const { channels } = require('../config/config');
const { logMessage } = require('../utils/components');
const E = require('../utils/emojis');

module.exports = {
  name: 'voiceStateUpdate',

  async execute(oldState, newState, client) {
    const { guild, member } = newState;
    if (member?.user?.bot) return;

    const logChannel = guild.channels.cache.get(channels.SES_LOG);
    if (!logChannel) return;

    const user = member?.user;
    const avatar = user?.displayAvatarURL({ size: 256 });

    // ── Kanala katıldı ────────────────────────────────────────
    if (!oldState.channel && newState.channel) {
      return logChannel.send(
        logMessage({
          title:     `${E.SPEAKER} Ses Kanalına Katıldı`,
          avatarUrl: avatar,
          fields: [
            { label: `${E.USER} Kullanıcı:`, value: `${user} (\`${user?.id}\`)` },
            { label: `${E.HEADSET} Kanal:`,  value: `**${newState.channel.name}**` },
          ],
          footer: `${E.timestamp(new Date(), 'F')}`,
        })
      );
    }

    // ── Kanaldan ayrıldı ──────────────────────────────────────
    if (oldState.channel && !newState.channel) {
      return logChannel.send(
        logMessage({
          title:     `${E.MUTE} Ses Kanalından Ayrıldı`,
          avatarUrl: avatar,
          fields: [
            { label: `${E.USER} Kullanıcı:`, value: `${user} (\`${user?.id}\`)` },
            { label: `${E.HEADSET} Kanal:`,  value: `**${oldState.channel.name}**` },
          ],
          footer: `${E.timestamp(new Date(), 'F')}`,
        })
      );
    }

    // ── Kanal değiştirdi ──────────────────────────────────────
    if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
      return logChannel.send(
        logMessage({
          title:     `${E.MIC} Ses Kanalı Değiştirdi`,
          avatarUrl: avatar,
          fields: [
            { label: `${E.USER} Kullanıcı:`, value: `${user} (\`${user?.id}\`)` },
            { label: `${E.HEADSET} Önceki:`, value: `**${oldState.channel.name}**` },
            { label: `${E.SPEAKER} Yeni:`,   value: `**${newState.channel.name}**` },
          ],
          footer: `${E.timestamp(new Date(), 'F')}`,
        })
      );
    }
  },
};
