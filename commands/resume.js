'use strict';

const findC = require('../find_con');

module.exports = {
  name: 'resume',
  description: 'Resume a song',
  execute(message, args, client) {
    const controller = findC(message, client);
    if (controller === undefined) return;
    if (controller.dispatcher && controller.playing) {
      if (controller.dispatcher.paused) controller.dispatcher.resume();
      message.react('👍🏼').catch(err => console.log(err));
    }
  },
};
