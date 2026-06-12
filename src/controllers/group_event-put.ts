import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import jsonRpc from 'request-json-rpc2';
import { SECRETARY } from '#env';

export default async (request: Request, response: Response): Promise<void> => {
  await jsonRpc({
    url: SECRETARY.RPC,
    body: {
      jsonrpc: '2.0',
      id: randomUUID(),
      method: 'create',
      params: request.body,
    },
    headers: {
      Authorization: `Bearer ${request.user.access_token}`,
    },
  });

  response.send('OK');
};
