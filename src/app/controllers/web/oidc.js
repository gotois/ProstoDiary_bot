const jose = require('jose');
const { SERVER } = require('../../../environment');
const oidc = require('../../middlewares/oidc');
const passportQueries = require('../../../db/passport');
const { pool, sql } = require('../../../db/sql');
const logger = require('../../../lib/log');
const requestService = require('../../../services/request.service');

// этот callback должен выполняться на ассистенте и записывать JWT в свою БД
module.exports.oidcallback = async (request, response) => {
  if (request.error) {
    response.sendStatus(400).send(request.error);
    return;
  }
  if (request.query.error) {
    response
      .sendStatus(400)
      .send(request.query.error + '\n' + request.query.error_description);
    return;
  }

  try {
    const tokenResult = await requestService.post(SERVER.HOST + '/oidc/token', {
      client_id: 'tg', // fixme подставлять через реферального ассистента вида '@ProstoDiary_bot'
      client_secret: 'foobar',
      code: request.query.code,
      grant_type: 'authorization_code',
    });
    const decoded = jose.JWT.decode(tokenResult.id_token);

    await pool.connect(async (connection) => {
      // fixme: делать UPDATE если такой client_id есть в БД
      // const hasExist = await connection.maybeOne(
      //   sql`select 1 from assistant where user_id = ${decoded.client_id}
      //   `,
      // );

      await connection.query(
        sql`INSERT INTO assistant
        (user_id, token)
        VALUES (${decoded.client_id}, ${tokenResult.id_token})
        `,
      );
    });

    response.send(`
    Ассистент подключен. ${JSON.stringify(decoded, null, 4)}
    `);
  } catch (error) {
    response.sendStatus(400).send(error);
    return;
  }
};

module.exports.interactionContinue = async (request, response, next) => {
  try {
    const interaction = await oidc.interactionDetails(request, response);
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
    await oidc.interactionFinished(request, response, result, {
      mergeWithLastSubmission: false,
    });
  } catch (error) {
    next(error);
  }
};

// @see https://github.com/panva/node-oidc-provider/blob/master/example/routes/express.js
module.exports.interactionUID = async (request, response, next) => {
  try {
    const details = await oidc.interactionDetails(request, response);
    const { uid, prompt, params, session } = details;
    const client = await oidc.Client.find(params.client_id);

    switch (prompt.name) {
      case 'select_account': {
        if (!session) {
          return oidc.interactionFinished(
            request,
            response,
            { select_account: {} },
            { mergeWithLastSubmission: false },
          );
        }

        // todo findAccount
        // const account = await oidcParser.Account.findAccount(
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
    return next(error);
  }
};

// authenticate
module.exports.interactionLogin = async (request, response, next) => {
  try {
    const {
      prompt: { name },
    } = await oidc.interactionDetails(request, response);
    logger.info('name: ' + name);
    const botInfo = await pool.connect(async (connection) => {
      const result = await connection.maybeOne(
        passportQueries.getPassport(request.body.email, request.body.password),
      );
      return result;
    });

    if (!botInfo) {
      response.sendStatus(401).send('Invalid email or password.');
      return;
    }
    const result = {
      select_account: {}, // make sure its skipped by the interaction policy since we just logged in
      login: {
        account: botInfo.id,
      },
    };
    await oidc.interactionFinished(request, response, result, {
      mergeWithLastSubmission: false,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.interactionConfirm = async (request, response, next) => {
  try {
    logger.info('interactionConfirm');
    await oidc.interactionFinished(
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
    next(error);
  }
};

module.exports.interactionAbort = async (request, response, next) => {
  try {
    const result = {
      error: 'access_denied',
      error_description: 'End-User aborted interaction',
    };
    await oidc.interactionFinished(request, response, result, {
      mergeWithLastSubmission: false,
    });
  } catch (error) {
    next(error);
  }
};
