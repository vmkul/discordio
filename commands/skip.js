module.exports = {
  name: 'skip',
  description: 'Skips a song',
  execute(message, args, client) {
    const guilds = client.commands.get('play').guilds;
    const guild = message.guild.name;
    let controller = guilds.find(element => {
      return element.guild_name === guild;
    });
    if (controller === undefined) return;
    if (controller.dispatcher && controller.playing) {
      controller.dispatcher.end();
      message.channel.send('Skipped track!');
    }
  },
};