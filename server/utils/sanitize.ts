export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return sanitizeHtml(input);
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }

  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }

  return input;
}

export function stripHtml(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input.replace(/<[^>]*>/g, '');
}

export function normalizeWhitespace(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input.replace(/\s+/g, ' ').trim();
}

export function sanitizeForDatabase(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return normalizeWhitespace(stripHtml(input));
}