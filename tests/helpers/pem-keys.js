// eslint-disable-next-line ava/use-test
const { ExecutionContext } = require('ava');
const fs = require('fs');
const { JWK } = require('jose');
/**
 * Проверяем что существует тестовый файл passport ключей
 *
 * @param {ExecutionContext} t - ava test
 * @returns {{privateKey: Buffer | string, publicKey: Buffer | string}}
 */
const getPemKeys = (t) => {
  let publicKey;
  let privateKey;
  if (!fs.existsSync('tests/data/keys')) {
    fs.mkdirSync('tests/data/keys');
  }
  const privateKeyPath = 'tests/data/keys/public.pem';
  const publicKeyPath = 'tests/data/keys/private.pem';
  // public key
  if (!fs.existsSync(publicKeyPath)) {
    t.log('generating public key pem');
    publicKey = JWK.generateSync('RSA', 2048).toPEM();
    fs.writeFileSync(publicKeyPath, publicKey);
  } else {
    publicKey = fs.readFileSync(publicKeyPath);
  }
  // private key
  if (!fs.existsSync(privateKeyPath)) {
    t.log('generating public key pem');
    privateKey = JWK.generateSync('RSA', 2048).toPEM(true);
    fs.writeFileSync(privateKeyPath, privateKey);
  } else {
    privateKey = fs.readFileSync(privateKeyPath);
  }
  return {
    publicKey,
    privateKey,
  };
};

module.exports = {
  getPemKeys,
};
