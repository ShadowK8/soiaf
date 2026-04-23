const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Character = require('../models/Character');
const User = require('../models/User');
const roles = require('../config/roles');
const { AYRAC_ROLLER, IRKLAR, SOYLULUKLAR, DINLER, KONUMLAR, MESLEKLER_1, MESLEKLER_2, HANELER_1, HANELER_2, HANELER_3 } = require('../config/karakterConfig');
const { CV2_FLAG } = require('./components');
const { sessions } = require('../commands/karakter/karakterKayit');

function buildSelect(customId, placeholder, secenekler) {
  const menu = new StringSelectMenuBuilder().setCustomId(customId).setPlaceholder(placeholder);
  secenekler.forEach(s => {
    const opt = new StringSelectMenuOptionBuilder().setLabel(s.label).setValue(s.value);
    if (s.emoji) opt.setEmoji(s.emoji);
    menu.addOptions(opt);
  });
  return menu.toJSON();
}

function nextBtn(id, label) {
  return new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(ButtonStyle.Secondary).toJSON();
}

function sayfaGoster(interaction, baslik, menuId, secenekler, butonlar = []) {
  const components = [
    { type: 10, content: `## ⚔️ Karakter Kayıt\n${baslik}` },
    { type: 14, divider: true, spacing: 1 },
    { type: 1, components: [buildSelect(menuId, 'Seç...', secenekler)] },
  ];
  if (butonlar.length > 0) components.push({ type: 1, components: butonlar });

  return interaction.update({
    flags: CV2_FLAG,
    components: [{ type: 17, components }],
  });
}

async function rolleriAta(member, session, guild) {
  const s = session.secimler;
  const ekle = [];
  const al   = [];

  if (s.cinsiyet) ekle.push(s.cinsiyet);
  if (s.irk)      ekle.push(s.irk);
  if (s.soyluluk) ekle.push(s.soyluluk);
  if (s.din)      ekle.push(s.din);
  if (s.konum)    ekle.push(s.konum);
  if (s.meslek)   ekle.push(s.meslek);
  if (s.hane && s.hane !== 'hanesiz') ekle.push(s.hane);

  ekle.push(...Object.values(AYRAC_ROLLER));
  ekle.push(roles.KAYITLI_UYE);
  al.push(roles.ROL_DISI);

  for (const r of ekle) { try { await member.roles.add(r); } catch {} }
  for (const r of al)   { try { await member.roles.remove(r); } catch {} }
}

async function tamamla(interaction, session, client) {
  const { guild } = interaction;
  const yetkiliId = interaction.user.id;

  const hedefMember = await guild.members.fetch(session.hedefId).catch(() => null);
  if (!hedefMember) {
    return interaction.update({
      flags: CV2_FLAG,
      components: [{ type: 17, components: [{ type: 10, content: '❌ Hedef kullanıcı sunucuda bulunamadı.' }] }],
    });
  }

  await interaction.update({
    flags: CV2_FLAG,
    components: [{ type: 17, components: [{ type: 10, content: '⏳ Karakter kaydediliyor...' }] }],
  });

  await rolleriAta(hedefMember, session, guild);

  const userDoc = await User.findOne({ discordId: session.hedefId });
  const isim    = userDoc?.registeredName ?? hedefMember.displayName;
  const yas     = userDoc?.registeredAge  ?? null;
  const nick    = yas ? `${isim} • ${yas}` : isim;

  try { await hedefMember.setNickname(nick, 'Karakter kaydı'); } catch {}

  await Character.findOneAndUpdate(
    { discordId: session.hedefId },
    { discordId: session.hedefId, guildId: guild.id, karakterAdi: isim, ...session.secimler, kayitTarihi: new Date(), kaydedenYetkili: yetkiliId },
    { upsert: true, new: true }
  );

  sessions.delete(yetkiliId);

  const rolIsmi = (id) => id ? (guild.roles.cache.get(id)?.name ?? '—') : '—';

  // ── Kayıt Logu ────────────────────────────────────────────
  const LOG_KANAL_ID = '1496428075498340442';
  const logKanal = guild.channels.cache.get(LOG_KANAL_ID);
  if (logKanal) {
    await logKanal.send({
      flags: CV2_FLAG,
      allowedMentions: { parse: [] },
      components: [{
        type: 17,
        components: [{
          type: 9,
          components: [{
            type: 10,
            content: [
              `## 📋 Karakter Kayıt Logu`,
              ``,
              `**👤 Kullanıcı:** ${hedefMember.user} (\`${hedefMember.user.id}\`)`,
              `**🗡️ İsim:** ${nick}`,
              `**⚔️ Cinsiyet:** ${rolIsmi(session.secimler.cinsiyet)}`,
              `**🌍 Irk:** ${rolIsmi(session.secimler.irk)}`,
              `**👑 Soyluluk:** ${rolIsmi(session.secimler.soyluluk)}`,
              `**🕯️ Din:** ${rolIsmi(session.secimler.din)}`,
              `**🗺️ Konum:** ${rolIsmi(session.secimler.konum)}`,
              `**⚔️ Meslek:** ${rolIsmi(session.secimler.meslek)}`,
              `**🏰 Hane:** ${rolIsmi(session.secimler.hane)}`,
              ``,
              `**🛡️ Kaydeden Yetkili:** <@${yetkiliId}>`,
              `-# ${new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })}`,
            ].join('\n'),
          }],
          accessory: { type: 11, media: { url: hedefMember.user.displayAvatarURL({ size: 256 }) } },
        }],
      }],
    }).catch(() => {});
  }

  await interaction.editReply({
    flags: CV2_FLAG,
    components: [{
      type: 17,
      components: [{
        type: 10,
        content: [
          `## ✅ Karakter Kaydı Tamamlandı!`,
          `**👤 Kullanıcı:** ${hedefMember.user}`,
          `**🗡️ İsim:** ${nick}`,
          `**⚔️ Cinsiyet:** ${rolIsmi(session.secimler.cinsiyet)}`,
          `**🌍 Irk:** ${rolIsmi(session.secimler.irk)}`,
          `**👑 Soyluluk:** ${rolIsmi(session.secimler.soyluluk)}`,
          `**🕯️ Din:** ${rolIsmi(session.secimler.din)}`,
          `**🗺️ Konum:** ${rolIsmi(session.secimler.konum)}`,
          `**⚔️ Meslek:** ${rolIsmi(session.secimler.meslek)}`,
          `**🏰 Hane:** ${rolIsmi(session.secimler.hane)}`,
          ``,
          `-# Statları girmek için \`/stat-gir\` komutunu kullan.`,
        ].join('\n'),
      }],
    }],
  });
}

// ── Select Menu Handler ────────────────────────────────────────
async function handleSelectMenu(interaction, client) {
  const id     = interaction.customId;
  const value  = interaction.values[0];
  const userId = interaction.user.id;

  const session = sessions.get(userId);
  if (!session) {
    return interaction.update({
      flags: CV2_FLAG,
      components: [{ type: 17, components: [{ type: 10, content: '❌ Oturum sona erdi. Komutu tekrar kullan.' }] }],
    });
  }

  // Seçimi kaydet
  if (id === 'krk_cinsiyet')               session.secimler.cinsiyet = value;
  else if (id === 'krk_irk')               session.secimler.irk      = value;
  else if (id === 'krk_soyluluk')          session.secimler.soyluluk = value;
  else if (id === 'krk_din')               session.secimler.din      = value;
  else if (id === 'krk_konum')             session.secimler.konum    = value;
  else if (id === 'krk_meslek1' || id === 'krk_meslek2') session.secimler.meslek = value;
  else if (id === 'krk_hane1' || id === 'krk_hane2' || id === 'krk_hane3') session.secimler.hane = value;

  // Sonraki adım
  if (id === 'krk_cinsiyet') return sayfaGoster(interaction, '**Adım 2/7 — Irk seçin:**', 'krk_irk', IRKLAR);
  if (id === 'krk_irk')      return sayfaGoster(interaction, '**Adım 3/7 — Soyluluk seçin:**', 'krk_soyluluk', SOYLULUKLAR);
  if (id === 'krk_soyluluk') return sayfaGoster(interaction, '**Adım 4/7 — Din seçin:**', 'krk_din', DINLER);
  if (id === 'krk_din')      return sayfaGoster(interaction, '**Adım 5/7 — Konum seçin:**', 'krk_konum', KONUMLAR);
  if (id === 'krk_konum')    return sayfaGoster(interaction, '**Adım 6/7 — Meslek seçin (Sayfa 1/2):**', 'krk_meslek1', MESLEKLER_1, [nextBtn('krk_meslek_s2', 'Sonraki Sayfa →')]);
  if (id === 'krk_meslek1')  return sayfaGoster(interaction, '**Adım 7/7 — Hane seçin (Sayfa 1/3):**', 'krk_hane1', HANELER_1, [nextBtn('krk_hane_s2', 'Sonraki Sayfa →')]);
  if (id === 'krk_meslek2')  return sayfaGoster(interaction, '**Adım 7/7 — Hane seçin (Sayfa 1/3):**', 'krk_hane1', HANELER_1, [nextBtn('krk_hane_s2', 'Sonraki Sayfa →')]);
  if (id === 'krk_hane1' || id === 'krk_hane2' || id === 'krk_hane3') return await tamamla(interaction, session, client);
}

// ── Button Handler ─────────────────────────────────────────────
async function handleButton(interaction, client) {
  const id     = interaction.customId;
  const userId = interaction.user.id;

  const session = sessions.get(userId);
  if (!session) {
    return interaction.update({
      flags: CV2_FLAG,
      components: [{ type: 17, components: [{ type: 10, content: '❌ Oturum sona erdi.' }] }],
    });
  }

  if (id === 'krk_meslek_s2') return sayfaGoster(interaction, '**Adım 6/7 — Meslek seçin (Sayfa 2/2):**', 'krk_meslek2', MESLEKLER_2, [nextBtn('krk_meslek_s1', '← Önceki Sayfa')]);
  if (id === 'krk_meslek_s1') return sayfaGoster(interaction, '**Adım 6/7 — Meslek seçin (Sayfa 1/2):**', 'krk_meslek1', MESLEKLER_1, [nextBtn('krk_meslek_s2', 'Sonraki Sayfa →')]);
  if (id === 'krk_hane_s2')   return sayfaGoster(interaction, '**Adım 7/7 — Hane seçin (Sayfa 2/3):**', 'krk_hane2', HANELER_2, [nextBtn('krk_hane_s1', '← Önceki'), nextBtn('krk_hane_s3', 'Sonraki →')]);
  if (id === 'krk_hane_s3')   return sayfaGoster(interaction, '**Adım 7/7 — Hane seçin (Sayfa 3/3):**', 'krk_hane3', HANELER_3, [nextBtn('krk_hane_s2', '← Önceki Sayfa')]);
  if (id === 'krk_hane_s1')   return sayfaGoster(interaction, '**Adım 7/7 — Hane seçin (Sayfa 1/3):**', 'krk_hane1', HANELER_1, [nextBtn('krk_hane_s2', 'Sonraki Sayfa →')]);
}

module.exports = { handleSelectMenu, handleButton };