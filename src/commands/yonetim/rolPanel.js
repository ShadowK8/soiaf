const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { CV2_FLAG } = require('../../utils/components');
const E = require('../../utils/emojis');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rol-panel')
    .setDescription('Partner görme rolü için buton paneli kurar. (Yetkili)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: 64 });

    await interaction.channel.send({
      flags: CV2_FLAG,
      components: [
        {
          type: 17, // Container — renksiz, ufak
          components: [
            {
              type: 10,
              content: [
                `### ${E.LINK} Partner Görme Rolü`,
                `Aşağıdaki butona tıklayarak partner sunucularını görmeni sağlayan rolü alabilir ya da kaldırabilirsin.`,
              ].join('\n'),
            },
            { type: 14, divider: true, spacing: 1 },
            {
              type: 1, // Action Row
              components: [
                {
                  type: 2, // Button
                  custom_id: 'partner_rol_toggle',
                  label: 'Rol Al / Kaldır',
                  style: 2, // Secondary
                  emoji: { name: '🤝' },
                },
              ],
            },
          ],
        },
      ],
    });

    await interaction.editReply({
      flags: 64 | CV2_FLAG,
      components: [
        { type: 17, components: [{ type: 10, content: `${E.CHECK} Panel kuruldu!` }] },
      ],
    });
  },
};