# fs-watch-webhook

**fs-watch-webhook** watches a folder and sends file-change events to a webhook. It is useful for small automation jobs: rebuild triggers, sync alerts, backup signals, content publishing, or local development hooks.

## Features

- Watches a target directory
- Debounces noisy file events
- Optional glob-like ignore patterns
- Adds event metadata: filename, full path, timestamp, host, process id
- Retries failed webhook delivery
- Dry-run mode for testing
- Zero runtime dependencies

## Usage

```bash
WEBHOOK_URL="https://example.com/hook" node cli.js ./watched-folder
```

Dry run:

```bash
node cli.js ./watched-folder --dry-run
```

Ignore common noisy files:

```bash
node cli.js ./watched-folder --ignore node_modules --ignore .git --ignore .tmp
```

## Payload example

```json
{
  "eventType": "rename",
  "filename": "notes.md",
  "fullPath": "/project/notes.md",
  "happenedAt": "2026-04-30T12:00:00.000Z",
  "host": "machine-name",
  "pid": 12345
}
```

## Development

```bash
npm test
```
