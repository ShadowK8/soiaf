const chalk = require('chalk');
const { errorMessage, CV2_FLAG } = require('../utils/components');
const E = require('../utils/emojis');

module.exports = {
  name: 'interactionCreate',

  async execute(interaction, client) {

    // ── Slash Komutları ──────────────────────────────────────────
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return interaction.reply({ ...errorMessage('Bu komut bulunamadı.') });

      if (!client.cooldowns.has(command.data.name)) client.cooldowns.set(command.data.name, new Map());
      const timestamps   = client.cooldowns.get(command.data.name);
      const cooldownTime = (command.cooldown ?? 3) * 1000;

      if (timestamps.has(interaction.user.id)) {
        const expiresAt = timestamps.get(interaction.user.id) + cooldownTime;
        if (Date.now() < expiresAt) {
          const remaining = ((expiresAt - Date.now()) / 1000).toFixed(1);
          return interaction.reply({ ...errorMessage(`Bu komutu tekrar kullanmak için **${remaining}** saniye bekle.`) });
        }
      }

      timestamps.set(interaction.user.id, Date.now());
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownTime);

      try {
        await command.execute(interaction, client);
      } catch (error) {
        if (error.code === 10062) return;
        console.error(chalk.red(`❌ Komut hatası (/${interaction.commandName}):`), error);
        const errPayload = errorMessage('Komut çalıştırılırken bir hata oluştu.');
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errPayload).catch(() => {});
        } else {
          await interaction.reply(errPayload).catch(() => {});
        }
      }
      return;
    }

    // ── Select Menu Handler'ları ─────────────────────────────────
    if (interaction.isStringSelectMenu()) {
      const id = interaction.customId;

      // Karakter kayıt select menüleri
      if (id.startsWith('krk_')) {
        try {
          const { handleSelectMenu } = require('../utils/karakterKayitHandler');
          await handleSelectMenu(interaction, client);
        } catch (err) {
          console.error('Karakter select hatası:', err);
        }
        return;
      }
    }

    // ── Modal Handler'ları ───────────────────────────────────────
    if (interaction.isModalSubmit()) {
      // Stat girişi - 1. modal (5 stat)
      if (interaction.customId === 'stat_giris_modal') {
        try {
          const Character = require('../models/Character');
          const { statSessions } = require('../commands/karakter/statGir');

          // Hedef kullanıcıyı al
          const hedefId = statSessions.get(interaction.user.id);
          if (!hedefId) {
            return interaction.reply({
              flags: 64 | CV2_FLAG,
              components: [{ type: 17, components: [{ type: 10, content: '❌ Oturum sona erdi. Komutu tekrar kullan.' }] }],
            });
          }

          const guc          = parseInt(interaction.fields.getTextInputValue('guc'));
          const diplomasi    = parseInt(interaction.fields.getTextInputValue('diplomasi'));
          const dayaniklilik = parseInt(interaction.fields.getTextInputValue('dayaniklilik'));
          const ceviklik     = parseInt(interaction.fields.getTextInputValue('ceviklik'));
          const bilgelik     = parseInt(interaction.fields.getTextInputValue('bilgelik'));

          const statlar5 = { guc, diplomasi, dayaniklilik, ceviklik, bilgelik };
          const hatalar  = [];

          for (const [isim, val] of Object.entries(statlar5)) {
            if (isNaN(val) || val < 5 || val > 20) hatalar.push(`${isim}: ${val} (5-20 arasında olmalı)`);
          }

          if (hatalar.length > 0) {
            return interaction.reply({
              flags: 64 | CV2_FLAG,
              components: [{ type: 17, components: [{ type: 10, content: `❌ Geçersiz stat değerleri:\n${hatalar.join('\n')}` }] }],
            });
          }

          // İkinci adım için session'a kaydet
          if (!client._statSessions) client._statSessions = new Map();
          client._statSessions.set(interaction.user.id, { ...statlar5, _hedefId: hedefId });

          // Modal'dan modal gösterilemez — buton ile devam et
          await interaction.reply({
            flags: 64 | CV2_FLAG,
            components: [{
              type: 17,
              components: [
                { type: 10, content: '**Adım 1/2 tamamlandı.** Kalan 3 stat için aşağıdaki butona bas:' },
                { type: 1, components: [{
                  type: 2,
                  custom_id: 'stat_modal2_ac',
                  label: 'Devam Et →',
                  style: 1,
                }]},
              ],
            }],
          });

        } catch (err) {
          console.error('Stat modal 1 hatası:', err);
        }
        return;
      }

      // Stat girişi - 2. modal (3 stat)
      if (interaction.customId === 'stat_giris_modal_2') {
        try {
          const Character = require('../models/Character');
          if (!client._statSessions) client._statSessions = new Map();

          const oncekiData  = client._statSessions.get(interaction.user.id) ?? {};
          const hedefId2    = oncekiData._hedefId ?? interaction.user.id;
          const { _hedefId, ...oncekiStatlar } = oncekiData;
          client._statSessions.delete(interaction.user.id);

          const idare    = parseInt(interaction.fields.getTextInputValue('idare'));
          const entrika  = parseInt(interaction.fields.getTextInputValue('entrika'));
          const askeriye = parseInt(interaction.fields.getTextInputValue('askeriye'));

          const tumStatlar = { ...oncekiStatlar, idare, entrika, askeriye };
          const hatalar    = [];

          for (const [isim, val] of Object.entries(tumStatlar)) {
            if (isNaN(val) || val < 5 || val > 20) hatalar.push(`${isim}: ${val} (5-20 arasında olmalı)`);
          }

          const toplam = Object.values(tumStatlar).reduce((a, b) => a + b, 0);

          if (hatalar.length > 0) {
            return interaction.reply({
              flags: 64 | CV2_FLAG,
              components: [{ type: 17, components: [{ type: 10, content: `❌ Geçersiz değerler:\n${hatalar.join('\n')}` }] }],
            });
          }

          if (toplam !== 90) {
            return interaction.reply({
              flags: 64 | CV2_FLAG,
              components: [{ type: 17, components: [{ type: 10, content: `❌ Toplam puan **${toplam}** oldu. Tam olarak **90** puan dağıtmalısın.` }] }],
            });
          }

          // Üst sınır kuralları
          const digerMin = (limitEdenStat) => {
            return Object.entries(tumStatlar)
              .filter(([k]) => k !== limitEdenStat)
              .every(([, v]) => {
                if (limitEdenStat >= 60 && v < 20) return false;
                if (limitEdenStat >= 50 && v < 15) return false;
                if (limitEdenStat >= 40 && v < 10) return false;
                return true;
              });
          };

          const kuralHatalari = [];
          for (const [isim, val] of Object.entries(tumStatlar)) {
            if (val >= 40 && !digerMin(val)) {
              if (val >= 60) kuralHatalari.push(`${isim} 60+ için diğer tüm statlar min 20 olmalı`);
              else if (val >= 50) kuralHatalari.push(`${isim} 50+ için diğer tüm statlar min 15 olmalı`);
              else if (val >= 40) kuralHatalari.push(`${isim} 40+ için diğer tüm statlar min 10 olmalı`);
            }
          }

          if (kuralHatalari.length > 0) {
            return interaction.reply({
              flags: 64 | CV2_FLAG,
              components: [{ type: 17, components: [{ type: 10, content: `❌ Kural ihlali:\n${kuralHatalari.join('\n')}` }] }],
            });
          }

          // Kaydet — hedef kullanıcıya
          await Character.findOneAndUpdate(
            { discordId: hedefId2 },
            { $set: { statlar: tumStatlar, statGirildi: true } },
            { upsert: true }
          );
          
          const { statSessions: ss } = require('../commands/karakter/statGir');
          ss.delete(interaction.user.id);

          const hedefTag = (await interaction.guild.members.fetch(hedefId2).catch(() => null))?.user?.tag ?? hedefId2;
          const ISIMLER = { guc: 'Güç', diplomasi: 'Diplomasi', dayaniklilik: 'Dayanıklılık', ceviklik: 'Çeviklik', bilgelik: 'Bilgelik', idare: 'İdare', entrika: 'Entrika', askeriye: 'Askeriye' };

          const satirlar = Object.entries(tumStatlar)
            .map(([k, v]) => `**${ISIMLER[k]}:** ${v}`)
            .join('\n');

          await interaction.reply({
            flags: 64 | CV2_FLAG,
            components: [{
              type: 17,
              components: [{
                type: 10,
                content: [
                  `## ✅ Statlar Kaydedildi!`,
                  `**Kullanıcı:** <@${hedefId2}>`,
                  ``,
                  satirlar,
                  ``,
                  `**Toplam:** ${toplam}/90`,
                ].join('\n'),
              }],
            }],
          });

        } catch (err) {
          console.error('Stat modal 2 hatası:', err);
        }
        return;
      }
    }

    // ── Button Handler'ları ──────────────────────────────────────
    if (interaction.isButton()) {
      const id = interaction.customId;

      try {
        // Karakter kayıt butonları
        if (id.startsWith('krk_')) {
          const { handleButton } = require('../utils/karakterKayitHandler');
          await handleButton(interaction, client);
          return;
        }

        // ─── Düello Butonları ────────────────────────────────────
        if (id.startsWith('duello_')) {
          const { handleButton: duelloBtn } = require('../utils/duelloHandler');
          await duelloBtn(interaction, client);
          return;
        }

        // ─── Stat Modal 2 Aç ─────────────────────────────────────
        if (id === 'stat_modal2_ac') {
          const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
          const modal2 = new ModalBuilder()
            .setCustomId('stat_giris_modal_2')
            .setTitle('Karakter Statları — Devam (90 Puan)');

          modal2.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('idare').setLabel('İdare (5-20)').setStyle(TextInputStyle.Short).setMinLength(1).setMaxLength(2).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('entrika').setLabel('Entrika (5-20)').setStyle(TextInputStyle.Short).setMinLength(1).setMaxLength(2).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('askeriye').setLabel('Askeriye (5-20)').setStyle(TextInputStyle.Short).setMinLength(1).setMaxLength(2).setRequired(true)),
          );
          return interaction.showModal(modal2);
        }

        // ─── Partner Rol Toggle ──────────────────────────────────
        if (id === 'partner_rol_toggle') {
          const PARTNER_ROL_ID = '1495773001105412168';
          const member = interaction.member;
          const rolVar = member.roles.cache.has(PARTNER_ROL_ID);

          if (rolVar) await member.roles.remove(PARTNER_ROL_ID);
          else        await member.roles.add(PARTNER_ROL_ID);

          return interaction.reply({
            flags: 64 | CV2_FLAG,
            components: [{ type: 17, components: [{ type: 10, content: rolVar ? `🤝 Partner Görme Rolü kaldırıldı.` : `🤝 Partner Görme Rolü verildi!` }] }],
          });
        }

        // ─── Sıralama Sayfa Butonları ────────────────────────────
        if (id.startsWith('siralama_')) {
          if (id === 'siralama_separator') return interaction.deferUpdate();

          const { siralaMesajiOlustur } = require('../commands/rp/siralama');
          const parcalar = id.split('_');
          const kol      = parcalar[1];
          const yon      = parcalar[2];
          let   hSayfa   = parseInt(parcalar[3]);
          let   gSayfa   = parseInt(parcalar[4]);
          const sahibiId = parcalar[5];

          if (interaction.user.id !== sahibiId) {
            return interaction.reply({
              flags: 64 | CV2_FLAG,
              components: [{ type: 17, components: [{ type: 10, content: `${E.LOCK} Bu sıralamayı sadece açan kişi sayfalayabilir.` }] }],
            });
          }

          if (kol === 'h') hSayfa += yon === 'next' ? 1 : -1;
          if (kol === 'g') gSayfa += yon === 'next' ? 1 : -1;
          hSayfa = Math.max(0, hSayfa);
          gSayfa = Math.max(0, gSayfa);

          await interaction.deferUpdate();
          const { payload } = await siralaMesajiOlustur(hSayfa, gSayfa, interaction);
          return interaction.editReply(payload);
        }

        // ─── Offline Onayla ──────────────────────────────────────
        if (id === 'offline_onayla') {
          const { PermissionFlagsBits } = require('discord.js');
          if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({ flags: 64 | CV2_FLAG, components: [{ type: 17, components: [{ type: 10, content: `${E.LOCK} Bu işlem için yetkin yok.` }] }] });
          }

          await interaction.deferUpdate();
          const { BotMeta } = require('../models/BotMeta');
          const User = require('../models/User');
          const pendingDoc = await BotMeta.findOne({ key: 'offlinePending' });
          const pending = pendingDoc?.value ?? [];

          if (!pending.length) {
            return interaction.editReply({ flags: CV2_FLAG, components: [{ type: 17, components: [{ type: 10, content: `${E.WARN} Uygulanacak veri bulunamadı.` }] }] });
          }

          for (const { userId, kelime } of pending) {
            await User.findOneAndUpdate({ discordId: userId }, { $inc: { 'rpStats.totalWords': kelime, 'rpStats.weeklyWords': kelime } }, { upsert: true });
          }

          await BotMeta.findOneAndUpdate({ key: 'offlinePending' }, { value: [] }, { upsert: true });
          return interaction.editReply({ flags: CV2_FLAG, components: [{ type: 17, components: [{ type: 10, content: `${E.CHECK} **Puanlar uygulandı!**\n-# ${pending.length} kullanıcının puanı güncellendi.` }] }] });
        }

        // ─── Offline İptal ───────────────────────────────────────
        if (id === 'offline_iptal') {
          const { PermissionFlagsBits } = require('discord.js');
          if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({ flags: 64 | CV2_FLAG, components: [{ type: 17, components: [{ type: 10, content: `${E.LOCK} Bu işlem için yetkin yok.` }] }] });
          }

          await interaction.deferUpdate();
          const { BotMeta } = require('../models/BotMeta');
          await BotMeta.findOneAndUpdate({ key: 'offlinePending' }, { value: [] }, { upsert: true });
          return interaction.editReply({ flags: CV2_FLAG, components: [{ type: 17, components: [{ type: 10, content: `${E.TRASH} Offline tarama verileri iptal edildi.` }] }] });
        }

      } catch (err) {
        if (err.code === 10062) return;
        console.error(chalk.red('❌ Buton hatası:'), err);
      }
    }
  },
};