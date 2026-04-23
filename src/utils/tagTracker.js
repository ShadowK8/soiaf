/**
 * Guild Tag Takip Sistemi
 * 
 * İki yöntemle çalışır:
 * 1. guildMemberUpdate event'i — anlık algılama
 * 2. Periyodik tarama (10 dakikada bir) — kaçan değişiklikler için
 * 
 * Algılama: member.user.clan?.identityGuildId === guild.id
 * Discord, tag takıldığında user.clan alanını doldurur.
 */

const { CV2_FLAG } = require('./components');
const E = require('./emojis');

const GUILD_TAG_ROL_ID = '1496106817812435016';
const BOOST_KANAL_ID   = '1495773006323122240';

// Üyenin sunucu tagını takıp takmadığını kontrol eder
function tagVarMi(member, guildId) {
  try {
    const clan = member.user.clan ?? member.user.primaryGuild ?? null;
    if (!clan) return false;
    // Birincil sunucusu bu sunucu mu?
    return clan.identityGuildId === guildId || clan.id === guildId;
  } catch {
    return false;
  }
}

// Rol ver/al + bildirim gönder
async function rolGuncelle(member, tagVar, client) {
  const { user, guild } = member;
  const rolVar = member.roles.cache.has(GUILD_TAG_ROL_ID);
  const avatar  = user.displayAvatarURL({ size: 256 });
  const kanal   = guild.channels.cache.get(BOOST_KANAL_ID);

  if (tagVar && !rolVar) {
    // Tag var, rol yok → rol ver
    try {
      await member.roles.add(GUILD_TAG_ROL_ID, 'Guild Tag takıldı');
    } catch { return; }

    if (kanal) {
      await kanal.send({
        flags: CV2_FLAG,
        allowedMentions: { parse: [] },
        components: [{
          type: 17,
          components: [{
            type: 9,
            components: [{
              type: 10,
              content: [
                `## 🏷️ Guild Tag`,
                ``,
                `${user} sunucu etiketini taktı, teşekkürler! 💛`,
                ``,
                `**Verilen Rol:** <@&${GUILD_TAG_ROL_ID}>`,
                `Etiket sahipleri sohbet kanalında medya paylaşabilir.`,
                ``,
                `-# ${E.timestamp(new Date(), 'F')}`,
              ].join('\n'),
            }],
            accessory: { type: 11, media: { url: avatar } },
          }],
        }],
      }).catch(() => {});
    }

  } else if (!tagVar && rolVar) {
    // Tag yok, rol var → rol al
    try {
      await member.roles.remove(GUILD_TAG_ROL_ID, 'Guild Tag çıkarıldı');
    } catch { return; }

    if (kanal) {
      await kanal.send({
        flags: CV2_FLAG,
        allowedMentions: { parse: [] },
        components: [{
          type: 17,
          components: [{
            type: 9,
            components: [{
              type: 10,
              content: [
                `## 🏷️ Guild Tag Kaldırıldı`,
                ``,
                `${user} sunucu etiketini çıkardı.`,
                ``,
                `**Alınan Rol:** <@&${GUILD_TAG_ROL_ID}>`,
                `Sohbet kanalındaki medya paylaşım izni kaldırıldı.`,
                ``,
                `-# ${E.timestamp(new Date(), 'F')}`,
              ].join('\n'),
            }],
            accessory: { type: 11, media: { url: avatar } },
          }],
        }],
      }).catch(() => {});
    }
  }
}

// Periyodik tarama — 10 dakikada bir tüm üyeleri tara
async function periyodikTara(client) {
  try {
    const guild = client.guilds.cache.first();
    if (!guild) return;

    const members = await guild.members.fetch();
    let islem = 0;

    for (const [, member] of members) {
      if (member.user.bot) continue;
      const tagVar = tagVarMi(member, guild.id);
      const rolVar = member.roles.cache.has(GUILD_TAG_ROL_ID);

      if (tagVar !== rolVar) {
        await rolGuncelle(member, tagVar, client);
        islem++;
        // Rate limit için küçük bekleme
        await new Promise(r => setTimeout(r, 500));
      }
    }

    if (islem > 0) {
      console.log(`Tag tarama: ${islem} üye güncellendi.`);
    }
  } catch (err) {
    console.error('Tag tarama hatası:', err.message);
  }
}

// Başlat
function tagTrackerBaslat(client) {
  // İlk tarama 30sn sonra
  setTimeout(() => periyodikTara(client), 30_000);
  // Sonraki taramalar 5 dakikada bir
  setInterval(() => periyodikTara(client), 5 * 60_000);
  console.log('Tag tracker başlatıldı (10dk aralıklı tarama).');
}

module.exports = { tagVarMi, rolGuncelle, tagTrackerBaslat };