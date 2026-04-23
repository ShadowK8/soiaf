const { channels } = require('../config/config');
const { logMessage } = require('../utils/components');
const E = require('../utils/emojis');

module.exports = {
  name: 'roleCreate',

  async execute(role, client) {
    const logChannel = role.guild.channels.cache.get(channels.SUNUCU_LOG);
    if (!logChannel) return;

    let creator = 'Bilinmiyor';
    try {
      const audit = await role.guild.fetchAuditLogs({ type: 30, limit: 1 }); // ROLE_CREATE = 30
      const entry = audit.entries.first();
      if (entry && Date.now() - entry.createdTimestamp < 5000) {
        creator = `${entry.executor} (\`${entry.executor.id}\`)`;
      }
    } catch { /* Yetki yoksa */ }

    await logChannel.send(
      logMessage({
        title: `${E.STAR} Rol Oluşturuldu`,
        fields: [
          { label: `${E.SHIELD} Rol:`,      value: `<@&${role.id}> (\`${role.name}\`)` },
          { label: `${E.USER} Oluşturan:`,  value: creator },
        ],
        footer: `${E.timestamp(new Date(), 'F')}`,
      })
    );
  },
};
