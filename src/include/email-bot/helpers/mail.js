const { simpleParser } = require('mailparser');

module.exports.readMailStream = function (stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => {
      chunks.push(chunk);
    });
    stream.on('end', () => {
      simpleParser(Buffer.concat(chunks).toString('utf8'), (error, mail) => {
        if (error) {
          return reject(error);
        }
        resolve(mail);
      });
    });
  });
};
