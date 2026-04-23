const { SlashCommandBuilder } = require('discord.js');

const IKON_KANAL_ID = '1496229629743071392';
const AYRAC_UST    = 'https://cdn.discordapp.com/attachments/1495818542958903348/1495826722279653526/AYRAC.png?ex=69e8fa31&is=69e7a8b1&hm=b3c793827db2461ef86cbf244f62f58ffe83cbbcdf2daddba19945efbb91967e&';
const AYRAC_ALT    = 'https://cdn.discordapp.com/attachments/1495818542958903348/1495827600612921526/ayrac2.png?ex=69e8fb03&is=69e7a983&hm=cd54fd3d38bc8d5bb6228c3aab2b66637f2d13f19909c3fc35029ad7be1513d2&';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ikon-yukle')
    .setDescription('Karakter görselini yükler.')
    .addAttachmentOption(opt =>
      opt.setName('gorsel').setDescription('Karakter görseli (png/jpg/webp)').setRequired(true)
    ),

  async execute(interaction, client) {
    const { user, guild } = interaction;
    const gorsel = interaction.options.getAttachment('gorsel');

    // Sadece görsel formatları kabul et
    const izinliFormatlar = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
    if (!izinliFormatlar.includes(gorsel.contentType)) {
      return interaction.reply({ content: '❌ Sadece PNG, JPG, WEBP veya GIF formatında görsel yükleyebilirsin.', flags: 64 });
    }

    const ikonKanal = guild.channels.cache.get(IKON_KANAL_ID);
    if (!ikonKanal) {
      return interaction.reply({ content: '❌ İkon kanalı bulunamadı.', flags: 64 });
    }

    // Kanala gönder
    await ikonKanal.send(AYRAC_UST);
    await ikonKanal.send({
      content: `${user} **adlı kişinin karakter görseli:**`,
      files: [{ attachment: gorsel.url, name: gorsel.name }],
    });
    await ikonKanal.send(AYRAC_ALT);

    await interaction.reply({ content: '✅ Karakter görselin yüklendi!', flags: 64 });
  },
};