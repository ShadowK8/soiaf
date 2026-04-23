const { channels } = require('../config/config');
const { logMessage } = require('../utils/components');
const E = require('../utils/emojis');

module.exports = {
  name: 'guildMemberRemove',

  async execute(member, client) {
    const { guild, user } = member;
    const logChannel = guild.channels.cache.get(channels.GIRIS_CIKIS_LOG);
    if (!logChannel) return;

    // Üyenin rollerini listele (en fazla 5 tane)
    const roles = member.roles.cache
      .filter((r) => r.id !== guild.id) // @everyone hariç
      .sort((a, b) => b.position - a.position)
      .first(5)
      .map((r) => `<@&${r.id}>`)
      .join(' ');

    const joinedAt = member.joinedAt
      ? E.timestamp(member.joinedAt, 'R')
      : 'Bilinmiyor';

    await logChannel.send(
      logMessage({
        title:     `${E.LEAVE} Sunucudan Ayrıldı`,
        avatarUrl: user.displayAvatarURL({ size: 256 }),
        fields: [
          { label: `${E.USER} Kullanıcı:`, value: `${user.tag} (\`${user.id}\`)` },
          { label: `${E.CALENDAR} Katılım:`, value: joinedAt },
          { label: `${E.SHIELD} Rolleri:`,  value: roles || 'Yok' },
          {
            label: `${E.USER} Üye Sayısı:`,
            value: `\`${guild.memberCount}\``,
          },
        ],
        footer: `${E.timestamp(new Date(), 'F')}`,
      })
    );
  },
};
