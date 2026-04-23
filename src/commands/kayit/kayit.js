const { SlashCommandBuilder } = require('discord.js');
const User = require('../../models/User');
const roles = require('../../config/roles');
const { channels } = require('../../config/config');
const { logMessage, CV2_FLAG } = require('../../utils/components');
const E = require('../../utils/emojis');

// Komutu kullanabilecek roller
const YETKİLİ_ROLLER = [
  roles.SUNUCU_SAHIBI,
  roles.GENEL_MENEJER,
  roles.YONETIM_KURULU,
  roles.UST_DUZEY_YETKILI_EKIBI,
  roles.GELISTIRICI,
  roles.RP_DENETIM_LIDERI,
  roles.REHBER_EKIBI_LIDERI,
  roles.RP_DENETIM_EKIBI,
  roles.REHBER_EKIBI,
  roles.PARTNER_SORUMLUSU_LIDERI,
  roles.PARTNER_SORUMLUSU_EKIBI,
];

module.exports = {
  cooldown: 5,

  data: new SlashCommandBuilder()
    .setName('kayit')
    .setDescription('Bir üyeyi sunucuya kayıt eder. (Yetkili)')
    .addUserOption((opt) =>
      opt.setName('kullanici').setDescription('Kayıt edilecek kullanıcı').setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName('isim').setDescription('Kullanıcının adı').setRequired(true).setMaxLength(32)
    )
    .addIntegerOption((opt) =>
      opt.setName('yas').setDescription('Kullanıcının yaşı').setRequired(true).setMinValue(1).setMaxValue(120)
    ),

  async execute(interaction, client) {
    await interaction.deferReply();

    const { guild, member: yetkili } = interaction;
    const hedef = interaction.options.getMember('kullanici');
    const isim  = interaction.options.getString('isim');
    const yas   = interaction.options.getInteger('yas');

    // ── Yetki kontrolü ────────────────────────────────────────
    const yetkiliMi = YETKİLİ_ROLLER.some((rolId) =>
      yetkili.roles.cache.has(rolId)
    );
    if (!yetkiliMi) {
      return interaction.editReply('❌ Bu komutu kullanma yetkin yok.');
    }

    // ── Temel kontroller ──────────────────────────────────────
    if (!hedef)         return interaction.editReply('❌ Kullanıcı sunucuda bulunamadı.');
    if (hedef.user.bot) return interaction.editReply('❌ Botlar kayıt edilemez.');

    const existing = await User.findOne({ discordId: hedef.user.id });
    if (existing?.isRegistered) {
      return interaction.editReply(`❌ ${hedef.user.tag} zaten kayıtlı.`);
    }

    const rolDisi       = guild.roles.cache.get(roles.ROL_DISI);
    const kayitBekleyen = guild.roles.cache.get(roles.KAYIT_BEKLEYEN);

    if (!rolDisi) return interaction.editReply('❌ Rol Dışı rolü bulunamadı.');

    // ── Nickname: İsim • Yaş ──────────────────────────────────
    const yeniNick = `${isim} • ${yas}`;
    try {
      await hedef.setNickname(yeniNick, `Kayıt: ${yetkili.user.tag}`);
    } catch { /* Sunucu sahibi değiştirilemez, sessiz geç */ }

    // ── Rol Dışı ver, Kayıt Bekleyen al ──────────────────────
    try {
      await hedef.roles.add(rolDisi, `Kayıt: ${isim} (${yas}) — ${yetkili.user.tag}`);
      if (kayitBekleyen && hedef.roles.cache.has(kayitBekleyen.id)) {
        await hedef.roles.remove(kayitBekleyen, 'Kayıt tamamlandı');
      }
    } catch {
      return interaction.editReply('❌ Rol işlemi sırasında hata oluştu. Bot yetkileri kontrol edilmeli.');
    }

    // ── Veritabanı ─────────────────────────────────────────────
    await User.findOneAndUpdate(
      { discordId: hedef.user.id },
      {
        discordId:      hedef.user.id,
        username:       hedef.user.tag ?? hedef.user.username,
        registeredName: isim,
        registeredAge:  yas,
        registeredAt:   new Date(),
        registeredBy:   yetkili.user.id,
        isRegistered:   true,
      },
      { upsert: true, new: true }
    );

    // ── Kayıt log ──────────────────────────────────────────────
    const logChannel = guild.channels.cache.get(channels.KAYIT_LOG);
    if (logChannel) {
      await logChannel.send(
        logMessage({
          title:     `${E.SCROLL} Yeni Kayıt`,
          avatarUrl: hedef.user.displayAvatarURL({ size: 256 }),
          fields: [
            { label: `${E.USER} Kayıt Edilen:`, value: `${hedef.user} (\`${hedef.user.id}\`)` },
            { label: `${E.QUILL} İsim:`,         value: yeniNick },
            { label: `${E.SHIELD} Verilen Rol:`,  value: `<@&${roles.ROL_DISI}>` },
            { label: `${E.TRASH} Alınan Rol:`,    value: kayitBekleyen ? `<@&${roles.KAYIT_BEKLEYEN}>` : '*Yok*' },
            { label: `${E.CROWN} Kaydeden:`,      value: `${yetkili.user} (\`${yetkili.user.id}\`)` },
            { label: `${E.CLOCK} Tarih:`,         value: E.timestamp(new Date(), 'F') },
          ],
        })
      );
    }

    // ── Sohbet kanalına hoşgeldin ──────────────────────────────
    const sohbetChannel = guild.channels.cache.get(channels.SOHBET);
    if (sohbetChannel) {
      await sohbetChannel.send(`${hedef.user} aramıza katıldı, hoş geldin. 👋`);
    }

    // ── Herkese görünür sonuç mesajı ──────────────────────────
    await interaction.editReply(
      `${hedef.user} başarıyla **${yeniNick}** olarak kaydedildi. — ${yetkili.user}`
    );
  },
};