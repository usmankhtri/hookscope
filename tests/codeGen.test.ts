import { describe, it, expect } from 'vitest';
import {
  generateCurl,
  generateFetch,
  generateAxios,
  generatePythonRequests,
} from '../src/engine/codeGen/generators';

describe('Code Generators', () => {
  const input = {
    method: 'POST' as const,
    url: 'https://api.example.com/webhooks',
    headers: {
      'content-type': 'application/json',
      'x-signature': 'sig_12345',
      'host': 'api.example.com', // should be excluded
    },
    rawBody: '{"hello":"world"}',
  };

  it('generates valid cURL commands with escaped bodies', () => {
    const curl = generateCurl(input);
    expect(curl).toContain('curl -X POST "https://api.example.com/webhooks"');
    expect(curl).toContain('-H "content-type: application/json"');
    expect(curl).toContain('-H "x-signature: sig_12345"');
    expect(curl).not.toContain('-H "host:');
    expect(curl).toContain("--data '{\"hello\":\"world\"}'");
  });

  it('generates JavaScript fetch code', () => {
    const code = generateFetch(input);
    expect(code).toContain('await fetch("https://api.example.com/webhooks"');
    expect(code).toContain('method: "POST"');
    expect(code).toContain('"x-signature": "sig_12345"');
  });

  it('generates Axios code', () => {
    const code = generateAxios(input);
    expect(code).toContain('import axios from \'axios\'');
    expect(code).toContain('await axios.post("https://api.example.com/webhooks"');
  });

  it('generates Python requests code', () => {
    const code = generatePythonRequests(input);
    expect(code).toContain('import requests');
    expect(code).toContain('requests.post(url, headers=headers');
  });
});
