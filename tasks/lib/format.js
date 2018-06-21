const format = {};

/**
 * Format a html document
 *
 * @param {string} signature
 * @param {string} html
 * @returns {string} new tag
 */
format.getHtmlDocument = function(cleartext, options) {
  if (options.document) {
    if (options.sandbox) {
      cleartext = `<!DOCTYPE html>
<html lang="en">
  <head>
	  <meta charset="utf-8">
    <title>Mailvelope OpenPGP Encrypted Form Sandbox</title>
  </head>
  <body>
    <iframe srcdoc='${cleartext}'></iframe>
  </body>
</html>`;
    } else {
    cleartext = `<!DOCTYPE html>
<html lang="en">
  <head>
	  <meta charset="utf-8">
    <title>Mailvelope OpenPGP Encrypted Form</title>
  </head>
  <body>
		${cleartext}
  </body>
</html>`;
    }
  }
  console.log(cleartext);
  return cleartext;
};



/**
 * Format <openpgp-encrypted-form> tag
 *
 * @param {string} signature
 * @param {string} html
 * @returns {string} new tag
 */
format.getEncryptedFormTag = function(signature, html) {
  signature = signature.split('\n')
    .filter(line => !(line.startsWith('---') || line.startsWith('Version') || line.startsWith('Comment')))
    .join('').replace(/\r?\n|\r/g, '');
  const checksum = signature.substr(signature.length - 4);
  return `<openpgp-encrypted-form id="form-${checksum}" signature="${signature}"><script type="text/template">${html}</script></openpgp-encrypted-form>`;
};

module.exports = format;