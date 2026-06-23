import { randomUUID } from 'node:crypto';
import jsonRpc from 'request-json-rpc2';
import { unpack } from 'zip-pack-unpack';
import secretaryAI from './assistant-client.ts';
import type { TaskGateway } from '../../domain/repositories/task-gateway.ts';

export class SecretaryGateway implements TaskGateway {
  host: string;

  constructor(host: string) {
    this.host = host;
  }

  async getTask(input: { taskId: string; accessToken: string }): Promise<{ status: number; data?: unknown }> {
    const response = await fetch(`${this.host}/tasks/${encodeURIComponent(input.taskId)}`, {
      method: 'GET',
      headers: { Accept: 'application/json', Authorization: `Bearer ${input.accessToken}` },
    });
    if (!response.ok) {
      throw new Error('Ошибка Task');
    }
    return await response.json();
  }

  async transcribe(input: { fileId: string }): Promise<string> {
    const response = await fetch(`${this.host}/transcription/${input.fileId}`);
    if (!response.ok) {
      throw new Error('Ошибка Voice');
    }

    const text = await response.text();

    return await secretaryAI.vzor(text);
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

  async call(input: {
    method: string;
    params: Record<string, unknown>;
    accessToken?: string | null;
    geolocation?: string | null;
    timezone?: string | null;
  }): Promise<{ result?: any; error?: { message?: string } }> {
    return jsonRpc({
      url: `${this.host}/rpc`,
      body: { jsonrpc: '2.0', id: randomUUID(), method: input.method, params: input.params },
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        Geolocation: input.geolocation,
        Timezone: input.timezone,
      },
    });
  }
}
