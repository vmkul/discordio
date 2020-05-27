'use strict';

const findC = require('../find_con');

module.exports = {
  name: 'effect',
  description: 'Apply a custom effect',
  execute(message, args, client) {
    const controller = findC(message, client);
    if (controller === undefined || args.length === 0) return;
    controller.effect = args[0];
    if (args[0] === 'null') controller.effect = null;
    message.react('👍🏼').catch(err => console.log(err));
  },
};
