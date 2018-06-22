const w3cjs = require('w3cjs');
const validate = {};

/**
 * W3C validate a given HTML snipped
 *
 * @param {string} html
 * @param {Object} options
 * @returns {Promise<any>}
 */
validate.W3C = function(html, options) {
  return new Promise((resolve, reject) => {
    w3cjs.validate({
      input: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>wrapper</title></head><body>${html}</body></html>`,
      output: 'json', // Defaults to 'json', other option includes html
      proxy: options.proxy,
      callback: (err, res) => {
        if (res.messages.length) {
          let errorMsg = '';
          for (const i in res.messages) {
            errorMsg += `Line ${res.messages[i].lastLine}: ${res.messages[i].message}\n`;
          }
          return reject(new Error(errorMsg));
        }
        return resolve();
      }
    });
  });
};

/**
 * Assert if the action property of a formElement is valid
 *
 * @param formElement
 * @returns {boolean}
 */
validate.assertAction = function(formElement) {
  const action = formElement.getAttribute('data-action');
  if (!action) {
    return true; // allowed, it returns armored data to page
  }
  const urlPattern = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gi;
  if (!urlPattern.test(action)) {
    throw new Error('The form action should be a valid url.');
  }
  if (!action.startsWith('https:')) {
    throw new Error('Insecure form action url.');
  }
  return true;
};

/**
 * Assert if the recipient property of a formElement is valid
 *
 * @param formElement
 * @returns {boolean}
 */
validate.assertRecipient = function(formElement) {
  const recipient = formElement.getAttribute('data-recipient');
  if (!recipient) {
    throw new Error('The encrypted form recipient cannot be empty.');
  }
  const emailPattern = /^[+a-zA-Z0-9_.!#$%&'*\/=?^`{|}~-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z0-9]{2,63}$/;
  if (!emailPattern.test(recipient)) {
    throw new Error('The encrypted form recipient must be a valid email address.');
  }
  return true;
};

/**
 * Assert if the encoding property of a formElement is valid
 *
 * @param formElement
 * @returns {boolean}
 */
validate.assertEncoding = function(formElement) {
  const enctype = formElement.getAttribute('data-enctype');
  if (!enctype) {
    return true; // empty is allowed, defaults to url
  }
  const whitelistedEnctype = ['json', 'url', 'html'];
  if (whitelistedEnctype.indexOf(enctype) === -1) {
    throw new Error('The requested encrypted form encoding type if is not supported.');
  }
  return true;
};

module.exports = validate;
