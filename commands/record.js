const ffmpeg = require('fluent-ffmpeg');
const { PassThrough } = require('stream');

module.exports = {
  name: 'record',
  description: 'Record audio for some time then send it',
  async execute(message) {
  if (!message.mentions.users.size) {
    return message.channel.send('Please mention one user you want to record');
  }
  const user = message.mentions.users.values().next();
  if (!message.member.voice.channel.members.has(user.value.id)) return message.channel.send('The user is not connected to the voice channel!');
  let connection;
  try {
    connection = await message.member.voice.channel.join();
  } catch (e) {
    message.reply('Looks like user is not in a voice channel');
    return;
  }

  const audio = connection.receiver.createStream(user.value, { mode: 'pcm' });

  const str = new PassThrough();
  ffmpeg(audio).inputFormat('s16le').outputFormat('mp3').audioFilter('atempo=2').output(str)
    .on('end', function() {
    console.log('Finished processing');
    })
    .run();
  connection.play(str);
  },
};