import path from 'node:path';

const environment = process.env;

export const IS_DEV = String(environment.NODE_ENV)?.toLowerCase()?.startsWith('dev');
export const OIDC = {
  CLIENT_ID: environment.CLIENT_ID,
  CLIENT_SECRET: environment.CLIENT_SECRET,
  CLIENT_REDIRECT: `${environment.HOST}/token`,
};
export const DATABASE = {
  USERS: path.join(import.meta.dirname, '../../database/users.sqlite'),
  GROUPS: path.join(import.meta.dirname, '../../database/groups.sqlite'),
  EVENTS: path.join(import.meta.dirname, '../../database/events.sqlite'),
  AGENT: IS_DEV ? ':memory:' : path.resolve('./database/agent.sqlite'),
};
export const LLM = {
  MODEL: 'ai/gemma4:E2B',
  // TODO: вынести local Docker endpoint, ключ и модель в конфигурацию
  URL: 'http://localhost:12434/engines/v1',
};
export const AGENT = {
  MODEL: 'yandexgpt-lite',
  MEMORY: DATABASE.AGENT,
  YC_API_KEY: environment.YC_API_KEY,
  YC_IAM_TOKEN: environment.YC_IAM_TOKEN,
};
export const SERVER = {
  HOST: environment.HOST,
  APP_URL: environment.APP_URL,
};
export const VOSK = {
  URL: environment.VOSK_RECOGNIZE_URL,
};
export const SECRETARY = {
  MCP: `${environment.SECRETARY_HOST}/mcp`,
  RPC: `${environment.SECRETARY_HOST}/rpc`,
  HOST: environment.SECRETARY_HOST,
};
export const TELEGRAM = {
  TOKEN: environment.TELEGRAM_TOKEN,
  DOMAIN: environment.TELEGRAM_DOMAIN,
  BOT_NAME: environment.TELEGRAM_BOT_NAME,
  BOT_LINK: IS_DEV ? 'https://t.me/secretary_dev_bot/Contracts' : 'https://t.me/gotois_bot/App',
  APP_URL: environment.APP_URL,
};
export const GOOGLE = {
  CALENDAR: {
    CLIENT_ID: environment.GOOGLE_CALENDAR_CLIENT_ID,
    CLIENT_SECRET: environment.GOOGLE_CALENDAR_CLIENT_SECRET,
  },
};
