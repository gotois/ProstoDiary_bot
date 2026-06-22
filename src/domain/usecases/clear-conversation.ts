import type { AssistantGateway } from '../repositories/assistant-gateway.ts';

export class ClearConversation {
  assistant: AssistantGateway;

  constructor(assistant: AssistantGateway) {
    this.assistant = assistant;
  }

  async execute(input: { chatId: number; tenantId: number }): Promise<void> {
    await this.assistant.clearConversation(input);
  }
}
