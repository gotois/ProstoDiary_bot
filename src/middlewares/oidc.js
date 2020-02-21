const Provider = require('oidc-provider');
const { JWKS } = require('jose');
const {
  interactionPolicy: { base: policy },
} = require('oidc-provider');
const { SERVER } = require('../environment');
// const PsqlAdapter = require('../db/adapters/oidc-postgresq');
const RedisAdapter = require('../db/adapters/redis');
const Account = require('./oidc/account.js');

// todo ключи генерируются при первом запуске приложения, надо сохранять их в БД и сделать асинхронными
const keystore = new JWKS.KeyStore();
keystore.generateSync('RSA', undefined, { use: 'sig' });
keystore.generateSync('EC', undefined, { key_ops: ['sign', 'verify'] });

// copies the default policy, already has login and consent prompt policies
const interactions = policy();

const clients = [
  // todo данные должны записываться в БД
  // где client_id становится алиасом для email вида search - search@gotointeractive.com
  // {
  //   client_id: 'search',
  //   client_secret: 'bar', // todo upd
  //   // todo редирект должен находиться на ассистенте,
  //   //  тогда ассистент будет получать ключ который детектирует id бота в его базе
  //   redirect_uris: [SERVER.HOST + '/oidcallback'],
  //   token_endpoint_auth_method: 'none',
  //   // grant_types: ['implicit'],
  //   response_types: ['code'],
  // },
  // {
  //   client_id: 'health',
  //   client_secret: 'bar',
  //   redirect_uris: [SERVER.HOST + '/oidcallback'],
  //   token_endpoint_auth_method: 'none',
  //   response_types: ['code'],
  // },
  // telegram assistant
  {
    client_id: 'tg',
    client_secret: 'foobar',
    application_type: 'web',
    grant_types: ['implicit', 'authorization_code'],
    response_types: ['code'],
    redirect_uris: [SERVER.HOST + '/oidcallback'],
    token_endpoint_auth_method: 'client_secret_post',
  },
];

const configuration = {
  // adapter: PsqlAdapter,
  adapter: RedisAdapter,
  clients,
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

module.exports = oidc;
