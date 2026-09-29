import { HttpMethod } from '../../types';

export interface CodeGenInput {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  rawBody?: string;
  contentType?: string;
}

const SKIP_HEADERS = new Set([
  'host',
  'connection',
  'content-length',
  'accept-encoding',
  'x-forwarded-for',
  'x-forwarded-proto',
  'x-forwarded-port',
  'x-real-ip',
  'cf-ray',
  'cf-visitor',
  'cf-connecting-ip',
  'cdn-loop',
]);

function cleanHeaders(headers: Record<string, string> = {}): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, val] of Object.entries(headers)) {
    if (!SKIP_HEADERS.has(key.toLowerCase())) {
      result[key] = val;
    }
  }
  return result;
}

export function generateCurl(input: CodeGenInput): string {
  const { method, url, rawBody } = input;
  const headers = cleanHeaders(input.headers);

  let cmd = `curl -X ${method} "${url}"`;

  for (const [key, val] of Object.entries(headers)) {
    cmd += ` \\\n  -H "${key}: ${val.replace(/"/g, '\\"')}"`;
  }

  if (rawBody && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    // Escape single quotes for bash
    const escapedBody = rawBody.replace(/'/g, `'\\''`);
    cmd += ` \\\n  --data '${escapedBody}'`;
  }

  return cmd;
}

export function generateFetch(input: CodeGenInput): string {
  const { method, url, rawBody } = input;
  const headers = cleanHeaders(input.headers);

  const options: any = {
    method,
  };

  if (Object.keys(headers).length > 0) {
    options.headers = headers;
  }

  if (rawBody && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    options.body = rawBody;
  }

  return `const response = await fetch("${url}", {
  method: "${method}",
  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, '\n  ')}${rawBody && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) ? `,\n  body: ${JSON.stringify(rawBody)}` : ''}
});

const data = await response.text();
console.log(response.status, data);`;
}

export function generateAxios(input: CodeGenInput): string {
  const { method, url, rawBody } = input;
  const headers = cleanHeaders(input.headers);

  const hasBody = rawBody && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  let parsedJsonBody: any = null;
  let isJson = false;

  if (hasBody) {
    try {
      parsedJsonBody = JSON.parse(rawBody);
      isJson = true;
    } catch {
      isJson = false;
    }
  }

  const m = method.toLowerCase();

  if (hasBody) {
    const bodyStr = isJson ? JSON.stringify(parsedJsonBody, null, 2) : JSON.stringify(rawBody);
    return `import axios from 'axios';

const response = await axios.${m}("${url}", ${bodyStr}, {
  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, '\n  ')}
});

console.log(response.status, response.data);`;
  }

  return `import axios from 'axios';

const response = await axios.${m}("${url}", {
  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, '\n  ')}
});

console.log(response.status, response.data);`;
}

export function generateNodeHttp(input: CodeGenInput): string {
  const { method, url, rawBody } = input;
  const headers = cleanHeaders(input.headers);

  return `// Native Node.js (Node 18+)
const res = await fetch("${url}", {
  method: "${method}",
  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, '\n  ')}${rawBody && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) ? `,\n  body: ${JSON.stringify(rawBody)}` : ''}
});

console.log(res.status, await res.text());`;
}

export function generatePythonRequests(input: CodeGenInput): string {
  const { method, url, rawBody } = input;
  const headers = cleanHeaders(input.headers);

  let py = `import requests\n\n`;
  py += `url = "${url}"\n`;

  if (Object.keys(headers).length > 0) {
    py += `headers = ${JSON.stringify(headers, null, 4)}\n`;
  } else {
    py += `headers = {}\n`;
  }

  const hasBody = rawBody && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  if (hasBody) {
    try {
      const parsed = JSON.parse(rawBody);
      py += `payload = ${JSON.stringify(parsed, null, 4)}\n\n`;
      py += `response = requests.${method.toLowerCase()}(url, headers=headers, json=payload)\n`;
    } catch {
      py += `data = ${JSON.stringify(rawBody)}\n\n`;
      py += `response = requests.${method.toLowerCase()}(url, headers=headers, data=data)\n`;
    }
  } else {
    py += `\nresponse = requests.${method.toLowerCase()}(url, headers=headers)\n`;
  }

  py += `print(response.status_code, response.text)\n`;
  return py;
}

export type CodeLanguage = 'curl' | 'fetch' | 'axios' | 'node' | 'python';

export function generateCodeForLanguage(lang: CodeLanguage, input: CodeGenInput): string {
  switch (lang) {
    case 'curl':
      return generateCurl(input);
    case 'fetch':
      return generateFetch(input);
    case 'axios':
      return generateAxios(input);
    case 'node':
      return generateNodeHttp(input);
    case 'python':
      return generatePythonRequests(input);
    default:
      return generateCurl(input);
  }
}
