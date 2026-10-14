import sanitizeHtml from 'sanitize-html';

const SANITIZE_OPTIONS = {
  allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre', 'blockquote'],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
  },
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' }),
  },
};

/**
 * Deep sanitization of string fields to eliminate XSS vectors
 */
function sanitizeValue(value) {
  if (typeof value === 'string') {
    return sanitizeHtml(value.trim(), SANITIZE_OPTIONS);
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === 'object') {
    const cleaned = {};
    for (const [key, val] of Object.entries(value)) {
      // Prevent NoSQL injection ($gt, $ne, $where, etc.)
      if (!key.startsWith('$')) {
        cleaned[key] = sanitizeValue(val);
      }
    }
    return cleaned;
  }
  return value;
}

export function sanitizeInputs(req, res, next) {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }
  next();
}
