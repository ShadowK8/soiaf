const mongoose = require('mongoose');
const RpChannel = require('../models/RpChannel');
const User = require('../models/User');
const { CV2_FLAG } = require('./components');
const E = require('./emojis');

const RAPOR_KANAL_ID = '1495773005828329574';

// BotMeta schema'sı — import yerine burada tanımla
let _BotMeta;
function getBotMeta() {
  if (_BotMeta) return _BotMeta;
  if (mongoose.modelNames().includes('BotMeta')) {
    _BotMeta = mongoose.model('BotMeta');
  } else {
    const schema = new mongoose.Schema(
      { key: { type: String, required: true, unique: true }, value: { type: mongoose.Schema.Types.Mixed } },
      { timestamps: true }
    );
    _BotMeta = mongoose.model('BotMeta', schema);
  }
  return _BotMeta;
}

async function getMeta(key) {
  const doc = await getBotMeta().findOne({ key });
  return doc?.value ?? null;
}

async function setMeta(key, value) {
  await getBotMeta().findOneAndUpdate({ key }, { value }, { upsert: true });
}

function kelimeSay(icerik) {
  return icerik.trim().split(/\s+/).filter((k) => k.length > 0).length;
}

async function offlineTakipBaslat(client) {
  const sonOnline = await getMeta('lastOnline');
  const simdi     = new Date();

  if (!sonOnline) {
    await setMeta('lastOnline', simdi.toISOString());
    return;
  }

  const kapaliTarih = new Date(sonOnline);
  const farkMs      = simdi.getTime() - kapaliTarih.getTime();
  const farkDk      = Math.floor(farkMs / 60000);

  if (farkDk < 2) {
    await setMeta('lastOnline', simdi.toISOString());
    return;
  }

  console.log(`🔍 Offline tarama başladı — ${farkDk} dakika kapalı kalındı.`);

  const guild = client.guilds.cache.first();
  if (!guild) return;

  const rpKanallar = await RpChannel.find({ guildId: guild.id });
  if (rpKanallar.length === 0) return;

  const kelimeler = new Map();

  for (const rpK of rpKanallar) {
    const discord_kanal = guild.channels.cache.get(rpK.channelId);
    if (!discord_kanal) continue;

    let mesajlar;
    try {
      mesajlar = await discord_kanal.messages.fetch({
        limit: 200,
        after: bigintFromDate(kapaliTarih),
      });
    } catch { continue; }

    for (const [, msg] of mesajlar) {
      if (msg.author?.bot) continue;
      if (!msg.content || msg.content.trim().length === 0) continue;
      if (msg.createdAt <= kapaliTarih) continue;

      const k = kelimeSay(msg.content);
      if (k === 0) continue;

      if (!kelimeler.has(msg.author.id)) {
        kelimeler.set(msg.author.id, { kelime: 0, mesajSayisi: 0 });
      }
      const mevcut = kelimeler.get(msg.author.id);
      mevcut.kelime      += k;
      mevcut.mesajSayisi += 1;
    }
  }

  if (kelimeler.size === 0) {
    await setMeta('lastOnline', simdi.toISOString());
    console.log('✅ Offline tarama tamamlandı — kurtarılacak mesaj yok.');
    return;
  }

  const raporKanal = guild.channels.cache.get(RAPOR_KANAL_ID);
  if (!raporKanal) {
    await setMeta('lastOnline', simdi.toISOString());
    return;
  }

  const satirlar = [...kelimeler.entries()]
    .sort(([, a], [, b]) => b.kelime - a.kelime)
    .slice(0, 20)
    .map(([uid, data]) => `<@${uid}> — **${data.kelime}** kelime (${data.mesajSayisi} mesaj)`)
    .join('\n');

  const toplamKelime = [...kelimeler.values()].reduce((t, d) => t + d.kelime, 0);

  const pendingData = [...kelimeler.entries()].map(([uid, data]) => ({
    userId: uid,
    kelime: data.kelime,
  }));
  await setMeta('offlinePending', pendingData);

  await raporKanal.send({
    flags: CV2_FLAG,
    components: [
      {
        type: 17,
        components: [
          {
            type: 10,
            content: [
              `## ${E.EYE} Offline Tarama Raporu`,
              ``,
              `**${E.CLOCK} Kapalı kalınan süre:** ${farkDk} dakika`,
              `**${E.CALENDAR} Aralık:** ${E.timestamp(kapaliTarih, 'f')} → ${E.timestamp(simdi, 'f')}`,
              `**${E.SCROLL} Toplam kurtarılan kelime:** ${toplamKelime.toLocaleString('tr-TR')}`,
              `**${E.USER} Etkilenen üye:** ${kelimeler.size}`,
            ].join('\n'),
          },
          { type: 14, divider: true, spacing: 1 },
          { type: 10, content: satirlar || '*Veri bulunamadı.*' },
          { type: 14, divider: true, spacing: 1 },
          {
            type: 10,
            content: `-# ${E.WARN} Puanları uygulamak veya iptal etmek için aşağıdaki butonları kullan.`,
          },
          {
            type: 1,
            components: [
              { type: 2, custom_id: 'offline_onayla', label: 'Puanları Uygula', style: 3, emoji: { name: '✅' } },
              { type: 2, custom_id: 'offline_iptal',  label: 'İptal Et',        style: 4, emoji: { name: '❌' } },
            ],
          },
        ],
      },
    ],
  });

  await setMeta('lastOnline', simdi.toISOString());
  console.log(`✅ Offline tarama tamamlandı — ${kelimeler.size} üye, ${toplamKelime} kelime.`);
}

function heartbeatBaslat() {
  setInterval(async () => {
    try { await setMeta('lastOnline', new Date().toISOString()); } catch { /* sessiz */ }
  }, 60_000);
}

function bigintFromDate(date) {
  const DISCORD_EPOCH = 1420070400000n;
  return String((BigInt(date.getTime()) - DISCORD_EPOCH) << 22n);
}

module.exports = { offlineTakipBaslat, heartbeatBaslat };