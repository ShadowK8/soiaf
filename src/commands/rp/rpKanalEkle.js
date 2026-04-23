const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const RpChannel = require('../../models/RpChannel');
const { errorMessage, CV2_FLAG } = require('../../utils/components');
const E = require('../../utils/emojis');

async function kanalıRpYap(channel, guildId, addedBy, categoryId = null) {
  // Zaten kayıtlı mı?
  const mevcut = await RpChannel.findOne({ guildId, channelId: channel.id });
  if (mevcut) return false;

  await RpChannel.create({
    guildId,
    channelId:   channel.id,
    channelName: channel.name,
    categoryId,
    addedBy,
  });

  // Kanala bilgi mesajı bırak — forum kanalları mesaj kabul etmez
  if (channel.type !== ChannelType.GuildForum) {
    try {
      await channel.send({
        flags: CV2_FLAG,
        components: [{
          type: 17,
          components: [{
            type: 10,
            content: `-# ${E.SCROLL} Bu kanal roleplay kanalı olarak belirlendi.`,
          }],
        }],
      });
    } catch { /* Yazma izni yoksa atla */ }
  }

  return true;
}

module.exports = {
  kanalıRpYap, // channelCreate event'i de kullanacak

  data: new SlashCommandBuilder()
    .setName('rp-kanal-ekle')
    .setDescription('Seçilen kanalı RP kelime sayacına ekler. (Yetkili)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption((opt) =>
      opt
        .setName('kanal')
        .setDescription('RP kanalı olarak işaretlenecek kanal')
        .setRequired(true)
    ),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: 64 });

    const { guild } = interaction;
    const kanal = interaction.options.getChannel('kanal');

    // Desteklenen kanal tipleri
    const desteklenen = [
      ChannelType.GuildText,
      ChannelType.GuildForum,
      ChannelType.GuildVoice,
      ChannelType.PublicThread,
      ChannelType.PrivateThread,
      ChannelType.GuildAnnouncement,
    ];

    if (!desteklenen.includes(kanal.type)) {
      return interaction.editReply(errorMessage('Bu kanal türü desteklenmiyor.'));
    }

    const eklendi = await kanalıRpYap(
      kanal,
      guild.id,
      interaction.user.id,
      kanal.parentId ?? null
    );

    await interaction.editReply({
      flags: 64 | CV2_FLAG,
      components: [
        {
          type: 17,
          components: [
            {
              type: 10,
              content: eklendi
                ? `${E.CHECK} ${kanal} RP kanalı olarak eklendi.`
                : `${E.WARN} ${kanal} zaten RP kanalı olarak kayıtlı.`,
            },
          ],
        },
      ],
    });
  },
};