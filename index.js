require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const mongoose = require('mongoose');
const chalk = require('chalk');
const { loadCommands } = require('./src/handlers/commandHandler');
const { loadEvents } = require('./src/handlers/eventHandler');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildModeration,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.GuildMember,
  ],
});

client.commands = new Collection();
client.cooldowns = new Collection();

async function init() {
  try {
    console.log(chalk.yellow('⚙️  ASOIAF™ Bot başlatılıyor...'));

    await mongoose.connect(process.env.MONGODB_URI);
    console.log(chalk.green('✅ MongoDB bağlantısı kuruldu.'));

    await loadCommands(client);
    await loadEvents(client);

    await client.login(process.env.BOT_TOKEN);
  } catch (error) {
    console.error(chalk.red('❌ Başlatma hatası:'), error);
    process.exit(1);
  }
}

process.on('unhandledRejection', (error) => {
  console.error(chalk.red('❌ İşlenmeyen promise hatası:'), error);
});

process.on('uncaughtException', (error) => {
  console.error(chalk.red('❌ Yakalanmamış istisna:'), error);
  process.exit(1);
});

init();
