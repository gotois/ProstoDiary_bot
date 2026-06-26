import { DatabaseSync } from 'node:sqlite';
import { LangChainYandexGPT } from 'langchain-yandexgpt';
import { ChatOpenAI } from '@langchain/openai';
import { DATABASE, SECRETARY, AGENT, LLM } from '#env';
import { SecretaryUser } from '../domain/usecases/ensure-user.ts';
import { SecretaryGroup } from '../domain/usecases/register-group.ts';
import { SqliteUserRepository } from '../infrastructure/database/sqlite-user-repository.ts';
import { SqliteGroupRepository } from '../infrastructure/database/sqlite-group-repository.ts';
import { SqliteTelegramEventRepository } from '../infrastructure/database/sqlite-telegram-event-repository.ts';
import { SecretaryGateway } from '../infrastructure/secretary/secretary-gateway.ts';
import SecretaryOidcGateway from '../infrastructure/oidc/client.ts';
import { StartAuthorization } from '../domain/usecases/start-authorization.ts';
import { CompleteAuthorization } from '../domain/usecases/complete-authorization.ts';
import { GetStartState } from '../domain/usecases/get-start-state.ts';
import { AssistantGateway } from '../infrastructure/secretary/assistant-client.ts';

import { RefreshUserTokens } from '../domain/usecases/refresh-user-tokens.ts';
import { SecretaryPostAuthorizationGateway } from '../infrastructure/secretary/post-authorization-gateway.ts';
import { PrepareAuthorizationWelcome } from '../domain/usecases/prepare-authorization-welcome.ts';

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

export const userRepository = new SqliteUserRepository(new DatabaseSync(DATABASE.USERS));
export const groupRepository = new SqliteGroupRepository(new DatabaseSync(DATABASE.GROUPS));
export const telegramEventRepository = new SqliteTelegramEventRepository(new DatabaseSync(DATABASE.EVENTS));

export const secretaryGateway = new SecretaryGateway(SECRETARY.HOST);
export const oidcGateway = new SecretaryOidcGateway();
export const assistantGateway = new AssistantGateway(SECRETARY.MCP, model, new DatabaseSync(AGENT.MEMORY));

export const postAuthorizationGateway = new SecretaryPostAuthorizationGateway(SECRETARY.HOST);

export const container = {
  user: new SecretaryUser(userRepository),
  group: new SecretaryGroup(groupRepository),

  // Auth
  refreshUserTokens: new RefreshUserTokens(oidcGateway),
  startAuthorization: new StartAuthorization(oidcGateway),
  completeAuthorization: new CompleteAuthorization(oidcGateway),

  // ???
  getStartState: new GetStartState(),
  prepareAuthorizationWelcome: new PrepareAuthorizationWelcome(postAuthorizationGateway),
};
