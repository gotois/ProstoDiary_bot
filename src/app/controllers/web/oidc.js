const jose = require('jose');
const passportQueries = require('../../../db/selectors/passport');
const assistantQueries = require('../../../db/selectors/assistant');
const { pool } = require('../../../db/sql');
const logger = require('../../../lib/log');
const { post } = require('../../../services/request.service');
const { SERVER } = require('../../../environment');

class OIDC {
  constructor(provider) {
    this.oidc = provider;
  }
  /**
   * @description callback должен выполняться на ассистенте и записывать JWT в свою БД
   * @param {*} request - request
   * @param {*} response - response
   * @returns {Promise<void>}
   */
  async oidcallback(request, response) {
    logger.info('oidcallback');
    try {
      if (request.error) {
        throw new Error(request.error);
      }
      if (request.query.error) {
        throw new Error(
          request.query.error + '\n' + request.query.error_description,
        );
      }
      const tokenResult = await post(SERVER.HOST + '/oidc/token', {
        client_id: request.query.client_id,
        client_secret: 'foobar',
        code: request.query.code,
        grant_type: 'authorization_code',
        redirect_uri:
          SERVER.HOST + `/oidcallback?client_id=${request.query.client_id}`,
      });
      const decoded = jose.JWT.decode(tokenResult.id_token);
      const assistantData = await pool.connect(async (connection) => {
        // сверяем что такой client_id ассистента существует
        const assistant = await connection.one(
          assistantQueries.selectMarketAssistant(request.query.client_id),
        );
        const assistantBot = await connection.maybeOne(
          assistantQueries.selectAssistantBotByEmail(decoded.email),
        );
        if (assistantBot) {
          // обновляется токен бота
          await connection.query(
            assistantQueries.updateAssistantBotToken(
              tokenResult.id_token,
              assistantBot.bot_user_email,
            ),
          );
        } else {
          // создается новый assistant.bot, ассистент сохраняет JWT
          // а в таблицу client.bot записывается id ассистента (tg@gotointeractive.com)
          await connection.query(
            assistantQueries.createAssistantBot({
              assistant_marketplace_id: assistantBot.id,
              token: tokenResult.id_token,
              bot_user_email: decoded.email,
            }),
          );
        }
        return assistant;
      });
      request.session.passportId = decoded.client_id;
      // в случае успеха надо перекидывать на homepage страницу ассистента
      if (assistantData.homepage) {
        response.redirect(assistantData.homepage);
        return;
      }
      response.send(
        `Привязан/обновлен ассистент ${decoded.aud} для бота ${decoded.email}.`,
      );
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
  // @see https://github.com/panva/node-oidc-provider/blob/master/example/routes/express.js
  async interactionUID(request, response) {
    logger.info('interactionUID');
    try {
      const details = await this.oidc.interactionDetails(request, response);
      const { uid, prompt, params, session } = details;
      const client = await this.oidc.Client.find(params.client_id);

      switch (prompt.name) {
        case 'select_account': {
          if (!session) {
            return this.oidc.interactionFinished(
              request,
              response,
              { select_account: {} },
              { mergeWithLastSubmission: false },
            );
          }

          // todo findAccount
          // const account = await Account.findAccount(
          //   undefined,
          //   session.accountId,
          // );
          // const { email } = await account.claims(
          //   'prompt',
          //   'email',
          //   { email: null },
          //   [],
          // );

          // return res.render('select_account', {
          //   client,
          //   uid,
          //   email,
          //   details: prompt.details,
          //   params,
          //   title: 'Sign-in',
          //   session: session ? debug(session) : undefined,
          //   dbg: {
          //     params: debug(params),
          //     prompt: debug(prompt),
          //   },
          // });
          break;
        }
        case 'login': {
          response.send(`
      <h1>${client.clientId}</h1>
      <form autocomplete="off" action="/interaction/${uid}/login" method="post">
        <input required type="email" name="email" placeholder="Enter bot email" autofocus="on">
        <input required type="password" name="password" placeholder="and password">
        <button type="submit">Sign-in</button>
      </form>
      <div>
        <a href="/interaction/${uid}/abort">[ Abort ]</a>
      </div>
        `);
          break;
        }
        case 'consent': {
          response.send(`
  ${prompt.details.scopes.new.map((scope) => {
    return `
      <li>${scope}</li>`;
  })}
      <form autocomplete="off" action="/interaction/${uid}/confirm" method="post">
        <button autofocus type="submit">Continue</button>
      </form>
      <div>
        <a href="/interaction/${uid}/abort">[ Abort ]</a>
      </div>
`);
          break;
        }
        default: {
          return undefined;
        }
      }
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
  // authenticate
  async interactionLogin(request, response) {
    logger.info('interactionLogin');
    try {
      const {
        prompt: { name },
      } = await this.oidc.interactionDetails(request, response);
      logger.info('name: ' + name);
      const botInfo = await pool.connect(async (connection) => {
        const result = await connection.maybeOne(
          passportQueries.getPassport(
            request.body.email,
            request.body.password,
          ),
        );
        return result;
      });

      if (!botInfo) {
        throw new Error('Invalid email or password.');
      }
      const result = {
        select_account: {}, // make sure its skipped by the interaction policy since we just logged in
        login: {
          account: botInfo.id,
        },
      };
      await this.oidc.interactionFinished(request, response, result, {
        mergeWithLastSubmission: false,
      });
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
  async interactionContinue(request, response) {
    logger.info('interactionContinue');
    try {
      const interaction = await this.oidc.interactionDetails(request, response);
      if (request.body.switch) {
        if (interaction.params.prompt) {
          const prompts = new Set(interaction.params.prompt.split(' '));
          prompts.add('login');
          interaction.params.prompt = [...prompts].join(' ');
        } else {
          interaction.params.prompt = 'logout';
        }
        await interaction.save();
      }
      const result = { select_account: {} };
      await this.oidc.interactionFinished(request, response, result, {
        mergeWithLastSubmission: false,
      });
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
  async interactionConfirm(request, response) {
    logger.info('interactionConfirm');
    try {
      await this.oidc.interactionFinished(
        request,
        response,
        {
          consent: {
            // rejectedScopes: [], // < uncomment and add rejections here
            // rejectedClaims: [], // < uncomment and add rejections here
          },
        },
        {
          mergeWithLastSubmission: true,
        },
      );
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
  async interactionAbort(request, response) {
    logger.info('interactionAbort');
    try {
      const result = {
        error: 'access_denied',
        error_description: 'End-User aborted interaction',
      };
      await this.oidc.interactionFinished(request, response, result, {
        mergeWithLastSubmission: false,
      });
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
}

module.exports = OIDC;