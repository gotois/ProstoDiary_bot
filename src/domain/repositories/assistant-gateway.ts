export interface AssistantGateway {
  clearConversation(input: { chatId: number; tenantId: number }): Promise<void>;
  processText(input: {
    text: string;
    chatId: number;
    tenantId: number;
    userId?: string;
    language: string;
    accessToken: string;
    location?: string | null;
    timezone?: string | null;
  }): Promise<{ content: Array<{ text: string }>; artifact?: unknown[] }>;
}
