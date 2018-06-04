/**
 * Copyright (C) 2018 Mailvelope GmbH
 * Licensed under the GNU Affero General Public License version 3
 */
module.exports = function(grunt) {
  // Target for watch and linting
  const target = [
    '*.js',
    'config/*.js',
    'tasks/**/*.js',
  ];

  const path = {
    'formSuccess': 'tests/fixtures/forms/success',
    'formErrors': 'tests/fixtures/forms/errors',
  };

  // Project configuration.
  grunt.initConfig({

    clean: {
      build: {
        src: ['tests/tmp']
      },
      min: {
        src: ['tests/tmp/min']
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
      test: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: [{
          expand: true,
          cwd: path.formSuccess,
          src: ['*.html'],
          dest: 'tests/tmp/min',
        }]
      },
    },

    'html-form-validate': {
      'test-success': {
        expand: true,
        cwd: path.formSuccess,
        src: ['*.html']
      },
      'test-error': {
        expand: true,
        cwd: path.formErrors,
        src: ['*.html']
      }
    },

    'openpgp-form-validate': {
      'test-success': {
        expand: true,
        cwd: path.formSuccess,
        src: ['*.html']
      },
      'test-error': {
        expand: true,
        cwd: path.formErrors,
        src: ['*.html']
      }
    },

    'openpgp-form-sign': {
      test: {
        expand: true,
        cwd: 'tests/tmp/min',
        src: ['*.html'],
        dest: 'tests/tmp',
        options: {
          secretKey: 'tests/fixtures/keys/0C3C3F1B.sec.asc'
        }
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

  // By default, lint and run all tests.
  grunt.registerTask('default', ['clean', 'html-form-validate', 'openpgp-form-validate', 'htmlmin', 'openpgp-form-sign', 'clean:min']);
  grunt.registerTask('validate', ['html-form-validate', 'openpgp-form-validate']);
  grunt.registerTask('lint', ['eslint']);
};
