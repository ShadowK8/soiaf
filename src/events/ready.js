const chalk = require('chalk');
const { ActivityType } = require('discord.js');
const { cacheGuildInvites } = require('../utils/inviteCache');
const { zamanlamaKur } = require('../utils/scheduler');
const { offlineTakipBaslat, heartbeatBaslat } = require('../utils/offlineTracker');
const { kategoriYukle } = require('../commands/rp/rpKategoriEkle');
const { tagTrackerBaslat } = require('../utils/tagTracker');

module.exports = {
  name: 'clientReady',
  once: true,

  async execute(client) {
    console.log(chalk.green(`\n✅ ${client.user.tag} olarak giriş yapıldı.`));
    console.log(chalk.blue(`📡 ${client.guilds.cache.size} sunucuda aktif.`));

    // ── Presence ──────────────────────────────────────────────
    client.user.setPresence({
      activities: [
        {
          name: 'bruceallenn.❤️ASOIAF',
          type: ActivityType.Playing,
        },
      ],
      status: 'idle',
    });

    // ── Davet önbelleği ────────────────────────────────────────
    for (const guild of client.guilds.cache.values()) {
      await cacheGuildInvites(guild);
      console.log(chalk.cyan(`  ↳ Davetler önbelleğe alındı: ${guild.name}`));
    }

    // ── Takip edilen kategorileri yükle ───────────────────────
    await kategoriYukle();
    console.log(chalk.cyan('  ↳ RP kategori listesi yüklendi.'));

    // ── Haftalık sıfırlama zamanlayıcısı ─────────────────────
    zamanlamaKur(client);

    // ── Offline tarama ────────────────────────────────────────
    await offlineTakipBaslat(client);

    // ── Tag Tracker ───────────────────────────────────────────
    tagTrackerBaslat(client);

    // ── Heartbeat (lastOnline güncelle) ───────────────────────
    heartbeatBaslat();

    console.log(chalk.yellow('\n⚔️  ASOIAF™ Bot hazır!\n'));
  },
};