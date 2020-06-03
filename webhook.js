'use strict';

const http = require('http');
const https = require('https');
const Discord = require('discord.js');
const { webhookId, webhookToken, newsToken } = require('./config.json');
const PORT = process.env.PORT || 80;
const random = maxVal => Math.floor(Math.random() * (maxVal + 1));
let usedArticles = [];
const maxValue = 16777215;

function* selectQuery(queries) {
  let i = 0;
  while (true) {
    yield queries[i];
    i++;
    if (i === queries.length) i = 0;
  }
}

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

const chooseColor = () => {
  const base10 = random(maxValue);
  return '#' + base10.toString(16);
};

const sendMessage = data => {
  const webhookClient = new Discord.WebhookClient(webhookId, webhookToken);
  const embed = new Discord.MessageEmbed()
    .setTitle(data.title)
    .setURL(data.url)
    .setAuthor(`${data.author} (${data.source})`)
    .setDescription(data.description)
    .setColor(chooseColor())
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

const fetchNews = query => {
  fetch(`https://newsapi.org/v2/top-headlines?${query}&apiKey=${newsToken}`)
    .then(res => {
      let article;
      const { articles } = JSON.parse(res);
      do {
        article = articles.shift();
        if (!article) return;
      } while (usedArticles.includes(article.title));
      usedArticles.push(article.title);
      if (usedArticles.length === 100) usedArticles = [];
      const { source, author, title, description,
        url, urlToImage, publishedAt } = article;
      sendMessage({ source: source.name, author, title,
        description, url, image: urlToImage, time: publishedAt });
    })
    .catch(fetchNews.bind(null, query));
};

const sources = ['country=ua', 'sources=ign', 'sources=die-zeit',
  'sources=espn', 'sources=techradar'];
const select = selectQuery(sources);

setInterval(() => {
  fetchNews(select.next().value);
}, 3.6e6);


