/**
 * Copyright (C) 2018 Mailvelope GmbH
 * Licensed under the GNU Affero General Public License version 3
 */
module.exports = function(grunt) {
  const seckey = grunt.option('seckey');
  const destination = grunt.option('destination') || 'tests/tmp';
  const document = grunt.option('document') || false;
  const origin = grunt.option('origin') || 'tests/fixtures/forms/errors';
  const passphrase = grunt.option('passphrase');
  const clean = grunt.option('clean');

  // Target for watch and linting
  const target = [
    '*.js',
    'config/*.js',
    'tasks/**/*.js',
  ];

  // Project configuration.
  grunt.initConfig({
    clean: {
      build: {
        src: [destination]
      },
      min: {
        src: [`${destination}/min`]
      }
    },

    eslint: {
      options: {
        maxWarnings: 10,
        configFile: 'config/eslint.json',
        cache: true,
        reportUnusedDisableDirectives: true,
        fix: false
      },
      target
    },

    // Development configuration to be run (and then tested).
    htmlmin: {
      task: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: [{
          expand: true,
          cwd: origin,
          src: ['*.html'],
          dest: `${destination}/min`,
        }]
      },
    },

    'html-form-validate': {
      task: {
        expand: true,
        cwd: origin,
        src: ['*.html']
      }
    },

    'openpgp-form-validate': {
      task: {
        expand: true,
        cwd: origin,
        src: ['*.html']
      }
    },

    'openpgp-form-sign': {
      task: {
        expand: true,
        cwd: `${destination}/min`,
        src: ['*.html'],
        dest: destination,
        options: {seckey, passphrase, document}
      },
    },

    'openpgp-html-decrypt': {
      task: {
        expand: true,
        cwd: origin,
        src: ['*.gpg'],
        dest: destination,
        options: {seckey, passphrase}
      }
    },

    watch: {
      scripts: {
        files: target,
        tasks: ['default'],
        options: {
          spawn: false
        }
      }
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-clean');

  const buildTasks = ['html-form-validate', 'openpgp-form-validate', 'htmlmin', 'openpgp-form-sign', 'clean:min'];
  const decryptTasks = ['openpgp-html-decrypt'];
  if (clean) {
    buildTasks.unshift('clean');
    decryptTasks.unshift('clean');
  }
  grunt.registerTask('default', buildTasks);
  grunt.registerTask('build', buildTasks);
  grunt.registerTask('decrypt', decryptTasks);
  grunt.registerTask('validate', ['html-form-validate', 'openpgp-form-validate']);
  grunt.registerTask('lint', ['eslint']);
};
