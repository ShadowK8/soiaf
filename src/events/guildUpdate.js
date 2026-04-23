const { channels } = require('../config/config');
const { logMessage } = require('../utils/components');
const E = require('../utils/emojis');

module.exports = {
  name: 'guildUpdate',

  async execute(oldGuild, newGuild, client) {
    const logChannel = newGuild.channels.cache.get(channels.SUNUCU_LOG);
    if (!logChannel) return;

    const changes = [];

    if (oldGuild.name !== newGuild.name) {
      changes.push({
        label: `${E.PENCIL} Sunucu Adı:`,
        value: `\`${oldGuild.name}\` → \`${newGuild.name}\``,
      });
    }

    if (oldGuild.icon !== newGuild.icon) {
      changes.push({
        label: `${E.EYE} İkon:`,
        value: newGuild.icon ? 'Güncellendi' : 'Kaldırıldı',
      });
    }

    if (oldGuild.vanityURLCode !== newGuild.vanityURLCode) {
      changes.push({
        label: `${E.LINK} Özel URL:`,
        value: `\`/${oldGuild.vanityURLCode ?? 'Yok'}\` → \`/${newGuild.vanityURLCode ?? 'Kaldırıldı'}\``,
      });
    }

    if (oldGuild.verificationLevel !== newGuild.verificationLevel) {
      changes.push({
        label: `${E.SHIELD} Doğrulama Seviyesi:`,
        value: `\`${oldGuild.verificationLevel}\` → \`${newGuild.verificationLevel}\``,
      });
    }

    if (changes.length === 0) return;

    await logChannel.send(
      logMessage({
        title: `${E.CASTLE} Sunucu Güncellendi`,
        fields: changes,
        footer: `${E.timestamp(new Date(), 'F')}`,
      })
    );
  },
};
