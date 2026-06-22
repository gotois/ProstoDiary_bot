import type { TranscriptionGateway } from '../../domain/repositories/transcription-gateway.ts';

export class HttpTranscriptionGateway implements TranscriptionGateway {
  serverHost: string;

  constructor(serverHost: string) {
    this.serverHost = serverHost;
  }

  async transcribe(input: { fileId: string }): Promise<string> {
    const response = await fetch(`${this.serverHost}/transcription/${input.fileId}`);
    if (!response.ok) throw new Error('Ошибка Voice');
    return response.text();
  }
}
