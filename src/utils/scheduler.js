const User = require('../models/User');
const House = require('../models/House');
const { CV2_FLAG } = require('./components');
const { AttachmentBuilder } = require('discord.js');
const { MAASLAR } = require('../config/haneler');
const path = require('path');
const E = require('./emojis');

const ILK3_KANAL_ID = '1495773003068342515';
const ILK3_GIF_PATH = path.join(__dirname, '../../src/assets/ilk3gif.gif');

let scheduler = null;

function msKalanPazartesi() {
  const simdi = new Date();
  const hedef = new Date(simdi);
  const gunFarki = (8 - simdi.getDay()) % 7 || 7;
  hedef.setDate(simdi.getDate() + gunFarki);
  hedef.setHours(0, 0, 0, 0);
  return hedef.getTime() - simdi.getTime();
}

async function haftalikSifirla(client) {
  const guild = client.guilds.cache.first();
  if (!guild) return;

  // ── 1. İlk 3 duyurusu ────────────────────────────────────────
  const ilk3 = await User.find({ 'rpStats.weeklyWords': { $gt: 0 } })
    .sort({ 'rpStats.weeklyWords': -1 }).limit(3);

  const kanal = guild.channels.cache.get(ILK3_KANAL_ID);
  if (kanal && ilk3.length > 0) {
    const rozetler = ['🥇', '🥈', '🥉'];
    const oduller  = [750, 500, 250];
    const siralama = ilk3.map((u, i) => {
      const kelime = u.rpStats?.weeklyWords ?? 0;
      const ad     = u.registeredName ?? u.username ?? 'Bilinmiyor';
      return `${rozetler[i]} **${ad}** — ${kelime.toLocaleString('tr-TR')} kelime *(+${oduller[i]} AE)*`;
    }).join('\n');

    const fs = require('fs');
    const gifVar = fs.existsSync(ILK3_GIF_PATH);
    const files  = gifVar ? [new AttachmentBuilder(ILK3_GIF_PATH, { name: 'ilk3.gif' })] : [];

    await kanal.send({
      flags: CV2_FLAG,
      files,
      components: [{
        type: 17,
        components: [
          { type: 10, content: [
            `## ${E.CROWN} Haftanın En Aktif Yazarları`,
            `-# ${E.CALENDAR} ${E.timestamp(new Date(), 'D')} haftası kapandı.`,
          ].join('\n') },
          ...(gifVar ? [{ type: 14, divider: true, spacing: 1 }, { type: 12, items: [{ media: { url: 'attachment://ilk3.gif' } }] }] : []),
          { type: 14, divider: true, spacing: 1 },
          { type: 10, content: siralama },
          { type: 14, divider: false, spacing: 1 },
          { type: 10, content: `-# ${E.FIRE} Haftaya yeniden başlıyor. Kalemler hazır olsun!` },
        ],
      }],
    }).catch(console.error);

    // İlk 3'e ödül ver
    for (let i = 0; i < ilk3.length; i++) {
      await User.findOneAndUpdate(
        { discordId: ilk3[i].discordId },
        { $inc: { 'economy.gold': oduller[i] } }
      );
    }
  }

  // ── 2. Haftalık puanları sıfırla ─────────────────────────────
  await User.updateMany({}, { $set: { 'rpStats.weeklyWords': 0 } });

  // ── 3. Maaşları öde ──────────────────────────────────────────
  await guild.members.fetch();
  let maasOdendi = 0;

  for (const [rolId, maas] of Object.entries(MAASLAR)) {
    const uyeler = guild.members.cache.filter(m =>
      m.roles.cache.has(rolId) && !m.user.bot
    );

    for (const [, uye] of uyeler) {
      await User.findOneAndUpdate(
        { discordId: uye.user.id },
        { $inc: { 'economy.gold': maas } },
        { upsert: true }
      );
      maasOdendi++;
    }
  }

  // ── 4. Hane gelirlerini kasaya ekle ──────────────────────────
  const haneler = await House.find({ haftalikGelir: { $gt: 0 } });
  for (const hane of haneler) {
    await House.findOneAndUpdate(
      { rolId: hane.rolId },
      { $inc: { kasa: hane.haftalikGelir } }
    );
  }

  console.log(`Haftalik sifirlama tamamlandi. Maas: ${maasOdendi} kisi, Hane geliri: ${haneler.length} hane.`);
  zamanlamaKur(client);
}

function zamanlamaKur(client) {
  if (scheduler) clearTimeout(scheduler);
  const kalan = msKalanPazartesi();
  const gun   = Math.floor(kalan / 86400000);
  const saat  = Math.floor((kalan % 86400000) / 3600000);
  console.log('Haftalik sifirlama: ' + gun + ' gun ' + saat + ' saat sonra.');
  scheduler = setTimeout(() => haftalikSifirla(client), kalan);
}

module.exports = { zamanlamaKur };