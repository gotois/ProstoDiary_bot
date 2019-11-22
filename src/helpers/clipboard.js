const { spawn } = require('child_process');

const copy = (text) => {
  const proc = spawn('pbcopy');
  proc.stdin.write(text);
  proc.stdin.end();
  // eslint-disable-next-line
  console.log(`(${text} has been copied to the Clipboard)`);
};

module.exports = {
  copy,
};
