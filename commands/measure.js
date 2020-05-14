const random = maxVal => Math.floor(Math.random()*(maxVal+1));

module.exports = {
  name: 'pipametr',
  description: 'Nice to know',
  async execute(message) {
    await message.channel.send('```()```');
    let content = '()';
    let additional = '';
    const len = random(20);
    if (len === 20)
      additional = 'Quite impressive!';
    else if (len === 0)
      additional = 'Poor guy!';
    else if (len >= 10)
      additional = 'Pretty fly for a white guy!';
    else if (len < 10)
      additional = 'You\'ll have to work on that!';
    const m = message.channel.lastMessage;
    for (let i = 0; i < len; i++) {
      content += '=';
      await m.edit('```' + content + '```').catch(() => i = len);
    }
    await m.edit('```' + content + `>\n${message.author.username}'s cock is ${len}cm long. ${additional}\`\`\``).catch();
  },
};