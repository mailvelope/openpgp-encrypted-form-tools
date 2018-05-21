# grunt-openpgp-forms

This is an experimental command line utility to generate encrypted form tags.

## Getting Started
This plugin requires Grunt `1.0.2`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-openpgp-forms --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-openpgp-forms');
```

## The "openpgp_forms" task

### Overview
In your project's Gruntfile, add a section named `openpgp_forms` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  'openpgp-form': {
    test: {
      expand: true,
      cwd: 'tests/tmp/min',
      src: ['*.html'],
      dest: 'tests/tmp',
      options: {
        secretKey: 'tests/fixtures/keys/0C3C3F1B.sec.asc'
      }
    }
  }
});
```

Check the project Gruntfile for a complete build example.

### Options

#### options.secretKey
Type: `String`
Default value: 'tests/fixtures/keys/0C3C3F1B.sec.asc'

A file path where the key for signing is located.

#### options.passphrase
Type: `String`
Default value: null

A the key passphrase to sign.

## Contributing
Lint and test your code using `grunt lint`.
