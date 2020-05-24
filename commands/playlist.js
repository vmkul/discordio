const findC = require('../find_con');
const yts = require('yt-search');
const Discord = require('discord.js');

module.exports = {
  name: 'playlist',
  description: 'Add playlist to the queue',
  execute(message, args, client) {
    const controller = findC(message, client);
    if (controller === undefined) return;

    let term;
    if (args[0].startsWith('https://')) {
      const index = args[0].indexOf('list=') + 5;
      let end_index = args[0].indexOf('&', index);
      if (end_index === -1) end_index = args[0].length;
      term = {
        listId: args[0].slice(index, end_index),
      }
    }
    else {
      term = args.join(' ');
    }
    yts(term, (err, results) => {
      if (err) {
        message.reply('There was an error!');
        return console.log(err);
      }
      if (results.playlists) {
        if (results.playlists.length === 0) return message.reply('Couldn\'t find anything!');
        return this.execute(message, [results.playlists[0].url], client);
      }

      if (results.items.length + controller.queue.length > 200) return message.reply('The queue is too long!');

      results.items.forEach((video, index) => {
        const embed = create_Embed(video.title, video.url, video.thumbnail, video.description, message.author.username, message.author.avatarURL());
        const link = video.url;
        const song = { link: link, embed: embed, message: message };
        if (index === 0) return setImmediate(() => controller.play(song).catch(e => {console.error(e)}));
        controller.queue.push(song);
      });
    });
  },
};

const create_Embed = (title, url, thumbnail, description, author_name, author_avatar) => {
  return new Discord.MessageEmbed()
    .setColor('#9deb70')
    .setTitle(title)
    .setURL(url)
    .setAuthor(author_name, author_avatar)
    .setThumbnail(thumbnail);
};