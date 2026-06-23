import { DatabaseSync } from 'node:sqlite';
import { DATABASE, SECRETARY } from '#env';
import { EnsureUser } from '../domain/usecases/ensure-user.ts';
import { UpdateUserLocation } from '../domain/usecases/update-user-location.ts';
import { UpdateUserTimezone } from '../domain/usecases/update-user-timezone.ts';
import { ClearUserTokens } from '../domain/usecases/clear-user-tokens.ts';
import { SaveUserTokens } from '../domain/usecases/save-user-tokens.ts';
import { RegisterGroup } from '../domain/usecases/register-group.ts';
import { RemoveGroup } from '../domain/usecases/remove-group.ts';
import { SqliteUserRepository } from '../infrastructure/database/sqlite-user-repository.ts';
import { SqliteGroupRepository } from '../infrastructure/database/sqlite-group-repository.ts';
import { SqliteTelegramEventRepository } from '../infrastructure/database/sqlite-telegram-event-repository.ts';
import { SecretaryGateway } from '../infrastructure/secretary/secretary-gateway.ts';
import SecretaryOidcGateway from '../infrastructure/oidc/client.ts';
import { StartAuthorization } from '../domain/usecases/start-authorization.ts';
import { CompleteAuthorization } from '../domain/usecases/complete-authorization.ts';
import { GetStartState } from '../domain/usecases/get-start-state.ts';
import { SecretaryAssistantGateway } from '../infrastructure/secretary/assistant-client.ts';
import { ProcessTextMessage } from '../domain/usecases/process-text-message.ts';
import { DeleteUser } from '../domain/usecases/delete-user.ts';
import { ClearConversation } from '../domain/usecases/clear-conversation.ts';
import { RefreshUserTokens } from '../domain/usecases/refresh-user-tokens.ts';
import { SecretaryPostAuthorizationGateway } from '../infrastructure/secretary/post-authorization-gateway.ts';
import { PrepareAuthorizationWelcome } from '../domain/usecases/prepare-authorization-welcome.ts';

export const userRepository = new SqliteUserRepository(new DatabaseSync(DATABASE.USERS));
export const groupRepository = new SqliteGroupRepository(new DatabaseSync(DATABASE.GROUPS));
export const telegramEventRepository = new SqliteTelegramEventRepository(new DatabaseSync(DATABASE.EVENTS));

export const secretaryGateway = new SecretaryGateway(SECRETARY.HOST);
export const oidcGateway = new SecretaryOidcGateway();
export const assistantGateway = new SecretaryAssistantGateway();


export const postAuthorizationGateway = new SecretaryPostAuthorizationGateway(SECRETARY.HOST);

export const container = {
  // user
  ensureUser: new EnsureUser(userRepository),
  updateUserLocation: new UpdateUserLocation(userRepository),
  updateUserTimezone: new UpdateUserTimezone(userRepository),
  clearUserTokens: new ClearUserTokens(userRepository),
  saveUserTokens: new SaveUserTokens(userRepository),
  refreshUserTokens: new RefreshUserTokens(oidcGateway),
  deleteUser: new DeleteUser(userRepository),

  // group
  registerGroup: new RegisterGroup(groupRepository),
  removeGroup: new RemoveGroup(groupRepository),

  // auth
  startAuthorization: new StartAuthorization(oidcGateway),
  completeAuthorization: new CompleteAuthorization(oidcGateway),
  getStartState: new GetStartState(),

  // conversion
  processTextMessage: new ProcessTextMessage(assistantGateway),
  clearConversation: new ClearConversation(assistantGateway),

  // ???
  prepareAuthorizationWelcome: new PrepareAuthorizationWelcome(postAuthorizationGateway),
};
