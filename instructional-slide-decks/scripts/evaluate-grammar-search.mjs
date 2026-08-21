import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const workspace = path.resolve(import.meta.dirname, '..', '..');
const casesPath = path.resolve(import.meta.dirname, '..', 'evals', 'grammar-search.json');
const searchPath = path.resolve(import.meta.dirname, 'search-grammar-book.mjs');
const cases = JSON.parse(fs.readFileSync(casesPath, 'utf8'));
let reciprocalRank = 0;
let hitsAtFive = 0;

for (const testCase of cases) {
  const args = [searchPath, testCase.query, '--limit', '5', '--neighbors', '0', '--json'];
  if (testCase.objective) args.push('--objective', testCase.objective);
  if (testCase.misconception) args.push('--misconception', testCase.misconception);
  const run = spawnSync(process.execPath, args, { cwd: workspace, encoding: 'utf8' });
  if (run.status !== 0) {
    process.stderr.write(run.stderr);
    process.exit(run.status || 1);
  }
  const output = JSON.parse(run.stdout);
  const expected = testCase.expectedHeading.toLowerCase();
  const rank = output.results.findIndex((result) => result.headingPath.toLowerCase().includes(expected)) + 1;
  if (rank > 0) {
    hitsAtFive += 1;
    reciprocalRank += 1 / rank;
  }
  console.log(`${rank ? 'PASS' : 'FAIL'} rank=${rank || '-'} expected="${testCase.expectedHeading}" query="${testCase.query}"`);
}

const recallAtFive = hitsAtFive / cases.length;
const mrr = reciprocalRank / cases.length;
console.log(`Recall@5=${recallAtFive.toFixed(3)} MRR=${mrr.toFixed(3)} cases=${cases.length}`);
if (recallAtFive < 0.83 || mrr < 0.65) process.exit(1);
