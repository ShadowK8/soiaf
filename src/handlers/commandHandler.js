const fs   = require('fs');
const path = require('path');
const chalk = require('chalk');
const { REST, Routes } = require('discord.js');

/**
 * commands/ klasöründeki tüm komutları yükler ve Discord'a kaydeder.
 */
async function loadCommands(client) {
  const commandsPath = path.join(__dirname, '..', 'commands');
  const commandData  = [];

  // Tüm kategori klasörlerini tara
  const categories = fs.readdirSync(commandsPath);

  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    const files = fs.readdirSync(categoryPath).filter((f) => f.endsWith('.js'));

    for (const file of files) {
      const command = require(path.join(categoryPath, file));

      if (!command?.data || !command?.execute) {
        console.warn(chalk.yellow(`⚠️  ${file} geçersiz komut formatı, atlandı.`));
        continue;
      }

      client.commands.set(command.data.name, command);
      commandData.push(command.data.toJSON());
      console.log(chalk.cyan(`  ↳ Komut yüklendi: /${command.data.name}`));
    }
  }

  // Discord'a slash komutlarını kaydet
  const rest = new REST().setToken(process.env.BOT_TOKEN);

  try {
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commandData }
    );
    console.log(chalk.green(`✅ ${commandData.length} komut Discord'a kaydedildi.`));
  } catch (error) {
    console.error(chalk.red('❌ Komut kaydı hatası:'), error);
  }
}

module.exports = { loadCommands };
