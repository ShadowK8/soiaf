const { ChannelType } = require('discord.js');
const { channels } = require('../config/config');
const { logMessage, CV2_FLAG } = require('../utils/components');
const { takipEdilenKategoriler } = require('../commands/rp/rpKategoriEkle');
const { kanalıRpYap } = require('../commands/rp/rpKanalEkle');
const RpChannel = require('../models/RpChannel');
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
  name: 'channelCreate',

  async execute(channel, client) {
    if (!channel.guild) return;

    // ── Sunucu log ────────────────────────────────────────────
    const logChannel = channel.guild.channels.cache.get(channels.SUNUCU_LOG);
    if (logChannel) {
      const type     = channelTypeNames[channel.type] ?? 'Bilinmeyen';
      const category = channel.parent?.name ?? 'Yok';

      let creator = 'Bilinmiyor';
      try {
        const audit = await channel.guild.fetchAuditLogs({ type: 10, limit: 1 });
        const entry = audit.entries.first();
        if (entry && Date.now() - entry.createdTimestamp < 5000) {
          creator = `${entry.executor} (\`${entry.executor.id}\`)`;
        }
      } catch { /* Yetki yoksa */ }

      await logChannel.send(
        logMessage({
          title: `${E.BELL} Kanal Oluşturuldu`,
          fields: [
            { label: `${E.SCROLL} Kanal:`,   value: `${channel} (\`${channel.name}\`)` },
            { label: `${E.STAR} Tür:`,        value: type },
            { label: `${E.MAP} Kategori:`,    value: category },
            { label: `${E.USER} Oluşturan:`,  value: creator },
          ],
          footer: `${E.timestamp(new Date(), 'F')}`,
        })
      );
    }

    // ── Takip edilen kategoride mi? ───────────────────────────
    const desteklenen = [
      ChannelType.GuildText,
      ChannelType.GuildForum,
      ChannelType.GuildVoice,
      ChannelType.GuildAnnouncement,
      ChannelType.PublicThread,
      ChannelType.PrivateThread,
    ];

    // Thread ise parent'ının kategorisini kontrol et
    const kategoriId = channel.parentId
      ? (channel.parent?.parentId ?? channel.parentId)
      : null;

    if (
      desteklenen.includes(channel.type) &&
      kategoriId &&
      takipEdilenKategoriler.has(kategoriId)
    ) {
      await kanalıRpYap(channel, channel.guild.id, 'auto', kategoriId);
    }
  },
};