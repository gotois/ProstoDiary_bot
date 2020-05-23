const validator = require('validator');
const e = require('express');
const logger = require('../../../lib/log');
const regStartTmpl = require('../../views/registration/registration-start');
const regOauthTmpl = require('../../views/registration/registration-oauth');
const regSuccessTmpl = require('../../views/registration/registration-success');
const apiRequest = require('../../../lib/api').private;

// подтверждение авторизации oauth. Сначала переходить сначала по ссылке вида https://cd0b2563.eu.ngrok.io/connect/yandex
// Через localhost не будет работать
module.exports = class OAUTH {
  /**
   * @param {e.Request} request - request
   * @param {e.Response} response - response
   */
  static async registractionCallback(request, response) {
    logger.info('web:oauth');
    try {
      const { grant, phone } = request.session;
      switch (grant.provider) {
        case 'yandex':
        case 'facebook': {
          if (grant.response.error) {
            throw new Error(grant.response.error.error_message);
          }
          break;
        }
        default: {
          throw new Error('Unknown provider: ' + grant.provider);
        }
      }
      const { yandex, facebook } = {
        [grant.provider]: {
          ...grant.response,
          access_token: response.access_token,
        },
      };
      if (!yandex && !facebook) {
        throw new Error('Unknown provider oauth');
      }
      const client = await apiRequest({
        jsonrpc: '2.0',
        id: 'xxxxx',
        method: 'user-get-phone',
        params: {
          phone,
        },
      });
      if (client) {
        const { message } = await apiRequest({
          jsonrpc: '2.0',
          id: 'xxxxx',
          method: 'oauth-update',
          params: {
            yandex,
            facebook,
            passportUID: client.id,
          },
        });
        request.session.passportId = client.id;
        logger.info(message);
        response.status(200).send(
          regSuccessTmpl({
            message,
          }),
        );
      } else {
        // такого phone в БД нет
        const { passport, message } = await apiRequest({
          jsonrpc: '2.0',
          id: 'xxxxx',
          method: 'oauth-create-passport',
          params: {
            yandex,
            facebook,
            phone,
            // telegram,
          },
        });
        request.session.passportId = passport.id;
        logger.info(message);
        response.status(200).send(
          regSuccessTmpl({
            message,
          }),
        );
      }
    } catch (error) {
      response.status(400).json(error);
    }
  }
  /**
   * @param {e.Request} request - request
   * @param {e.Response} response - response
   */
  static registrationStart(request, response) {
    logger.info('web:registrationStart');
    try {
      response.status(200).send(regStartTmpl());
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
  /**
   * @param {e.Request} request - request
   * @param {e.Response} response - response
   */
  static registrationOauth(request, response) {
    logger.info('web:registrationOauth');
    try {
      let { phone = '' } = request.body;
      phone = phone
        .replace('(', '')
        .replace(')', '')
        .replace('+', '')
        .replace(/-/g, '');
      if (!validator.isMobilePhone(phone, 'ru-RU')) {
        throw new Error(`${request.body.phone} Not a phone`);
      }
      request.session.phone = phone;
      response.status(200).send(regOauthTmpl());
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
};
