var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/server/createApp.ts
import express from "express";

// src/engine/storage/memoryAdapter.ts
var MAX_EVENTS_PER_ENDPOINT = 100;
var MAX_BODY_SIZE_BYTES = 512 * 1024;
var DEFAULT_RETENTION_HOURS = 24;
var MemoryStorageAdapter = class {
  constructor() {
    this.name = "MemoryStorageAdapter";
    this.endpoints = /* @__PURE__ */ new Map();
    this.events = /* @__PURE__ */ new Map();
    this.sessionEndpoints = /* @__PURE__ */ new Map();
  }
  isConfigured() {
    return true;
  }
  getStatus() {
    return {
      configured: true,
      type: "memory",
      message: "In-memory ephemeral storage active. This mode is suitable for local development only and is NOT persistent across serverless invocations.",
      isDurable: false,
      retentionHours: DEFAULT_RETENTION_HOURS,
      maxEventsPerEndpoint: MAX_EVENTS_PER_ENDPOINT,
      maxBodySizeBytes: MAX_BODY_SIZE_BYTES
    };
  }
  async createEndpoint(endpoint, sessionId) {
    this.endpoints.set(endpoint.token, { ...endpoint });
    if (!this.events.has(endpoint.token)) {
      this.events.set(endpoint.token, []);
    }
    if (sessionId) {
      let set = this.sessionEndpoints.get(sessionId);
      if (!set) {
        set = /* @__PURE__ */ new Set();
        this.sessionEndpoints.set(sessionId, set);
      }
      set.add(endpoint.token);
    }
    return endpoint;
  }
  async getEndpoint(token) {
    const ep = this.endpoints.get(token);
    return ep ? { ...ep } : null;
  }
  async updateEndpoint(token, updates) {
    const existing = this.endpoints.get(token);
    if (!existing) return null;
    const updated = { ...existing, ...updates, token: existing.token, id: existing.id };
    this.endpoints.set(token, updated);
    return { ...updated };
  }
  async deleteEndpoint(token, sessionId) {
    const deleted = this.endpoints.delete(token);
    this.events.delete(token);
    if (sessionId) {
      this.sessionEndpoints.get(sessionId)?.delete(token);
    }
    for (const set of this.sessionEndpoints.values()) {
      set.delete(token);
    }
    return deleted;
  }
  async listEndpoints(sessionId) {
    if (sessionId) {
      const set = this.sessionEndpoints.get(sessionId);
      if (!set || set.size === 0) return [];
      const list = [];
      for (const token of set) {
        const ep = this.endpoints.get(token);
        if (ep) list.push({ ...ep });
      }
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return [];
  }
  async attachToSession(token, sessionId) {
    if (!sessionId) return;
    if (this.endpoints.has(token)) {
      let set = this.sessionEndpoints.get(sessionId);
      if (!set) {
        set = /* @__PURE__ */ new Set();
        this.sessionEndpoints.set(sessionId, set);
      }
      set.add(token);
    }
  }
  async saveEvent(event) {
    let list = this.events.get(event.endpointToken);
    if (!list) {
      list = [];
      this.events.set(event.endpointToken, list);
    }
    list.unshift({ ...event });
    if (list.length > MAX_EVENTS_PER_ENDPOINT) {
      list.length = MAX_EVENTS_PER_ENDPOINT;
    }
  }
  async getEvents(token, options) {
    const list = this.events.get(token) || [];
    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;
    const paged = list.slice(offset, offset + limit).map((e) => ({ ...e }));
    return {
      events: paged,
      total: list.length
    };
  }
  async getEvent(token, eventId) {
    const list = this.events.get(token) || [];
    const found = list.find((e) => e.id === eventId);
    return found ? { ...found } : null;
  }
  async deleteEvent(token, eventId) {
    const list = this.events.get(token);
    if (!list) return false;
    const initialLen = list.length;
    const filtered = list.filter((e) => e.id !== eventId);
    this.events.set(token, filtered);
    return filtered.length < initialLen;
  }
  async clearEvents(token) {
    if (this.events.has(token)) {
      this.events.set(token, []);
      return true;
    }
    return false;
  }
};

// src/engine/storage/redisAdapter.ts
import { Redis } from "@upstash/redis";
var MAX_EVENTS_PER_ENDPOINT2 = 100;
var MAX_BODY_SIZE_BYTES2 = 512 * 1024;
var DEFAULT_RETENTION_HOURS2 = 24;
var RedisStorageAdapter = class {
  constructor() {
    this.name = "RedisStorageAdapter";
    this.client = null;
    this.configured = false;
    this.connectionError = null;
    this.init();
  }
  init() {
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_REST_URL || process.env.REDIS_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_REST_TOKEN || process.env.REDIS_TOKEN;
    if (url && token) {
      try {
        this.client = new Redis({
          url,
          token
        });
        this.configured = true;
      } catch (err) {
        this.configured = false;
        this.connectionError = err?.message || "Failed to initialize Redis client";
      }
    } else {
      this.configured = false;
    }
  }
  isConfigured() {
    return this.configured && this.client !== null;
  }
  getStatus() {
    if (!this.isConfigured()) {
      return {
        configured: false,
        type: "unconfigured",
        message: "Live endpoint storage is not configured. Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (or REDIS_REST_URL and REDIS_REST_TOKEN) before using public persistent webhook endpoints on serverless platforms.",
        isDurable: false,
        retentionHours: DEFAULT_RETENTION_HOURS2,
        maxEventsPerEndpoint: MAX_EVENTS_PER_ENDPOINT2,
        maxBodySizeBytes: MAX_BODY_SIZE_BYTES2
      };
    }
    return {
      configured: true,
      type: "upstash",
      message: "Redis-compatible serverless persistent storage active. Durable across serverless invocations.",
      isDurable: true,
      retentionHours: DEFAULT_RETENTION_HOURS2,
      maxEventsPerEndpoint: MAX_EVENTS_PER_ENDPOINT2,
      maxBodySizeBytes: MAX_BODY_SIZE_BYTES2
    };
  }
  epKey(token) {
    return `hooklab:ep:${token}`;
  }
  eventsListKey(token) {
    return `hooklab:events:${token}`;
  }
  eventKey(token, eventId) {
    return `hooklab:ev:${token}:${eventId}`;
  }
  sessionKey(sessionId) {
    return `hooklab:sess:${sessionId}:endpoints`;
  }
  async createEndpoint(endpoint, sessionId) {
    if (!this.client) throw new Error("Storage not configured");
    const ttlSeconds = (endpoint.retentionHours || DEFAULT_RETENTION_HOURS2) * 3600;
    await this.client.set(this.epKey(endpoint.token), JSON.stringify(endpoint), {
      ex: ttlSeconds
    });
    await this.client.sadd("hooklab:endpoints", endpoint.token);
    if (sessionId) {
      await this.client.sadd(this.sessionKey(sessionId), endpoint.token);
      await this.client.expire(this.sessionKey(sessionId), 30 * 86400);
    }
    return endpoint;
  }
  async getEndpoint(token) {
    if (!this.client) return null;
    const data = await this.client.get(this.epKey(token));
    if (!data) return null;
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    }
    return data;
  }
  async updateEndpoint(token, updates) {
    if (!this.client) return null;
    const existing = await this.getEndpoint(token);
    if (!existing) return null;
    const updated = {
      ...existing,
      ...updates,
      token: existing.token,
      id: existing.id
    };
    const ttlSeconds = (updated.retentionHours || DEFAULT_RETENTION_HOURS2) * 3600;
    await this.client.set(this.epKey(token), JSON.stringify(updated), {
      ex: ttlSeconds
    });
    return updated;
  }
  async deleteEndpoint(token, sessionId) {
    if (!this.client) return false;
    await this.clearEvents(token);
    await this.client.del(this.epKey(token));
    await this.client.srem("hooklab:endpoints", token);
    if (sessionId) {
      await this.client.srem(this.sessionKey(sessionId), token);
    }
    return true;
  }
  async listEndpoints(sessionId) {
    if (!this.client) return [];
    let tokens = [];
    if (sessionId) {
      tokens = await this.client.smembers(this.sessionKey(sessionId)) || [];
    } else {
      return [];
    }
    if (!tokens || tokens.length === 0) return [];
    const endpoints = [];
    for (const token of tokens) {
      const ep = await this.getEndpoint(token);
      if (ep) {
        endpoints.push(ep);
      } else {
        if (sessionId) {
          await this.client.srem(this.sessionKey(sessionId), token);
        }
        await this.client.srem("hooklab:endpoints", token);
      }
    }
    return endpoints.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async attachToSession(token, sessionId) {
    if (!this.client || !sessionId) return;
    const ep = await this.getEndpoint(token);
    if (ep) {
      await this.client.sadd(this.sessionKey(sessionId), token);
      await this.client.expire(this.sessionKey(sessionId), 30 * 86400);
    }
  }
  async saveEvent(event) {
    if (!this.client) throw new Error("Storage not configured");
    const token = event.endpointToken;
    const ep = await this.getEndpoint(token);
    const retentionHours = ep?.retentionHours || DEFAULT_RETENTION_HOURS2;
    const ttlSeconds = retentionHours * 3600;
    await this.client.set(this.eventKey(token, event.id), JSON.stringify(event), {
      ex: ttlSeconds
    });
    const listKey = this.eventsListKey(token);
    await this.client.lpush(listKey, event.id);
    await this.client.ltrim(listKey, 0, MAX_EVENTS_PER_ENDPOINT2 - 1);
    await this.client.expire(listKey, ttlSeconds);
  }
  async getEvents(token, options) {
    if (!this.client) return { events: [], total: 0 };
    const listKey = this.eventsListKey(token);
    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;
    const total = await this.client.llen(listKey);
    if (total === 0) return { events: [], total: 0 };
    const eventIds = await this.client.lrange(listKey, offset, offset + limit - 1);
    if (!eventIds || eventIds.length === 0) return { events: [], total };
    const events = [];
    for (const eventId of eventIds) {
      const raw = await this.client.get(this.eventKey(token, eventId));
      if (raw) {
        if (typeof raw === "string") {
          try {
            events.push(JSON.parse(raw));
          } catch {
          }
        } else {
          events.push(raw);
        }
      }
    }
    return { events, total };
  }
  async getEvent(token, eventId) {
    if (!this.client) return null;
    const raw = await this.client.get(this.eventKey(token, eventId));
    if (!raw) return null;
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return raw;
  }
  async deleteEvent(token, eventId) {
    if (!this.client) return false;
    await this.client.del(this.eventKey(token, eventId));
    await this.client.lrem(this.eventsListKey(token), 0, eventId);
    return true;
  }
  async clearEvents(token) {
    if (!this.client) return false;
    const listKey = this.eventsListKey(token);
    const eventIds = await this.client.lrange(listKey, 0, -1);
    if (eventIds && eventIds.length > 0) {
      for (const id of eventIds) {
        await this.client.del(this.eventKey(token, id));
      }
    }
    await this.client.del(listKey);
    return true;
  }
};

// src/engine/storage/storageManager.ts
var UnconfiguredStorageAdapter = class {
  constructor() {
    this.name = "UnconfiguredStorageAdapter";
  }
  isConfigured() {
    return false;
  }
  getStatus() {
    return {
      configured: false,
      type: "unconfigured",
      message: "Live endpoint storage is not configured. Configure the required server-side storage environment variables (UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN) before using public persistent webhook endpoints.",
      isDurable: false,
      retentionHours: 24,
      maxEventsPerEndpoint: 100,
      maxBodySizeBytes: 512 * 1024
    };
  }
  async createEndpoint() {
    throw new Error("Live endpoint storage is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.");
  }
  async getEndpoint() {
    return null;
  }
  async updateEndpoint() {
    throw new Error("Storage not configured");
  }
  async deleteEndpoint() {
    return false;
  }
  async listEndpoints() {
    return [];
  }
  async saveEvent() {
    throw new Error("Live endpoint storage is not configured. Incoming webhooks cannot be stored.");
  }
  async getEvents() {
    return { events: [], total: 0 };
  }
  async getEvent() {
    return null;
  }
  async deleteEvent() {
    return false;
  }
  async clearEvents() {
    return false;
  }
};
var StorageManager = class _StorageManager {
  static {
    this.instance = null;
  }
  static getAdapter() {
    if (!_StorageManager.instance) {
      if (process.env.NODE_ENV === "test") {
        _StorageManager.instance = new MemoryStorageAdapter();
      } else {
        const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_REST_URL || process.env.REDIS_URL;
        const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_REST_TOKEN || process.env.REDIS_TOKEN;
        if (redisUrl && redisToken) {
          _StorageManager.instance = new RedisStorageAdapter();
        } else if (process.env.ALLOW_EPHEMERAL_DEV_STORAGE === "true" || process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
          _StorageManager.instance = new MemoryStorageAdapter();
        } else {
          _StorageManager.instance = new UnconfiguredStorageAdapter();
        }
      }
    }
    return _StorageManager.instance;
  }
  static setAdapterForTesting(adapter) {
    _StorageManager.instance = adapter;
  }
};

// src/engine/security/tokenGenerator.ts
var ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
function generateEndpointToken(length = 14) {
  let randomValues;
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
  } else {
    try {
      const nodeCrypto = __require("crypto");
      randomValues = new Uint8Array(nodeCrypto.randomBytes(length));
    } catch {
      randomValues = new Uint8Array(length);
      for (let i = 0; i < length; i++) {
        randomValues[i] = Math.floor(Math.random() * 256);
      }
    }
  }
  let result = "";
  for (let i = 0; i < length; i++) {
    result += ALPHABET[randomValues[i] % ALPHABET.length];
  }
  return result;
}
function generateEventId() {
  let rand = "";
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    rand = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  } else {
    rand = Math.random().toString(16).substring(2, 10);
  }
  return `evt_${Date.now().toString(36)}_${rand}`;
}
function isValidEndpointToken(token) {
  if (!token || typeof token !== "string") return false;
  if (token.length < 6 || token.length > 32) return false;
  return /^[a-zA-Z0-9_-]+$/.test(token);
}

// src/engine/parser/requestParser.ts
function formatXmlSafely(xml) {
  try {
    let formatted = "";
    let indent = 0;
    const tab = "  ";
    const cleanXml = xml.replace(/(>)(<)(\/*)/g, "$1\r\n$2$3");
    const lines = cleanXml.split("\r\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith("</")) {
        indent = Math.max(0, indent - 1);
      }
      formatted += tab.repeat(indent) + trimmed + "\n";
      if (trimmed.startsWith("<") && !trimmed.startsWith("</") && !trimmed.endsWith("/>") && !trimmed.startsWith("<?") && !trimmed.startsWith("<!") && !trimmed.includes("</")) {
        indent++;
      }
    }
    return formatted.trim() || xml;
  } catch {
    return xml;
  }
}
function parseFormUrlEncoded(raw) {
  const result = {};
  if (!raw || typeof raw !== "string") return result;
  const pairs = raw.split("&");
  for (const pair of pairs) {
    if (!pair) continue;
    const eqIdx = pair.indexOf("=");
    let key = "";
    let val = "";
    if (eqIdx >= 0) {
      key = decodeURIComponent(pair.slice(0, eqIdx).replace(/\+/g, " "));
      val = decodeURIComponent(pair.slice(eqIdx + 1).replace(/\+/g, " "));
    } else {
      key = decodeURIComponent(pair.replace(/\+/g, " "));
      val = "";
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
function detectContentFormat(contentType = "", rawBody = "") {
  const ct = contentType.toLowerCase().trim();
  if (!rawBody || rawBody.trim() === "") {
    return "empty";
  }
  if (ct.includes("application/json") || ct.includes("+json")) {
    return "json";
  }
  if (ct.includes("application/xml") || ct.includes("text/xml") || ct.includes("+xml")) {
    return "xml";
  }
  if (ct.includes("application/x-www-form-urlencoded")) {
    return "form";
  }
  if (ct.includes("text/plain") || ct.includes("text/csv")) {
    return "text";
  }
  const trimmed = rawBody.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}") || trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return "json";
  }
  if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
    return "xml";
  }
  if (trimmed.includes("=") && !trimmed.includes("\n") && !trimmed.includes("{")) {
    return "form";
  }
  return "text";
}
function parseWebhookPayload(rawBody = "", contentType = "") {
  const format = detectContentFormat(contentType, rawBody);
  if (format === "empty") {
    return {
      contentFormat: "empty",
      parsedBody: null,
      formattedView: ""
    };
  }
  if (format === "json") {
    try {
      const parsed = JSON.parse(rawBody);
      return {
        contentFormat: "json",
        parsedBody: parsed,
        formattedView: JSON.stringify(parsed, null, 2)
      };
    } catch (err) {
      return {
        contentFormat: "json",
        parsedBody: null,
        bodyError: "Unable to parse this payload as JSON.",
        formattedView: rawBody
      };
    }
  }
  if (format === "xml") {
    return {
      contentFormat: "xml",
      parsedBody: null,
      formattedView: formatXmlSafely(rawBody)
    };
  }
  if (format === "form") {
    try {
      const parsed = parseFormUrlEncoded(rawBody);
      return {
        contentFormat: "form",
        parsedBody: parsed,
        formattedView: JSON.stringify(parsed, null, 2)
      };
    } catch {
      return {
        contentFormat: "form",
        parsedBody: null,
        bodyError: "Unable to parse form-urlencoded payload.",
        formattedView: rawBody
      };
    }
  }
  return {
    contentFormat: "text",
    parsedBody: rawBody,
    formattedView: rawBody
  };
}

// src/engine/security/ssrfGuard.ts
import net from "net";
function isPrivateIp(ip) {
  if (!net.isIP(ip)) {
    return false;
  }
  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map((p) => parseInt(p, 10));
    if (parts.length !== 4) return true;
    if (parts[0] === 0) return true;
    if (parts[0] === 10) return true;
    if (parts[0] === 127) return true;
    if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 0 && parts[2] === 0) return true;
    if (parts[0] === 192 && parts[1] === 0 && parts[2] === 2) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 198 && parts[1] === 51 && parts[2] === 100) return true;
    if (parts[0] === 203 && parts[1] === 0 && parts[2] === 113) return true;
    if (parts[0] >= 224 && parts[0] <= 239) return true;
    if (parts[0] >= 240) return true;
    return false;
  }
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower === "::1" || lower === "0000:0000:0000:0000:0000:0000:0000:0001") return true;
    if (lower === "::" || lower === "0000:0000:0000:0000:0000:0000:0000:0000") return true;
    if (lower.startsWith("::ffff:")) {
      const ipv4Part = lower.slice(7);
      if (net.isIPv4(ipv4Part)) {
        return isPrivateIp(ipv4Part);
      }
    }
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
    if (lower.startsWith("fe8") || lower.startsWith("fe9") || lower.startsWith("fea") || lower.startsWith("feb")) return true;
    return false;
  }
  return false;
}
var BLOCKED_HOSTNAMES = /* @__PURE__ */ new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "metadata.google.internal",
  "metadata.internal",
  "instance-data",
  "169.254.169.254"
]);
function validateReplayUrlSync(urlString) {
  if (!urlString || typeof urlString !== "string") {
    return { allowed: false, reason: "URL must be a non-empty string" };
  }
  let parsed;
  try {
    parsed = new URL(urlString.trim());
  } catch {
    return { allowed: false, reason: "Malformed URL provided" };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { allowed: false, reason: "Only HTTP and HTTPS protocols are allowed" };
  }
  const hostname = parsed.hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return { allowed: false, reason: `Access to hostname "${hostname}" is restricted (SSRF protection)` };
  }
  if (hostname.endsWith(".localhost") || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    return { allowed: false, reason: "Access to internal/local domains is restricted" };
  }
  if (isPrivateIp(hostname)) {
    return { allowed: false, reason: `Access to private IP address "${hostname}" is restricted` };
  }
  return { allowed: true, normalizedUrl: parsed.toString() };
}
async function validateReplayUrlWithDns(urlString) {
  const syncCheck = validateReplayUrlSync(urlString);
  if (!syncCheck.allowed) {
    return syncCheck;
  }
  const parsed = new URL(urlString.trim());
  const hostname = parsed.hostname;
  if (net.isIP(hostname)) {
    return syncCheck;
  }
  try {
    const dns = await import("dns");
    const records = await dns.promises.lookup(hostname, { all: true });
    for (const record of records) {
      if (isPrivateIp(record.address)) {
        return {
          allowed: false,
          reason: `Resolved IP ${record.address} for host ${hostname} is private/internal (SSRF blocked)`
        };
      }
    }
    return { allowed: true, normalizedUrl: parsed.toString() };
  } catch (err) {
    return { allowed: false, reason: `DNS resolution failed: ${err.message}` };
  }
}

// src/engine/security/rateLimiter.ts
var MemoryRateLimiter = class {
  // 120 requests per minute
  constructor(limit = 120, windowMs = 60 * 1e3) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.buckets = /* @__PURE__ */ new Map();
    this.defaultWindowMs = 60 * 1e3;
    // 1 minute
    this.defaultLimit = 120;
    this.limit = limit;
    this.windowMs = windowMs;
  }
  isRateLimited(key, customLimit) {
    const now = Date.now();
    const effectiveLimit = customLimit ?? this.limit;
    let bucket = this.buckets.get(key);
    if (!bucket || now >= bucket.resetAt) {
      bucket = {
        count: 1,
        resetAt: now + this.windowMs
      };
      this.buckets.set(key, bucket);
      return { limited: false, current: 1, limit: effectiveLimit, retryAfterSeconds: 0 };
    }
    bucket.count++;
    if (bucket.count > effectiveLimit) {
      const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1e3));
      return { limited: true, current: bucket.count, limit: effectiveLimit, retryAfterSeconds };
    }
    return { limited: false, current: bucket.count, limit: effectiveLimit, retryAfterSeconds: 0 };
  }
  cleanup() {
    const now = Date.now();
    for (const [key, bucket] of this.buckets.entries()) {
      if (now >= bucket.resetAt) {
        this.buckets.delete(key);
      }
    }
  }
};
var globalRateLimiter = new MemoryRateLimiter(
  parseInt(process.env.RATE_LIMIT_PER_MINUTE || "120", 10),
  60 * 1e3
);

// src/server/createApp.ts
var MAX_BODY_SIZE_BYTES3 = 512 * 1024;
var MAX_REPLAY_RESPONSE_SIZE = 256 * 1024;
function parseCookies(req) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return {};
  const cookies = {};
  for (const pair of cookieHeader.split(";")) {
    const idx = pair.indexOf("=");
    if (idx > 0) {
      const key = pair.slice(0, idx).trim();
      const val = pair.slice(idx + 1).trim();
      cookies[key] = decodeURIComponent(val);
    }
  }
  return cookies;
}
function getSessionId(req) {
  const fromHeader = req.headers["x-hookscope-session"] || req.headers["x-hooklab-session"];
  if (fromHeader && fromHeader.trim().length >= 8) {
    return fromHeader.trim();
  }
  const cookies = parseCookies(req);
  if (cookies.hs_session && cookies.hs_session.trim().length >= 8) {
    return cookies.hs_session.trim();
  }
  if (cookies.hl_session && cookies.hl_session.trim().length >= 8) {
    return cookies.hl_session.trim();
  }
  return void 0;
}
function generateSessionId() {
  return `sess_${generateEndpointToken(18)}`;
}
function createExpressApp() {
  const app2 = express();
  app2.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });
  app2.use("/h/:token", express.raw({ type: "*/*", limit: "1mb" }));
  app2.use("/api/h/:token", express.raw({ type: "*/*", limit: "1mb" }));
  app2.use("/api", express.json({ limit: "1mb" }));
  app2.use("/api", express.urlencoded({ extended: true, limit: "1mb" }));
  app2.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send("User-agent: *\nAllow: /\nAllow: /docs\nAllow: /security\nAllow: /privacy\nAllow: /about\nDisallow: /app/\nDisallow: /h/\nDisallow: /api/\n\nSitemap: https://hookscope-tools.vercel.app/sitemap.xml\n");
  });
  app2.get("/sitemap.xml", (_req, res) => {
    res.type("application/xml").send('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://hookscope-tools.vercel.app/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>\n  <url><loc>https://hookscope-tools.vercel.app/docs</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n  <url><loc>https://hookscope-tools.vercel.app/security</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>\n  <url><loc>https://hookscope-tools.vercel.app/privacy</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>\n  <url><loc>https://hookscope-tools.vercel.app/about</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>\n</urlset>');
  });
  app2.get("/api/status", (req, res) => {
    const storage = StorageManager.getAdapter();
    res.json({
      storage: storage.getStatus(),
      version: "1.0.0",
      nodeEnv: process.env.NODE_ENV || "development",
      limits: {
        maxBodySizeBytes: MAX_BODY_SIZE_BYTES3,
        rateLimitPerMin: 120,
        maxEventsPerEndpoint: 100,
        maxReplayResponseSizeBytes: MAX_REPLAY_RESPONSE_SIZE
      }
    });
  });
  app2.post("/api/endpoints", async (req, res) => {
    try {
      const storage = StorageManager.getAdapter();
      if (!storage.isConfigured()) {
        const status = storage.getStatus();
        return res.status(503).json({
          error: "STORAGE_UNCONFIGURED",
          message: status.message
        });
      }
      let sessionId = getSessionId(req);
      if (!sessionId) {
        sessionId = generateSessionId();
      }
      res.setHeader("Set-Cookie", `hl_session=${encodeURIComponent(sessionId)}; Path=/; Max-Age=2592000; SameSite=Lax`);
      const token = generateEndpointToken(14);
      const endpoint = {
        id: `ep_${token}`,
        token,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        name: req.body?.name || `Endpoint ${token.slice(0, 6)}`,
        description: req.body?.description || "",
        retentionHours: 24,
        rateLimitPerMin: 120,
        mockResponse: {
          enabled: false,
          statusCode: 200,
          delayMs: 0,
          contentType: "application/json",
          body: JSON.stringify({ status: "ok", message: "Webhook received successfully" }, null, 2),
          headers: {}
        }
      };
      const created = await storage.createEndpoint(endpoint, sessionId);
      return res.status(201).json({ endpoint: created, sessionId });
    } catch (err) {
      return res.status(500).json({ error: "FAILED_TO_CREATE_ENDPOINT", message: err.message });
    }
  });
  app2.get("/api/endpoints", async (req, res) => {
    try {
      const storage = StorageManager.getAdapter();
      const sessionId = getSessionId(req);
      if (!sessionId) {
        return res.json({ endpoints: [] });
      }
      const endpoints = await storage.listEndpoints(sessionId);
      return res.json({ endpoints });
    } catch (err) {
      return res.status(500).json({ error: "FAILED_TO_LIST_ENDPOINTS", message: err.message });
    }
  });
  app2.get("/api/endpoints/:token", async (req, res) => {
    const token = req.params.token;
    if (!isValidEndpointToken(token)) {
      return res.status(400).json({ error: "INVALID_TOKEN", message: "Malformed endpoint identifier" });
    }
    try {
      const storage = StorageManager.getAdapter();
      const endpoint = await storage.getEndpoint(token);
      if (!endpoint) {
        return res.status(404).json({ error: "ENDPOINT_NOT_FOUND", message: "Endpoint not found or expired" });
      }
      const sessionId = getSessionId(req);
      if (sessionId && storage.attachToSession) {
        await storage.attachToSession(token, sessionId);
      }
      return res.json({ endpoint });
    } catch (err) {
      return res.status(500).json({ error: "STORAGE_ERROR", message: err.message });
    }
  });
  const handleUpdateEndpoint = async (req, res) => {
    const token = req.params.token;
    if (!isValidEndpointToken(token)) {
      return res.status(400).json({ error: "INVALID_TOKEN", message: "Malformed endpoint identifier" });
    }
    try {
      const storage = StorageManager.getAdapter();
      const updated = await storage.updateEndpoint(token, req.body);
      if (!updated) {
        return res.status(404).json({ error: "ENDPOINT_NOT_FOUND", message: "Endpoint not found" });
      }
      return res.json({ endpoint: updated });
    } catch (err) {
      return res.status(500).json({ error: "STORAGE_ERROR", message: err.message });
    }
  };
  app2.patch("/api/endpoints/:token", handleUpdateEndpoint);
  app2.put("/api/endpoints/:token", handleUpdateEndpoint);
  app2.delete("/api/endpoints/:token", async (req, res) => {
    const token = req.params.token;
    if (!isValidEndpointToken(token)) {
      return res.status(400).json({ error: "INVALID_TOKEN", message: "Malformed endpoint identifier" });
    }
    try {
      const storage = StorageManager.getAdapter();
      const sessionId = getSessionId(req);
      const success = await storage.deleteEndpoint(token, sessionId);
      return res.json({ success });
    } catch (err) {
      return res.status(500).json({ error: "STORAGE_ERROR", message: err.message });
    }
  });
  app2.get("/api/endpoints/:token/events", async (req, res) => {
    const token = req.params.token;
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "50", 10)));
    const offset = Math.max(0, parseInt(req.query.offset || "0", 10));
    try {
      const storage = StorageManager.getAdapter();
      const result = await storage.getEvents(token, { limit, offset });
      return res.json(result);
    } catch (err) {
      return res.status(500).json({ error: "STORAGE_ERROR", message: err.message });
    }
  });
  app2.get("/api/endpoints/:token/events/:eventId", async (req, res) => {
    const { token, eventId } = req.params;
    try {
      const storage = StorageManager.getAdapter();
      const event = await storage.getEvent(token, eventId);
      if (!event) {
        return res.status(404).json({ error: "EVENT_NOT_FOUND", message: "Event not found" });
      }
      return res.json({ event });
    } catch (err) {
      return res.status(500).json({ error: "STORAGE_ERROR", message: err.message });
    }
  });
  app2.delete("/api/endpoints/:token/events/:eventId", async (req, res) => {
    const { token, eventId } = req.params;
    try {
      const storage = StorageManager.getAdapter();
      const success = await storage.deleteEvent(token, eventId);
      return res.json({ success });
    } catch (err) {
      return res.status(500).json({ error: "STORAGE_ERROR", message: err.message });
    }
  });
  const handleClearEvents = async (req, res) => {
    const token = req.params.token;
    try {
      const storage = StorageManager.getAdapter();
      const success = await storage.clearEvents(token);
      return res.json({ success });
    } catch (err) {
      return res.status(500).json({ error: "STORAGE_ERROR", message: err.message });
    }
  };
  app2.post("/api/endpoints/:token/clear", handleClearEvents);
  app2.delete("/api/endpoints/:token/events", handleClearEvents);
  const webhookHandler = async (req, res) => {
    const token = req.params.token;
    const startTime = Date.now();
    if (!isValidEndpointToken(token)) {
      return res.status(400).json({ error: "INVALID_TOKEN", message: "Malformed endpoint identifier" });
    }
    const storage = StorageManager.getAdapter();
    if (!storage.isConfigured()) {
      const status = storage.getStatus();
      return res.status(503).json({
        error: "STORAGE_UNCONFIGURED",
        message: status.message
      });
    }
    const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "127.0.0.1";
    const rateCheck = globalRateLimiter.isRateLimited(`ep:${token}:${clientIp}`);
    if (rateCheck.limited) {
      res.setHeader("Retry-After", rateCheck.retryAfterSeconds.toString());
      return res.status(429).json({
        error: "RATE_LIMIT_EXCEEDED",
        message: `Too many requests. Limit: ${rateCheck.limit} req/min. Please retry in ${rateCheck.retryAfterSeconds}s.`
      });
    }
    const endpoint = await storage.getEndpoint(token);
    if (!endpoint) {
      return res.status(404).json({
        error: "ENDPOINT_NOT_FOUND",
        message: "This webhook endpoint does not exist or has expired."
      });
    }
    let rawBody = "";
    let sizeBytes = 0;
    if (Buffer.isBuffer(req.body)) {
      sizeBytes = req.body.length;
      if (sizeBytes > MAX_BODY_SIZE_BYTES3) {
        return res.status(413).json({
          error: "PAYLOAD_TOO_LARGE",
          message: `Payload size (${sizeBytes} bytes) exceeds limit of ${MAX_BODY_SIZE_BYTES3} bytes (512 KB).`
        });
      }
      rawBody = req.body.toString("utf-8");
    } else if (typeof req.body === "string") {
      sizeBytes = Buffer.byteLength(req.body, "utf-8");
      if (sizeBytes > MAX_BODY_SIZE_BYTES3) {
        return res.status(413).json({
          error: "PAYLOAD_TOO_LARGE",
          message: `Payload size exceeds limit of ${MAX_BODY_SIZE_BYTES3} bytes.`
        });
      }
      rawBody = req.body;
    }
    const contentType = req.headers["content-type"] || "";
    const parsedResult = parseWebhookPayload(rawBody, contentType);
    const sanitizedHeaders = {};
    for (const [k, v] of Object.entries(req.headers)) {
      if (typeof v === "string") {
        sanitizedHeaders[k] = v;
      } else if (Array.isArray(v)) {
        sanitizedHeaders[k] = v.join(", ");
      }
    }
    const queryParams = {};
    for (const [k, v] of Object.entries(req.query)) {
      if (typeof v === "string") {
        queryParams[k] = v;
      } else if (Array.isArray(v)) {
        queryParams[k] = v.map(String);
      }
    }
    const mock = endpoint.mockResponse;
    const statusCodeSent = mock?.enabled ? mock.statusCode : 200;
    const event = {
      id: generateEventId(),
      endpointToken: token,
      method: req.method.toUpperCase(),
      path: req.originalUrl || req.url,
      url: `${req.protocol}://${req.get("host")}${req.originalUrl || req.url}`,
      query: queryParams,
      headers: sanitizedHeaders,
      contentType,
      contentFormat: parsedResult.contentFormat,
      rawBody,
      parsedBody: parsedResult.parsedBody,
      bodyError: parsedResult.bodyError,
      sizeBytes,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      ip: clientIp,
      durationMs: Date.now() - startTime,
      statusCodeSent
    };
    try {
      await storage.saveEvent(event);
    } catch (saveErr) {
      return res.status(500).json({ error: "SAVE_FAILED", message: saveErr.message });
    }
    if (mock?.enabled) {
      if (mock.delayMs && mock.delayMs > 0) {
        const safeDelay = Math.min(5e3, Math.max(0, mock.delayMs));
        await new Promise((resolve) => setTimeout(resolve, safeDelay));
      }
      if (mock.headers) {
        for (const [hk, hv] of Object.entries(mock.headers)) {
          res.setHeader(hk, hv);
        }
      }
      if (mock.contentType) {
        res.setHeader("Content-Type", mock.contentType);
      }
      return res.status(mock.statusCode || 200).send(mock.body || "");
    }
    return res.status(200).json({
      received: true,
      id: event.id,
      timestamp: event.timestamp,
      sizeBytes
    });
  };
  app2.all("/h/:token", webhookHandler);
  app2.all("/api/h/:token", webhookHandler);
  app2.post("/api/replay", async (req, res) => {
    const replayReq = req.body;
    if (!replayReq || !replayReq.url) {
      return res.status(400).json({ error: "MISSING_URL", message: "Destination URL is required for replay" });
    }
    const ssrfValidation = await validateReplayUrlWithDns(replayReq.url);
    if (!ssrfValidation.allowed) {
      return res.status(400).json({
        error: "SSRF_RESTRICTION",
        message: ssrfValidation.reason || "Destination URL violates SSRF security restrictions."
      });
    }
    const startTime = Date.now();
    const timeoutMs = Math.min(15e3, Math.max(1e3, replayReq.timeoutMs || 1e4));
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const sanitizedHeaders = { ...replayReq.headers || {} };
      delete sanitizedHeaders["host"];
      delete sanitizedHeaders["content-length"];
      const fetchOptions = {
        method: replayReq.method || "POST",
        headers: sanitizedHeaders,
        signal: controller.signal,
        redirect: "follow"
      };
      if (replayReq.body && ["POST", "PUT", "PATCH", "DELETE"].includes(replayReq.method)) {
        fetchOptions.body = replayReq.body;
      }
      const response = await fetch(ssrfValidation.normalizedUrl || replayReq.url, fetchOptions);
      clearTimeout(timeoutId);
      const durationMs = Date.now() - startTime;
      const respHeaders = {};
      response.headers.forEach((val, key) => {
        respHeaders[key] = val;
      });
      const rawText = await response.text();
      const sizeBytes = Buffer.byteLength(rawText, "utf-8");
      const truncatedBody = sizeBytes > MAX_REPLAY_RESPONSE_SIZE ? rawText.slice(0, MAX_REPLAY_RESPONSE_SIZE) + "\n... [Response body truncated due to size limit]" : rawText;
      const result = {
        success: response.ok,
        statusCode: response.status,
        statusText: response.statusText,
        durationMs,
        headers: respHeaders,
        body: truncatedBody,
        sizeBytes,
        targetUrl: replayReq.url,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      return res.json(result);
    } catch (err) {
      clearTimeout(timeoutId);
      const durationMs = Date.now() - startTime;
      const isTimeout = err.name === "AbortError" || err.message?.includes("aborted");
      const result = {
        success: false,
        durationMs,
        headers: {},
        body: "",
        sizeBytes: 0,
        error: isTimeout ? `Request timed out after ${timeoutMs}ms` : err.message || "Network request failed",
        targetUrl: replayReq.url,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      return res.status(502).json(result);
    }
  });
  return app2;
}

// src/server/apiEntry.ts
var app = createExpressApp();
var apiEntry_default = app;
export {
  app,
  apiEntry_default as default
};
