const stream = require('youtube-audio-stream');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const search = require('youtube-search');
ffmpeg.setFfmpegPath(ffmpegPath);

const opts = {
  maxResults: 10,
  key: 'AIzaSyCLfxKAPCJYfVEfzcmnfTfykUIjC3ujYzA'
};

const obj = {
  name: 'play',
  description: 'Play a song',
  guilds: [],
  async execute(message, args) {
    const guild = message.guild.name;
    let controller = this.guilds.find(element => {
      return element.guild_name === guild;
    });
    if (controller === undefined) controller = new song_control(guild);
    if (args[0].startsWith('https://'))
      controller.play(message, args);
    else
      find_song(message, args, controller);
  },
};

module.exports = obj;


class song_control {
  constructor(guild_name) {
    this.guild_name = guild_name;
    this.stack = [];
    this.playing = false;
    obj.guilds.push(this);
    this.volume = 0.4;
  }

  async play(message, args) {
    if (args.length === 0 || typeof args[0] !== 'string' || (!message.member.voice.channel && !this.connection)) return;

    if (this.playing) {
      this.stack.push(args);
      message.channel.send('Queued ' + args.join(' '));
      return;
    }

    const link = args[0];
    if (!this.connection) this.connection = await message.member.voice.channel.join();
    this.dispatcher = this.connection.play(stream(link), {volume: this.volume});
    message.channel.send('Playing ' + link);

    this.dispatcher.on('start', () => {
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
    });

    this.dispatcher.on('error', console.error);
  }
}

const find_song = (message, args, controller) => {
    search(args.join(' '), opts, function (err, results) {
      if (err) return console.log(err);
      const link = results[0].link;
      controller.play(message, [link]);
    });
}
