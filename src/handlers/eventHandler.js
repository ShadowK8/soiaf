const fs    = require('fs');
const path  = require('path');
const chalk = require('chalk');

/**
 * events/ klasöründeki tüm event dosyalarını yükler.
 * Her dosya { name, once, execute } export etmeli.
 */
async function loadEvents(client) {
  const eventsPath = path.join(__dirname, '..', 'events');
  const files = fs.readdirSync(eventsPath).filter((f) => f.endsWith('.js'));

  for (const file of files) {
    const event = require(path.join(eventsPath, file));

    if (!event?.name || !event?.execute) {
      console.warn(chalk.yellow(`⚠️  ${file} geçersiz event formatı, atlandı.`));
      continue;
    }

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }

    console.log(chalk.cyan(`  ↳ Event yüklendi: ${event.name}`));
  }
}

module.exports = { loadEvents };
