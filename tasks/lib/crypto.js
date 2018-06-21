const inquirer = require('inquirer');
const openpgp = require('openpgp');
const crypto = {};

/**
 * Get and return the decrypted private key
 *
 * @throws Error if the seckey option is missing on file does not exist
 * @param {Object} options
 * @param {Object} grunt
 * @returns {Object} options
 */
crypto.getPrivateKey = async function(options, grunt) {
  if (!options.seckey) {
    throw new Error('The secret key is missing in the options.');
  }
  if (!grunt.file.exists(options.seckey)) {
    throw new Error('The secret key file does not exist.');
  }

  // Validate private key
  const armoredPrivateKey = grunt.file.read(options.seckey);
  let privateKey = openpgp.key.readArmored(armoredPrivateKey);
  if (privateKey.err) {
    throw new Error(privateKey.err[0].message);
  }
  privateKey = privateKey.keys[0];

  // if passphrase is provided in options ignore
  let passphrase = options.passphrase || undefined;
  if (!passphrase && !privateKey.primaryKey.isDecrypted) {
    const answers = await inquirer.prompt([{
      type: 'password',
      message: 'Enter your passphrase:',
      name: 'passphrase'
    }]);
    options.passphrase = answers.passphrase;
  }

  if (!privateKey.primaryKey.isDecrypted) {
    await privateKey.decrypt(options.passphrase);
  }

  return privateKey;
};

/**
 * Generate a signature for a given cleartext message
 *
 * @param {string} message
 * @param {Object} options
 */
crypto.signMessage = async function(message, options) {
  const signed = await openpgp.sign({
    data: message,
    privateKeys: [options.privateKey],
    detached: true
  });
  return signed.signature;
};


/**
 * Generate a signature for a given cleartext message
 *
 * @param {string} encryptedMessage
 * @param {Object} options
 */
crypto.decrypt = async function(encryptedMessage, options) {
  // todo: publicKeys: signingKeys
  const message = openpgp.message.readArmored(encryptedMessage);
  return await openpgp.decrypt({message, privateKeys: [options.privateKey]});
};

module.exports = crypto;
