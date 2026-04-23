const { SlashCommandBuilder, PermissionFlagsBits, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { CV2_FLAG } = require('../../utils/components');
const { CINSIYETLER, IRKLAR, SOYLULUKLAR, DINLER, KONUMLAR, MESLEKLER, HANELER_1, HANELER_2, HANELER_3 } = require('../../config/karakterConfig');

// Session store — userId → { secimler, hedefId }
const sessions = new Map();

const YETKİLİ_ROLLER = [
  '1495773001902329932','1495773001902329931','1495773001902329930',
  '1495773001902329929','1495773001902329928','1495773001902329927',
  '1495773001902329926','1495773001868771507','1495773001868771506',
];

function yetkiliMi(member) {
  return YETKİLİ_ROLLER.some(r => member.roles.cache.has(r)) ||
    member.permissions.has(PermissionFlagsBits.ManageRoles);
}

module.exports = {
  sessions,

  data: new SlashCommandBuilder()
    .setName('karakter-kayit')
    .setDescription('Bir üyenin karakterini kayıt eder. (Yetkili)')
    .addUserOption(opt =>
      opt.setName('kullanici').setDescription('Karakteri kaydedilecek kullanıcı').setRequired(true)
    ),

  async execute(interaction, client) {
    if (!yetkiliMi(interaction.member)) {
      return interaction.reply({ content: '❌ Bu komutu kullanma yetkin yok.', flags: 64 });
    }

    const hedef = interaction.options.getMember('kullanici');
    if (!hedef) return interaction.reply({ content: '❌ Kullanıcı bulunamadı.', flags: 64 });
    if (hedef.user.bot) return interaction.reply({ content: '❌ Botlar kayıt edilemez.', flags: 64 });

    // Session başlat — yetkili ID'si key, hedef ID'si içinde
    sessions.set(interaction.user.id, { secimler: {}, hedefId: hedef.user.id });

    await interaction.reply({
      flags: 64 | CV2_FLAG,
      components: [{
        type: 17,
        components: [
          {
            type: 10,
            content: [
              `## ⚔️ Karakter Kayıt`,
              `**Hedef:** ${hedef.user} (\`${hedef.user.id}\`)`,
              ``,
              `**Adım 1/7 — Cinsiyet seçin:**`,
            ].join('\n'),
          },
          { type: 14, divider: true, spacing: 1 },
          {
            type: 1,
            components: [
              new StringSelectMenuBuilder()
                .setCustomId('krk_cinsiyet')
                .setPlaceholder('Cinsiyet seç...')
                .addOptions(CINSIYETLER.map(s => {
                  const opt = new StringSelectMenuOptionBuilder().setLabel(s.label).setValue(s.value);
                  if (s.emoji) opt.setEmoji(s.emoji);
                  return opt;
                }))
                .toJSON(),
            ],
          },
        ],
      }],
    });
  },
};