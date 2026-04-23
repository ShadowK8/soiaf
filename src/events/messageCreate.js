const RpChannel = require('../models/RpChannel');
const User = require('../models/User');

const KELIME_PER_SEVIYE = 7500;
const AE_PER_1000_KELIME = 500; // Her 1000 kelime = 500 Altın Ejderha

function kelimeSay(icerik) {
  return icerik.trim().split(/\s+/).filter(k => k.length > 0).length;
}

module.exports = {
  name: 'messageCreate',

  async execute(message, client) {
    if (message.author?.bot) return;
    if (!message.guild) return;
    if (!message.content || typeof message.content !== 'string' || message.content.trim().length === 0) return;

    const kanalId  = message.channel.id;
    const parentId = message.channel.parentId ?? null;

    const rpKanal = await RpChannel.findOne({
      guildId:   message.guild.id,
      channelId: { $in: [kanalId, parentId].filter(Boolean) },
    });
    if (!rpKanal) return;

    const kelime = kelimeSay(message.content);
    if (kelime === 0) return;

    // Kullanıcıyı getir veya oluştur
    const user = await User.findOneAndUpdate(
      { discordId: message.author.id },
      {
        $inc: {
          'rpStats.totalWords':  kelime,
          'rpStats.weeklyWords': kelime,
        },
        $set: {
          'rpStats.lastActivity': new Date(),
          username: message.author.tag ?? message.author.username,
        },
      },
      { upsert: true, new: true }
    );

    // ── Altın Ejderha ekle (her 1000 kelime = 500 AE) ─────────
    const oncekiToplam = (user.rpStats?.totalWords ?? 0) - kelime;
    const yeniToplam   = user.rpStats?.totalWords ?? 0;

    const oncekiBin = Math.floor(oncekiToplam / 1000);
    const yeniBin   = Math.floor(yeniToplam / 1000);
    const binFark   = yeniBin - oncekiBin;

    if (binFark > 0) {
      const aeKazanilan = binFark * AE_PER_1000_KELIME;
      await User.findOneAndUpdate(
        { discordId: message.author.id },
        { $inc: { 'economy.gold': aeKazanilan } }
      );
    }

    // ── Seviye kontrolü ────────────────────────────────────────
    const oncekiSeviye = Math.floor(oncekiToplam / KELIME_PER_SEVIYE);
    const yeniSeviye   = Math.floor(yeniToplam / KELIME_PER_SEVIYE);

    if (yeniSeviye > oncekiSeviye) {
      const seviyeFark = yeniSeviye - oncekiSeviye;
      await User.findOneAndUpdate(
        { discordId: message.author.id },
        { $inc: { serbestStatPuani: seviyeFark } }
      );
    }
  },
};