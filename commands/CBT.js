module.exports = {
  name: 'CBT',
  description: 'Is it a joke?',
  execute(message, args) {
    message.channel.send('You meant computer based training?');
  },
};