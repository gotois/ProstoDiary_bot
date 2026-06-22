import type { AssistantGateway } from '../repositories/assistant-gateway.ts';
import type { TranscriptionGateway } from '../repositories/transcription-gateway.ts';

export class ProcessVoiceMessage {
  transcription: TranscriptionGateway;
  assistant: AssistantGateway;

  constructor(transcription: TranscriptionGateway, assistant: AssistantGateway) {
    this.transcription = transcription;
    this.assistant = assistant;
  }

  async execute(input: {
    fileId: string;
    chatId: number;
    tenantId: number;
    userId?: string;
    language: string;
    accessToken: string;
    location?: string | null;
    timezone?: string | null;
  }) {
    const text = await this.transcription.transcribe({ fileId: input.fileId });
    return this.assistant.processText({ ...input, text });
  }
}
