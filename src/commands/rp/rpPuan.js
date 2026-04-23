const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const User = require('../../models/User');
const { errorMessage, CV2_FLAG } = require('../../utils/components');
const E = require('../../utils/emojis');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rp-puan')
    .setDescription('Bir üyenin RP kelime puanını manuel düzenler. (Yetkili)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((sub) =>
      sub
        .setName('ekle')
        .setDescription('Kullanıcıya puan ekler.')
        .addUserOption((o) => o.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
        .addIntegerOption((o) => o.setName('miktar').setDescription('Eklenecek kelime sayısı').setRequired(true).setMinValue(1))
        .addStringOption((o) => o.setName('tip').setDescription('Hangi sayaca?').setRequired(true)
          .addChoices(
            { name: 'Haftalık', value: 'weekly' },
            { name: 'Genel', value: 'total' },
            { name: 'İkisi de', value: 'both' }
          ))
    )
    .addSubcommand((sub) =>
      sub
        .setName('sil')
        .setDescription('Kullanıcıdan puan siler.')
        .addUserOption((o) => o.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
        .addIntegerOption((o) => o.setName('miktar').setDescription('Silinecek kelime sayısı').setRequired(true).setMinValue(1))
        .addStringOption((o) => o.setName('tip').setDescription('Hangi sayaçtan?').setRequired(true)
          .addChoices(
            { name: 'Haftalık', value: 'weekly' },
            { name: 'Genel', value: 'total' },
            { name: 'İkisi de', value: 'both' }
          ))
    )
    .addSubcommand((sub) =>
      sub
        .setName('sifirla')
        .setDescription('Kullanıcının haftalık puanını sıfırlar.')
        .addUserOption((o) => o.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
    ),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: 64 });

    const sub      = interaction.options.getSubcommand();
    const hedef    = interaction.options.getUser('kullanici');
    const miktar   = interaction.options.getInteger('miktar') ?? 0;
    const tip      = interaction.options.getString('tip') ?? 'both';

    let updateQuery = {};
    let mesaj = '';

    if (sub === 'ekle') {
      if (tip === 'weekly' || tip === 'both') updateQuery['rpStats.weeklyWords'] = miktar;
      if (tip === 'total'  || tip === 'both') updateQuery['rpStats.totalWords']  = miktar;

      await User.findOneAndUpdate(
        { discordId: hedef.id },
        { $inc: updateQuery },
        { upsert: true }
      );
      mesaj = `${E.CHECK} ${hedef} kullanıcısına **${miktar}** kelime eklendi.`;

    } else if (sub === 'sil') {
      if (tip === 'weekly' || tip === 'both') updateQuery['rpStats.weeklyWords'] = -miktar;
      if (tip === 'total'  || tip === 'both') updateQuery['rpStats.totalWords']  = -miktar;

      // Negatife düşmesin
      const user = await User.findOne({ discordId: hedef.id });
      if (!user) return interaction.editReply(errorMessage('Bu kullanıcının kayıtlı puanı yok.'));

      const yeniHaftalik = Math.max(0, (user.rpStats?.weeklyWords ?? 0) - (tip !== 'total' ? miktar : 0));
      const yeniGenel    = Math.max(0, (user.rpStats?.totalWords  ?? 0) - (tip !== 'weekly' ? miktar : 0));

      await User.findOneAndUpdate(
        { discordId: hedef.id },
        { $set: { 'rpStats.weeklyWords': yeniHaftalik, 'rpStats.totalWords': yeniGenel } }
      );
      mesaj = `${E.CHECK} ${hedef} kullanıcısından **${miktar}** kelime silindi.`;

    } else if (sub === 'sifirla') {
      await User.findOneAndUpdate(
        { discordId: hedef.id },
        { $set: { 'rpStats.weeklyWords': 0 } }
      );
      mesaj = `${E.CHECK} ${hedef} kullanıcısının haftalık puanı sıfırlandı.`;
    }

    await interaction.editReply({
      flags: 64 | CV2_FLAG,
      components: [{ type: 17, components: [{ type: 10, content: mesaj }] }],
    });
  },
};