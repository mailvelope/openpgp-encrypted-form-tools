/**
 * Copyright (C) 2018 Mailvelope GmbH
 * Licensed under the GNU Affero General Public License version 3
 */
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

module.exports = function(grunt) {
  const dom = new JSDOM('');
  const window = dom.window;
  const dompurify = createDOMPurify(window);

  function createElementFromHTML(htmlString) {
    // Replace DOMParser approach as it's not available in JSDOM
    var div = dom.window.document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div;
  }

  function getCleanFormElement(dirtyHtml) {
    const html = dompurify.sanitize(dirtyHtml, {
      ALLOWED_TAGS: ['form'],
      ALLOWED_ATTR: ['data-action', 'data-recipient', 'data-enctype']
    });
    const htmlElement = createElementFromHTML(html);
    const formElementCollection = htmlElement.getElementsByTagName('form');
    if (!formElementCollection.length) {
      throw new Error('There should be one form tag in the form definition.');
    }
    if (formElementCollection.length > 1) {
      throw new Error('There should be only one form tag in the form definition.');
    }
    return formElementCollection[0];
  }

  function assertAction(formElement) {
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
  }

  function assertRecipient(formElement) {
    const recipient = formElement.getAttribute('data-recipient');
    if (!recipient) {
      throw new Error('The encrypted form recipient cannot be empty.');
    }
    const emailPattern = /^[+a-zA-Z0-9_.!#$%&'*\/=?^`{|}~-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z0-9]{2,63}$/;
    if (!emailPattern.test(recipient)) {
      throw new Error('The encrypted form recipient must be a valid email address.');
    }
    return true;
  }

  function assertEncoding(formElement) {
    let enctype = formElement.getAttribute('data-enctype');
    if (!enctype) {
      return true; // empty is allowed, defaults to url
    }
    const whitelistedEnctype = ['json', 'url', 'html'];
    if (whitelistedEnctype.indexOf(enctype) === -1) {
      throw new Error('The requested encrypted form encoding type if is not supported.');
    }
    return true;
  }

  // main
  grunt.registerMultiTask('openpgp-form-validate', 'Generate a signed OpenPGP form tag (Experimental)', function() {

    // Iterate over all specified file groups.
    const tasks = [];
    let fail = false;

    this.files.forEach(file => {
      const filepath = file.src[0];
      if (!grunt.file.exists(filepath)) {
        grunt.log.warn(`Form file "${filepath}" not found.`);
        return false;
      }
      const html = grunt.file.read(filepath);
      const form = getCleanFormElement(html);
      let errors = [];

      // Run all the checks before exiting
      // to display maximum amount of info on screen
      try {
        assertAction(form);
      } catch (error) {
        errors.push(error);
      }
      try {
        assertRecipient(form);
      } catch (error) {
        errors.push(error);
      }
      try {
        assertEncoding(form);
      } catch (error) {
        errors.push(error);
      }

      if(errors.length) {
        fail = true;
        grunt.log.error(`Form file "${filepath}" contains errors:`);
        errors.forEach((error, i) => {
          grunt.log.error(`${i+1}. ${error.message} `);
        });
      }
    });

    if(fail) {
      grunt.fail.warn('Fix errors to continue.');
    }
  });
};
