const archiver = require('archiver');
const yauzl = require('yauzl');
const { Writable } = require('stream');
/**
 * @todo нужно настроить на передачу Buffer, а не только string
 * @param {string} input - input
 * @param {string} fileName - file name
 * @returns {Promise<any>}
 */
const pack = (input, fileName) => {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', {
      zlib: { level: 5 },
    });
    archive.on('error', (error) => {
      reject(error);
    });
    archive.on('end', () => {
      resolve(Buffer.concat(buffers));
    });
    const ws = Writable();
    const buffers = [];
    ws._write = (chunk, enc, next) => {
      buffers.push(chunk);
      next();
    };
    archive.pipe(ws);
    archive.append(Buffer.from(input, 'utf8'), { name: fileName });
    archive.finalize();
  });
};
/**
 * @param {Buffer} zip - zipFile
 * @returns {Promise<any>}
 */
const readZipFiles = (zip) => {
  return new Promise((resolve, reject) => {
    let entryCount = zip.entryCount;
    let out = new Map();
    zip.on('entry', (entry) => {
      zip.openReadStream(entry, (error, readStream) => {
        if (error) {
          return reject(error);
        }
        const chunks = [];
        readStream.on('data', (chunk) => {
          return chunks.push(chunk);
        });
        readStream.on('error', (error) => {
          reject(error);
        });
        readStream.on('end', () => {
          out.set(entry.fileName, Buffer.concat(chunks));
          if (--entryCount === 0) {
            resolve(out);
          }
        });
        zip.readEntry();
      });
    });
    zip.readEntry();
    // zipfile.on('end', () => {
    //   console.log("end of entries");
    // });
  });
};
/**
 * @param {Buffer} buffer - buffer
 * @returns {Promise<any>}
 */
const unpack = (buffer) => {
  return new Promise((resolve, reject) => {
    yauzl.fromBuffer(buffer, { lazyEntries: true }, async (error, zipfile) => {
      if (error) {
        return reject(error);
      }
      const zipContents = await readZipFiles(zipfile);
      return resolve(zipContents);
    });
  });
};

module.exports = {
  pack,
  unpack,
};
