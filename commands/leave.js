'use strict';

const findC = require('../find_con');

module.exports = {
  name: 'leave',
  description: 'Leaves voice channel',
  execute(message, args, client) {
    if (!message.member.voice.channel) return;
    message.member.voice.channel.leave();
    const controller = findC(message, client);
    if (controller === undefined) return;
    if (controller.connection) {
      controller.connection.disconnect();
      controller.cycling = false;
      controller.queue = [];
      if (controller.dispatcher && controller.playing) {
        controller.dispatcher.end();
      }
    }
  },
};
