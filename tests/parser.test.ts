import { describe, it, expect } from 'vitest';
import {
  detectContentFormat,
  parseFormUrlEncoded,
  parseWebhookPayload,
  formatXmlSafely,
} from '../src/engine/parser/requestParser';

describe('Request Parser', () => {
  it('detects json, xml, form, and text formats correctly', () => {
    expect(detectContentFormat('application/json', '{"a":1}')).toBe('json');
    expect(detectContentFormat('application/cloudevents+json', '{"a":1}')).toBe('json');
    expect(detectContentFormat('application/xml', '<root><id>1</id></root>')).toBe('xml');
    expect(detectContentFormat('application/x-www-form-urlencoded', 'foo=bar&baz=1')).toBe('form');
    expect(detectContentFormat('text/plain', 'hello world')).toBe('text');
    expect(detectContentFormat('', '')).toBe('empty');
  });

  it('parses valid JSON payloads safely', () => {
    const raw = '{"order_id": 12345, "status": "paid"}';
    const result = parseWebhookPayload(raw, 'application/json');

    expect(result.contentFormat).toBe('json');
    expect(result.parsedBody).toEqual({ order_id: 12345, status: 'paid' });
    expect(result.bodyError).toBeUndefined();
    expect(result.formattedView).toContain('"order_id": 12345');
  });

  it('handles malformed JSON payloads gracefully without crashing', () => {
    const raw = '{"order_id": 12345, status: broken';
    const result = parseWebhookPayload(raw, 'application/json');

    expect(result.contentFormat).toBe('json');
    expect(result.parsedBody).toBeNull();
    expect(result.bodyError).toBe('Unable to parse this payload as JSON.');
    expect(result.formattedView).toBe(raw);
  });

  it('parses form-urlencoded payloads into key-value pairs', () => {
    const raw = 'user=alice&role=admin&item=1&item=2';
    const parsed = parseFormUrlEncoded(raw);

    expect(parsed.user).toBe('alice');
    expect(parsed.role).toBe('admin');
    expect(parsed.item).toEqual(['1', '2']);
  });

  it('formats XML safely without expanding external entities', () => {
    const raw = '<root><child attr="val">text</child></root>';
    const formatted = formatXmlSafely(raw);

    expect(formatted).toContain('<root>');
    expect(formatted).toContain('  <child attr="val">');
    expect(formatted).toContain('</root>');
  });
});
