const { SlashCommandBuilder } = require('discord.js');
const { BOLGELER } = require('../../config/haneler');
const { CV2_FLAG } = require('../../utils/components');
const E = require('../../utils/emojis');

const TEHLIKE_TABLOSU = [
  { min: 1,  max: 4,  baslik: '⚠️ Büyük Tehlike!',        renk: '🔴',
    aciklamalar: [
      'Kampınız gece baskınına uğradı, eşyalarınız yağmalandı.',
      'Denizde şiddetli bir fırtına koptu, gemileriniz hasar gördü.',
      'Yolda pusuya düştünüz, kayıplar var.',
      'Köprü çöktü, çevreyi dolaşmak zorunda kaldınız.',
    ]},
  { min: 5,  max: 10, baslik: '🌧️ Orta Düzey Tehlike',    renk: '🟡',
    aciklamalar: [
      'Kötü hava koşulları yolculuğu yavaşlattı.',
      'Yolunuzu kaybettiniz, fazladan zaman harcandı.',
      'Bir kısım erzak bozuldu.',
      'Araçlardan biri arızalandı, onarım gerekti.',
    ]},
  { min: 11, max: 25, baslik: '✅ Normal Yolculuk',         renk: '🟢',
    aciklamalar: [
      'Yolculuk sorunsuz tamamlandı.',
      'Yol boyunca herhangi bir güçlükle karşılaşılmadı.',
      'Hava güzeldi, yolculuk konforlu geçti.',
    ]},
  { min: 26, max: 30, baslik: '✨ Olağanüstü Yolculuk!',   renk: '🔵',
    aciklamalar: [
      'Yolda değerli bir ganimet buldunuz.',
      'Yolculuk esnasında işinize yarayacak önemli bir bilgi edindınız.',
      'Beklenmedik bir müttefik yolculuğunuza eşlik etti.',
      'Kısa yol keşfettiniz, vaktinden önce ulaştınız.',
    ]},
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('seyahat')
    .setDescription('Seyahat zarı atar ve tehlike belirler.')
    .addStringOption(opt =>
      opt.setName('cikis').setDescription('Yola çıkılan bölge').setRequired(true)
        .addChoices(...BOLGELER.map(b => ({ name: b.emoji + ' ' + b.isim, value: b.isim })))
    )
    .addStringOption(opt =>
      opt.setName('varis').setDescription('Gidilecek bölge').setRequired(true)
        .addChoices(...BOLGELER.map(b => ({ name: b.emoji + ' ' + b.isim, value: b.isim })))
    ),

  async execute(interaction, client) {
    const cikis = interaction.options.getString('cikis');
    const varis = interaction.options.getString('varis');

    if (cikis === varis) {
      return interaction.reply({
        flags: 64 | CV2_FLAG,
        components: [{ type: 17, components: [{ type: 10, content: '❌ Çıkış ve varış bölgesi aynı olamaz.' }] }],
      });
    }

    const zar    = Math.floor(Math.random() * 30) + 1;
    const tehlike = TEHLIKE_TABLOSU.find(t => zar >= t.min && zar <= t.max);
    const aciklama = tehlike.aciklamalar[Math.floor(Math.random() * tehlike.aciklamalar.length)];

    const cikisBolge = BOLGELER.find(b => b.isim === cikis);
    const varisBolge = BOLGELER.find(b => b.isim === varis);

    const icerik = [
      `## 🗺️ Seyahat Sonucu`,
      ``,
      `**${cikisBolge.emoji} Çıkış:** ${cikis}`,
      `**${varisBolge.emoji} Varış:** ${varis}`,
      ``,
      `**🎲 Zar:** \`${zar}\` *(1-30)*`,
      `**${tehlike.renk} Sonuç:** ${tehlike.baslik}`,
      ``,
      `*${aciklama}*`,
      ``,
      ...(zar >= 26 ? ['-# ℹ️ 26-30 aralığı için rol pası yetkililere başvurunuz.'] : []),
      `-# ${interaction.user} tarafından kullanıldı.`,
    ].join('\n');

    await interaction.reply({
      flags: CV2_FLAG,
      components: [{ type: 17, components: [{ type: 10, content: icerik }] }],
    });
  },
};