/**
 * Davet Takip Sistemi
 * Kimin davet ettiğini, kaçıncı davet olduğunu ve
 * özel URL (vanity) kullanımını tespit eder.
 */

// guildId → Map<code, { uses, inviterId, inviterTag, maxUses }>
const inviteCache = new Map();

/**
 * Bir sunucunun tüm davetlerini önbelleğe alır.
 */
async function cacheGuildInvites(guild) {
  try {
    const invites = await guild.invites.fetch();
    const cache = new Map();

    invites.forEach((invite) => {
      cache.set(invite.code, {
        uses:        invite.uses ?? 0,
        inviterId:   invite.inviter?.id ?? null,
        inviterTag:  invite.inviter?.tag ?? 'Bilinmiyor',
        maxUses:     invite.maxUses ?? 0,
      });
    });

    inviteCache.set(guild.id, cache);
    return cache;
  } catch {
    return new Map();
  }
}

/**
 * Yeni üye katıldığında kullanılan daveti tespit eder.
 * @returns {{ invite, inviter, isVanity, inviteCount }}
 */
async function detectUsedInvite(guild) {
  const oldCache = inviteCache.get(guild.id) ?? new Map();

  // Vanity URL kontrolü
  let vanityUses = 0;
  try {
    if (guild.vanityURLCode) {
      const vanity = await guild.fetchVanityData();
      vanityUses = vanity.uses ?? 0;
    }
  } catch { /* Yetki yoksa atla */ }

  // Güncel davetleri al
  let newInvites = new Map();
  try {
    const fetched = await guild.invites.fetch();
    fetched.forEach((invite) => {
      newInvites.set(invite.code, {
        uses:        invite.uses ?? 0,
        inviterId:   invite.inviter?.id ?? null,
        inviterTag:  invite.inviter?.tag ?? 'Bilinmiyor',
        maxUses:     invite.maxUses ?? 0,
      });
    });
  } catch { /* Yetki yoksa */ }

  // Önbelleği güncelle
  inviteCache.set(guild.id, newInvites);

  // Kullanılan daveti bul
  let usedCode   = null;
  let usedInvite = null;

  for (const [code, newData] of newInvites) {
    const oldData = oldCache.get(code);
    if (!oldData) {
      // Yeni davet kodu — oluşturulduğunda zaten 1 kullanım olabilir
      if (newData.uses > 0) {
        usedCode   = code;
        usedInvite = newData;
        break;
      }
      continue;
    }
    if (newData.uses > oldData.uses) {
      usedCode   = code;
      usedInvite = newData;
      break;
    }
  }

  // Eğer bulunamadıysa vanity kontrolü (uses arttıysa)
  if (!usedInvite && guild.vanityURLCode) {
    try {
      const freshVanity = await guild.fetchVanityData();
      if ((freshVanity.uses ?? 0) > vanityUses) {
        return {
          invite:       null,
          inviter:      null,
          isVanity:     true,
          vanityCode:   guild.vanityURLCode,
          inviteCount:  null,
        };
      }
    } catch { /* */ }
  }

  if (!usedInvite) {
    return {
      invite:      null,
      inviter:     null,
      isVanity:    false,
      inviteCount: null,
    };
  }

  // Davet edenin toplam davetini hesapla (mevcut davetlerin toplamı)
  let inviteCount = 0;
  for (const [, data] of newInvites) {
    if (data.inviterId === usedInvite.inviterId) {
      inviteCount += data.uses ?? 0;
    }
  }

  return {
    invite:      { code: usedCode, ...usedInvite },
    inviterId:   usedInvite.inviterId,
    inviterTag:  usedInvite.inviterTag,
    isVanity:    false,
    inviteCount,
  };
}

module.exports = { cacheGuildInvites, detectUsedInvite, inviteCache };
