const random = maxVal => Math.floor(Math.random()*(maxVal+1));

module.exports = {
  name: 'maps',
  description: 'Send a reasonable cs:go map pool',
  execute(message, args) {
    const maps = ['Mirage', 'Inferno', 'Overpass', 'Vertigo', 'Nuke', 'Train', 'Dust II', 'Anubis', 'Cache', 'Agency', 'Office'];
    const pool = [];

    const num = parseInt(args[0]);
    if (args.length === 0 || isNaN(num) || num > 11 || num < 1) {
      message.channel.send('Please specify a number of maps you want to include (from 1 to 11)');
      return;
    }

    for (let i = 0; i < num; i++) {
      const index = random(maps.length - 1);
      pool.push(maps[index]);
      maps.splice(index, 1);
    }

    message.channel.send('```\nYour map pool: \n' + pool.join(', ') + '```');
  },
};