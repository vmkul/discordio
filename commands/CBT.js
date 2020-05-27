'use strict';

module.exports = {
  name: 'cbt',
  description: 'Is it a joke?',
  execute(message) {
    message.channel.send('You meant computer based training?');
  },
};
