const { pool } = require('../../../db/sql');
const { Ed25519KeyPair } = require('crypto-ld');
const signatureQueries = require('../../../db/selectors/signature');
const assistantQueries = require('../../../db/selectors/assistant');

module.exports = async function ({
  assistantMarketplaceId,
  token,
  bot_user_email,
}) {
  try {
    const { privateKeyBase58, publicKeyBase58 } = await Ed25519KeyPair.generate(
      {},
    );
    await pool.connect(async (connection) => {
      const assistant = await connection.query(
        assistantQueries.createAssistantBot({
          assistant_marketplace_id: assistantMarketplaceId,
          token,
          bot_user_email: bot_user_email,
          privateKeyBase58,
          publicKeyBase58,
        }),
      );
      const fingerprint = Ed25519KeyPair.fingerprintFromPublicKey({
        publicKeyBase58,
      });
      await connection.query(
        signatureQueries.create({
          assistant_marketplace_id: assistantMarketplaceId,
          // todo убрать хардкод 'tg'
          verification:
            'https://gotointeractive.com/marketplace/tg/keys/' + assistant.id,
          fingerprint,
        }),
      );
    });
    return Promise.resolve(true);
  } catch (error) {
    return Promise.reject(this.error(400, error.message, error));
  }
};
