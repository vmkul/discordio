'use strict';

const Discord = require('discord.js');
const Canvas = require('canvas');
const fs = require('fs');
const random = maxVal => Math.floor(Math.random() * (maxVal + 1));

const applyText = (text, ctx, width, height) => {
  const marginW = width * 0.2;
  const marginH = height * 0.5;
  const words = text.split(' ');
  let font = 70;
  let substrings;
  const reducer = (prev, cur, index) => {
    if (ctx.measureText(prev + ' ' + cur).width <= width - marginW) {
      if (index === words.length - 1) substrings.push(prev + ' ' + cur);
      return prev + ' ' + cur;
    } else
      substrings.push(prev);
    if (index === words.length - 1) substrings.push(cur);
    return cur;
  };
  do {
    substrings = [];
    ctx.font = `${font}px serif`;
    words.reduce(reducer);
    font -= 10;
  } while (substrings.length * font > height - marginH);
  return substrings.join('\n');
};

module.exports = {
  name: 'quote',
  description: 'Send a wise quote about life',
  photos: fs.readdirSync('./wolves'),
  quotes: fs.readFileSync('./quotes.txt'),
  async execute(message) {
    const quotes = this.quotes.toString().split('\n');
    const citation = quotes[random(quotes.length - 1)];
    const wolf = this.photos[random(this.photos.length - 1)];
    const background = await Canvas.loadImage(`./wolves/${wolf}`);
    const { naturalHeight, naturalWidth } = background;
    const canvas = Canvas.createCanvas(naturalWidth, naturalHeight);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    const text = applyText(citation, ctx, naturalWidth, naturalHeight);
    ctx.drawImage(background, 0, 0, naturalWidth, naturalHeight);
    ctx.fillText(text, 50, 100);
    const attachment = new Discord
      .MessageAttachment(canvas.toBuffer(), 'quote.png');
    await message.channel.send('', attachment);
  },
};
