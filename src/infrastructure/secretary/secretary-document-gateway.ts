import { unpack } from 'zip-pack-unpack';
import type { DocumentGateway } from '../../domain/repositories/document-gateway.ts';
import secretaryAI from './assistant-client.ts';

export class SecretaryDocumentGateway implements DocumentGateway {
  host: string;

  constructor(host: string) {
    this.host = host;
  }

  async process(input: { fileId: string }): Promise<{ url: string }> {
    const url = `${this.host}/file/${input.fileId}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Ошибка');
    await (response.headers.get('content-type') === 'application/zip'
      ? unpack(Buffer.from(await response.arrayBuffer()))
      : secretaryAI.vzor(response));
    return { url };
  }
}
