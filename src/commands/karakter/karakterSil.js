const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Character = require('../../models/Character');
const User = require('../../models/User');
const roles = require('../../config/roles');
const { AYRAC_ROLLER } = require('../../config/karakterConfig');
const { CV2_FLAG } = require('../../utils/components');
const E = require('../../utils/emojis');

const YETKİLİ_ROLLER = [
  '1495773001902329932','1495773001902329931','1495773001902329930',
  '1495773001902329929','1495773001902329928',
];

function yetkiliMi(member) {
  return YETKİLİ_ROLLER.some(r => member.roles.cache.has(r)) ||
    member.permissions.has(PermissionFlagsBits.ManageRoles);
}

// Karakter ile ilgili tüm rol ID listesi
const KARAKTER_ROLLERI = [
  // Cinsiyet
  roles.ERKEK, roles.KADIN,
  // Irk
  roles.ILK_INSANLAR, roles.ANDALLAR, roles.RHOYNARLAR, roles.VALYRALLILAR,
  // Soyluluk
  roles.SOYLU, roles.PIC, roles.KOYLU,
  // Din
  roles.YEDI_INANCI, roles.RHLLOR, roles.ESKI_TANRILAR, roles.BOGULMUS_TANRI,
  // Konum
  roles.KUZEY_TOPRAKLARI, roles.NEHIR_TOPRAKLARI, roles.TAC_TOPRAKLARI,
  roles.BATI_TOPRAKLARI, roles.FIRTINA_TOPRAKLARI, roles.ARRYN_VADISI,
  roles.DORNE_KONUMU, roles.MENZIL, roles.DEMIR_ADALAR, roles.ESSOS,
  // Meslekler
  roles.KRAL_KRALICE, roles.PRENS_PRENSES, roles.DORNE_PRENSI_PRENSESI,
  roles.KRAL_ELI, roles.YUCE_LORD, roles.KRAL_MUHAFIZLARI_LORD_KUMANDANI,
  roles.SEHIR_MUHAFIZLARI_LORD_KUMANDANI, roles.GECE_NOBETCILERI_LORD_KUMANDANI,
  roles.YUCE_SEPTON, roles.KUCUK_KONSEY, roles.BUYUK_USTAT, roles.HAZINEDAR,
  roles.KANUN_BASI, roles.DONANMA_BASI, roles.FISILTILARIN_EFENDISI,
  roles.KRAL_MUHAFIZI, roles.LORD_LEYDI, roles.SOVALYE, roles.GECE_NOBETCISI,
  roles.KIZIL_RAHIP_RAHIBE, roles.PARALI_ASKER, roles.TUCCAR, roles.KORSAN,
  roles.HAYDUT, roles.NEDIME, roles.YAVER,
  // Kayıtlı Üye
  roles.KAYITLI_UYE,
  // Ayraçlar
  ...Object.values(AYRAC_ROLLER),
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('karakter-sil')
    .setDescription('Bir karakteri siler ve tüm rollerini alır. (Yetkili)')
    .addUserOption(opt =>
      opt.setName('kullanici').setDescription('Karakteri silinecek kullanıcı').setRequired(true)
    ),

  async execute(interaction, client) {
    if (!yetkiliMi(interaction.member)) {
      return interaction.reply({ content: '❌ Bu komutu kullanma yetkin yok.', flags: 64 });
    }

    await interaction.deferReply({ flags: 64 });

    const { guild } = interaction;
    const hedef = interaction.options.getMember('kullanici');

    if (!hedef) return interaction.editReply('❌ Kullanıcı bulunamadı.');

    // DB'den sil
    await Character.findOneAndDelete({ discordId: hedef.user.id });

    // Tüm karakter rollerini al
    for (const rolId of KARAKTER_ROLLERI) {
      if (hedef.roles.cache.has(rolId)) {
        try { await hedef.roles.remove(rolId); } catch {}
      }
    }

    // Rol Dışı ver, Kayıt Bekleyen al (eğer varsa)
    try { await hedef.roles.add(roles.ROL_DISI); } catch {}
    try { await hedef.roles.remove(roles.KAYIT_BEKLEYEN); } catch {}

    await interaction.editReply({
      flags: 64 | CV2_FLAG,
      components: [{
        type: 17,
        components: [{
          type: 10,
          content: [
            `${E.CHECK} **${hedef.user.tag}** karakteri silindi.`,
            `-# Tüm karakter rolleri alındı, Rol Dışı rolü verildi.`,
          ].join('\n'),
        }],
      }],
    });
  },
};