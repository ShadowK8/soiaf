const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { CV2_FLAG } = require('../../utils/components');
const E = require('../../utils/emojis');

module.exports = {
  cooldown: 5,

  data: new SlashCommandBuilder()
    .setName('dm')
    .setDescription('Bir üyeye veya roldeki herkese DM gönderir. (Yönetici)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((opt) =>
      opt.setName('mesaj').setDescription('Gönderilecek mesaj').setRequired(true).setMaxLength(1800)
    )
    .addUserOption((opt) =>
      opt.setName('kullanici').setDescription('DM gönderilecek kullanıcı').setRequired(false)
    )
    .addRoleOption((opt) =>
      opt.setName('rol').setDescription('DM gönderilecek rol').setRequired(false)
    ),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: 64 });

    const mesaj     = interaction.options.getString('mesaj');
    const kullanici = interaction.options.getUser('kullanici');
    const rol       = interaction.options.getRole('rol');
    const { guild } = interaction;

    if (!kullanici && !rol) {
      return interaction.editReply({
        flags: 64 | CV2_FLAG,
        components: [{ type: 17, components: [{ type: 10, content: `❌ Kullanıcı veya rol seçmelisin.` }] }],
      });
    }

    const dmIcerigi = [
      `**${guild.name}** sunucusundan bir mesaj aldınız:`,
      ``,
      mesaj,
    ].join('\n');

    // ── Tek kullanıcıya ───────────────────────────────────────
    if (kullanici && !rol) {
      let basarili = 0;
      let basarisiz = 0;

      try {
        await kullanici.send(dmIcerigi);
        basarili = 1;
      } catch {
        basarisiz = 1;
      }

      // Ephemeral özet
      await interaction.editReply({
        flags: 64 | CV2_FLAG,
        components: [{ type: 17, components: [{ type: 10, content: basarili ? `${E.CHECK} DM gönderildi.` : `❌ DM gönderilemedi. DM'leri kapalı olabilir.` }] }],
      });

      // Public rapor
      await interaction.followUp({
        flags: CV2_FLAG,
        components: [{
          type: 17,
          components: [{
            type: 10,
            content: [
              `### ${E.SCROLL} DM Raporu`,
              ``,
              `**${E.USER} Hedef:** ${kullanici}`,
              `**${E.QUILL} Mesaj:** ${mesaj.length > 100 ? mesaj.slice(0, 100) + '...' : mesaj}`,
              ``,
              `${E.CHECK} Başarılı: **${basarili}** ${E.DOT} ❌ Başarısız: **${basarisiz}**`,
              ``,
              `-# ${E.CLOCK} ${E.timestamp(new Date(), 'F')} ${E.DOT} Gönderen: ${interaction.user}`,
            ].join('\n'),
          }],
        }],
      });

      return;
    }

    // ── Roldeki herkese ───────────────────────────────────────
    if (rol) {
      await guild.members.fetch();
      const uyeler = guild.members.cache.filter((m) =>
        m.roles.cache.has(rol.id) && !m.user.bot
      );

      if (uyeler.size === 0) {
        return interaction.editReply({
          flags: 64 | CV2_FLAG,
          components: [{ type: 17, components: [{ type: 10, content: `❌ Bu rolde DM gönderilebilecek üye bulunamadı.` }] }],
        });
      }

      await interaction.editReply({
        flags: 64 | CV2_FLAG,
        components: [{ type: 17, components: [{ type: 10, content: `${E.LOADING} **${rol.name}** rolündeki **${uyeler.size}** üyeye DM gönderiliyor...` }] }],
      });

      let basarili = 0;
      let basarisiz = 0;

      for (const [, uye] of uyeler) {
        try {
          await uye.user.send(dmIcerigi);
          basarili++;
        } catch {
          basarisiz++;
        }
        await new Promise((r) => setTimeout(r, 500));
      }

      // Ephemeral özet güncelle
      await interaction.editReply({
        flags: 64 | CV2_FLAG,
        components: [{ type: 17, components: [{ type: 10, content: `${E.CHECK} Gönderim tamamlandı. **${basarili}** başarılı, **${basarisiz}** başarısız.` }] }],
      });

      // Public rapor
      await interaction.followUp({
        flags: CV2_FLAG,
        components: [{
          type: 17,
          components: [{
            type: 10,
            content: [
              `### ${E.SCROLL} DM Raporu`,
              ``,
              `**${E.SHIELD} Hedef Rol:** <@&${rol.id}>`,
              `**${E.USER} Toplam Üye:** ${uyeler.size}`,
              `**${E.QUILL} Mesaj:** ${mesaj.length > 100 ? mesaj.slice(0, 100) + '...' : mesaj}`,
              ``,
              `${E.CHECK} Başarılı: **${basarili}** ${E.DOT} ❌ Başarısız: **${basarisiz}**`,
              ``,
              `-# ${E.CLOCK} ${E.timestamp(new Date(), 'F')} ${E.DOT} Gönderen: ${interaction.user}`,
            ].join('\n'),
          }],
        }],
      });
    }
  },
};