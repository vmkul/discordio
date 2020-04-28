const findC = require('../find_con');

module.exports = {
  name: 'skipall',
  description: 'Clears the queue',
  execute(message, args, client) {
    const controller = findC(message, client);
    if (controller === undefined) return;
    if (controller.dispatcher) {
      if (controller.playing) controller.dispatcher.end();
      controller.stack = [];
      message.react('👍🏼').catch(err => console.log(err));
    }
  },
};