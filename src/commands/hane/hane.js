const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const House = require('../../models/House');
const { HANELER, LORD_LEYDI_ROL } = require('../../config/haneler');
const { CV2_FLAG } = require('../../utils/components');
const E = require('../../utils/emojis');
const path = require('path');
const fs = require('fs');

const ARMA_DIR = path.join(__dirname, '../../../src/assets/haneler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hane')
    .setDescription('Hane bilgilerini gösterir.')
    .addRoleOption(opt =>
      opt.setName('hane').setDescription('Belirli bir hane (belirtilmezse kendi haneniz)').setRequired(false)
    ),

  async execute(interaction, client) {
    await interaction.deferReply();

    const { guild, member } = interaction;
    const seciliRol = interaction.options.getRole('hane');

    let haneKonfig;

    if (seciliRol) {
      haneKonfig = HANELER.find(h => h.rolId === seciliRol.id);
      if (!haneKonfig) return interaction.editReply('❌ Bu rol bir haneye ait değil.');
    } else {
      haneKonfig = HANELER.find(h => member.roles.cache.has(h.rolId));
      if (!haneKonfig) return interaction.editReply('❌ Herhangi bir haneye ait rolün yok.');
    }

    const hane = await House.findOneAndUpdate(
      { rolId: haneKonfig.rolId },
      { $setOnInsert: { rolId: haneKonfig.rolId, isim: haneKonfig.isim } },
      { upsert: true, new: true }
    );

    if (guild.members.cache.size < guild.memberCount * 0.9) {
      await guild.members.fetch().catch(() => {});
    }
    const lider = guild.members.cache.find(m =>
      m.roles.cache.has(haneKonfig.rolId) && m.roles.cache.has(LORD_LEYDI_ROL)
    );

    const armaPath = path.join(ARMA_DIR, haneKonfig.arma);
    const armaVar  = fs.existsSync(armaPath);
    const files    = armaVar ? [new AttachmentBuilder(armaPath, { name: 'arma.png' })] : [];

    const icerik = [
      `## ${E.CASTLE} ${haneKonfig.isim}`,
      ``,
      `**${E.MAP} Bölge:** ${haneKonfig.bolge}`,
      `**${E.CROWN} Hane Lideri:** ${lider ? lider.user.toString() : '*Belirsiz*'}`,
      `**${E.STAR} Tür:** ${haneKonfig.azam ? 'Azam Hane' : 'Alt Hane'}`,
      ``,
      `**${E.GOLD} Kasa:** ${hane.kasa.toLocaleString('tr-TR')} Altın Ejderha`,
      `**${E.GOLD} Haftalık Gelir:** ${hane.haftalikGelir.toLocaleString('tr-TR')} Altın Ejderha`,
      ``,
      `**${E.SWORD} Düzenli Ordu:** ${hane.duzenliAsker.toLocaleString('tr-TR')}`,
      `**${E.DAGGER} Paralı Asker:** ${hane.paraliAsker.toLocaleString('tr-TR')}`,
      `**${E.SHIP} Donanma:** ${hane.donanma.toLocaleString('tr-TR')}`,
      ``,
      `-# ${E.timestamp(new Date(), 'F')}`,
    ].join('\n');

    const icerikBlogu = armaVar
      ? { type: 9, components: [{ type: 10, content: icerik }], accessory: { type: 11, media: { url: 'attachment://arma.png' } } }
      : { type: 10, content: icerik };

    await interaction.editReply({
      flags: CV2_FLAG,
      files,
      components: [{ type: 17, components: [icerikBlogu] }],
    });
  },
};