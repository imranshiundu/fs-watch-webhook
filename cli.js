#!/usr/bin/env node
import { startWatcher } from './index.js';

function parseArgs(argv) {
  const args = { ignore: [] };
  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--webhook') args.webhookUrl = argv[++i];
    else if (arg === '--ignore') args.ignore.push(argv[++i]);
    else if (arg === '--debounce') args.debounceMs = Number(argv[++i]);
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else positional.push(arg);
  }
  args.root = positional[0] || '.';
  return args;
}

function help() {
  console.log(`fs-watch-webhook

Usage:
  WEBHOOK_URL=https://example.com/hook node cli.js ./folder

Options:
  --webhook <url>      Webhook URL
  --ignore <pattern>   Ignore filenames containing pattern. Can be repeated
  --debounce <ms>      Debounce time. Default: 400
  --dry-run            Print payloads instead of sending
`);
}

const args = parseArgs(process.argv.slice(2));
if (args.help) help();
else {
  startWatcher({ ...args, webhookUrl: args.webhookUrl || process.env.WEBHOOK_URL });
  console.log(`Watching ${args.root}`);
}
