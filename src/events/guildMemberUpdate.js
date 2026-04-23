const { channels } = require('../config/config');
const { logMessage } = require('../utils/components');
const { tagVarMi, rolGuncelle } = require('../utils/tagTracker');
const E = require('../utils/emojis');

module.exports = {
  name: 'guildMemberUpdate',

  async execute(oldMember, newMember, client) {
    if (newMember.user?.bot) return;

    const user   = newMember.user;
    const avatar = user.displayAvatarURL({ size: 256 });
    const { guild } = newMember;

    // ── Guild Tag değişimi kontrolü ───────────────────────────
    const eskiTagVar = tagVarMi(oldMember, guild.id);
    const yeniTagVar = tagVarMi(newMember, guild.id);

    if (eskiTagVar !== yeniTagVar) {
      await rolGuncelle(newMember, yeniTagVar, client);
    }

    // ── Üye log ───────────────────────────────────────────────
    const logChannel = guild.channels.cache.get(channels.UYE_LOG);
    if (!logChannel) return;

    if (oldMember.nickname !== newMember.nickname) {
      await logChannel.send(
        logMessage({
          title:     `${E.PENCIL} Takma Ad Değişti`,
          avatarUrl: avatar,
          fields: [
            { label: `${E.USER} Kullanıcı:`, value: `${user} (\`${user.id}\`)` },
            { label: `${E.TRASH} Eski:`,     value: oldMember.nickname || '*Yok*' },
            { label: `${E.PENCIL} Yeni:`,    value: newMember.nickname || '*Kaldırıldı*' },
          ],
          footer: E.timestamp(new Date(), 'F'),
        })
      );
    }

    const eklenenRoller    = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id));
    const kaldirilanRoller = oldMember.roles.cache.filter(r => !newMember.roles.cache.has(r.id));

    if (eklenenRoller.size > 0) {
      await logChannel.send(
        logMessage({
          title:     `${E.SHIELD} Rol Eklendi`,
          avatarUrl: avatar,
          fields: [
            { label: `${E.USER} Kullanıcı:`, value: `${user} (\`${user.id}\`)` },
            { label: `${E.STAR} Rol(ler):`,  value: eklenenRoller.map(r => `<@&${r.id}>`).join(' ') },
          ],
          footer: E.timestamp(new Date(), 'F'),
        })
      );
    }

    if (kaldirilanRoller.size > 0) {
      await logChannel.send(
        logMessage({
          title:     `${E.SHIELD} Rol Kaldırıldı`,
          avatarUrl: avatar,
          fields: [
            { label: `${E.USER} Kullanıcı:`, value: `${user} (\`${user.id}\`)` },
            { label: `${E.TRASH} Rol(ler):`, value: kaldirilanRoller.map(r => `<@&${r.id}>`).join(' ') },
          ],
          footer: E.timestamp(new Date(), 'F'),
        })
      );
    }
  },
};