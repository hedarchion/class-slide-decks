import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const args = process.argv.slice(2);
const query = args.find((arg) => !arg.startsWith('--'));
const fileOption = args.indexOf('--file');
const file = fileOption >= 0 ? args[fileOption + 1] : path.resolve(process.cwd(), 'embeddings.jsonl');

if (!query || !file) {
  console.error('Usage: node search-grammar-book.mjs "<topic>" [--file <embeddings.jsonl>]');
  process.exit(1);
}

const terms = [...new Set(query.toLowerCase().match(/[a-z0-9]+/g) || [])];
const phrase = query.toLowerCase();
const matches = [];

const lines = readline.createInterface({ input: fs.createReadStream(file, 'utf8') });
for await (const line of lines) {
  if (!line.trim()) continue;
  const chunk = JSON.parse(line);
  const text = String(chunk.text || '');
  const lower = text.toLowerCase();
  let score = lower.includes(phrase) ? 8 : 0;
  for (const term of terms) {
    const occurrences = lower.split(term).length - 1;
    score += Math.min(occurrences, 6);
  }
  if (score > 0) {
    matches.push({
      id: chunk.id,
      score,
      words: chunk.words,
      excerpt: text.replace(/\s+/g, ' ').slice(0, 420),
    });
  }
}

for (const match of matches.sort((a, b) => b.score - a.score).slice(0, 5)) {
  console.log(`\n[${match.id}] score=${match.score} words=${match.words}\n${match.excerpt}`);
}

if (matches.length === 0) console.log('No lexical matches. Try a related grammar term.');
