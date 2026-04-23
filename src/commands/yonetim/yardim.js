const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { CV2_FLAG } = require('../../utils/components');

const YETKİLİ_ROLLER = [
  '1495773001902329932','1495773001902329931','1495773001902329930',
  '1495773001902329929','1495773001902329928','1495773001902329927',
  '1495773001902329926','1495773001868771507','1495773001868771506',
  '1495773001868771505','1495773001868771504',
];

function yetkiliMi(member) {
  return YETKİLİ_ROLLER.some(r => member.roles.cache.has(r));
}

const GENEL_YARDIM = [
  `## 📖 Komut Listesi`,
  ``,
  `**Karakter**`,
  `/profil \`[kullanici]\` — Karakter profilini ve statları gösterir`,
  `/ikon-yukle \`gorsel\` — Karakter görselini yükler`,
  `/seviye \`[kullanici]\` — Seviye, serbest stat puanı ve bakiye gösterir`,
  ``,
  `**Hane**`,
  `/hane \`[hane]\` — Hane bilgilerini gösterir`,
  ``,
  `**RP & Oyun**`,
  `/siralama — Haftalık ve genel kelime sıralaması`,
  `/zar \`format\` — Zar atar. Örnek: 1d20, 1d30+5`,
  `/hamilelik — Hamilelik sonucunu belirler`,
  `/seyahat \`cikis\` \`varis\` — Seyahat zarı atar, tehlike belirler`,
  `/kontenjan \`bolge\` — Bölgedeki hane kontenjanlarını gösterir`,
].join('\n');

const YETKİLİ_YARDIM = [
  `## ⚔️ Yetkili Komut Listesi`,
  ``,
  `**Kayıt & Karakter**`,
  `/kayit \`kullanici isim yas\` — Üyeyi sunucuya kayıt eder`,
  `/karakter-kayit \`kullanici\` — Karakteri adım adım kaydeder, rolleri atar`,
  `/karakter-sil \`kullanici\` — Karakteri ve tüm rollerini siler`,
  `/stat-gir \`kullanici\` — Karakterin 8 statını girer`,
  `/stat-duzenle \`kullanici stat deger\` — Tek bir statı düzenler`,
  ``,
  `**Hane**`,
  `/hane-yonet — Kasa, gelir, asker, paralı asker, donanma ekle/çıkart`,
  ``,
  `**RP Sistemi**`,
  `/rp-kategori-ekle \`kategori-idler\` — Kategorileri kelime sayacına ekler`,
  `/rp-kanal-ekle \`kanal\` — Tek kanalı kelime sayacına ekler`,
  `/rp-puan \`ekle/sil/sifirla\` — Manuel puan düzenler`,
  `/rp-kurulum \`onay\` — RP kategorilerini siler ve yeniden oluşturur`,
  ``,
  `**Moderasyon**`,
  `/mod \`ban/kick/unban/timeout/untimeout/temizle\` — Moderasyon işlemleri`,
  `/uyar \`kullanici sebep\` — Uyarı verir`,
  `/uyari-gecmisi \`[kullanici]\` — Uyarı geçmişini gösterir`,
  ``,
  `**Yönetim**`,
  `/dm \`mesaj [kullanici/rol]\` — DM gönderir`,
  `/rol-panel — Partner görme rolü paneli kurar`,
].join('\n');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('yardim')
    .setDescription('Komut listesini gösterir.'),

  async execute(interaction, client) {
    const isYetkili = yetkiliMi(interaction.member);

    if (isYetkili) {
      // Yetkililere iki ayrı mesaj — genel + yetkili
      await interaction.reply({
        flags: 64 | CV2_FLAG,
        components: [{
          type: 17,
          components: [
            { type: 10, content: GENEL_YARDIM },
            { type: 14, divider: true, spacing: 1 },
            { type: 10, content: YETKİLİ_YARDIM },
          ],
        }],
      });
    } else {
      await interaction.reply({
        flags: 64 | CV2_FLAG,
        components: [{
          type: 17,
          components: [{ type: 10, content: GENEL_YARDIM }],
        }],
      });
    }
  },
};