'use strict';

const { Worker } = require('worker_threads');
const Discord = require('discord.js');
const fs = require('fs');
const client = new Discord.Client();
const { prefix, token } = require('./config.json');
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.once('ready', () => {
  const keys = client.guilds.cache.keys();
  const play = client.commands.get('play');
  for (let id of keys) {
    play.execute(id, []);
  }
  console.log('Ready!');
});

client.on('message', async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (!client.commands.has(commandName)) return;
  const command = client.commands.get(commandName);

  try {
    setImmediate(() => command.execute(message, args, client));
  } catch (error) {
    console.error(error);
    message.reply('there was an error trying to execute that command!');
  }

});

client.login(token);

const worker = new Worker('./webhook.js');

worker.on('exit', () => {
  console.log('worker died');
  process.exit(1);
});