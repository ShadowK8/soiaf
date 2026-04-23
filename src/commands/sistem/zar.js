const { SlashCommandBuilder } = require('discord.js');
const { CV2_FLAG } = require('../../utils/components');
const E = require('../../utils/emojis');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('zar')
    .setDescription('Zar atar. Örnek: 1d20+5, 1d30+entrika')
    .addStringOption(opt =>
      opt.setName('format').setDescription('Format: 1dX veya 1dX+sayi').setRequired(true)
    ),

  async execute(interaction, client) {
    const format = interaction.options.getString('format').toLowerCase().trim();

    // 1dX veya 1dX+N formatını parse et
    const match = format.match(/^1d(\d+)(?:\+(\d+|[a-züğışçö]+))?$/i);
    if (!match) {
      return interaction.reply({
        flags: 64 | CV2_FLAG,
        components: [{ type: 17, components: [{ type: 10, content: '❌ Geçersiz format. Örnek: `1d20`, `1d30+5`, `1d30+entrika`' }] }],
      });
    }

    const yuze    = parseInt(match[1]);
    const bonus   = match[2] ?? null;
    const bonusSayi = bonus && /^\d+$/.test(bonus) ? parseInt(bonus) : null;
    const bonusIsim = bonus && !/^\d+$/.test(bonus) ? bonus : null;

    if (yuze < 2 || yuze > 1000) {
      return interaction.reply({
        flags: 64 | CV2_FLAG,
        components: [{ type: 17, components: [{ type: 10, content: '❌ Zar yüzü 2 ile 1000 arasında olmalı.' }] }],
      });
    }

    const zar    = Math.floor(Math.random() * yuze) + 1;
    const toplam = bonusSayi !== null ? zar + bonusSayi : zar;

    // Sonuç yorumu (1d30 için seyahat/stat aralıkları)
    let yorum = '';
    if (yuze === 30) {
      if (zar <= 4)       yorum = '⚠️ *Büyük tehlike!*';
      else if (zar <= 10) yorum = '🌧️ *Orta düzey tehlike.*';
      else if (zar <= 25) yorum = '✅ *Yolculuk normal geçti.*';
      else                yorum = '✨ *Olağanüstü başarı!*';
    }

    const satirlar = [
      `## 🎲 Zar Sonucu`,
      ``,
      `**Format:** \`${format}\``,
      `**${E.SWORD} Zar:** \`${zar}\` *(1-${yuze})*`,
    ];

    if (bonusSayi !== null) {
      satirlar.push(`**➕ Bonus:** \`+${bonusSayi}\``);
      satirlar.push(`**🏆 Toplam:** \`${toplam}\``);
    } else if (bonusIsim !== null) {
      satirlar.push(`**➕ Stat Bonusu:** \`${bonusIsim}\` *(stat sistemi gelince eklenir)*`);
      satirlar.push(`**🏆 Şimdilik:** \`${zar}\``);
    }

    if (yorum) satirlar.push(``, yorum);
    satirlar.push(``, `-# ${interaction.user} zarı attı.`);

    await interaction.reply({
      flags: CV2_FLAG,
      components: [{ type: 17, components: [{ type: 10, content: satirlar.join('\n') }] }],
    });
  },
};