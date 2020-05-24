const { Ed25519KeyPair } = require('crypto-ld');
const { pool } = require('../../../db/sql');
const signatureQueries = require('../../../db/selectors/signature');
const marketplaceQueries = require('../../../db/selectors/marketplace');

module.exports = async function ({ verification, clientId }) {
  try {
    const { fingerprint, marketplace } = await pool.connect(
      async (connection) => {
        const result = await connection.one(
          signatureQueries.selectByVerification(verification),
        );
        const marketplace = await connection.one(
          marketplaceQueries.selectByClientId(clientId),
        );
        return {
          fingerprint: result.fingerprint,
          marketplace: marketplace,
        };
      },
    );

    // public key
    // @see https://github.com/digitalbazaar/minimal-cipher
    const publicKeyNode = Ed25519KeyPair.fromFingerprint({ fingerprint });
    publicKeyNode.id = verification;

    return Promise.resolve({
      marketplace,
      publicKeyNode,
    });
  } catch (error) {
    return Promise.reject(this.error(400, error.message, error));
  }
};
