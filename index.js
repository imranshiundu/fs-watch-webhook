import { watch } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export function createPayload(root, eventType, filename) {
  return {
    eventType,
    filename: filename ? String(filename) : null,
    fullPath: filename ? path.resolve(root, String(filename)) : path.resolve(root),
    happenedAt: new Date().toISOString(),
    host: os.hostname(),
    pid: process.pid,
  };
}

export function shouldIgnore(filename = '', patterns = []) {
  return patterns.some((pattern) => String(filename).includes(pattern));
}

export async function deliverWebhook(webhookUrl, payload, options = {}) {
  const fetchImpl = options.fetchImpl || fetch;
  const retries = Number(options.retries ?? 2);

  if (options.dryRun) {
    console.log(JSON.stringify(payload, null, 2));
    return true;
  }

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetchImpl(webhookUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Webhook failed with status ${response.status}`);
      return true;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }
  throw lastError;
}

export function startWatcher({ root = '.', webhookUrl, fetchImpl = fetch, debounceMs = 400, ignore = [], dryRun = false } = {}) {
  if (!webhookUrl && !dryRun) throw new Error('webhookUrl is required unless dryRun is enabled');
  const timers = new Map();

  const watcher = watch(root, { recursive: false }, (eventType, filename) => {
    if (filename && shouldIgnore(filename, ignore)) return;
    const key = `${eventType}:${filename || ''}`;
    clearTimeout(timers.get(key));
    timers.set(key, setTimeout(async () => {
      timers.delete(key);
      const payload = createPayload(root, eventType, filename);
      try {
        await deliverWebhook(webhookUrl, payload, { fetchImpl, dryRun });
      } catch (error) {
        console.error(error.message || error);
      }
    }, debounceMs));
  });
  return watcher;
}
