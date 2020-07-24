const archiver = require('archiver');
const yauzl = require('yauzl');
const { Writable } = require('stream');
/**
 * @param {Array<object>} inputs - input
 * @returns {Promise<any>}
 */
const pack = (inputs) => {
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
    for (const input of inputs) {
      archive.append(input.buffer, { name: input.filename });
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
    const out = new Map();
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
 * @param {object} [options] - yauzlOptions
 * @returns {Promise<Map>}
 */
const unpack = (
  buffer,
  // eslint-disable-next-line
  options = {
    lazyEntries: true,
    decodeStrings: true,
    validateEntrySizes: true,
  },
) => {
  return new Promise((resolve, reject) => {
    yauzl.fromBuffer(buffer, options, async (error, zipfile) => {
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
