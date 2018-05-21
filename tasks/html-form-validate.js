/**
 * Copyright (C) 2018 Mailvelope GmbH
 * Licensed under the GNU Affero General Public License version 3
 */
const w3cjs = require('w3cjs');

module.exports = function(grunt) {
  /**
   * W3C validate a given HTML snipped
   *
   * @param {string} html
   * @param {Object} options
   * @returns {Promise<any>}
   */
  function validateHtml(html, options) {
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
  }

  // main
  grunt.registerMultiTask('html-form-validate', 'Validate an html form (Experimental)', function() {
    // Iterate over all specified file groups.
    const tasks = [];
    this.files.forEach(file => {
      const filepath = file.src[0];
      if (!grunt.file.exists(filepath)) {
        grunt.log.warn(`Form file "${filepath}" not found.`);
        return false;
      }
      const html = grunt.file.read(filepath);
      const asyncTask = validateHtml(html, this.options())
      .catch(error => {
        grunt.log.error(`HTML validation for form in file "${file.dest}".`);
        grunt.log.error(error.message);
        grunt.fail.warn(new Error('Fix errors to continue.'));
      });
      tasks.push(asyncTask);
    });

    Promise.all(tasks).then(this.async());
  });
};
