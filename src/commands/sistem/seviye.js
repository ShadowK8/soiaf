const { SlashCommandBuilder } = require('discord.js');
const User = require('../../models/User');
const { CV2_FLAG } = require('../../utils/components');
const E = require('../../utils/emojis');

const KELIME_PER_SEVIYE = 7500;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('seviye')
    .setDescription('Güncel seviyeni ve serbest stat puanını gösterir.')
    .addUserOption(opt =>
      opt.setName('kullanici').setDescription('Başka bir kullanıcıyı görmek için').setRequired(false)
    ),

  async execute(interaction, client) {
    await interaction.deferReply();

    const hedef = interaction.options.getUser('kullanici') ?? interaction.user;
    const user  = await User.findOne({ discordId: hedef.id });

    if (!user) {
      return interaction.editReply({
        flags: CV2_FLAG,
        components: [{ type: 17, components: [{ type: 10, content: `❌ ${hedef.tag} henüz kayıtlı değil.` }] }],
      });
    }

    const toplamKelime  = user.rpStats?.totalWords ?? 0;
    const seviye        = Math.floor(toplamKelime / KELIME_PER_SEVIYE);
    const serbestPuan   = user.serbestStatPuani ?? 0;
    const mevcut        = toplamKelime % KELIME_PER_SEVIYE;
    const kalanKelime   = KELIME_PER_SEVIYE - mevcut;
    const yuzde         = Math.round((mevcut / KELIME_PER_SEVIYE) * 10);
    const bar           = '█'.repeat(yuzde) + '░'.repeat(10 - yuzde);
    const bakiye        = user.economy?.gold ?? 0;

    const icerik = [
      `## ${E.STAR} ${hedef.displayName} — Seviye Bilgisi`,
      ``,
      `**📊 Seviye:** ${seviye}`,
      `**🎯 Serbest Stat Puanı:** ${serbestPuan}`,
      ``,
      `**${E.SCROLL} Toplam Kelime:** ${toplamKelime.toLocaleString('tr-TR')}`,
      `**📈 Sonraki Seviye:**`,
      `\`${bar}\` ${mevcut.toLocaleString('tr-TR')}/${KELIME_PER_SEVIYE.toLocaleString('tr-TR')}`,
      `*${kalanKelime.toLocaleString('tr-TR')} kelime kaldı*`,
      ``,
      `**${E.GOLD} Bireysel Bakiye:** ${bakiye.toLocaleString('tr-TR')} Altın Ejderha`,
      ``,
      `-# ${E.timestamp(new Date(), 'F')}`,
    ].join('\n');

    await interaction.editReply({
      flags: CV2_FLAG,
      components: [{
        type: 17,
        components: [{
          type: 9,
          components: [{ type: 10, content: icerik }],
          accessory: { type: 11, media: { url: hedef.displayAvatarURL({ size: 256 }) } },
        }],
      }],
    });
  },
};