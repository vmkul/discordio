'use strict';

const ytdl = require('ytdl-core');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const yts = require('yt-search');
const { PassThrough } = require('stream');
const Discord = require('discord.js');
const { EventEmitter } = require('events');
const guilds = [];
ffmpeg.setFfmpegPath(ffmpegPath);

function* selectTrack(queue) {
  let i = 0;
  while (true) {
    yield queue[i];
    i++;
    if (i === queue.length) i = 0;
  }
}

const createEmbed = (title, url, thumb, info, authorName, authorAvatar) =>
  new Discord.MessageEmbed()
    .setColor('#9deb70')
    .setTitle(title)
    .setURL(url)
    .setAuthor(authorName, authorAvatar)
    .setDescription(info)
    .setThumbnail(thumb);

class SongControl extends EventEmitter {
  constructor(guildName) {
    super();
    this.guildName = guildName;
    this.queue = [];
    this.playing = false;
    this.volume = 1;
    this.effect = null;
    this.reading = false;
    this.cycling = false;
    this.timer = null;
    this.on('finish', () => {
      if (this.cycling) {
        setImmediate(() => this.play(this.gen.next().value));
        return;
      }
      if (this.queue.length !== 0) {
        const song = this.queue.shift();
        setImmediate(() => this.play(song));
      } else {
        this.timer = setTimeout(() => {
          if (this.connection) this.connection.disconnect();
        }, 9e5);
      }
    });
    guilds.push(this);
  }

  async play(song) {
    if (this.reading) return;
    if (!ytdl.validateURL(song.link)) {
      song.message.reply('There was an url error');
      this.emit('finish');
    }
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.playing) {
      if (this.queue.length > 200)
        return song.message.reply('The queue is too long!');
      this.queue.push(song);
      this.gen = selectTrack(this.queue);
      song.message.channel.send('Queued');
      await song.message.channel.send(song.embed);
      return;
    }

    const stream = new PassThrough();
    const effect = new PassThrough();

    this.command = ffmpeg(ytdl(song.link, { filter: format => !!format.url })
      .on('error', e => {
        song.message.reply('Download error');
        console.log(e);
        this.emit('finish');
      })).outputFormat('mp3').on('error', () => {
      if (this.dispatcher) this.dispatcher.end();
    }).output(stream);
    this.command.run();

    if (this.effect) {
      ffmpeg(stream).outputFormat('mp3')
        .audioFilter(this.effect).on('error', err => {
          song.message.reply('Wrong filter!');
          console.log(err);
          setImmediate(() => this.dispatcher.end());
          this.effect = null;
        }).output(effect).run();
    }

    if (!song.message.member.voice.channel) {
      await song.message.reply('User left the channel, emptying the queue');
      this.queue = [];
      this.cycling = false;
      return;
    }
    this.connection = await song.message.member.voice.channel.join()
      .catch(() => song.message.reply('There was an error connecting!'));

    try {
      const str = this.effect ? effect : stream;
      this.dispatcher = this.connection.play(str
        .on('error', err => { throw err; }), { volume: this.volume })
        .on('error', err => { throw err; });
    } catch (e) {
      console.error(e);
      song.message.channel.send('There was an error processing your request');
      return;
    }

    this.dispatcher.on('start', () => {
      song.message.channel.send('Playing');
      song.message.channel.send(song.embed);
      console.log('song is now playing!');
      this.playing = true;
    });

    this.dispatcher.on('finish', () => {
      console.log('song has finished playing!');
      this.emit('finish');
      this.playing = false;
    });

    this.dispatcher.on('error', console.error);
  }
}

const findSong = (message, args, controller) => {
  let term;
  if (args[0].startsWith('https://www.youtube.com/watch?v=')) {
    term = {
      pageStart: 1,
      pageEnd: 3,
      videoId: args[0].slice(32, 44),
    };
  } else if (args[0].startsWith('https://youtu.be/')) {
    term = {
      pageStart: 1,
      pageEnd: 3,
      videoId: args[0].slice(17, 28),
    };
  } else {
    term = args.join(' ');
  }
  yts(term, (err, results) => {
    let video;
    if (err) {
      message.reply('There was an error!');
      return console.log(err);
    }
    if (results.videos) {
      if (results.videos.length === 0)
        return message.reply('Couldn\'t find anything!');
      video = results.videos[0];
    } else
      video = results;
    const embed = createEmbed(video.title, video.url,
      video.thumbnail, video.description, message.author.username,
      message.author.avatarURL());
    const link = video.url;
    setImmediate(() => controller.play({ link, embed, message })
      .catch(e => console.error(e)));
  });
};

const obj = {
  name: 'play',
  description: 'Play a song',
  guilds,
  async execute(message, args) {
    let guild;
    if (message.guild)
      guild = message.guild.id;
    else
      guild = message;
    let controller = this.guilds.find(element => element.guildName === guild);
    if (controller === undefined) controller = new SongControl(guild);
    if (args.length === 0) return;
    findSong(message, args, controller);
  },
};

module.exports = obj;
