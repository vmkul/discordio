'use strict';

module.exports = (message, client) => {
  const guilds = client.commands.get('play').guilds;
  const guild = message.guild.id;
  const controller = guilds.find(element => element.guild_name === guild);
  return controller;
};
