const { LangChainYandexGPT } = require('langchain-yandexgpt');
const SecretaryAI = require('../../../secretary-ai'); // todo - поменять на библиотку из npm
const { SECRETARY, AGENT } = require('../environments/index.cjs');
const { DatabaseSync } = require('node:sqlite');

const model = new LangChainYandexGPT({
  temperature: 0,
  apiKey: process.env.YC_API_KEY,
  folderID: process.env.YC_IAM_TOKEN,
  model: AGENT.MODEL,
});

const secretaryAI = new SecretaryAI.default(
  SECRETARY.MCP,
  'virtual-secretary-mcp-server',
  model,
  new DatabaseSync(AGENT.MEMORY),
);

module.exports = secretaryAI;
