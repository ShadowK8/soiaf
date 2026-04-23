const { channels } = require('../config/config');
const { logMessage } = require('../utils/components');
const E = require('../utils/emojis');

module.exports = {
  name: 'roleDelete',

  async execute(role, client) {
    const logChannel = role.guild.channels.cache.get(channels.SUNUCU_LOG);
    if (!logChannel) return;

    let deleter = 'Bilinmiyor';
    try {
      const audit = await role.guild.fetchAuditLogs({ type: 32, limit: 1 }); // ROLE_DELETE = 32
      const entry = audit.entries.first();
      if (entry && Date.now() - entry.createdTimestamp < 5000) {
        deleter = `${entry.executor} (\`${entry.executor.id}\`)`;
      }
    } catch { /* Yetki yoksa */ }

    await logChannel.send(
      logMessage({
        title: `${E.TRASH} Rol Silindi`,
        fields: [
          { label: `${E.SHIELD} Rol Adı:`, value: `\`${role.name}\`` },
          { label: `${E.USER} Silen:`,     value: deleter },
        ],
        footer: `${E.timestamp(new Date(), 'F')}`,
      })
    );
  },
};
