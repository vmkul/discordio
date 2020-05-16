const findC = require('../find_con');

module.exports = {
  name: 'cycle',
  description: 'Cycle the queue',
  execute(message, args, client) {
    const controller = findC(message, client);
    if (controller === undefined) return;
    if (controller.stack.length !== 0) {
      if (args.length !== 0 && controller.cycling) {
        controller.cycling = false;
        message.react('👍🏼').catch(err => console.log(err));
        return;
      }
      controller.cycling = true;
      message.reply('Now cycling the queue');
    }
  },
};
