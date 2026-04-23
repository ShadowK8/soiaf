const { ChannelType } = require('discord.js');
const { channels } = require('../config/config');
const { logMessage } = require('../utils/components');
const E = require('../utils/emojis');

const channelTypeNames = {
  [ChannelType.GuildText]:         'Metin Kanalı',
  [ChannelType.GuildVoice]:        'Ses Kanalı',
  [ChannelType.GuildCategory]:     'Kategori',
  [ChannelType.GuildAnnouncement]: 'Duyuru Kanalı',
  [ChannelType.GuildForum]:        'Forum Kanalı',
  [ChannelType.GuildStageVoice]:   'Sahne Kanalı',
  [ChannelType.GuildMedia]:        'Medya Kanalı',
};

module.exports = {
  name: 'channelDelete',

  async execute(channel, client) {
    if (!channel.guild) return;

    const logChannel = channel.guild.channels.cache.get(channels.SUNUCU_LOG);
    if (!logChannel) return;

    const type     = channelTypeNames[channel.type] ?? 'Bilinmeyen';
    const category = channel.parent?.name ?? 'Yok';

    let deleter = 'Bilinmiyor';
    try {
      const audit = await channel.guild.fetchAuditLogs({ type: 12, limit: 1 }); // CHANNEL_DELETE = 12
      const entry = audit.entries.first();
      if (entry && Date.now() - entry.createdTimestamp < 5000) {
        deleter = `${entry.executor} (\`${entry.executor.id}\`)`;
      }
    } catch { /* Yetki yoksa */ }

    await logChannel.send(
      logMessage({
        title: `${E.TRASH} Kanal Silindi`,
        fields: [
          { label: `${E.SCROLL} Kanal Adı:`, value: `\`${channel.name}\`` },
          { label: `${E.STAR} Tür:`,         value: type },
          { label: `${E.MAP} Kategori:`,     value: category },
          { label: `${E.USER} Silen:`,       value: deleter },
        ],
        footer: `${E.timestamp(new Date(), 'F')}`,
      })
    );
  },
};
