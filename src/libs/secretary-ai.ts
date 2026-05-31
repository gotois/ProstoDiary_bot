import { LangChainYandexGPT } from 'langchain-yandexgpt';
import { DatabaseSync } from 'node:sqlite';
import { ChatOpenAI } from '@langchain/openai';
import environment from '../environments/index.ts';

const { SECRETARY, AGENT } = environment;

// todo - поменять на библиотеку из npm
import SecretaryAI from '../../../../secretary-ai/index.js';

const model = AGENT.MODEL.startsWith('yandex')
  ? new LangChainYandexGPT({
      temperature: 0,
      apiKey: process.env.YC_API_KEY,
      folderID: process.env.YC_IAM_TOKEN,
      model: AGENT.MODEL,
    })
  : new ChatOpenAI({
      configuration: {
        baseURL: 'http://localhost:12434/engines/v1', // The local Docker endpoint
      },
      openAIApiKey: 'shit',
      modelName: 'ai/gemma4:E2B',
    });

const secretaryAI = new SecretaryAI(
  SECRETARY.MCP,
  'virtual-secretary-mcp-server',
  model,
  new DatabaseSync(AGENT.MEMORY),
);

export default secretaryAI;
