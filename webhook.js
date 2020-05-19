const http = require('http');
const Discord = require('discord.js');
const { webhook_id, webhook_token } = require('./config.json');
const PORT = process.env.PORT || 80;

http.createServer((req, res) => {
  let body = '';

  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', () => {
    if (body.length !== 0) {
      try {
        body = body.toString().replace(/"/g, '\'').replace(/\$/g, '"');
        send_Message(JSON.parse(body));
      } catch (e) {
        console.error(e);
      }
    }
    console.log('Got a POST message');
    res.writeHead(200);
    res.end('Okay');
  });
}).listen(PORT);

const send_Message = email => {
  const webhookClient = new Discord.WebhookClient(webhook_id, webhook_token);
  const embed = new Discord.MessageEmbed()
    .setTitle(email.subject)
    .setAuthor(email.from_name)
    .setDescription(email.body)
    .setColor('#a504bf');
  webhookClient.send('@everyone', {
    username: 'Tarkov BOT',
    avatarURL: 'https://toppng.com/uploads/preview/escape-from-tarkov-logo-11563187295owl0loeixb.png',
    embeds: [embed],
  });
}