'use strict';

const http = require('http');
const Discord = require('discord.js');
const { webhookId, webhookToken } = require('./config.json');
const PORT = process.env.PORT || 80;

const sendMessage = (info, content, images) => {
  const webhookClient = new Discord.WebhookClient(webhookId, webhookToken);
  const embed = new Discord.MessageEmbed()
    .setTitle(info.subject)
    .setAuthor(info.fromName)
    .setDescription(content)
    .setColor('#a504bf');
  if (images.length !== 0) embed.setImage(images[0]);
  webhookClient.send('', {
    embeds: [embed],
  });
};

http.createServer((req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', () => {
    if (body.length !== 0) {
      try {
        console.log('Got a POST message');
        const content = body.toString();
        const regExp = /(https?:\/\/.*\.(?:png|jpg))/g;
        const images = [];
        let img;
        const info = {
          subject: req.headers['subject'],
          fromName: req.headers['from_name']
        };

        while (img !== null) {
          img = regExp.exec(content);
          if (img) images.push(img[0]);
        }

        sendMessage(info, content, images);
      } catch (e) {
        console.error(e);
      }
    }
    res.writeHead(200);
    res.end('Okay');
  });
}).listen(PORT);


