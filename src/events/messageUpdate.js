const { channels } = require('../config/config');
const { logMessage } = require('../utils/components');
const E = require('../utils/emojis');

module.exports = {
  name: 'messageUpdate',

  async execute(oldMessage, newMessage, client) {
    // Partial, bot veya içerik değişmemiş mesajları atla
    if (oldMessage.partial || newMessage.partial) return;
    if (newMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return;

    const logChannel = newMessage.guild?.channels.cache.get(channels.MESAJ_LOG);
    if (!logChannel) return;

    const eskiIcerik = oldMessage.content?.slice(0, 500) || '*Boş*';
    const yeniIcerik = newMessage.content?.slice(0, 500) || '*Boş*';

    await logChannel.send(
      logMessage({
        title:     `${E.PENCIL} Mesaj Düzenlendi`,
        avatarUrl: newMessage.author.displayAvatarURL({ size: 256 }),
        fields: [
          { label: `${E.USER} Kullanıcı:`,  value: `${newMessage.author} (\`${newMessage.author.id}\`)` },
          { label: `${E.BELL} Kanal:`,      value: `${newMessage.channel} — [Mesaja Git](${newMessage.url})` },
          { label: `${E.TRASH} Eski:`,      value: eskiIcerik },
          { label: `${E.PENCIL} Yeni:`,     value: yeniIcerik },
        ],
        footer: `${E.timestamp(new Date(), 'F')}`,
      })
    );
  },
};
