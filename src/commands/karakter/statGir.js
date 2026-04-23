const { SlashCommandBuilder, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { CV2_FLAG } = require('../../utils/components');

const YETKİLİ_ROLLER = [
  '1495773001902329932','1495773001902329931','1495773001902329930',
  '1495773001902329929','1495773001902329928','1495773001902329927',
  '1495773001902329926','1495773001868771507','1495773001868771506',
];

function yetkiliMi(member) {
  return YETKİLİ_ROLLER.some(r => member.roles.cache.has(r)) ||
    member.permissions.has(PermissionFlagsBits.ManageRoles);
}

// Yetkili ID → hedef ID eşleşmesi (modal döndüğünde kime ait olduğunu bilmek için)
const statSessions = new Map();

module.exports = {
  statSessions,

  data: new SlashCommandBuilder()
    .setName('stat-gir')
    .setDescription('Bir karakterin statlarını girer. (Yetkili)')
    .addUserOption(opt =>
      opt.setName('kullanici').setDescription('Statları girilecek kullanıcı').setRequired(true)
    ),

  async execute(interaction, client) {
    if (!yetkiliMi(interaction.member)) {
      return interaction.reply({ content: '❌ Bu komutu kullanma yetkin yok.', flags: 64 });
    }

    const hedef = interaction.options.getMember('kullanici');
    if (!hedef) return interaction.reply({ content: '❌ Kullanıcı bulunamadı.', flags: 64 });

    // Hedefi session'a kaydet
    statSessions.set(interaction.user.id, hedef.user.id);

    const modal = new ModalBuilder()
      .setCustomId('stat_giris_modal')
      .setTitle(`${hedef.displayName} — Statlar (90 Puan)`);

    const fields = [
      ['guc',          'Güç (5-20)'],
      ['diplomasi',    'Diplomasi (5-20)'],
      ['dayaniklilik', 'Dayanıklılık (5-20)'],
      ['ceviklik',     'Çeviklik (5-20)'],
      ['bilgelik',     'Bilgelik (5-20)'],
    ];

    modal.addComponents(
      ...fields.map(([key, label]) =>
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId(key)
            .setLabel(label)
            .setStyle(TextInputStyle.Short)
            .setMinLength(1).setMaxLength(2).setRequired(true)
        )
      )
    );

    await interaction.showModal(modal);
  },
};