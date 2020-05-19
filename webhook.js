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
        const parsed = body.toString();
        const content = parsed.substring(0, parsed.indexOf('$'));
        const info = parsed.substring(parsed.indexOf('$') + 1, parsed.length).replace(/"/g, '\'').replace(/\$/g, '"');
        console.log(content);
        console.log(info);
        send_Message(JSON.parse(info), content);
      } catch (e) {
        console.error(e);
      }
    }
    console.log('Got a POST message');
    res.writeHead(200);
    res.end('Okay');
  });
}).listen(PORT);

const send_Message = (info, content) => {
  const webhookClient = new Discord.WebhookClient(webhook_id, webhook_token);
  const embed = new Discord.MessageEmbed()
    .setTitle(info.subject)
    .setAuthor(info.from_name)
    .setDescription(content)
    .setColor('#a504bf');
  webhookClient.send('@everyone', {
    username: 'Tarkov BOT',
    avatarURL: 'https://toppng.com/uploads/preview/escape-from-tarkov-logo-11563187295owl0loeixb.png',
    embeds: [embed],
  });
}

// https://discordapp.com/api/webhooks/711915486685954119/O6F3lieanGYKsffKtY-CCgun5tMjvKd_7DW5E30U1BLTOGQMEVBc2Wqg5_QN7P0rcAlc