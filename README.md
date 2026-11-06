# fs-watch-webhook

Watch a folder locally and POST an event payload to a webhook every time it changes —
as a Node CLI or importable watcher.

## CLI

```bash
node cli.js --root ./incoming --webhook https://example.com/hook
node cli.js --root ./data --webhook https://example.com/hook --dry-run
node cli.js --help
```

## Library

```js
import { startWatcher } from './index.js';

startWatcher({
  root: './incoming',
  webhookUrl: 'https://example.com/hook',
  debounceMs: 400,   // burst coalescing
  ignore: [],        // filenames to skip
  retries: 2,        // delivery attempts
  // dryRun: true    // log payload instead of POSTing
});
```

## Delivery promise

- One file event → one **POST** with a JSON payload (filename, event, timestamp), after a 400 ms debounce.
- Retries: configurable; runs until delivered or attempts are exhausted.
- `--dry-run` / `dryRun: true` prints and logs the exact payload without POSTing it — safe to aim at a dev webhook.
- Ignores sub-folder recursion deliberately (`recursive: false`), so deeper trees can be handled by nested watchers.
