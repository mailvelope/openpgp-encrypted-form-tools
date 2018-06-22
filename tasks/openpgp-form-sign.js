/**
 * Copyright (C) 2018 Mailvelope GmbH
 * Licensed under the GNU Affero General Public License version 3
 */
const clean = require('./lib/clean');
const crypto = require('./lib/crypto');
const format = require('./lib/format');

module.exports = function(grunt) {
  grunt.registerMultiTask('openpgp-form-sign', 'Generate a signed OpenPGP form tag (Experimental)', async function() {
    const done = this.async();
    const tasks = [];
    const options = this.options();
    try {
      options.privateKey = await crypto.getPrivateKey(options, grunt);
    } catch (error) {
      grunt.log.error(error.message);
      return false;
    }
    this.files.forEach(file => {
      const filepath = file.src[0];
      if (!grunt.file.exists(filepath)) {
        grunt.log.warn(`Form file "${filepath}" not found.`);
        return false;
      }
      const cleanHtml = clean.getCleanFormHtml(grunt.file.read(filepath));
      const asyncTask = crypto.signMessage(cleanHtml, options)
      .then(signature => {
        let cleartext = format.getEncryptedFormTag(signature, cleanHtml);
        cleartext = format.getHtmlDocument(cleartext, options);
        grunt.file.write(file.dest, cleartext);
        grunt.log.writeln(`File "${file.dest}" created.`);
      })
      .catch(error => {
        grunt.log.error(`File "${file.dest}" not created.`);
        grunt.log.error(error.message);
      });
      tasks.push(asyncTask);
    });
    Promise.all(tasks).then(done);
  });
};
