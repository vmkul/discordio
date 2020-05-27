'use strict';

module.exports = (message, client) => {
  const guilds = client.commands.get('play').guilds;
  const guild = message.guild.id;
  return guilds.find(element => element.guildName === guild);
};
