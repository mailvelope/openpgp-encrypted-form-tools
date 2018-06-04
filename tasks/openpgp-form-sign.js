/**
 * Copyright (C) 2018 Mailvelope GmbH
 * Licensed under the GNU Affero General Public License version 3
 */
const openpgp = require('openpgp');
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

module.exports = function(grunt) {

  /**
   * Remove all non whitelisted tags and properties
   *
   * @param dirtyHtml
   * @returns {*}
   */
  function getCleanFormHtml(dirtyHtml) {
    const dompurify = createDOMPurify(new JSDOM('').window);
    return dompurify.sanitize(dirtyHtml, {
      ALLOWED_TAGS: [
        'bdi', 'bdo', 'br', 'datalist', 'div', 'fieldset', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'i', 'input',
        'label', 'legend', 'optgroup', 'option', 'p', 'select', 'small', 'span', 'strong', 'textarea'
      ],
      ALLOWED_ATTR: [
        // default html attributes
        'accesskey', 'class', 'dir', 'hidden', 'id', 'lang', 'tabindex', 'title', 'action', 'name', 'alt',
        'checked', 'dirname', 'disabled', 'for', 'required', 'list', 'max', 'maxlength', 'min', 'multiple',
        'name', 'pattern', 'placeholder', 'readonly', 'required', 'size', 'step', 'type', 'value',
        // custom data attributes
        'data-action', 'data-recipient'
      ],
      SAFE_FOR_TEMPLATES: false,
      SAFE_FOR_JQUERY: false
    });
  }

  /**
   * Validate the grunt task options
   *
   * @throws Error if the secretKey option is missing on file does not exist
   * @param {Object} options
   * @returns {Object} options
   */
  function validateOptions(options) {
    if (!options.secretKey) {
      throw new Error('The secret key is missing in the options.');
    }
    if (!grunt.file.exists(options.secretKey)) {
      throw new Error('The secret key file does not exist.');
    }
    return options;
  }

  /**
   * Format <pgp-encrypted-form> tag
   *
   * @param {string} signature
   * @param {string} html
   * @returns {string} new tag
   */
  function formatTag(signature, html) {
    signature = signature.split('\n')
    .filter(line => !(line.startsWith('---') || line.startsWith('Version') || line.startsWith('Comment')))
    .join('').replace(/\r?\n|\r/g, '');
    return `<pgp-encrypted-form signature="${signature}"><script type="text/template">${html}</script></pgp-encrypted-form>`;
  }

  /**
   * Write a file on disk using grunt
   *
   * @param {string} destination
   * @param {string} cleartext
   */
  function writeOnFile(destination, cleartext) {
    grunt.file.write(destination, cleartext);
    grunt.log.writeln(`File "${destination}" created.`);
  }

  /**
   * Generate a signature for a given cleartext message
   *
   * @param {string} message
   * @param {Object} options
   */
  async function signMessage(message, options) {
    const armoredPrivateKey = grunt.file.read(options.secretKey);
    let privateKey = openpgp.key.readArmored(armoredPrivateKey);
    if (privateKey.err) {
      throw new Error(privateKey.err[0].message);
    }
    privateKey = privateKey.keys[0];
    if (!privateKey.primaryKey.isDecrypted) {
      await privateKey.decrypt(options.passphrase);
    }
    const signed = await openpgp.sign({
      data: message,
      privateKeys: [privateKey],
      detached: true
    });
    return signed.signature;
  }

  // main
  grunt.registerMultiTask('openpgp-form-sign', 'Generate a signed OpenPGP form tag (Experimental)', function() {
    // Get and validate options
    let options;
    try {
      options = validateOptions(this.options());
    } catch (error) {
      grunt.log.error(error.message);
      return false;
    }

    // Iterate over all specified file groups.
    const tasks = [];
    this.files.forEach(file => {
      const filepath = file.src[0];
      if (!grunt.file.exists(filepath)) {
        grunt.log.warn(`Form file "${filepath}" not found.`);
        return false;
      }
      const cleanHtml = getCleanFormHtml(grunt.file.read(filepath));
      const asyncTask = signMessage(cleanHtml, options)
      .then(signature => formatTag(signature, cleanHtml))
      .then(cleartext => writeOnFile(file.dest, cleartext))
      .catch(error => {
        grunt.log.error(`File "${file.dest}" not created.`);
        grunt.log.error(error.message);
      });
      tasks.push(asyncTask);
    });

    Promise.all(tasks).then(this.async());
  });
};
