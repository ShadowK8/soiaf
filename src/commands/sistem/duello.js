const { SlashCommandBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Character = require('../../models/Character');
const { CV2_FLAG } = require('../../utils/components');

// Aktif düellolar — Map<kanalId, DüelloSession>
const duelloSessions = new Map();

function zarAt(yuz) {
  return Math.floor(Math.random() * yuz) + 1;
}

function hpBar(hp) {
  const dolu = Math.max(0, Math.round(hp / 5));
  return `\`${'█'.repeat(dolu)}${'░'.repeat(10 - dolu)}\` **${hp}/50 HP**`;
}

function duelloMesaji(session) {
  const { oyuncu1, oyuncu2, siradaki, tur } = session;

  return {
    flags: CV2_FLAG,
    allowedMentions: { parse: [] },
    components: [{
      type: 17,
      components: [
        {
          type: 10,
          content: [
            `## ⚔️ Düello — Tur ${tur}`,
            ``,
            `**${oyuncu1.isim}**`,
            hpBar(oyuncu1.hp),
            ``,
            `**${oyuncu2.isim}**`,
            hpBar(oyuncu2.hp),
            ``,
            `**Sıra:** <@${siradaki}> saldırıyor!`,
            `-# Saldırmak için aşağıdaki butona bas.`,
          ].join('\n'),
        },
        {
          type: 1,
          components: [
            new ButtonBuilder().setCustomId('duello_saldir').setLabel('⚔️ Saldır').setStyle(ButtonStyle.Danger).toJSON(),
          ],
        },
      ],
    }],
  };
}

module.exports = {
  duelloSessions,

  data: new SlashCommandBuilder()
    .setName('duello')
    .setDescription('Bir oyuncuya düello teklif eder.')
    .addUserOption(opt =>
      opt.setName('rakip').setDescription('Düello teklif edeceğin oyuncu').setRequired(true)
    ),

  async execute(interaction, client) {
    const { user, channel, guild } = interaction;
    const rakipMember = interaction.options.getMember('rakip');

    if (!rakipMember) return interaction.reply({ content: '❌ Kullanıcı bulunamadı.', flags: 64 });
    if (rakipMember.user.bot) return interaction.reply({ content: '❌ Botlara düello teklif edilemez.', flags: 64 });
    if (rakipMember.user.id === user.id) return interaction.reply({ content: '❌ Kendinle düello yapamazsın.', flags: 64 });

    // Aktif düello kontrolü
    if (duelloSessions.has(channel.id)) {
      return interaction.reply({ content: '❌ Bu kanalda zaten aktif bir düello var.', flags: 64 });
    }

    // Karakter stat kontrolü
    const [kar1, kar2] = await Promise.all([
      Character.findOne({ discordId: user.id }),
      Character.findOne({ discordId: rakipMember.user.id }),
    ]);

    if (!kar1?.statlar) return interaction.reply({ content: '❌ Karakterin kayıtlı değil veya statların girilmemiş.', flags: 64 });
    if (!kar2?.statlar) return interaction.reply({ content: `❌ ${rakipMember.user.tag} karakteri kayıtlı değil veya statları girilmemiş.`, flags: 64 });

    await interaction.reply({
      flags: CV2_FLAG,
      allowedMentions: { parse: [] },
      components: [{
        type: 17,
        components: [
          {
            type: 10,
            content: [
              `## ⚔️ Düello Teklifi`,
              ``,
              `<@${user.id}> sana düello teklif ediyor, <@${rakipMember.user.id}>!`,
              ``,
              `-# Kabul etmek veya reddetmek için aşağıdaki butonları kullan.`,
            ].join('\n'),
          },
          {
            type: 1,
            components: [
              new ButtonBuilder().setCustomId(`duello_kabul_${user.id}_${rakipMember.user.id}`).setLabel('✅ Kabul Et').setStyle(ButtonStyle.Success).toJSON(),
              new ButtonBuilder().setCustomId(`duello_reddet_${user.id}`).setLabel('❌ Reddet').setStyle(ButtonStyle.Secondary).toJSON(),
            ],
          },
        ],
      }],
    });
  },
};