const Provider = require('oidc-provider');
const { SERVER } = require('../environment');

const oidc = new Provider(SERVER.HOST, {
  // adapter: RedisAdapter,
  clients: [
    {
      client_id: 'search',
      client_secret: 'bar', // todo upd
      // todo редирект должен находиться на ассистенте,
      //  тогда ассистент будет получать ключ который детектирует id бота в его базе
      redirect_uris: [SERVER.HOST + '/oidcallback'],
      token_endpoint_auth_method: 'none',
      // grant_types: ['implicit'],
      response_types: ['code'],
    },
    {
      client_id: 'health',
      client_secret: 'bar',
      redirect_uris: [SERVER.HOST + '/oidcallback'],
      token_endpoint_auth_method: 'none',
      response_types: ['code'],
    },
    // todo: new assistants here
  ],

  // jwks, // todo add
  // formats: {
  //   AccessToken: 'jwt',
  // },

  // This interface is required by oidc-provider
  // todo This would ideally be just a check whether the account is still in your storage
  findAccount(/* context, id */) {
    return undefined;
    // return {
    //   accountId: id,
    //   and this claims() method would actually query to retrieve the account claims
    //   async claims() {
    //     return {
    //       sub: id,
    //       email: account.email,
    //       email_verified: account.email_verified,
    //     };
    //   },
    // };
  },
  claims: {
    openid: ['sub'],
    email: ['email', 'email_verified'],
  },
  features: {
    devInteractions: { enabled: false }, // defaults to true
    deviceFlow: { enabled: true }, // defaults to false
    introspection: { enabled: true }, // defaults to false
    encryption: { enabled: true },
    revocation: { enabled: true },
  },
  ttl: {
    AccessToken: 1 * 60 * 60, // 1 hour in seconds
    AuthorizationCode: 10 * 60, // 10 minutes in seconds
    IdToken: 1 * 60 * 60, // 1 hour in seconds
    DeviceCode: 10 * 60, // 10 minutes in seconds
    RefreshToken: 1 * 24 * 60 * 60, // 1 day in seconds
  },
});
oidc.proxy = true;

module.exports = oidc;
