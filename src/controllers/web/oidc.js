const oidcParser = require('../../middlewares/oidc');
const passportQueries = require('../../db/passport');
const { pool } = require('../../core/database');

// todo этот колбэк тестовый. данные коды нужно получать на удаленном ассистенте
module.exports.oidcallback = (request, response) => {
  if (request.error) {
    response.send(request.error);
    return;
  }
  response.send(`
  Ассистент подключен. 
  code: ${request.query.code}`);
};

module.exports.interactionUID = async (request, response, next) => {
  try {
    const details = await oidcParser.interactionDetails(request, response);
    const { uid, prompt } = details;
    const client = await oidcParser.Client.find(details.params.client_id);

    switch (prompt.name) {
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
      default: {
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
    }
  } catch (error) {
    return next(error);
  }
};

module.exports.interactionLogin = async (request, response, next) => {
  try {
    // authenticate
    const botId = await pool.connect(async (connection) => {
      const botId = await connection.maybeOne(
        passportQueries.checkByLoginAndPassword(
          request.body.email,
          request.body.password,
        ),
      );
      return botId;
    });

    if (!botId) {
      response.send('Invalid email or password.');
      return;
    }
    const result = {
      login: {
        account: botId,
      },
    };
    await oidcParser.interactionFinished(request, response, result, {
      mergeWithLastSubmission: false,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.interactionConfirm = async (request, response, next) => {
  try {
    await oidcParser.interactionFinished(
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
    await oidcParser.interactionFinished(
      request,
      response,
      {
        error: 'access_denied',
        error_description: 'End-User aborted interaction',
      },
      {
        mergeWithLastSubmission: false,
      },
    );
  } catch (error) {
    next(error);
  }
};
