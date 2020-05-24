const Discord = require('discord.js');
const Canvas = require('canvas');
const fs = require('fs');
const random = maxVal => Math.floor(Math.random() * (maxVal + 1));

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
    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'wolf_quote.png');
    await message.channel.send('', attachment);
  },
};

const applyText = (text, ctx, width, height) => {
  const margin_w = width * 0.2;
  const margin_h = height * 0.5;
  const words = text.split(' ');
  let font = 70;
  let substrings;
  do {
    substrings = [];
    ctx.font = `${font}px serif`;
    words.reduce((prev, cur, index) => {
      if (ctx.measureText(prev + ' ' + cur).width <= width - margin_w) {
        if (index === words.length - 1) substrings.push(prev + ' ' + cur);
        return prev + ' ' + cur;
      }
      else
        substrings.push(prev);
      if (index === words.length - 1) substrings.push(cur);
      return cur;
    });
    font -= 10;
  } while (substrings.length * font > height - margin_h);
  return substrings.join('\n');
};