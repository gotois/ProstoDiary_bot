const Transport = require('winston-transport');
const AcceptAction = require('../../action/accept');
const RejectAction = require('../../action/reject');
const AuthorizeAction = require('../../action/authorize');

module.exports = class CommandTransport extends Transport {
  /**
   * @param {object} info - info
   * @param {Function} callback - callback
   */
  log(info, callback) {
    const { document, marketplace, passport, result } = info.message;
    this.emit(
      'pre-logged',
      AuthorizeAction({
        agent: document.agent,
        mainEntity: document.result.mainEntity,
      }),
      {
        user: marketplace.client_id,
        pass: marketplace.client_secret,
        sendImmediately: false,
      },
    );
    try {
      callback();
      setImmediate(() => {
        this.emit(
          'logged',
          AcceptAction({
            result: {
              '@type': 'Answer',
              'abstract': result.abstract,
              'encodingFormat': result.encodingFormat || 'text/plain',
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
