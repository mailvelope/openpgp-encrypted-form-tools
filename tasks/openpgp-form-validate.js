/**
 * Copyright (C) 2018 Mailvelope GmbH
 * Licensed under the GNU Affero General Public License version 3
 */
const clean = require('./lib/clean');
const validate = require('./lib/validate');

module.exports = function(grunt) {

  // main
  grunt.registerMultiTask('openpgp-form-validate', 'Generate a signed OpenPGP form tag (Experimental)', function() {
    // Iterate over all specified file groups.
    let failed = false;

    this.files.forEach(file => {
      const filepath = file.src[0];
      if (!grunt.file.exists(filepath)) {
        grunt.log.warn(`Form file "${filepath}" not found.`);
        return false;
      }
      const html = grunt.file.read(filepath);
      const form = clean.getCleanFormElement(html);
      const errors = [];

      // Run all the checks before exiting
      // to display maximum amount of info on screen
      try {
        validate.assertAction(form);
      } catch (error) {
        errors.push(error);
      }
      try {
        validate.assertRecipient(form);
      } catch (error) {
        errors.push(error);
      }
      try {
        validate.assertEncoding(form);
      } catch (error) {
        errors.push(error);
      }

      if (errors.length) {
        failed = true;
        grunt.log.error(`Form file "${filepath}" contains errors:`);
        errors.forEach((error, i) => {
          grunt.log.error(`${i + 1}. ${error.message} `);
        });
      }
    });

    if (failed) {
      grunt.fail.warn('Fix errors to continue.');
    }
  });
};
