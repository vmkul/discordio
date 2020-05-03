module.exports = {
  name: 'uptime',
  description: 'Prints server\'s uptime',
  execute(message, args, client) {
    const uptime = client.uptime;
    message.channel.send('Bot up for ' + uptime);
  },
};
