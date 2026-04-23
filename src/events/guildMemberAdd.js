const { CV2_FLAG } = require('../utils/components');
const { AttachmentBuilder } = require('discord.js');
const { channels } = require('../config/config');
const { detectUsedInvite } = require('../utils/inviteCache');
const { logMessage } = require('../utils/components');
const path = require('path');
const E = require('../utils/emojis');

const GIF_PATH = path.join(__dirname, '../../src/assets/welcome.gif');

const HOSGELDIN_METNI = `ASOIAF: The Peaceful Reign sunucusuna hoş geldiniz.

Yedi Krallık'ın kılıç seslerinden arındığı, barışın hüküm sürdüğü ancak fısıltıların ve siyasi hamlelerin hiç bitmediği bu döneme dahil oldunuz. Taht oyunlarının sadece savaş alanlarında değil, konsey odalarında ve ziyafet masalarında şekillendiği bu hikayede yerinizi almadan önce ilgili kanalları incelemeniz gerekmektedir.

Sunucu kurallarını okuduktan sonra <#1451991932703084775> kanalına giderek isim ve yaşınızı belirterek kayıt olabilirsiniz. Kayıt tamamlandıktan sonra rol ile ilgili tüm kanallara erişim sağlayabileceksiniz.

Diyarın huzuru sizin seçimlerinizle şekillenecek.`;

module.exports = {
  name: 'guildMemberAdd',

  async execute(member, client) {
    const { guild, user } = member;

    // ── Davet tespiti ─────────────────────────────────────────
    const inviteInfo = await detectUsedInvite(guild);

    let inviteField;
    if (inviteInfo.isVanity) {
      inviteField = `${E.LINK} Özel Sunucu URL'si (\`/${inviteInfo.vanityCode}\`)`;
    } else if (inviteInfo.inviterId) {
      const inviter = await client.users.fetch(inviteInfo.inviterId).catch(() => null);
      const inviterMention = inviter
        ? `${inviter} (\`${inviter.id}\`)`
        : `\`${inviteInfo.inviterTag}\``;
      const count = inviteInfo.inviteCount ?? 0;
      inviteField = `${inviterMention} — **${count}. daveti**`;
    } else {
      inviteField = 'Tespit edilemedi';
    }

    // ── Giriş/Çıkış log ───────────────────────────────────────
    const logChannel = guild.channels.cache.get(channels.GIRIS_CIKIS_LOG);
    if (logChannel) {
      await logChannel.send(
        logMessage({
          title:     `${E.WAVE} Sunucuya Katıldı`,
          avatarUrl: user.displayAvatarURL({ size: 256 }),
          fields: [
            { label: `${E.USER} Kullanıcı:`,        value: `${user} (\`${user.id}\`)` },
            { label: `${E.LINK} Davet Eden:`,        value: inviteField },
            { label: `${E.CALENDAR} Hesap Açıldı:`, value: E.timestamp(user.createdAt, 'R') },
            { label: `${E.USER} Üye Sayısı:`,       value: `\`${guild.memberCount}\`` },
          ],
          footer: E.timestamp(new Date(), 'F'),
        })
      );
    }

    // ── Hoşgeldin mesajı ──────────────────────────────────────
    const hosgeldinChannel = guild.channels.cache.get(channels.HOSGELDIN);
    if (!hosgeldinChannel) return;

    const now       = new Date();
    const tarihSaat = E.timestamp(now, 'F');
    const goreli    = E.timestamp(now, 'R');

    const gifAttachment = new AttachmentBuilder(GIF_PATH, { name: 'welcome.gif' });

    await hosgeldinChannel.send({
      flags: CV2_FLAG,
      files: [gifAttachment],
      components: [
        {
          type: 17, // Container — renksiz
          components: [

            // ── Avatar + Kullanıcı adı + mention ──────────
            {
              type: 9, // Section
              components: [
                {
                  type: 10,
                  content: [
                    `${user}`,
                    `### ${E.CASTLE} ${user.displayName}`,
                    `-# ${E.USER} \`${user.username}\` · \`${user.id}\``,
                  ].join('\n'),
                },
              ],
              accessory: {
                type: 11, // Thumbnail — avatar sağda
                media: { url: user.displayAvatarURL({ size: 256 }) },
              },
            },

            // ── Ayraç ─────────────────────────────────────
            { type: 14, divider: true, spacing: 1 },

            // ── Hoşgeldin metni ───────────────────────────
            {
              type: 10,
              content: HOSGELDIN_METNI,
            },

            // ── Ayraç ─────────────────────────────────────
            { type: 14, divider: true, spacing: 1 },

            // ── GIF — attachment olarak, metnin altında ───
            {
              type: 12, // Media Gallery
              items: [
                { media: { url: 'attachment://welcome.gif' } },
              ],
            },

            // ── İnce ayraç ────────────────────────────────
            { type: 14, divider: false, spacing: 1 },

            // ── Alt detay: tarih/saat ─────────────────────
            {
              type: 10,
              content: `-# ${E.CLOCK} ${tarihSaat} · ${goreli}`,
            },

          ],
        },
      ],
    });
  },
};