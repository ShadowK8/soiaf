const { channels } = require('../config/config');
const { logMessage } = require('../utils/components');
const E = require('../utils/emojis');

module.exports = {
  name: 'messageDelete',

  async execute(message, client) {
    // Partial mesajlar (önbellekte olmayan) ve bot mesajları atla
    if (message.partial || message.author?.bot) return;

    const logChannel = message.guild?.channels.cache.get(channels.MESAJ_LOG);
    if (!logChannel) return;

    // İçerik yok ve ek yok → loglamaya gerek yok
    const content     = message.content?.slice(0, 900) || '*Metin içeriği yok*';
    const attachments = message.attachments.size
      ? `\n${E.LINK} **${message.attachments.size} ek** silindi.`
      : '';

    await logChannel.send(
      logMessage({
        title:     `${E.TRASH} Mesaj Silindi`,
        avatarUrl: message.author.displayAvatarURL({ size: 256 }),
        fields: [
          { label: `${E.USER} Kullanıcı:`, value: `${message.author} (\`${message.author.id}\`)` },
          { label: `${E.BELL} Kanal:`,     value: `${message.channel}` },
          { label: `${E.SCROLL} İçerik:`,  value: content + attachments },
        ],
        footer: `${E.timestamp(new Date(), 'F')}`,
      })
    );
  },
};
