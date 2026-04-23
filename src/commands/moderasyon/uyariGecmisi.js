const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Warning = require('../../models/Warning');
const { CV2_FLAG } = require('../../utils/components');
const E = require('../../utils/emojis');

const YETKİLİ_ROLLER = [
  '1495773001902329932','1495773001902329931','1495773001902329930',
  '1495773001902329929','1495773001902329928','1495773001902329927',
  '1495773001902329926','1495773001868771507','1495773001868771506',
];

function yetkiliMi(member) {
  return YETKİLİ_ROLLER.some(r => member.roles.cache.has(r)) ||
    member.permissions.has(PermissionFlagsBits.ModerateMembers);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('uyari-gecmisi')
    .setDescription('Uyarı geçmişini gösterir.')
    .addUserOption(opt =>
      opt.setName('kullanici').setDescription('Belirli bir kullanıcı (boş = genel liste)').setRequired(false)
    ),

  async execute(interaction, client) {
    if (!yetkiliMi(interaction.member)) {
      return interaction.reply({ content: '❌ Bu komutu kullanma yetkin yok.', flags: 64 });
    }

    await interaction.deferReply({ flags: 64 });

    const { guild } = interaction;
    const hedef = interaction.options.getUser('kullanici');

    if (hedef) {
      // ── Belirli kullanıcının uyarıları ──────────────────────
      const uyarilar = await Warning.find({
        guildId: guild.id,
        userId:  hedef.id,
        aktif:   true,
      }).sort({ createdAt: -1 });

      if (uyarilar.length === 0) {
        return interaction.editReply({
          flags: 64 | CV2_FLAG,
          components: [{
            type: 17,
            components: [{ type: 10, content: `${E.CHECK} ${hedef.tag} kullanıcısının aktif uyarısı yok.` }],
          }],
        });
      }

      const satirlar = uyarilar.map((u, i) => {
        const mod = `<@${u.moderatorId}>`;
        return `**${i + 1}.** ${u.sebep}\n-# ${mod} ${E.DOT} ${E.timestamp(u.createdAt, 'f')} ${E.DOT} Silinme: ${E.timestamp(u.silinecekAt, 'R')}`;
      }).join('\n\n');

      return interaction.editReply({
        flags: 64 | CV2_FLAG,
        components: [{
          type: 17,
          components: [{
            type: 9,
            components: [{
              type: 10,
              content: [
                `## ${E.WARN} ${hedef.tag} — Uyarı Geçmişi`,
                `**Aktif Uyarı:** ${uyarilar.length}/5`,
                ``,
                satirlar,
              ].join('\n'),
            }],
            accessory: { type: 11, media: { url: hedef.displayAvatarURL({ size: 256 }) } },
          }],
        }],
      });

    } else {
      // ── Genel liste — en son uyarılananlar ──────────────────
      const uyarilar = await Warning.find({
        guildId: guild.id,
        aktif:   true,
      }).sort({ createdAt: -1 }).limit(20);

      if (uyarilar.length === 0) {
        return interaction.editReply({
          flags: 64 | CV2_FLAG,
          components: [{
            type: 17,
            components: [{ type: 10, content: `${E.CHECK} Sunucuda aktif uyarı bulunmuyor.` }],
          }],
        });
      }

      const satirlar = uyarilar.map((u, i) => {
        return `**${i + 1}.** <@${u.userId}> — ${u.sebep}\n-# <@${u.moderatorId}> ${E.DOT} ${E.timestamp(u.createdAt, 'f')}`;
      }).join('\n\n');

      return interaction.editReply({
        flags: 64 | CV2_FLAG,
        components: [{
          type: 17,
          components: [{
            type: 10,
            content: [
              `## ${E.WARN} Genel Uyarı Geçmişi`,
              `-# En son ${uyarilar.length} uyarı gösteriliyor (yeniden eskiye)`,
              ``,
              satirlar,
            ].join('\n'),
          }],
        }],
      });
    }
  },
};