const { spawn } = require('child_process');

const copy = (text) => {
  const proc = spawn('pbcopy');
  proc.stdin.write(text);
  proc.stdin.end();
};

module.exports = {
  copy,
};
