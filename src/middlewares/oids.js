const Provider = require('oidc-provider');
const { SERVER } = require('../environment');

// @see https://github.com/panva/node-oidc-provider-example/tree/master/00-oidc-minimal
// /.well-known/openid-configuration # to see your openid-configuration
// /auth?client_id=foo&response_type=code&scope=openid # to start your first Authentication Request
const oidc = new Provider(SERVER.HOST, {
  // todo configure Provider to use the adapter PostgreSQL
  // adapter: xxx,

  clients: [
    {
      client_id: 'foo',
      client_secret: 'bar',
      redirect_uris: [SERVER.HOST + '/oidcallback'],
      // response_types: ['id_token'],
      // grant_types: ['implicit'],
      // token_endpoint_auth_method: 'none',
    },
  ],
  // jwks, // todo add
  // formats: {
  //   AccessToken: 'jwt',
  // },
  // features: {
  //   encryption: { enabled: true },
  //   introspection: { enabled: true },
  //   revocation: { enabled: true },
  // },
});
oidc.proxy = true;

module.exports = oidc;
