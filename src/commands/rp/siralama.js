const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const User = require('../../models/User');
const { CV2_FLAG } = require('../../utils/components');
const path = require('path');
const fs = require('fs');
const E = require('../../utils/emojis');

const SAYFA_BOYUTU = 10;
const GIF_PATH = path.join(__dirname, '../../assets/siralama.gif');

function listeyiYaz(kullanicilar, baslangic, alan) {
  if (kullanicilar.length === 0) return '*Henüz kayıt yok.*';
  return kullanicilar
    .map((u, i) => {
      const sira   = baslangic + i + 1;
      const rozet  = sira === 1 ? '🥇' : sira === 2 ? '🥈' : sira === 3 ? '🥉' : `\`${sira}.\``;
      const kelime = alan === 'weekly' ? (u.rpStats?.weeklyWords ?? 0) : (u.rpStats?.totalWords ?? 0);
      const ad     = u.registeredName ?? u.username ?? 'Bilinmiyor';
      return `${rozet} **${ad}** — ${kelime.toLocaleString('tr-TR')} kelime`;
    })
    .join('\n');
}

async function siralaMesajiOlustur(haftalikSayfa, genelSayfa, interaction) {
  const skip_h = haftalikSayfa * SAYFA_BOYUTU;
  const skip_g = genelSayfa * SAYFA_BOYUTU;

  const [haftaliklar, geneller, toplamH, toplamG] = await Promise.all([
    User.find({ 'rpStats.weeklyWords': { $gt: 0 } }).sort({ 'rpStats.weeklyWords': -1 }).skip(skip_h).limit(SAYFA_BOYUTU),
    User.find({ 'rpStats.totalWords':  { $gt: 0 } }).sort({ 'rpStats.totalWords':  -1 }).skip(skip_g).limit(SAYFA_BOYUTU),
    User.countDocuments({ 'rpStats.weeklyWords': { $gt: 0 } }),
    User.countDocuments({ 'rpStats.totalWords':  { $gt: 0 } }),
  ]);

  const toplamSayfaH = Math.max(1, Math.ceil(toplamH / SAYFA_BOYUTU));
  const toplamSayfaG = Math.max(1, Math.ceil(toplamG / SAYFA_BOYUTU));
  const uid = interaction.user.id;

  const butonlar = [
    { type: 2, custom_id: `siralama_h_prev_${haftalikSayfa}_${genelSayfa}_${uid}`, label: '‹ Haftalık', style: 2, disabled: haftalikSayfa === 0 },
    { type: 2, custom_id: `siralama_h_next_${haftalikSayfa}_${genelSayfa}_${uid}`, label: 'Haftalık ›', style: 2, disabled: haftalikSayfa >= toplamSayfaH - 1 },
    { type: 2, custom_id: 'siralama_separator', label: '·', style: 2, disabled: true },
    { type: 2, custom_id: `siralama_g_prev_${haftalikSayfa}_${genelSayfa}_${uid}`, label: '‹ Genel',    style: 2, disabled: genelSayfa === 0 },
    { type: 2, custom_id: `siralama_g_next_${haftalikSayfa}_${genelSayfa}_${uid}`, label: 'Genel ›',    style: 2, disabled: genelSayfa >= toplamSayfaG - 1 },
  ];

  const gifVar = fs.existsSync(GIF_PATH);
  const files  = gifVar ? [new AttachmentBuilder(GIF_PATH, { name: 'siralama.gif' })] : [];

  // Başlık bloğu — GIF varsa Section+thumbnail, yoksa sadece text
  const baslik = gifVar
    ? {
        type: 9,
        components: [{ type: 10, content: `## ${E.SWORD} RP Kelime Sıralaması\n-# ${E.CLOCK} ${E.timestamp(new Date(), 'R')} güncellendi` }],
        accessory: { type: 11, media: { url: 'attachment://siralama.gif' } },
      }
    : { type: 10, content: `## ${E.SWORD} RP Kelime Sıralaması\n-# ${E.CLOCK} ${E.timestamp(new Date(), 'R')} güncellendi` };

  const icerikler = [
    baslik,
    { type: 14, divider: true, spacing: 1 },
    { type: 10, content: `### 📅 Haftalık — Sayfa ${haftalikSayfa + 1}/${toplamSayfaH}\n${listeyiYaz(haftaliklar, skip_h, 'weekly')}` },
    { type: 14, divider: true, spacing: 1 },
    { type: 10, content: `### 📊 Genel — Sayfa ${genelSayfa + 1}/${toplamSayfaG}\n${listeyiYaz(geneller, skip_g, 'total')}` },
    { type: 14, divider: false, spacing: 1 },
    { type: 1, components: butonlar },
  ];

  return {
    payload: {
      flags: CV2_FLAG,
      files,
      components: [{ type: 17, components: icerikler }],
    },
    toplamSayfaH,
    toplamSayfaG,
  };
}

module.exports = {
  siralaMesajiOlustur,

  data: new SlashCommandBuilder()
    .setName('siralama')
    .setDescription('Haftalık ve genel RP kelime sıralamasını gösterir.'),

  async execute(interaction, client) {
    await interaction.deferReply();
    const { payload } = await siralaMesajiOlustur(0, 0, interaction);
    await interaction.editReply(payload);
  },
};