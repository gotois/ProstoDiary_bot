const { LangChainYandexGPT } = require('langchain-yandexgpt');
// todo - поменять на библиотку из npm
const SecretaryAI = require('../../../secretary-ai');
const { SERVER } = require('../environments/index.cjs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const model = new LangChainYandexGPT({
  temperature: 0,
  apiKey: process.env.YC_API_KEY,
  folderID: process.env.YC_IAM_TOKEN,
  model: 'yandexgpt-lite',
});

const memory = SERVER.IS_DEV ? ':memory:' : path.resolve('./database/agent.sqlite');
const secretaryAI = new SecretaryAI.default(
  SERVER.HOST + '/mcp',
  'virtual-secretary-mcp-server',
  model,
  new DatabaseSync(memory),
);

module.exports = secretaryAI;
