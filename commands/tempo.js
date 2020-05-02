const findC = require('../find_con');

module.exports = {
  name: 'tempo',
  description: 'Change song\'s tempo',
  execute(message, args, client) {
    const controller = findC(message, client);
    if (controller === undefined && args.length === 0) return;
    const freq = parseFloat(args[0]);
    if (isNaN(freq)) return;
    controller.effect = 'atempo=' + freq.toString();
    message.react('👍🏼').catch(err => console.log(err));
  },
};
