const e = require('express');
const openapiJsonrpcJsdoc = require('openapi-jsonrpc-jsdoc');
const { SERVER } = require('../../../environment');

module.exports = class DocumentationController {
  /**
   * @param {e.Request} request - request
   * @param {e.Response} response - response
   */
  static async openApi(request, response) {
    try {
      const data = await openapiJsonrpcJsdoc({
        api: '/api/',
        securitySchemes: {
          BasicAuth: {
            type: 'http',
            scheme: 'basic',
          },
        },
        servers: [
          {
            url: `${SERVER.HOST}:${SERVER.PORT}`,
          },
          // {
          //   url: SERVER.HEROKUAPP,
          // },
        ],
        packageUrl: './package.json',
        files: './src/api/v4/public/*.js',
      });
      // ping
      data.paths['/'] = {
        get: {
          responses: {
            200: {
              description: 'OK',
              content: {
                'text/plain': {
                  schema: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
      };
      // todo /id/:uuid/:date
      //  ...
      // todo /mail
      //  ...
      // todo /message/:uuid
      //  ...
      data.paths['/oauth/*'] = {
        get: {
          responses: {
            200: {
              description: 'OK',
            },
          },
        },
      };
      response.status(200).json(data);
    } catch (error) {
      response.status(404).json({ message: error.message });
    }
  }
};
