const findC = require('../find_con');

module.exports = {
  name: 'vol',
  description: 'Set instant volume',
  execute(message, args, client) {
    const volume = parseFloat(args[0]);
    if (isNaN(volume) && args.length !== 0) return;
    const controller = findC(message, client);
    if (controller === undefined) return;

    if (args.length === 0) {
      message.channel.send('Current volume is ' + controller.volume);
      return;
    }

    if (controller.dispatcher) {
      controller.dispatcher.setVolume(volume);
      controller.volume = volume;
      message.channel.send('Changed volume to ' + volume);
    }
  },
};