const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const RpChannel = require('../../models/RpChannel');
const { kanalıRpYap } = require('./rpKanalEkle');
const { errorMessage, CV2_FLAG } = require('../../utils/components');
const E = require('../../utils/emojis');

// Kategori ID'lerini takip et — channelCreate event'i bunu kullanır
const takipEdilenKategoriler = new Set();

async function kategoriYukle() {
  // Sunucu yeniden başladığında DB'den yükle
  const kanallar = await RpChannel.find({ categoryId: { $ne: null } });
  kanallar.forEach((k) => {
    if (k.categoryId) takipEdilenKategoriler.add(k.categoryId);
  });
}

module.exports = {
  takipEdilenKategoriler,
  kategoriYukle,

  data: new SlashCommandBuilder()
    .setName('rp-kategori-ekle')
    .setDescription('Kategorideki tüm kanalları RP kelime sayacına ekler. (Yetkili)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption((opt) =>
      opt
        .setName('kategori_id')
        .setDescription('Kategori ID\'si')
        .setRequired(true)
    ),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: 64 });

    const { guild } = interaction;
    const kategoriId = interaction.options.getString('kategori_id');

    // Kategoriyi bul
    const kategori = guild.channels.cache.get(kategoriId);
    if (!kategori || kategori.type !== ChannelType.GuildCategory) {
      return interaction.editReply(errorMessage('Geçerli bir kategori ID\'si gir.'));
    }

    // Kategorideki tüm kanalları al
    const altKanallar = guild.channels.cache.filter(
      (c) => c.parentId === kategoriId
    );

    // Desteklenen tipler
    const desteklenen = [
      ChannelType.GuildText,
      ChannelType.GuildForum,
      ChannelType.GuildVoice,
      ChannelType.GuildAnnouncement,
    ];

    let eklenen = 0;
    let atlanan = 0;

    for (const [, kanal] of altKanallar) {
      if (!desteklenen.includes(kanal.type)) continue;

      const sonuc = await kanalıRpYap(
        kanal,
        guild.id,
        interaction.user.id,
        kategoriId
      );

      if (sonuc) {
        eklenen++;
        // Forum ise aktif thread'leri de ekle
        if (kanal.type === ChannelType.GuildForum) {
          const threads = await kanal.threads.fetchActive().catch(() => null);
          if (threads) {
            for (const [, thread] of threads.threads) {
              await kanalıRpYap(thread, guild.id, interaction.user.id, kategoriId);
            }
          }
        }
      } else {
        atlanan++;
      }
    }

    // Kategoriyi takip listesine ekle
    takipEdilenKategoriler.add(kategoriId);

    await interaction.editReply({
      flags: 64 | CV2_FLAG,
      components: [
        {
          type: 17,
          components: [
            {
              type: 10,
              content: [
                `${E.CHECK} **${kategori.name}** kategorisi işlendi.`,
                ``,
                `**${E.SCROLL} Eklenen kanal:** ${eklenen}`,
                `**${E.WARN} Zaten kayıtlı:** ${atlanan}`,
                ``,
                `-# ${E.BELL} Kategoriye sonradan eklenen kanallar otomatik olarak sisteme dahil edilecek.`,
              ].join('\n'),
            },
          ],
        },
      ],
    });
  },
};