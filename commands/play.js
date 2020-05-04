const stream = require('youtube-audio-stream');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const search = require('youtube-search');
const { PassThrough } = require('stream');
const fs = require('fs');
const { youtube_token } = require('../config.json');
ffmpeg.setFfmpegPath(ffmpegPath);

const opts = {
  maxResults: 10,
  key: youtube_token,
};

const obj = {
  name: 'play',
  description: 'Play a song',
  guilds: [],
  async execute(message, args) {
    let guild;
    if (message.guild)
      guild = message.guild.id;
    else
      guild = message;
    let controller = this.guilds.find(element => {
      return element.guild_name === guild;
    });
    if (controller === undefined) controller = new song_control(guild);
    if (args.length === 0) return;
    if (args[0].startsWith('https://'))
      setImmediate(() => controller.play(message, args).catch(e => {console.error(e)}));
    else
      find_song(message, args);
  },
};

module.exports = obj;

class song_control {
  constructor(guild_name) {
    this.guild_name = guild_name;
    this.stack = [];
    this.playing = false;
    this.volume = 1;
    this.effect = null;
    this.reading = false;
    obj.guilds.push(this);
  }

  async play(message, args) {
    if (args.length === 0 || typeof args[0] !== 'string' || (!message.member.voice.channel && !this.connection) || this.reading) return;

    if (this.playing) {
      this.stack.push(args);
      message.channel.send('Queued ' + args.join(' '));
      return;
    }

    const link = args[0];
    if (!this.connection) this.connection = await message.member.voice.channel.join();
    try {
      if (this.effect) {
        const str = new PassThrough().on('error', err => { throw err });
        ffmpeg(stream(link).on('error', err => { throw err })).audioFilter(this.effect).format('mp3').output(str)
          .on('error', err => {
            message.channel.send('Wrong filter!');
            this.effect = null;
          }).run();
        this.dispatcher = this.connection.play(str, {volume: this.volume}).on('error', err => { throw err });
      } else
        this.dispatcher = this.connection.play(stream(link).on('error', err => { throw err }), {volume: this.volume})
          .on('error', err => { throw err });
    } catch (e) {
      console.error(console.error(e));
      message.channel.send('There was an error processing your request');
      return;
    }

    this.dispatcher.on('start', () => {
      message.channel.send('Playing ' + link);
      console.log('song is now playing!');
      this.playing = true;
    });

    this.dispatcher.on('finish', () => {
      console.log('song has finished playing!');
      this.playing = false;
      if (this.stack.length !== 0) {
        const arg = this.stack.shift();
        obj.execute(message, arg);
      }
      return true;
    });

    this.dispatcher.on('error', console.error);

  }
}


const find_song = (message, args, controller) => {
  search(args.join(' '), opts, function (err, results) {
    if (err) return console.log(err);
    if (results[0].kind !== 'youtube#video') return;
    const link = results[0].link;
    obj.execute(message, [link]).catch(err => console.log(err));
  });
}
