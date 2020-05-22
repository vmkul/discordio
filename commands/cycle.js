const findC = require('../find_con');

module.exports = {
  name: 'cycle',
  description: 'Cycle the queue',
  execute(message, args, client) {
    const controller = findC(message, client);
    if (controller === undefined) return;
    if (controller.queue.length !== 0) {
      if (controller.cycling) {
        controller.cycling = false;
        message.react('👍🏼').catch(err => console.log(err));
        return;
      }
      controller.cycling = true;
      message.reply('Now cycling the queue');
    }
  },
};
