const archiver = require('archiver');
const yauzl = require('yauzl');
const { Writable } = require('stream');
/**
 * @param {string|Buffer} input - input
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
    if (typeof input === 'string') {
      archive.append(Buffer.from(input, 'utf8'), { name: fileName });
    } else {
      archive.append(input, { name: fileName });
    }
    archive.finalize();
  });
};
/**
 * @param {Buffer} zip - zipFile
 * @returns {Promise<Map>}
 */
const readZipFiles = (zip) => {
  return new Promise((resolve, reject) => {
    let out = new Map();
    zip.readEntry();
    zip.on('entry', (entry) => {
      // Directory file names end with '/'.
      if (entry.fileName.endsWith('/')) {
        zip.readEntry();
        return;
      }
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
          zip.readEntry();
          if (zip.entryCount === zip.entriesRead) {
            resolve(out);
          }
        });
      });
    });
  });
};
/**
 * @param {Buffer} buffer - buffer
 * @returns {Promise<Map>}
 */
const unpack = (buffer) => {
  return new Promise((resolve, reject) => {
    const yauzlOptions = {
      lazyEntries: true,
      decodeStrings: true,
      validateEntrySizes: true,
    };
    yauzl.fromBuffer(buffer, yauzlOptions, async (error, zipfile) => {
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
