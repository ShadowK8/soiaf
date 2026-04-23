require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commandData = [];
const commandsPath = path.join(__dirname, '..', 'commands');

const categories = fs.readdirSync(commandsPath);
for (const category of categories) {
  const categoryPath = path.join(commandsPath, category);
  if (!fs.statSync(categoryPath).isDirectory()) continue;

  const files = fs.readdirSync(categoryPath).filter(function(f) {
    return f.endsWith('.js');
  });

  for (const file of files) {
    try {
      const command = require(path.join(categoryPath, file));
      if (command && command.data) {
        commandData.push(command.data.toJSON());
        console.log('Yuklendi: ' + command.data.name);
      }
    } catch (err) {
      console.error('HATA ' + file + ': ' + err.message);
    }
  }
}

const rest = new REST().setToken(process.env.BOT_TOKEN);

rest.put(
  Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
  { body: commandData }
).then(function() {
  console.log('Komutlar kaydedildi: ' + commandData.length);
}).catch(function(err) {
  console.error('Hata: ' + err.message);
});