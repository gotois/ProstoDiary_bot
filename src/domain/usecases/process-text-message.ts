import type { AssistantGateway } from '../repositories/assistant-gateway.ts';

export class ProcessTextMessage {
  assistant: AssistantGateway;

  constructor(assistant: AssistantGateway) {
    this.assistant = assistant;
  }

  async execute(input: {
    text: string;
    chatId: number;
    tenantId: number;
    userId?: string;
    language: string;
    accessToken: string;
    location?: string | null;
    timezone?: string | null;
  }) {
    return this.assistant.processText(input);
  }
}
