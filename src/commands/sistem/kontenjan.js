const { SlashCommandBuilder } = require('discord.js');
const { HANELER, BOLGELER } = require('../../config/haneler');
const { CV2_FLAG } = require('../../utils/components');
const E = require('../../utils/emojis');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kontenjan')
    .setDescription('Seçilen bölgedeki hane kontenjanlarını gösterir.')
    .addStringOption(opt =>
      opt.setName('bolge').setDescription('Bölge seçin').setRequired(true)
        .addChoices(...BOLGELER.map(b => ({ name: b.emoji + ' ' + b.isim, value: b.isim })))
    ),

  async execute(interaction, client) {
    await interaction.deferReply();

    const { guild } = interaction;
    const bolge = interaction.options.getString('bolge');
    const bolgeKonfig = BOLGELER.find(b => b.isim === bolge);
    const bolgeHaneleri = HANELER.filter(h => h.bolge === bolge);

    if (bolgeHaneleri.length === 0) {
      return interaction.editReply('Bu bölgede kayıtlı hane bulunamadı.');
    }

    // Cache yeterince doluysa tekrar fetch etme
    if (guild.members.cache.size < guild.memberCount * 0.9) {
      await guild.members.fetch().catch(() => {});
    }

    const azamHaneler = bolgeHaneleri.filter(h => h.azam);
    const altHaneler  = bolgeHaneleri.filter(h => !h.azam);

    function satirOlustur(h) {
      const kontenjan  = h.azam ? 10 : 5;
      const uyeSayisi  = guild.members.cache.filter(m => m.roles.cache.has(h.rolId) && !m.user.bot).size;
      const dolu       = Math.min(uyeSayisi, kontenjan);
      const bos        = Math.max(0, kontenjan - dolu);
      const doluluk    = Math.round((dolu / kontenjan) * 10);
      const bar        = '█'.repeat(doluluk) + '░'.repeat(10 - doluluk);
      return `**${h.isim}**\n\`${bar}\` ${dolu}/${kontenjan} — ${bos > 0 ? bos + ' boş' : 'Dolu'}`;
    }

    const icerik = [
      `## ${bolgeKonfig.emoji} ${bolge} — Kontenjanlar`,
      ``,
      ...(azamHaneler.length > 0 ? [
        `### Azam Haneler *(maks. 10)*`,
        ...azamHaneler.map(satirOlustur),
        ``,
      ] : []),
      ...(altHaneler.length > 0 ? [
        `### Alt Haneler *(maks. 5)*`,
        ...altHaneler.map(satirOlustur),
      ] : []),
    ].join('\n');

    await interaction.editReply({
      flags: CV2_FLAG,
      components: [{ type: 17, components: [{ type: 10, content: icerik }] }],
    });
  },
};