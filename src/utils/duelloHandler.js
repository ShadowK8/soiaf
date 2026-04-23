const { ButtonBuilder, ButtonStyle } = require('discord.js');
const Character = require('../models/Character');
const { CV2_FLAG } = require('./components');
const { duelloSessions } = require('../commands/sistem/duello');

function zarAt(yuz) { return Math.floor(Math.random() * yuz) + 1; }

function hpBar(hp) {
  const dolu = Math.max(0, Math.round(hp / 5));
  return `\`${'█'.repeat(dolu)}${'░'.repeat(10 - dolu)}\` **${hp}/50 HP**`;
}

function turMesaji(session) {
  const { oyuncu1, oyuncu2, siradaki, tur } = session;
  const saldiran = siradaki === oyuncu1.id ? oyuncu1 : oyuncu2;

  return {
    flags: CV2_FLAG,
    allowedMentions: { parse: [] },
    components: [{
      type: 17,
      components: [
        {
          type: 10,
          content: [
            `## ⚔️ Düello — Tur ${tur}`,
            ``,
            `**${oyuncu1.isim}** — ${hpBar(oyuncu1.hp)}`,
            `**${oyuncu2.isim}** — ${hpBar(oyuncu2.hp)}`,
            ``,
            `⚔️ Sıra **${saldiran.isim}**'da! Saldırı için butona bas.`,
          ].join('\n'),
        },
        {
          type: 1,
          components: [
            new ButtonBuilder().setCustomId('duello_saldir').setLabel('⚔️ Saldır').setStyle(ButtonStyle.Danger).toJSON(),
          ],
        },
      ],
    }],
  };
}

async function handleButton(interaction, client) {
  const { customId, user, channel } = interaction;

  // ── Kabul Et ───────────────────────────────────────────────
  if (customId.startsWith('duello_kabul_')) {
    const [, , teklifEdenId, rakipId] = customId.split('_');

    if (user.id !== rakipId) {
      return interaction.reply({ content: '❌ Bu teklif sana ait değil.', flags: 64 });
    }

    if (duelloSessions.has(channel.id)) {
      return interaction.reply({ content: '❌ Bu kanalda zaten aktif düello var.', flags: 64 });
    }

    const [kar1, kar2] = await Promise.all([
      Character.findOne({ discordId: teklifEdenId }),
      Character.findOne({ discordId: rakipId }),
    ]);

    const member1 = await interaction.guild.members.fetch(teklifEdenId).catch(() => null);
    const member2 = await interaction.guild.members.fetch(rakipId).catch(() => null);

    // Kimin başlayacağını rastgele belirle
    const baslayan = Math.random() < 0.5 ? teklifEdenId : rakipId;

    const session = {
      oyuncu1: { id: teklifEdenId, isim: member1?.displayName ?? 'Oyuncu 1', hp: 50, statlar: kar1.statlar },
      oyuncu2: { id: rakipId,      isim: member2?.displayName ?? 'Oyuncu 2', hp: 50, statlar: kar2.statlar },
      siradaki: baslayan,
      savunmaAşamasi: false,
      sonSaldiriZar: null,
      tur: 1,
    };

    duelloSessions.set(channel.id, session);

    await interaction.update({
      flags: CV2_FLAG,
      allowedMentions: { parse: [] },
      components: [{
        type: 17,
        components: [
          {
            type: 10,
            content: [
              `## ⚔️ Düello Başlıyor!`,
              ``,
              `**${session.oyuncu1.isim}** vs **${session.oyuncu2.isim}**`,
              ``,
              `🎲 Bot belirledi: **${baslayan === teklifEdenId ? session.oyuncu1.isim : session.oyuncu2.isim}** ilk saldırıyı yapacak!`,
              ``,
              `-# ⚠️ Düelloya başlamadan önce her iki tarafın da emote atması gerekmektedir.`,
            ].join('\n'),
          },
          {
            type: 1,
            components: [
              new ButtonBuilder().setCustomId('duello_saldir').setLabel('⚔️ Saldır').setStyle(ButtonStyle.Danger).toJSON(),
            ],
          },
        ],
      }],
    });
    return;
  }

  // ── Reddet ─────────────────────────────────────────────────
  if (customId.startsWith('duello_reddet_')) {
    const teklifEdenId = customId.split('_')[2];
    if (user.id !== interaction.message.mentions?.users?.first()?.id && user.id !== teklifEdenId) {
      return interaction.reply({ content: '❌ Bu teklifi sadece teklif edilen kişi reddedebilir.', flags: 64 });
    }

    return interaction.update({
      flags: CV2_FLAG,
      components: [{
        type: 17,
        components: [{ type: 10, content: `❌ Düello teklifi reddedildi.` }],
      }],
    });
  }

  // ── Saldır ─────────────────────────────────────────────────
  if (customId === 'duello_saldir') {
    const session = duelloSessions.get(channel.id);
    if (!session) return interaction.reply({ content: '❌ Aktif düello bulunamadı.', flags: 64 });

    if (user.id !== session.siradaki) {
      return interaction.reply({ content: '❌ Şu an sıra sende değil.', flags: 64 });
    }

    const saldiran  = session.siradaki === session.oyuncu1.id ? session.oyuncu1 : session.oyuncu2;
    const savunan   = session.siradaki === session.oyuncu1.id ? session.oyuncu2 : session.oyuncu1;

    const saldiriZar  = zarAt(30);
    const gucBonus    = saldiran.statlar?.guc ?? 5;
    const saldiriToplam = saldiriZar + gucBonus;

    session.sonSaldiriZar = saldiriToplam;
    session.savunmaAsamasi = true;

    await interaction.update({
      flags: CV2_FLAG,
      allowedMentions: { parse: [] },
      components: [{
        type: 17,
        components: [
          {
            type: 10,
            content: [
              `## ⚔️ Düello — Tur ${session.tur}`,
              ``,
              `**${session.oyuncu1.isim}** — ${hpBar(session.oyuncu1.hp)}`,
              `**${session.oyuncu2.isim}** — ${hpBar(session.oyuncu2.hp)}`,
              ``,
              `⚔️ **${saldiran.isim}** saldırdı!`,
              `🎲 Saldırı Zarı: \`${saldiriZar}\` + Güç \`${gucBonus}\` = **${saldiriToplam}**`,
              ``,
              `🛡️ **${savunan.isim}**, savunmayı hangi statla yapacaksın?`,
            ].join('\n'),
          },
          {
            type: 1,
            components: [
              new ButtonBuilder().setCustomId('duello_savun_dayaniklilik').setLabel('🛡️ Dayanıklılık').setStyle(ButtonStyle.Primary).toJSON(),
              new ButtonBuilder().setCustomId('duello_savun_ceviklik').setLabel('💨 Çeviklik').setStyle(ButtonStyle.Primary).toJSON(),
            ],
          },
        ],
      }],
    });
    return;
  }

  // ── Savunma Seçimi ─────────────────────────────────────────
  if (customId === 'duello_savun_dayaniklilik' || customId === 'duello_savun_ceviklik') {
    const session = duelloSessions.get(channel.id);
    if (!session) return interaction.reply({ content: '❌ Aktif düello bulunamadı.', flags: 64 });

    const savunan  = session.siradaki === session.oyuncu1.id ? session.oyuncu2 : session.oyuncu1;
    const saldiran = session.siradaki === session.oyuncu1.id ? session.oyuncu1 : session.oyuncu2;

    if (user.id !== savunan.id) {
      return interaction.reply({ content: '❌ Şu an savunma sırası sende değil.', flags: 64 });
    }

    const statIsim   = customId === 'duello_savun_dayaniklilik' ? 'dayaniklilik' : 'ceviklik';
    const statLabel  = customId === 'duello_savun_dayaniklilik' ? 'Dayanıklılık' : 'Çeviklik';
    const savunmaZar = zarAt(30);
    const statBonus  = savunan.statlar?.[statIsim] ?? 5;
    const savunmaToplam = savunmaZar + statBonus;

    const saldiriToplam = session.sonSaldiriZar;
    const hasar = saldiriToplam - savunmaToplam;

    let sonucMetin = '';
    if (hasar > 0) {
      savunan.hp = Math.max(0, savunan.hp - hasar);
      sonucMetin = `💥 Saldırı isabet etti! **${savunan.isim}** **${hasar} hasar** aldı.`;
    } else {
      sonucMetin = `🛡️ Savunma başarılı! Saldırı engellendi.`;
    }

    // Düello bitti mi?
    if (savunan.hp <= 0) {
      duelloSessions.delete(channel.id);
      return interaction.update({
        flags: CV2_FLAG,
        allowedMentions: { parse: [] },
        components: [{
          type: 17,
          components: [{
            type: 10,
            content: [
              `## ⚔️ Düello Bitti!`,
              ``,
              `**${session.oyuncu1.isim}** — ${hpBar(session.oyuncu1.hp)}`,
              `**${session.oyuncu2.isim}** — ${hpBar(session.oyuncu2.hp)}`,
              ``,
              sonucMetin,
              ``,
              `🏆 **Kazanan: ${saldiran.isim}!**`,
              ``,
              `-# ⚠️ Düello bittikten sonra her iki tarafın da emote atması gerekmektedir.`,
            ].join('\n'),
          }],
        }],
      });
    }

    // Sıra değiştir
    session.siradaki  = savunan.id;
    session.savunmaAsamasi = false;
    session.sonSaldiriZar  = null;
    session.tur++;

    return interaction.update({
      flags: CV2_FLAG,
      allowedMentions: { parse: [] },
      components: [{
        type: 17,
        components: [
          {
            type: 10,
            content: [
              `## ⚔️ Düello — Tur ${session.tur}`,
              ``,
              `**${session.oyuncu1.isim}** — ${hpBar(session.oyuncu1.hp)}`,
              `**${session.oyuncu2.isim}** — ${hpBar(session.oyuncu2.hp)}`,
              ``,
              `🎲 **${saldiran.isim}** saldırdı: \`${saldiriToplam}\``,
              `🛡️ **${savunan.isim}** ${statLabel} ile savundu: \`${savunmaToplam}\``,
              ``,
              sonucMetin,
              ``,
              `⚔️ Sıra **${session.siradaki === session.oyuncu1.id ? session.oyuncu1.isim : session.oyuncu2.isim}**'da!`,
            ].join('\n'),
          },
          {
            type: 1,
            components: [
              new ButtonBuilder().setCustomId('duello_saldir').setLabel('⚔️ Saldır').setStyle(ButtonStyle.Danger).toJSON(),
            ],
          },
        ],
      }],
    });
  }
}

module.exports = { handleButton };