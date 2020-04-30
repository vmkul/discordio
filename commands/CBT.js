module.exports = {
  name: 'cbt',
  description: 'Is it a joke?',
  execute(message, args) {
    message.channel.send('You meant computer based training?');
  },
};