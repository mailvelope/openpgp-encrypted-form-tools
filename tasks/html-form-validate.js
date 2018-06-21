/**
 * Copyright (C) 2018 Mailvelope GmbH
 * Licensed under the GNU Affero General Public License version 3
 */
const validate = require('./lib/validate');

module.exports = function(grunt) {

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
      const asyncTask = validate.W3C(html, this.options())
      .catch(error => {
        grunt.log.error(`${filepath} contains some errors`);
        grunt.log.error(error.message);
        grunt.fail.warn(new Error('Fix errors to continue.'));
      });
      tasks.push(asyncTask);
    });

    Promise.all(tasks).then(this.async());
  });
};
