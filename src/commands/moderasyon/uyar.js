const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Warning = require('../../models/Warning');
const { CV2_FLAG } = require('../../utils/components');
const E = require('../../utils/emojis');

const MAX_UYARI = 5;

const YETKİLİ_ROLLER = [
  '1495773001902329932','1495773001902329931','1495773001902329930',
  '1495773001902329929','1495773001902329928','1495773001902329927',
  '1495773001902329926','1495773001868771507','1495773001868771506',
];

function yetkiliMi(member) {
  return YETKİLİ_ROLLER.some(r => member.roles.cache.has(r)) ||
    member.permissions.has(PermissionFlagsBits.ModerateMembers);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('uyar')
    .setDescription('Bir üyeye uyarı verir.')
    .addUserOption(opt =>
      opt.setName('kullanici').setDescription('Uyarılacak kullanıcı').setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('sebep').setDescription('Uyarı sebebi').setRequired(true).setMaxLength(300)
    ),

  async execute(interaction, client) {
    if (!yetkiliMi(interaction.member)) {
      return interaction.reply({ content: '❌ Bu komutu kullanma yetkin yok.', flags: 64 });
    }

    await interaction.deferReply();

    const hedef = interaction.options.getMember('kullanici');
    const sebep = interaction.options.getString('sebep');
    const { guild } = interaction;

    if (!hedef) return interaction.editReply('❌ Kullanıcı bulunamadı.');
    if (hedef.user.bot) return interaction.editReply('❌ Botlara uyarı verilemez.');

    // Mevcut aktif uyarıları say
    const aktifUyarilar = await Warning.find({
      guildId: guild.id,
      userId:  hedef.user.id,
      aktif:   true,
    });

    const mevcutSayi = aktifUyarilar.length;

    if (mevcutSayi >= MAX_UYARI) {
      return interaction.editReply({
        flags: CV2_FLAG,
        components: [{
          type: 17,
          components: [{
            type: 10,
            content: `❌ ${hedef.user} zaten maksimum uyarı sayısına (${MAX_UYARI}) ulaşmış.`,
          }],
        }],
      });
    }

    // Yeni uyarı oluştur
    const silinecekAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 hafta
    const yeniUyari = await Warning.create({
      guildId:     guild.id,
      userId:      hedef.user.id,
      moderatorId: interaction.user.id,
      sebep,
      aktif:       true,
      silinecekAt,
    });

    const yeniSayi = mevcutSayi + 1;
    const maxMi    = yeniSayi >= MAX_UYARI;

    // Sıra metni
    const siraMetni = () => {
      const metinler = ['Birinci', 'İkinci', 'Üçüncü', 'Dördüncü', 'Beşinci'];
      return metinler[yeniSayi - 1] ?? `${yeniSayi}.`;
    };

    const icerik = [
      `## ${E.WARN} Uyarı Verildi`,
      ``,
      `**${E.USER} Kullanıcı:** ${hedef.user} (\`${hedef.user.id}\`)`,
      `**${E.SCROLL} Sebep:** ${sebep}`,
      `**${E.SHIELD} Uyarı:** ${siraMetni()} uyarı (${yeniSayi}/${MAX_UYARI})`,
      `**${E.CROWN} Yetkili:** ${interaction.user}`,
      `**${E.CLOCK} Silinme:** ${E.timestamp(silinecekAt, 'R')}`,
      ``,
      maxMi
        ? `⛔ **${hedef.user.tag} maksimum uyarı sayısına ulaştı!**`
        : ``,
    ].filter(l => l !== '').join('\n');

    await interaction.editReply({
      flags: CV2_FLAG,
      components: [{
        type: 17,
        components: [{
          type: 9,
          components: [{ type: 10, content: icerik }],
          accessory: { type: 11, media: { url: hedef.user.displayAvatarURL({ size: 256 }) } },
        }],
      }],
    });

    // Kullanıcıya DM gönder
    try {
      await hedef.user.send({
        flags: CV2_FLAG,
        components: [{
          type: 17,
          components: [{
            type: 10,
            content: [
              `## ${E.WARN} Uyarı Aldınız`,
              ``,
              `**Sunucu:** ${guild.name}`,
              `**Sebep:** ${sebep}`,
              `**Uyarı:** ${yeniSayi}/${MAX_UYARI}`,
              `**Silinme:** ${E.timestamp(silinecekAt, 'R')}`,
              maxMi ? `\n⛔ Maksimum uyarı sayısına ulaştınız.` : '',
            ].filter(Boolean).join('\n'),
          }],
        }],
      });
    } catch { /* DM kapalıysa sessiz geç */ }
  },
};