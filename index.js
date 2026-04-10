import { watch } from 'node:fs';
import path from 'node:path';

export function createPayload(root, eventType, filename) {
  return {
    eventType,
    filename,
    fullPath: filename ? path.join(root, filename) : root,
    happenedAt: new Date().toISOString(),
  };
}

export function startWatcher({ root = '.', webhookUrl, fetchImpl = fetch }) {
  if (!webhookUrl) throw new Error('webhookUrl is required');
  const watcher = watch(root, async (eventType, filename) => {
    const payload = createPayload(root, eventType, filename);
    await fetchImpl(webhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
  });
  return watcher;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Provide a webhookUrl and import startWatcher() to use this module.');
}
