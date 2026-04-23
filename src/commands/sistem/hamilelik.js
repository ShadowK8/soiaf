const { SlashCommandBuilder } = require('discord.js');
const { CV2_FLAG } = require('../../utils/components');
const E = require('../../utils/emojis');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hamilelik')
    .setDescription('Hamilelik sonucunu belirler.'),

  async execute(interaction, client) {
    // ── Hamile mi? (%60 evet)
    const hamile = Math.random() < 0.60;

    if (!hamile) {
      return interaction.reply({
        flags: CV2_FLAG,
        components: [{
          type: 17,
          components: [{
            type: 10,
            content: [
              `## 🌸 Hamilelik Testi`,
              ``,
              `**Sonuç:** ❌ Hamile kalınamadı.`,
              ``,
              `-# Bu sefer olmadı. Belki bir sonraki sefere...`,
              `-# ${interaction.user} tarafından kullanıldı.`,
            ].join('\n'),
          }],
        }],
      });
    }

    // ── Cinsiyet (%50 erkek %50 kız)
    const erkek = Math.random() < 0.50;
    const cinsiyet = erkek ? '👦 Erkek' : '👧 Kız';

    // ── Çocuk sayısı (%80 tek, %15 ikiz, %5 üçüz)
    const sayi = Math.random();
    let cocukSayisi, cocukMetin;
    if (sayi < 0.80) {
      cocukSayisi = 1;
      cocukMetin  = 'Tek Çocuk';
    } else if (sayi < 0.95) {
      cocukSayisi = 2;
      cocukMetin  = 'İkiz';
    } else {
      cocukSayisi = 3;
      cocukMetin  = 'Üçüz';
    }

    const icerik = [
      `## 🌸 Hamilelik Testi`,
      ``,
      `**Sonuç:** ✅ Hamile kalındı!`,
      ``,
      `**👶 Çocuk Sayısı:** ${cocukMetin}`,
      `**${erkek ? '👦' : '👧'} Cinsiyet:** ${cinsiyet}`,
      ``,
      ...(cocukSayisi > 1 ? [
        `-# ℹ️ Yalnızca bir çocuğun cinsiyeti belirlendi.`,
        `-# Diğer çocukların cinsiyeti anne ve babanın tercihine bırakılmıştır.`,
      ] : []),
      ``,
      `-# ${interaction.user} tarafından kullanıldı.`,
    ].join('\n');

    await interaction.reply({
      flags: CV2_FLAG,
      components: [{ type: 17, components: [{ type: 10, content: icerik }] }],
    });
  },
};