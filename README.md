# openpgp-encrypted-form-tools

This is an experimental command line utility to generate encrypted form tags.


## Getting Started
This plugin requires Grunt `1.0.2`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install openpgp-encrypted-form-tools --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('openpgp-encrypted-form-tools');
```

## Overview
In the project Gruntfile you can find an example of configuration that you can adapt for your own project.

## The build task

This task allows you to create an <openpgp-encrypted-form> from a <form>.
You will need to specify a secret key to sign the form. You will need to indicate where the html form is located
and where you want the resulting file to be placed.

If you want to test the task you can run it as follow:
```
grunt build\
  --seckey=tests/fixtures/keys/0C3C3F1B.sec.asc\
  --origin=tests/fixtures/forms/success/\
  --destination=tests/tmp\
```

To tests HTML validation error you can try (with or without `--force` option):
```
grunt build\
  --seckey=tests/fixtures/keys/0C3C3F1B.sec.asc\
  --origin=tests/fixtures/forms/errors/\
  --destination=tests/tmp\
  --force
```

To tests password prompt you can try (with or without `--force` option):
```
grunt build\
  --seckey=tests/fixtures/keys/5D9B054F.sec.asc\
  --origin=tests/fixtures/forms/ada/\
  --destination=tests/tmp\
  --passphrase=ada@passbolt.com
```

### Build task options

#### options.seckey
Type: `String`
Default value: undefined

A file path where the key for signing is located.

#### options.passphrase
Type: `String`
Default value: undefined

A the passphrase to decrypt the signing key if needed.
If key is encrypted and passphrase is empty a password prompt will be shown.

#### options.origin
Type: `String`
Default value: 'tests/fixtures/forms/errors'

A directory where the origin html forms are located

#### options.destination
Type: `String`
Default value: 'test/tmp'

A directory where the minified and signed for will be placed.

#### options.document
Type: `Bool`
Default value: false

If you want to output a full HTML document or only the openpgp-encrypted-form tag.

#### options.clean
Type: `Bool`
Default value: false

Weather you want to delete the destination folder prior build.

## Contributing
Lint and test your code using `grunt lint`.

## The decrypt task

This task allows you to take the encrypted data collected via an <openpgp-encrypted-form> 
with the HTML enctype set, and decrypt and sanitize it in a way that will be safe to be
displayed in a browser.


If you want to test the task you can run it as follow:
```
grunt decrypt\
 --seckey=tests/fixtures/keys/0C3C3F1B.sec.asc\
 --pubkey=tests/fixtures/keys/5D9B054F.sec.asc\
 --origin=tests/fixtures/data\
 --destination=tests/tmp\
 --clean

```

### Build task options

#### options.seckey
Type: `String`
Default value: undefined

A file path where the key for signing is located.

#### options.pubkey
Type: `String`
Default value: undefined

A file path where the public key of the form data sender is located.
If no public key is provided signature check will be skipped.

#### options.passphrase
Type: `String`
Default value: undefined

A the passphrase to decrypt the signing key if needed.
If key is encrypted and passphrase is empty a password prompt will be shown.

#### options.origin
Type: `String`
Default value: 'tests/fixtures/forms/errors'

A directory where the origin html forms are located

#### options.destination
Type: `String`
Default value: 'test/tmp'

A directory where the minified and signed for will be placed.

#### options.clean
Type: `Bool`
Default value: false

Weather you want to delete the destination folder prior build.
