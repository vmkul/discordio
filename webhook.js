'use strict';

const http = require('http');
const https = require('https');
const Discord = require('discord.js');
const { webhookId, webhookToken, newsToken } = require('./config.json');
const PORT = process.env.PORT || 80;
const random = maxVal => Math.floor(Math.random() * (maxVal + 1));

const fetch = url => new Promise((resolve, reject) => {
  const protocol = url.startsWith('https') ? https : http;
  protocol.get(url, res => {
    if (res.statusCode !== 200) {
      const { statusCode, statusMessage } = res;
      reject(new Error(`Status Code: ${statusCode} ${statusMessage}`));
    }
    res.setEncoding('utf8');
    const buffer = [];
    res.on('data', chunk => buffer.push(chunk));
    res.on('end', () => resolve(buffer.join()));
  });
});

const sendMessage = data => {
  const webhookClient = new Discord.WebhookClient(webhookId, webhookToken);
  const embed = new Discord.MessageEmbed()
    .setTitle(data.title)
    .setURL(data.url)
    .setAuthor(`${data.author} (${data.source})`)
    .setDescription(data.description)
    .setColor('#ef0b88')
    .setImage(data.image)
    .setTimestamp(data.time);
  webhookClient.send('', {
    embeds: [embed],
  });
};

http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Okay');
}).listen(PORT);

const fetchNews = () => {
  fetch(`https://newsapi.org/v2/top-headlines?country=ua&apiKey=${newsToken}`)
    .then(res => {
      const { articles } = JSON.parse(res);
      const article = articles[random(articles.length)];
      const { source, author, title, description,
        url, urlToImage, publishedAt } = article;
      sendMessage({ source: source.name, author, title,
        description, url, image: urlToImage, time: publishedAt });
    })
    .catch(fetchNews);
};

setInterval(fetchNews, 3.6e6);
