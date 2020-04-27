const stream = require('youtube-audio-stream');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = {
  name: 'play',
  description: 'Play a song',
  async execute(message, args) {
    if (args.length === 0) return;
    message.channel.send('Playing ' + args[0]);
    if (message.member.voice.channel) {
      const connection = await message.member.voice.channel.join();
      const config = JSON.parse(fs.readFileSync('config.json').toString());
      const volume = config.volume;

      const dispatcher = connection.play(stream(args[0]), { volume: volume });

      dispatcher.on('start', () => {
        console.log('audio.mp3 is now playing!');
      });

      dispatcher.on('finish', () => {
        console.log('audio.mp3 has finished playing!');
      });

      dispatcher.on('error', console.error);

    }
  },
};
