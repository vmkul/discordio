module.exports = {
  name: 'leave',
  description: 'Leaves voice channel',
  execute(message, args, client) {
    message.member.voice.channel.leave();
    const guilds = client.commands.get('play').guilds;
    const guild = message.guild.name;
    let controller = guilds.find(element => {
      return element.guild_name === guild;
    });
    if (controller) {
      controller.connection.disconnect();
      controller.connection = false;
      if (controller.dispatcher && controller.playing) {
        controller.dispatcher.end();
      }
    }
  },
};