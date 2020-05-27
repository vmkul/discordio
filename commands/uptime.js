'use strict';

const convertMS = ms => {
  let h, m, s;
  s = Math.floor(ms / 1000);
  m = Math.floor(s / 60);
  s %= 60;
  h = Math.floor(m / 60);
  m %= 60;
  const  d = Math.floor(h / 24);
  h %= 24;
  return `${d}d ${h}:${m}:${s}`;
};

module.exports = {
  name: 'uptime',
  description: 'Prints server\'s uptime',
  execute(message, args, client) {
    const uptime = client.uptime;
    message.channel.send('Uptime: ' + convertMS(uptime));
  },
};

