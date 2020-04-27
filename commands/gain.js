const fs = require('fs');

module.exports = {
  name: 'gain',
  description: 'Change player\'s gain',
  execute(message, args) {
    const volume = parseFloat(args[0]);
    if (typeof volume !== 'number') return;

    message.channel.send('Setting gain to ' + volume);
    const config = JSON.parse(fs.readFileSync('config.json').toString());
    config.volume = volume;
    fs.writeFileSync('config.json', JSON.stringify(config));
  },
};