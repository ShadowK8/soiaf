const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const Character = require('../../models/Character');
const User = require('../../models/User');
const { CV2_FLAG } = require('../../utils/components');
const E = require('../../utils/emojis');

const KELIME_PER_SEVIYE = 7500;

function yildiz(deger) {
  const seviye = deger >= 50 ? 4 : deger >= 30 ? 3 : deger >= 15 ? 2 : deger >= 5 ? 1 : 0;
  return '★'.repeat(seviye + 1) + '☆'.repeat(4 - seviye);
}

function statBar(deger) {
  const dolu = Math.round(deger / 10);
  return `\`${'█'.repeat(Math.min(dolu, 10))}${'░'.repeat(Math.max(0, 10 - dolu))}\` **${deger}**`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profil')
    .setDescription('Karakter profilini gösterir.')
    .addUserOption(opt =>
      opt.setName('kullanici').setDescription('Başka bir kullanıcının profili').setRequired(false)
    ),

  async execute(interaction, client) {
    await interaction.deferReply();

    const { guild } = interaction;
    const hedef     = interaction.options.getUser('kullanici') ?? interaction.user;
    const member    = await guild.members.fetch(hedef.id).catch(() => null);

    const [karakter, user] = await Promise.all([
      Character.findOne({ discordId: hedef.id }),
      User.findOne({ discordId: hedef.id }),
    ]);

    if (!karakter) {
      return interaction.editReply({
        flags: CV2_FLAG,
        components: [{ type: 17, components: [{ type: 10, content: `❌ ${hedef.tag} için kayıtlı karakter bulunamadı.` }] }],
      });
    }

    const rolIsmi = (rolId) => rolId ? (guild.roles.cache.get(rolId)?.name ?? '—') : '—';

    const toplamKelime = user?.rpStats?.totalWords ?? 0;
    const seviye       = Math.floor(toplamKelime / KELIME_PER_SEVIYE);
    const bakiye       = user?.economy?.gold ?? 0;
    const statPuan     = user?.serbestStatPuani ?? 0;
    const s            = karakter.statlar ?? {};

    // Stat satırları
    const statlar = [
      ['⚔️ Güç',           s.guc          ?? 0],
      ['🗣️ Diplomasi',     s.diplomasi    ?? 0],
      ['🛡️ Dayanıklılık',  s.dayaniklilik ?? 0],
      ['💨 Çeviklik',      s.ceviklik     ?? 0],
      ['📚 Bilgelik',      s.bilgelik     ?? 0],
      ['📋 İdare',         s.idare        ?? 0],
      ['🕵️ Entrika',       s.entrika      ?? 0],
      ['⚔️ Askeriye',      s.askeriye     ?? 0],
    ].map(([isim, val]) => `**${isim}:** ${statBar(val)} ${yildiz(val)}`).join('\n');

    const icerik = [
      `## 📜 ${member?.displayName ?? hedef.username}`,
      ``,
      `**🏰 Hane:** ${rolIsmi(karakter.hane)}`,
      `**⚔️ Meslek:** ${rolIsmi(karakter.meslek)}`,
      `**🗺️ Konum:** ${rolIsmi(karakter.konum)}`,
      `**👑 Soyluluk:** ${rolIsmi(karakter.soyluluk)}`,
      `**🕯️ Din:** ${rolIsmi(karakter.din)}`,
      `**🌍 Irk:** ${rolIsmi(karakter.irk)}`,
      ``,
      `## 📊 Statlar`,
      statlar,
      ``,
      `## 🏆 İstatistikler`,
      `**📈 Seviye:** ${seviye}`,
      `**🎯 Serbest Stat Puanı:** ${statPuan}`,
      `**📝 Toplam Kelime:** ${toplamKelime.toLocaleString('tr-TR')}`,
      `**💰 Bakiye:** ${bakiye.toLocaleString('tr-TR')} AE`,
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