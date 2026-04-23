const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const House = require('../../models/House');
const { HANELER } = require('../../config/haneler');
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

function haneKonfigBul(rolId) {
  return HANELER.find(h => h.rolId === rolId);
}

async function haneGetir(rolId, isim) {
  return House.findOneAndUpdate(
    { rolId },
    { $setOnInsert: { rolId, isim } },
    { upsert: true, new: true }
  );
}

function yanitOlustur(islem, alan, miktar, haneIsim, yeniDeger) {
  const ikonlar = { kasa: E.GOLD, gelir: E.GOLD, duzenliAsker: E.SWORD, paraliAsker: E.DAGGER, donanma: E.SHIP };
  const isimler = { kasa: 'Kasa', gelir: 'Haftalık Gelir', duzenliAsker: 'Düzenli Ordu', paraliAsker: 'Paralı Asker', donanma: 'Donanma' };
  const islemIkon = islem === 'ekle' ? '➕' : '➖';
  return {
    flags: 64 | CV2_FLAG,
    components: [{
      type: 17,
      components: [{
        type: 10,
        content: [
          `${islemIkon} **${haneIsim}** — ${isimler[alan]} güncellendi`,
          `**${ikonlar[alan]} ${islem === 'ekle' ? 'Eklenen' : 'Çıkarılan'}:** ${miktar.toLocaleString('tr-TR')}`,
          `**Yeni Değer:** ${yeniDeger.toLocaleString('tr-TR')}`,
        ].join('\n'),
      }],
    }],
  };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hane-yonet')
    .setDescription('Hane verilerini yönetir. (Yetkili)')
    .addSubcommand(s => s.setName('kasa-ekle').setDescription('Hane kasasına para ekler.')
      .addRoleOption(o => o.setName('hane').setDescription('Hane').setRequired(true))
      .addIntegerOption(o => o.setName('miktar').setDescription('Miktar (AE)').setRequired(true).setMinValue(1)))
    .addSubcommand(s => s.setName('kasa-cikart').setDescription('Hane kasasından para çıkartır.')
      .addRoleOption(o => o.setName('hane').setDescription('Hane').setRequired(true))
      .addIntegerOption(o => o.setName('miktar').setDescription('Miktar (AE)').setRequired(true).setMinValue(1)))
    .addSubcommand(s => s.setName('gelir-ekle').setDescription('Haftalık gelir ekler.')
      .addRoleOption(o => o.setName('hane').setDescription('Hane').setRequired(true))
      .addIntegerOption(o => o.setName('miktar').setDescription('Miktar (AE)').setRequired(true).setMinValue(1)))
    .addSubcommand(s => s.setName('gelir-cikart').setDescription('Haftalık gelir azaltır.')
      .addRoleOption(o => o.setName('hane').setDescription('Hane').setRequired(true))
      .addIntegerOption(o => o.setName('miktar').setDescription('Miktar (AE)').setRequired(true).setMinValue(1)))
    .addSubcommand(s => s.setName('asker-ekle').setDescription('Düzenli orduya asker ekler.')
      .addRoleOption(o => o.setName('hane').setDescription('Hane').setRequired(true))
      .addIntegerOption(o => o.setName('miktar').setDescription('Miktar').setRequired(true).setMinValue(1)))
    .addSubcommand(s => s.setName('asker-cikart').setDescription('Düzenli ordudan asker çıkartır.')
      .addRoleOption(o => o.setName('hane').setDescription('Hane').setRequired(true))
      .addIntegerOption(o => o.setName('miktar').setDescription('Miktar').setRequired(true).setMinValue(1)))
    .addSubcommand(s => s.setName('paraliasker-ekle').setDescription('Paralı asker ekler.')
      .addRoleOption(o => o.setName('hane').setDescription('Hane').setRequired(true))
      .addIntegerOption(o => o.setName('miktar').setDescription('Miktar').setRequired(true).setMinValue(1)))
    .addSubcommand(s => s.setName('paraliasker-cikart').setDescription('Paralı asker çıkartır.')
      .addRoleOption(o => o.setName('hane').setDescription('Hane').setRequired(true))
      .addIntegerOption(o => o.setName('miktar').setDescription('Miktar').setRequired(true).setMinValue(1)))
    .addSubcommand(s => s.setName('donanma-ekle').setDescription('Donanma ekler.')
      .addRoleOption(o => o.setName('hane').setDescription('Hane').setRequired(true))
      .addIntegerOption(o => o.setName('miktar').setDescription('Miktar').setRequired(true).setMinValue(1)))
    .addSubcommand(s => s.setName('donanma-cikart').setDescription('Donanma çıkartır.')
      .addRoleOption(o => o.setName('hane').setDescription('Hane').setRequired(true))
      .addIntegerOption(o => o.setName('miktar').setDescription('Miktar').setRequired(true).setMinValue(1))),

  async execute(interaction, client) {
    if (!yetkiliMi(interaction.member)) {
      return interaction.reply({ content: '❌ Bu komutu kullanma yetkin yok.', flags: 64 });
    }

    await interaction.deferReply({ flags: 64 });

    const sub    = interaction.options.getSubcommand();
    const rol    = interaction.options.getRole('hane');
    const miktar = interaction.options.getInteger('miktar');

    const haneKonfig = haneKonfigBul(rol.id);
    if (!haneKonfig) return interaction.editReply('❌ Bu rol bir haneye ait değil.');

    const hane = await haneGetir(haneKonfig.rolId, haneKonfig.isim);

    // Alan ve işlem belirle
    const MAP = {
      'kasa-ekle':           { alan: 'kasa',          islem: 'ekle', carpan: 1 },
      'kasa-cikart':         { alan: 'kasa',          islem: 'cikart', carpan: -1 },
      'gelir-ekle':          { alan: 'haftalikGelir', islem: 'ekle', carpan: 1 },
      'gelir-cikart':        { alan: 'haftalikGelir', islem: 'cikart', carpan: -1 },
      'asker-ekle':          { alan: 'duzenliAsker',  islem: 'ekle', carpan: 1 },
      'asker-cikart':        { alan: 'duzenliAsker',  islem: 'cikart', carpan: -1 },
      'paraliasker-ekle':    { alan: 'paraliAsker',   islem: 'ekle', carpan: 1 },
      'paraliasker-cikart':  { alan: 'paraliAsker',   islem: 'cikart', carpan: -1 },
      'donanma-ekle':        { alan: 'donanma',       islem: 'ekle', carpan: 1 },
      'donanma-cikart':      { alan: 'donanma',       islem: 'cikart', carpan: -1 },
    };

    const { alan, islem, carpan } = MAP[sub];
    const yeniDeger = Math.max(0, (hane[alan] || 0) + carpan * miktar);

    await House.findOneAndUpdate(
      { rolId: haneKonfig.rolId },
      { $set: { [alan]: yeniDeger } }
    );

    await interaction.editReply(yanitOlustur(islem, alan, miktar, haneKonfig.isim, yeniDeger));
  },
};