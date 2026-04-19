// const { LangChainYandexGPT } = require('langchain-yandexgpt');
const { LangChainYandexGPT } = require('../../../../langchain-yandexgpt/index.mjs');
const { DatabaseSync } = require('node:sqlite');
const { ChatOpenAI } = require('@langchain/openai');
const SecretaryAI = require('../../../../secretary-ai'); // todo - поменять на библиотку из npm
const { SECRETARY, AGENT } = require('../environments/index.cjs');

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

const secretaryAI = new SecretaryAI.default(
  SECRETARY.MCP,
  'virtual-secretary-mcp-server',
  model,
  new DatabaseSync(AGENT.MEMORY),
);

module.exports = secretaryAI;
