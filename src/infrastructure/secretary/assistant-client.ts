import { LangChainYandexGPT } from 'langchain-yandexgpt';
import { DatabaseSync } from 'node:sqlite';
import { ChatOpenAI } from '@langchain/openai';
import { SECRETARY, AGENT, LLM } from '#env';
import type { AssistantGateway } from '../../domain/repositories/assistant-gateway.ts';

// todo - поменять на библиотеку из npm
import SecretaryAI from '../../../../../secretary-ai/index.js';

const model = AGENT.MODEL.startsWith('yandex')
  ? new LangChainYandexGPT({
      temperature: 0,
      apiKey: AGENT.YC_API_KEY,
      folderID: AGENT.YC_IAM_TOKEN,
      model: AGENT.MODEL,
    })
  : new ChatOpenAI({
      configuration: {
        baseURL: LLM.URL,
      },
      openAIApiKey: 'shit',
      model: LLM.MODEL,
    });

const secretaryAI = new SecretaryAI(
  SECRETARY.MCP,
  'virtual-secretary-mcp-server',
  model,
  new DatabaseSync(AGENT.MEMORY),
);

export class SecretaryAssistantGateway implements AssistantGateway {
  async clearConversation(input: { chatId: number; tenantId: number }): Promise<void> {
    await secretaryAI.clear({ configurable: { thread_id: input.chatId, tenant_id: input.tenantId } });
  }

  async processText(input: {
    text: string;
    chatId: number;
    tenantId: number;
    userId?: string;
    language: string;
    accessToken: string;
    location?: string | null;
    timezone?: string | null;
  }): Promise<{ content: Array<{ text: string }>; artifact?: any[] }> {
    const headers = new Headers({
      Accept: 'text/markdown',
      Authorization: `Bearer ${input.accessToken}`,
    });
    if (input.location) {
      headers.set('Geolocation', input.location);
    } else if (input.timezone) {
      headers.set('Timezone', input.timezone);
    }

    if (!secretaryAI.isConnected) {
      await secretaryAI.connect(headers);
    }

    return secretaryAI.chat(input.text, {
      configurable: {
        thread_id: input.chatId,
        tenant_id: input.tenantId,
      },
      metadata: {
        user_id: input.userId,
        locale: input.language,
      },
      headers,
    });
  }
}

export default secretaryAI;
