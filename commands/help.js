'use strict';

const { prefix } = require('../config.json');

module.exports = {
  name: 'help',
  description: 'List a description of available commands',
  execute(message, args, client) {
    let result = '```';
    for (const command of client.commands) {
      result += `${prefix}${command[1].name} - ${command[1].description}\n`;
    }
    message.channel.send(result + '```');
  },
};
