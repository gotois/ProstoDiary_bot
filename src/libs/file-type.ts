import { fileTypeFromBuffer } from 'file-type';

export async function getMimeType(input: Buffer | Uint8Array | string, filename?: string): Promise<string> {
  if (input instanceof Uint8Array || Buffer.isBuffer(input)) {
    const result = await fileTypeFromBuffer(input);
    if (result && result.mime) {
      const [mime] = result.mime.split(' ');
      return mime.replace(';', '');
    } else if (filename?.endsWith('.txt')) {
      return 'text/plain';
    }
  }
  if (typeof input === 'string') {
    return input.startsWith('data:') ? input.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0] : 'text/plain';
  }
  throw new Error('Cannot detect input');
}
