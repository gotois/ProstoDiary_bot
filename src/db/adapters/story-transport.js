const Transport = require('winston-transport');
const { SERVER } = require('../../environment');
const AcceptAction = require('../../core/models/action/accept');
const RejectAction = require('../../core/models/action/reject');
const AuthorizeAction = require('../../core/models/action/authorize');
const logger = require('../../lib/log');
const textService = require('../../services/text.service');
const apiRequest = require('../../lib/api').private;

module.exports = class PsqlTransport extends Transport {
  constructor(options) {
    super(options);
  }
  /**
   * @param {object} info - info
   * @param {Function} callback - callback
   * @returns {Promise<void>}
   */
  async log(info, callback) {
    const { document, marketplace, passport } = info.message;
    try {
      let preContent;
      if (document.result.encodingFormat.endsWith('vnd.geo+json')) {
        preContent = 'posting geo';
      } else if (document.result.encodingFormat.startsWith('text')) {
        preContent = document.result.abstract;
      } else {
        preContent = 'posting buffer';
      }
      this.emit(
        'pre-logged',
        AuthorizeAction({
          agent: document.agent,
          mainEntity: document.result.mainEntity,
          result: {
            encodingFormat: 'text/markdown',
            abstract: `_${textService.previousInput(preContent)}_ 📝`,
          },
        }),
        {
          user: marketplace.client_id,
          pass: marketplace.client_secret,
          sendImmediately: false,
        },
      );
      const { id } = await apiRequest({
        jsonrpc: '2.0',
        id: 'xxxxx',
        method: 'story-create',
        params: {
          document: document,
          passport: passport,
        },
      });
      info.messageId = id;
      callback();
      setImmediate(() => {
        logger.warn(id);
        this.emit(
          'logged',
          AcceptAction({
            result: {
              '@type': 'Answer',
              'abstract': 'Запись добавлена',
              'encodingFormat': 'text/html',
              'text': 'Открыть запись',
              'url': `${SERVER.HOST}/message/${passport.email}/${id}`,
            },
            agent: document.agent,
            participant: {
              email: passport.email,
            },
            mainEntity: document.result.mainEntity,
          }),
          {
            user: marketplace.client_id,
            pass: marketplace.client_secret,
            sendImmediately: false,
          },
        );
      });
    } catch (error) {
      callback(
        RejectAction({
          message: error.message,
          agent: document.agent,
          mainEntity: document.result.mainEntity,
        }),
        {
          user: marketplace.client_id,
          pass: marketplace.client_secret,
          sendImmediately: false,
        },
      );
    }
  }
};
