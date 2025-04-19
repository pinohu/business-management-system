import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

export const sanitizer = {
  sanitizeInput(input, options = {}) {
    if (typeof input !== 'string') {
      return input;
    }

    const defaultOptions = {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      SANITIZE_DOM: true,
      WHOLE_DOCUMENT: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_DOM: false,
    };

    return purify.sanitize(input, { ...defaultOptions, ...options });
  },

  sanitizeHTML(html, options = {}) {
    if (typeof html !== 'string') {
      return html;
    }

    const defaultOptions = {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: ['href', 'target'],
      SANITIZE_DOM: true,
      WHOLE_DOCUMENT: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_DOM: false,
    };

    return purify.sanitize(html, { ...defaultOptions, ...options });
  },

  sanitizeObject(obj, options = {}) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item, options));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeInput(value, options);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value, options);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  },

  sanitizeFormData(formData, options = {}) {
    const sanitized = {};
    for (const [key, value] of formData.entries()) {
      sanitized[key] = this.sanitizeInput(value, options);
    }
    return sanitized;
  },
}; 