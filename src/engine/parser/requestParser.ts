import { ContentFormat } from '../../types';

export interface ParsedRequestResult {
  contentFormat: ContentFormat;
  parsedBody: any;
  bodyError?: string;
  formattedView: string;
}

/**
 * Format XML string with indentation safely without executing or expanding external entities.
 */
export function formatXmlSafely(xml: string): string {
  try {
    let formatted = '';
    let indent = 0;
    const tab = '  ';

    // Normalize spacing around tags
    const cleanXml = xml.replace(/(>)(<)(\/*)/g, '$1\r\n$2$3');
    const lines = cleanXml.split('\r\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith('</')) {
        indent = Math.max(0, indent - 1);
      }

      formatted += tab.repeat(indent) + trimmed + '\n';

      if (
        trimmed.startsWith('<') &&
        !trimmed.startsWith('</') &&
        !trimmed.endsWith('/>') &&
        !trimmed.startsWith('<?') &&
        !trimmed.startsWith('<!') &&
        !trimmed.includes('</')
      ) {
        indent++;
      }
    }

    return formatted.trim() || xml;
  } catch {
    return xml;
  }
}

/**
 * Safely parse query strings or form urlencoded strings.
 */
export function parseFormUrlEncoded(raw: string): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};
  if (!raw || typeof raw !== 'string') return result;

  const pairs = raw.split('&');
  for (const pair of pairs) {
    if (!pair) continue;
    const eqIdx = pair.indexOf('=');
    let key = '';
    let val = '';
    if (eqIdx >= 0) {
      key = decodeURIComponent(pair.slice(0, eqIdx).replace(/\+/g, ' '));
      val = decodeURIComponent(pair.slice(eqIdx + 1).replace(/\+/g, ' '));
    } else {
      key = decodeURIComponent(pair.replace(/\+/g, ' '));
      val = '';
    }

    if (key in result) {
      const current = result[key];
      if (Array.isArray(current)) {
        current.push(val);
      } else {
        result[key] = [current, val];
      }
    } else {
      result[key] = val;
    }
  }
  return result;
}

/**
 * Detect content format from content-type header or raw string sniffing.
 */
export function detectContentFormat(contentType: string = '', rawBody: string = ''): ContentFormat {
  const ct = contentType.toLowerCase().trim();

  if (!rawBody || rawBody.trim() === '') {
    return 'empty';
  }

  if (ct.includes('application/json') || ct.includes('+json')) {
    return 'json';
  }

  if (ct.includes('application/xml') || ct.includes('text/xml') || ct.includes('+xml')) {
    return 'xml';
  }

  if (ct.includes('application/x-www-form-urlencoded')) {
    return 'form';
  }

  if (ct.includes('text/plain') || ct.includes('text/csv')) {
    return 'text';
  }

  // Sniff content if content-type is missing or generic
  const trimmed = rawBody.trim();
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    return 'json';
  }

  if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
    return 'xml';
  }

  if (trimmed.includes('=') && !trimmed.includes('\n') && !trimmed.includes('{')) {
    return 'form';
  }

  return 'text';
}

/**
 * Parse incoming webhook payload according to detected format.
 */
export function parseWebhookPayload(rawBody: string = '', contentType: string = ''): ParsedRequestResult {
  const format = detectContentFormat(contentType, rawBody);

  if (format === 'empty') {
    return {
      contentFormat: 'empty',
      parsedBody: null,
      formattedView: '',
    };
  }

  if (format === 'json') {
    try {
      const parsed = JSON.parse(rawBody);
      return {
        contentFormat: 'json',
        parsedBody: parsed,
        formattedView: JSON.stringify(parsed, null, 2),
      };
    } catch (err: any) {
      return {
        contentFormat: 'json',
        parsedBody: null,
        bodyError: 'Unable to parse this payload as JSON.',
        formattedView: rawBody,
      };
    }
  }

  if (format === 'xml') {
    return {
      contentFormat: 'xml',
      parsedBody: null,
      formattedView: formatXmlSafely(rawBody),
    };
  }

  if (format === 'form') {
    try {
      const parsed = parseFormUrlEncoded(rawBody);
      return {
        contentFormat: 'form',
        parsedBody: parsed,
        formattedView: JSON.stringify(parsed, null, 2),
      };
    } catch {
      return {
        contentFormat: 'form',
        parsedBody: null,
        bodyError: 'Unable to parse form-urlencoded payload.',
        formattedView: rawBody,
      };
    }
  }

  // Plain text
  return {
    contentFormat: 'text',
    parsedBody: rawBody,
    formattedView: rawBody,
  };
}
