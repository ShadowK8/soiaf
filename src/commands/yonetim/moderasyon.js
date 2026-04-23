const { SlashCommandBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const { CV2_FLAG } = require('../../utils/components');
const E = require('../../utils/emojis');
const path = require('path');
const fs = require('fs');

const BAN_GIF = path.join(__dirname, '../../../src/assets/ban.gif');

const YETKİLİ_ROLLER = [
  '1495773001902329932', // Sunucu Sahibi
  '1495773001902329931', // Genel Menajer
  '1495773001902329930', // Yönetim Kurulu
  '1495773001902329929', // Üst Düzey Yetkili
  '1495773001902329928', // Geliştirici
];

function yetkiliMi(member) {
  return YETKİLİ_ROLLER.some(r => member.roles.cache.has(r));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mod')
    .setDescription('Moderasyon komutları.')
    .addSubcommand(sub =>
      sub
        .setName('ban')
        .setDescription('Bir veya birden fazla kullanıcıyı banlar.')
        .addStringOption(opt =>
          opt.setName('kullanicilar')
            .setDescription('Kullanıcı etiket(leri) veya ID(leri) — birden fazla için boşlukla ayır')
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('sebep')
            .setDescription('Ban sebebi')
            .setRequired(false)
        )
        .addIntegerOption(opt =>
          opt.setName('mesaj_sil')
            .setDescription('Kaç günlük mesaj silinsin? (0-7)')
            .setMinValue(0)
            .setMaxValue(7)
            .setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('kick')
        .setDescription('Bir kullanıcıyı sunucudan atar.')
        .addUserOption(opt =>
          opt.setName('kullanici').setDescription('Kullanıcı').setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('sebep').setDescription('Sebep').setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('unban')
        .setDescription('Bir kullanıcının banını kaldırır.')
        .addStringOption(opt =>
          opt.setName('id').setDescription('Kullanıcı ID\'si').setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('timeout')
        .setDescription('Bir kullanıcıyı susturur.')
        .addUserOption(opt =>
          opt.setName('kullanici').setDescription('Kullanıcı').setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('sure')
            .setDescription('Süre (örn: 10m, 2h, 1d)')
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('sebep').setDescription('Sebep').setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('untimeout')
        .setDescription('Kullanıcının timeout\'unu kaldırır.')
        .addUserOption(opt =>
          opt.setName('kullanici').setDescription('Kullanıcı').setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('temizle')
        .setDescription('Kanaldan toplu mesaj siler.')
        .addIntegerOption(opt =>
          opt.setName('miktar')
            .setDescription('Silinecek mesaj sayısı (1-100)')
            .setMinValue(1)
            .setMaxValue(100)
            .setRequired(true)
        )
    ),

  async execute(interaction, client) {
    if (!yetkiliMi(interaction.member) && !interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ content: '❌ Bu komutu kullanma yetkin yok.', flags: 64 });
    }

    const sub = interaction.options.getSubcommand();
    const { guild } = interaction;

    // ── BAN ───────────────────────────────────────────────────────
    if (sub === 'ban') {
      await interaction.deferReply();

      const girdi  = interaction.options.getString('kullanicilar');
      const sebep  = interaction.options.getString('sebep') || 'Sebep belirtilmedi';
      const silGun = interaction.options.getInteger('mesaj_sil') ?? 0;

      // ID veya mention'ları ayıkla
      const parcalar = girdi.split(/\s+/);
      const idler = parcalar.map(p => p.replace(/[<@!>]/g, '').trim()).filter(p => /^\d+$/.test(p));

      if (idler.length === 0) {
        return interaction.editReply('❌ Geçerli kullanıcı ID veya etiketi bulunamadı.');
      }

      const basarili = [];
      const basarisiz = [];

      for (const id of idler) {
        try {
          // Önce kullanıcıyı fetch et (sunucuda olmasa bile)
          const user = await client.users.fetch(id).catch(() => null);
          if (!user) { basarisiz.push(`\`${id}\` — Kullanıcı bulunamadı`); continue; }

          await guild.bans.create(id, {
            reason: `${sebep} | Banlayan: ${interaction.user.tag}`,
            deleteMessageSeconds: silGun * 86400,
          });
          basarili.push(user);
        } catch (err) {
          basarisiz.push(`\`${id}\` — ${err.message}`);
        }
      }

      // GIF
      const gifVar = fs.existsSync(BAN_GIF);
      const files  = gifVar ? [new AttachmentBuilder(BAN_GIF, { name: 'ban.gif' })] : [];

      // Mesaj içeriği
      const banlilar = basarili.map((u, i) => {
        const no = basarili.length > 1 ? `${i + 1}. ` : '';
        return `${no}**${u.tag}** (\`${u.id}\`)`;
      }).join('\n');

      const icerik = [
        `## 👋 Elveda!`,
        ``,
        basarili.length === 1
          ? `**${basarili[0].tag}** az önce Yedi Krallık'tan kovuldu. Tokat yedi, gitti.`
          : `Aşağıdaki **${basarili.length}** kişi Yedi Krallık'tan kovuldu. Tokat yedi, gittiler.`,
        ``,
        banlilar,
        ``,
        `**${E.SCROLL} Sebep:** ${sebep}`,
        `**${E.CROWN} Banlayan:** ${interaction.user}`,
        ``,
        ...(basarisiz.length > 0 ? [`-# ❌ Başarısız: ${basarisiz.join(', ')}`] : []),
        `-# ${E.CLOCK} ${E.timestamp(new Date(), 'F')}`,
      ].join('\n');

      const components = [{
        type: 17,
        components: [
          ...(gifVar ? [{
            type: 12,
            items: [{ media: { url: 'attachment://ban.gif' } }],
          }, { type: 14, divider: true, spacing: 1 }] : []),
          { type: 10, content: icerik },
        ],
      }];

      await interaction.editReply({ flags: CV2_FLAG, files, components });
    }

    // ── KICK ──────────────────────────────────────────────────────
    if (sub === 'kick') {
      await interaction.deferReply();

      const hedef = interaction.options.getMember('kullanici');
      const sebep = interaction.options.getString('sebep') || 'Sebep belirtilmedi';

      if (!hedef) return interaction.editReply('❌ Kullanıcı bulunamadı.');

      try {
        await hedef.kick(`${sebep} | Atan: ${interaction.user.tag}`);
        await interaction.editReply({
          flags: CV2_FLAG,
          components: [{
            type: 17,
            components: [{ type: 10, content: `${E.LEAVE} **${hedef.user.tag}** sunucudan atıldı.\n**Sebep:** ${sebep}\n**İşlemi yapan:** ${interaction.user}\n-# ${E.timestamp(new Date(), 'F')}` }],
          }],
        });
      } catch (err) {
        await interaction.editReply(`❌ Kick atılamadı: ${err.message}`);
      }
    }

    // ── UNBAN ─────────────────────────────────────────────────────
    if (sub === 'unban') {
      await interaction.deferReply({ flags: 64 });

      const id = interaction.options.getString('id').trim();
      try {
        const user = await client.users.fetch(id).catch(() => null);
        await guild.bans.remove(id);
        await interaction.editReply({
          flags: 64 | CV2_FLAG,
          components: [{
            type: 17,
            components: [{ type: 10, content: `${E.CHECK} **${user?.tag ?? id}** kullanıcısının banı kaldırıldı.` }],
          }],
        });
      } catch (err) {
        await interaction.editReply(`❌ Ban kaldırılamadı: ${err.message}`);
      }
    }

    // ── TIMEOUT ───────────────────────────────────────────────────
    if (sub === 'timeout') {
      await interaction.deferReply({ flags: 64 });

      const hedef = interaction.options.getMember('kullanici');
      const sure  = interaction.options.getString('sure');
      const sebep = interaction.options.getString('sebep') || 'Sebep belirtilmedi';

      if (!hedef) return interaction.editReply('❌ Kullanıcı bulunamadı.');

      // Süre parse
      const sureParse = { m: 60000, h: 3600000, d: 86400000 };
      const match = sure.match(/^(\d+)([mhd])$/i);
      if (!match) return interaction.editReply('❌ Geçersiz süre formatı. Örnek: 10m, 2h, 1d');

      const ms = parseInt(match[1]) * sureParse[match[2].toLowerCase()];
      if (ms > 28 * 86400000) return interaction.editReply('❌ Maksimum timeout süresi 28 gündür.');

      try {
        await hedef.timeout(ms, `${sebep} | İşlemi yapan: ${interaction.user.tag}`);
        await interaction.editReply({
          flags: 64 | CV2_FLAG,
          components: [{
            type: 17,
            components: [{ type: 10, content: `${E.LOCK} **${hedef.user.tag}** **${sure}** süreyle susturuldu.\n**Sebep:** ${sebep}` }],
          }],
        });
      } catch (err) {
        await interaction.editReply(`❌ Timeout verilemedi: ${err.message}`);
      }
    }

    // ── UNTIMEOUT ─────────────────────────────────────────────────
    if (sub === 'untimeout') {
      await interaction.deferReply({ flags: 64 });

      const hedef = interaction.options.getMember('kullanici');
      if (!hedef) return interaction.editReply('❌ Kullanıcı bulunamadı.');

      try {
        await hedef.timeout(null);
        await interaction.editReply({
          flags: 64 | CV2_FLAG,
          components: [{
            type: 17,
            components: [{ type: 10, content: `${E.UNLOCK} **${hedef.user.tag}** kullanıcısının timeout\'u kaldırıldı.` }],
          }],
        });
      } catch (err) {
        await interaction.editReply(`❌ Timeout kaldırılamadı: ${err.message}`);
      }
    }

    // ── TEMİZLE ───────────────────────────────────────────────────
    if (sub === 'temizle') {
      await interaction.deferReply({ flags: 64 });

      const miktar = interaction.options.getInteger('miktar');
      try {
        const silinen = await interaction.channel.bulkDelete(miktar, true);
        await interaction.editReply({
          flags: 64 | CV2_FLAG,
          components: [{
            type: 17,
            components: [{ type: 10, content: `${E.TRASH} **${silinen.size}** mesaj silindi.` }],
          }],
        });
      } catch (err) {
        await interaction.editReply(`❌ Mesajlar silinemedi: ${err.message}`);
      }
    }
  },
};