module.exports = {
  name: 'vol',
  description: 'Set instant volume',
  execute(message, args, client) {
    const volume = parseFloat(args[0]);
    if (typeof volume !== 'number' && args.length !== 0) return;
    const guilds = client.commands.get('play').guilds;
    const guild = message.guild.name;
    let controller = guilds.find(element => {
      return element.guild_name === guild;
    });
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