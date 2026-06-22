import type { TaskGateway } from '../../domain/repositories/task-gateway.ts';
import { randomUUID } from 'node:crypto';
import jsonRpc from 'request-json-rpc2';

export class SecretaryTaskGateway implements TaskGateway {
  host: string;

  constructor(host: string) {
    this.host = host;
  }

  async getTask(input: { taskId: string; accessToken: string }): Promise<{ status: number; data?: unknown }> {
    const response = await fetch(`${this.host}/tasks/${encodeURIComponent(input.taskId)}`, {
      method: 'GET',
      headers: { Accept: 'application/json', Authorization: `Bearer ${input.accessToken}` },
    });
    if (!response.ok) return { status: response.status };
    return { status: response.status, data: await response.json() };
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
