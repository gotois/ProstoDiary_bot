const Provider = require('oidc-provider');
const { JWKS } = require('jose');
const {
  SERVER,
  IS_PRODUCTION,
  SECURE_KEY,
  CLIENTS,
} = require('../../environment');
const RedisAdapter = require('../../db/adapters/redis');
const Account = require('./oidc/account');

const {
  interactionPolicy: { base: policy },
} = Provider;
// todo ключи генерируются при первом запуске приложения, надо сохранять их в БД и сделать асинхронными
const keystore = new JWKS.KeyStore();
keystore.generateSync('RSA', undefined, { use: 'sig' });
keystore.generateSync('EC', undefined, { key_ops: ['sign', 'verify'] });

// copies the default policy, already has login and consent prompt policies
const interactions = policy();

const configuration = {
  adapter: RedisAdapter,
  clients: CLIENTS,
  jwks: keystore.toJWKS(true),

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

    // todo set false for PRODUCTION
    // devInteractions: { enabled: true },
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

const oidc = new Provider(SERVER.HOST, configuration);
oidc.proxy = true;
if (IS_PRODUCTION) {
  oidc.keys = SECURE_KEY.split(',');
}

module.exports = oidc;
