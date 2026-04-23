const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Character = require('../../models/Character');
const { CV2_FLAG } = require('../../utils/components');
const E = require('../../utils/emojis');

const YETKİLİ_ROLLER = [
  '1495773001902329932','1495773001902329931','1495773001902329930',
  '1495773001902329929','1495773001902329928',
];

function yetkiliMi(member) {
  return YETKİLİ_ROLLER.some(r => member.roles.cache.has(r)) ||
    member.permissions.has(PermissionFlagsBits.ManageGuild);
}

const STAT_LISTESI = ['guc', 'diplomasi', 'dayaniklilik', 'ceviklik', 'bilgelik', 'idare', 'entrika', 'askeriye'];
const STAT_ISIMLER = {
  guc: 'Güç', diplomasi: 'Diplomasi', dayaniklilik: 'Dayanıklılık',
  ceviklik: 'Çeviklik', bilgelik: 'Bilgelik', idare: 'İdare',
  entrika: 'Entrika', askeriye: 'Askeriye',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stat-duzenle')
    .setDescription('Bir karakterin statını düzenler. (Yetkili)')
    .addUserOption(opt => opt.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
    .addStringOption(opt =>
      opt.setName('stat').setDescription('Düzenlenecek stat').setRequired(true)
        .addChoices(...STAT_LISTESI.map(s => ({ name: STAT_ISIMLER[s], value: s })))
    )
    .addIntegerOption(opt =>
      opt.setName('deger').setDescription('Yeni değer').setRequired(true).setMinValue(1).setMaxValue(200)
    ),

  async execute(interaction, client) {
    if (!yetkiliMi(interaction.member)) {
      return interaction.reply({ content: '❌ Bu komutu kullanma yetkin yok.', flags: 64 });
    }

    await interaction.deferReply({ flags: 64 });

    const hedef = interaction.options.getUser('kullanici');
    const stat  = interaction.options.getString('stat');
    const deger = interaction.options.getInteger('deger');

    const karakter = await Character.findOne({ discordId: hedef.id });
    if (!karakter) return interaction.editReply('❌ Bu kullanıcının kayıtlı karakteri yok.');

    const eskiDeger = karakter.statlar?.[stat] ?? 0;

    await Character.findOneAndUpdate(
      { discordId: hedef.id },
      { $set: { [`statlar.${stat}`]: deger } }
    );

    await interaction.editReply({
      flags: 64 | CV2_FLAG,
      components: [{
        type: 17,
        components: [{
          type: 10,
          content: [
            `${E.CHECK} **${hedef.tag}** — ${STAT_ISIMLER[stat]} güncellendi`,
            `**Eski:** ${eskiDeger} → **Yeni:** ${deger}`,
          ].join('\n'),
        }],
      }],
    });
  },
};