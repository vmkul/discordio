const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

module.exports = {
  name: 'record',
  description: 'Record audio for some time then send it',
  async execute(message, args) {
  if (!message.mentions.users.size) {
    return message.channel.send('Please mention one user you want to record');
  }
  const user = message.mentions.users.values().next();
  const connection = await message.member.voice.channel.join();
  const audio = connection.receiver.createStream(user.value, { mode: 'pcm' });
  audio.on('data', () => console.log('finish'));

  const stream = fs.createWriteStream('audio.mp3');
  const command = ffmpeg(audio).inputFormat('s16le');
  await command.output(stream).outputFormat('mp3')
    .on('end', function() {
    console.log('Finished processing');
    })
    .run();
  },
};