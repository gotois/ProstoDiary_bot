const Provider = require('oidc-provider');
const { JWKS } = require('jose');
const { SERVER, IS_PRODUCTION, SECURE_KEY } = require('../environment');
const { pool, NotFoundError } = require('../db/sql');
const RedisAdapter = require('../db/adapters/oidc-transport');
const marketplaceQueries = require('../db/selectors/marketplace');
const Account = require('../app/models/account');
/**
 * @returns {Promise<Provider>}
 */
module.exports = async () => {
  const {
    interactionPolicy: { base: policy },
  } = Provider;

  const keystore = new JWKS.KeyStore();
  await Promise.all([
    keystore.generate('RSA', undefined, { use: 'sig' }),
    keystore.generate('EC', undefined, { key_ops: ['sign', 'verify'] }),
  ]);
  const jwks = keystore.toJWKS(true);

  const CLIENTS = await pool.connect(async (connection) => {
    let marketplaces;
    try {
      marketplaces = await connection.many(marketplaceQueries.selectAll());
    } catch (error) {
      if (error instanceof NotFoundError) {
        // todo generate Error
        // logger.warn('Assistants not found');
        return [];
      }
      throw error;
    }
    return marketplaces.map((assistant) => {
      return {
        ...assistant,
        redirect_uris: [
          // насыщаем редирект текущим урлом сервера
          SERVER.HOST + `/oidcallback?client_id=${assistant.client_id}`,
          ...assistant.redirect_uris,
        ],
      };
    });
  });

  // copies the default policy, already has login and consent prompt policies
  const interactions = policy();

  const configuration = {
    // todo при переходе использовать другой адаптер - https://github.com/panva/node-oidc-provider/blob/master/example/adapters/firestore.js
    adapter: RedisAdapter,
    clients: CLIENTS,
    jwks,

    // This interface is required by oidc-provider
    findAccount: Account.findAccount,

    // hack https://github.com/panva/node-oidc-provider/blob/master/docs/README.md#id-token-does-not-include-claims-other-than-sub
    conformIdTokenClaims: false,
    cookies: {
      long: { signed: true, secure: true, maxAge: 1 * 24 * 60 * 60 * 1000 }, // 1 day in ms
      short: { signed: true, secure: true },
      keys: [
        'some secret key',
        'and also the old rotated away some time ago',
        'and one more',
      ],
    },
    claims: {
      email: ['email', 'email_verified'],
      profile: ['locale', 'client_id', 'name', 'updated_at', 'zoneinfo'],
    },
    features: {
      clientCredentials: { enabled: true },
      introspection: { enabled: true },
      revocation: { enabled: true },
      registration: { initialAccessToken: true },
      requestObjects: { request: true },
      encryption: { enabled: true },
      jwtIntrospection: { enabled: true },
      jwtResponseModes: { enabled: true },
      devInteractions: { enabled: false },
    },
    interactions: {
      policy: interactions,
      url(context) {
        return `/interaction/${context.oidc.uid}`;
      },
    },
    format: { default: 'opaque' },
    ttl: {
      AccessToken: 1 * 60 * 60, // 1 hour in seconds
      AuthorizationCode: 10 * 60, // 10 minutes in seconds
      IdToken: 1 * 60 * 60, // 1 hour in seconds
      RefreshToken: 1 * 24 * 60 * 60, // 1 day in seconds
    },
  };

  const provider = new Provider(SERVER.HOST, configuration);
  provider.proxy = true;
  if (IS_PRODUCTION) {
    provider.keys = SECURE_KEY.split(',');
  }
  return provider;
};
