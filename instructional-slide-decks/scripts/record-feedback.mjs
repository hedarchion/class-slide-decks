import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const value = (name) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : '';
};

const record = {
  date: value('date') || new Date().toISOString().slice(0, 10),
  artifact: value('artifact'),
  type: value('type'),
  observation: value('observation'),
  action: value('action'),
  scope: value('scope') || 'current',
};

const allowedTypes = new Set([
  'preference',
  'artifact-defect',
  'instructional-outcome',
  'one-off-request',
  'policy-boundary',
]);
const allowedScopes = new Set(['current', 'preference', 'candidate', 'promoted']);

for (const field of ['artifact', 'type', 'observation', 'action']) {
  if (!record[field]) {
    console.error(`Missing required --${field} value.`);
    process.exit(1);
  }
}
if (!allowedTypes.has(record.type)) {
  console.error(`Invalid --type. Use: ${[...allowedTypes].join(', ')}`);
  process.exit(1);
}
if (!allowedScopes.has(record.scope)) {
  console.error(`Invalid --scope. Use: ${[...allowedScopes].join(', ')}`);
  process.exit(1);
}

for (const field of ['artifact', 'observation', 'action']) {
  record[field] = record[field].replace(/[\r\n]+/g, ' ').trim();
}

const workspace = path.resolve(import.meta.dirname, '..', '..');
const output = path.join(workspace, 'learning', 'feedback.jsonl');
if (args.includes('--dry-run')) {
  console.log(JSON.stringify(record, null, 2));
  process.exit(0);
}
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.appendFileSync(output, `${JSON.stringify(record)}\n`, 'utf8');
console.log(`Recorded feedback in ${path.relative(workspace, output)}`);
