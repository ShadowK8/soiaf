const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { takipEdilenKategoriler } = require('../rp/rpKategoriEkle');
const { CV2_FLAG } = require('../../utils/components');
const RpChannel = require('../../models/RpChannel');
const E = require('../../utils/emojis');

const YETKILI_ID = '906876769230012416';

const SILINECEK_KATEGORILER = [
  '1495877245024342206',
  '1495877214485614684',
  '1495877170210279425',
  '1495877155261907076',
  '1495877132621189266',
  '1495877085791780995',
  '1495877043999604898',
  '1495877024856674405',
];

const ROL_YAZAMAZ   = '1495773001105412171';
const ROL_YAZABILIR = '1495773001105412172';

const YAPI = [
  {
    kategori: 'Kuzey Toprakları',
    kanallar: [
      '🍃┆yollar','🪽┆0','🐺┆winterfell','🐟┆white harbor',
      '🩸┆dreadfort','❄️┆karhold','🕯️┆last hearth',
      '🌲┆deepwood motte','🛡️┆castle cerwyn','🐻┆bear island',
      '🐸┆greywater watch',
    ],
  },
  {
    kategori: 'Demir Adalar',
    kanallar: [
      '🍃┆yollar','🪽┆0','🐙┆pyke','📖┆castle harlaw',
      '🔨┆hammerhorn','🌊┆blacktyde','⚓️┆lordsport','🎭┆old wyk',
    ],
  },
  {
    kategori: 'Nehir Toprakları',
    kanallar: [
      '🍃┆yollar','🪽┆0','🐟┆riverrun','🌉┆the twins',
      '🧱┆seagard','🐦‍⬛┆raventree hall','🐎┆stone hedge',
      '🗡️┆wayfarer\'s rest','🎻┆pinkmaiden','🛡️┆castle darry','🕯️┆harrenhal',
    ],
  },
  {
    kategori: 'Vadi Toprakları',
    kanallar: [
      '🍃┆yollar','🪽┆0','🦅┆eyrie','🪨┆runestone',
      '⚓┆gulltown','🌳┆ironoaks','🏰┆redfort','🎼┆strongsong',
    ],
  },
  {
    kategori: 'Batı Toprakları',
    kanallar: [
      '🍃┆yollar','🪽┆0','🦁┆casterly rock','🛡️┆ashemark',
      '⚒️┆golden tooth','🌄┆castle crakehall','🐗┆hornvale','⚖️┆faircastle',
    ],
  },
  {
    kategori: 'Taç Toprakları',
    kanallar: [
      '🍃┆yollar','🪽┆0','👑┆king\'s landing','🐉┆driftmark',
      '🦀┆claw isle','🏰┆castle rosby','🛡️┆stonedance','⚔️┆duskendale',
    ],
  },
  {
    kategori: 'Fırtına Toprakları',
    kanallar: [
      '🍃┆yollar','🪽┆0','🦌┆storm\'s end','🌴┆evenfall hall',
      '⚔️┆blackhaven','🌾┆harvest hall','🦢┆stonehelm',
      '🐢┆greenstone','🪉┆nightsong',
    ],
  },
  {
    kategori: 'Menzil Toprakları',
    kanallar: [
      '🍃┆yollar','🪽┆0','🌿┆highgarden','🏚┆oldtown',
      '🍷┆arbor island','🛡️┆horn hill','🌅┆goldengrove',
      '🌸┆brightwater keep','🌳┆old oak','🍎┆cider hall',
    ],
  },
  {
    kategori: 'Dorne Toprakları',
    kanallar: [
      '🍃┆yollar','🪽┆0','☀️┆sunspear','🪾┆yronwood',
      '🌠┆starfall','⛰️┆skyreach','🏔️┆blackmont','🦂┆hellholt',
    ],
  },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rp-kurulum')
    .setDescription('RP kanallarini siler ve yeniden olusturur.')
    .addBooleanOption((opt) =>
      opt.setName('onay').setDescription('Kurulumu baslatmak icin true sec.').setRequired(true)
    ),

  async execute(interaction, client) {
    if (interaction.user.id !== YETKILI_ID) {
      return interaction.reply({ content: 'Yetkin yok.', flags: 64 });
    }

    const onay = interaction.options.getBoolean('onay');
    if (!onay) {
      return interaction.reply({ content: 'Onay verilmedi.', flags: 64 });
    }

    await interaction.deferReply();
    const { guild } = interaction;

    await interaction.editReply('1/3 - Eski kanallar siliniyor...');

    for (const katId of SILINECEK_KATEGORILER) {
      const kategori = guild.channels.cache.get(katId);
      if (!kategori) continue;
      const altKanallar = guild.channels.cache.filter(c => c.parentId === katId);
      for (const [, kanal] of altKanallar) {
        try { await kanal.delete(); await new Promise(r => setTimeout(r, 300)); } catch (e) {}
      }
      try { await kategori.delete(); await new Promise(r => setTimeout(r, 300)); } catch (e) {}
    }

    await interaction.editReply('2/3 - Yeni kanallar olusturuluyor...');

    const permissionOverwrites = [
      { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
      {
        id: ROL_YAZAMAZ,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
        deny: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.CreatePublicThreads, PermissionFlagsBits.SendMessagesInThreads],
      },
      {
        id: ROL_YAZABILIR,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.CreatePublicThreads,
          PermissionFlagsBits.SendMessagesInThreads,
        ],
      },
    ];

    let toplamKategori = 0;
    let toplamKanal = 0;
    let hatalar = 0;

    for (const { kategori, kanallar } of YAPI) {
      let kategoriObj;
      try {
        kategoriObj = await guild.channels.create({
          name: kategori,
          type: ChannelType.GuildCategory,
        });
        toplamKategori++;
        takipEdilenKategoriler.add(kategoriObj.id);
      } catch (err) {
        hatalar++;
        continue;
      }

      for (const kanalAdi of kanallar) {
        try {
          const forum = await guild.channels.create({
            name: kanalAdi,
            type: ChannelType.GuildForum,
            parent: kategoriObj.id,
            permissionOverwrites,
            defaultAutoArchiveDuration: 10080,
          });
          await RpChannel.findOneAndUpdate(
            { guildId: guild.id, channelId: forum.id },
            { guildId: guild.id, channelId: forum.id, channelName: forum.name, categoryId: kategoriObj.id, addedBy: YETKILI_ID },
            { upsert: true }
          );
          toplamKanal++;
          await new Promise(r => setTimeout(r, 500));
        } catch (err) {
          hatalar++;
        }
      }
    }

    await interaction.editReply({
      content: null,
      flags: CV2_FLAG,
      components: [{
        type: 17,
        components: [{
          type: 10,
          content: [
            '## Kurulum Tamamlandi',
            '',
            'Olusturulan Kategori: ' + toplamKategori,
            'Olusturulan Forum: ' + toplamKanal,
            'Hata: ' + hatalar,
            '',
            '-# ' + E.timestamp(new Date(), 'F') + ' - Kuran: ' + interaction.user,
          ].join('\n'),
        }],
      }],
    });
  },
};