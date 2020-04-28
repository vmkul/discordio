const findC = require('../find_con');

module.exports = {
  name: 'leave',
  description: 'Leaves voice channel',
  execute(message, args, client) {
    message.member.voice.channel.leave();
    const controller = findC(message, client);
    if (controller === undefined) return;
    if (controller) {
      controller.connection.disconnect();
      controller.connection = false;
      if (controller.dispatcher && controller.playing) {
        controller.dispatcher.end();
      }
    }
  },
};