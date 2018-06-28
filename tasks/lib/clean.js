const {JSDOM} = require('jsdom');
const createDOMPurify = require('dompurify');
const clean = {};
const dom = new JSDOM('');
const dompurify = createDOMPurify(dom.window);

/**
 * Remove all non whitelisted tags and properties from html text
 *
 * @param dirtyHtml
 * @returns {*}
 */
clean.getCleanFormHtml = function(dirtyHtml) {
  return dompurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: [
      'bdi', 'bdo', 'br', 'datalist', 'div', 'fieldset', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'i', 'input',
      'label', 'legend', 'optgroup', 'option', 'p', 'select', 'small', 'span', 'strong', 'textarea'
    ],
    ALLOWED_ATTR: [
      // default html attributes
      'accesskey', 'class', 'dir', 'hidden', 'id', 'lang', 'tabindex', 'title', 'name', 'alt',
      'checked', 'dirname', 'disabled', 'for', 'required', 'list', 'max', 'maxlength', 'min', 'multiple',
      'name', 'pattern', 'placeholder', 'readonly', 'required', 'size', 'step', 'type', 'value',
      // custom data attributes
      'data-action', 'data-recipient'
    ],
    SAFE_FOR_TEMPLATES: false,
    SAFE_FOR_JQUERY: false
  });
};

/**
 * Sanitize a html form data results for display
 *
 * @param dirtyHtml
 * @returns {*}
 */
clean.getCleanHtmlForDisplay = function(dirtyHtml) {
  return dompurify.sanitize(dirtyHtml, {
    ALLOWED_URI_REGEXP: /^data:(text|image).*/i
  });
};

/**
 * Get a clean form element from dubious html string
 * @param dirtyHtml
 * @returns {HTMLFormElement}
 */
clean.getCleanFormElement = function(dirtyHtml) {
  const html = dompurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: ['form'],
    ALLOWED_ATTR: ['data-action', 'data-recipient', 'data-enctype']
  });

  // Replace DOMParser approach of mailvelope as it's not available in JSDOM
  const htmlElement = dom.window.document.createElement('div');
  htmlElement.innerHTML = html.trim();
  const formElementCollection = htmlElement.getElementsByTagName('form');

  if (!formElementCollection.length) {
    throw new Error('There should be one form tag in the form definition.');
  }
  if (formElementCollection.length > 1) {
    throw new Error('There should be only one form tag in the form definition.');
  }
  return formElementCollection[0];
};

module.exports = clean;
