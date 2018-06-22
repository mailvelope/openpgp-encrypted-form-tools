/**
 * Copyright (C) 2018 Mailvelope GmbH
 * Licensed under the GNU Affero General Public License version 3
 */
const clean = require('./lib/clean');
const crypto = require('./lib/crypto');
const format = require('./lib/format');

module.exports = function(grunt) {
  grunt.registerMultiTask('openpgp-html-decrypt', 'Decrypt and sanitize an OpenPGP message containing HTML (Experimental)', async function() {
    const done = this.async();
    const tasks = [];
    let options = this.options();
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

      const armoredData = grunt.file.read(filepath);
      const asyncTask = crypto.decrypt(armoredData, options)
      .then(cleartext => {
        const cleanHtml = clean.getCleanHtmlForDisplay(cleartext.data);
        const document = format.getHtmlDocument(cleanHtml, {document: true, sandbox: true});
        const dest = `${this.data.dest}/${Date.now()}_${cleartext.filename}`;
        grunt.file.write(dest, document);
        grunt.log.writeln(`File "${dest}" created.`);
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
