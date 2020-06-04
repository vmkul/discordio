'use strict';

const vm = require('vm');

module.exports = {
  name: 'run',
  description: 'Run a snippet of code, then send the output',
  execute(message, args) {
    if (args.length === 0) return;
    let code = args.join(' ');

    if (!code.startsWith('```js\n'))
      return message.reply('Invalid code format!');

    code = code.slice(5, code.length - 3);
    const logs = [];
    const restricted = ['fs', 'timers', 'console'];

    const context = { console: { log: arg => logs.push(arg) },
      require: lib => {
        if (restricted.includes(lib)) {
          logs.push(`Module ${lib} is restricted!`);
          return null;
        } else {
          return require(lib);
        }
      } };
    vm.createContext(context);

    try {
      vm.runInContext(code, context, { timeout: 1000 });
    } catch (e) {
      logs.push('Application exited with error: ' + e);
    }
    if (logs.length === 0) logs.push('');
    message.channel.send(`**Program output:**\n\`\`\`
    ${logs.map(log => JSON.stringify(log)).join('\n')}\`\`\``).catch(() => {
      message.reply('Output too long!');
    });
  },
};


