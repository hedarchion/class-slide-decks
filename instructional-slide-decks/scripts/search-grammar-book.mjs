import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const option = (name, fallback = '') => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : fallback;
};
const optionNames = new Set(['--file', '--limit', '--chars', '--objective', '--misconception', '--level', '--neighbors']);
const query = args.find((arg, index) => !arg.startsWith('--') && (index === 0 || !optionNames.has(args[index - 1])));
const file = path.resolve(option('file', path.resolve(process.cwd(), 'grammar for english teachers.md.md')));
const limit = Math.max(1, Number(option('limit', '5')) || 5);
const chars = Math.max(300, Number(option('chars', '1000')) || 1000);
const neighborCount = Math.max(0, Number(option('neighbors', '1')) || 0);
const objective = option('objective');
const misconception = option('misconception');
const level = option('level');
const jsonOutput = args.includes('--json');

if (!query || !fs.existsSync(file)) {
  console.error('Usage: node search-grammar-book.mjs "<topic>" [--objective "..."] [--misconception "..."] [--level A2] [--file "grammar for english teachers.md.md"] [--limit 5] [--neighbors 1] [--json]');
  process.exit(1);
}

const stopwords = new Set(['a', 'an', 'and', 'are', 'as', 'at', 'be', 'for', 'from', 'how', 'in', 'is', 'it', 'of', 'on', 'or', 'the', 'to', 'use', 'with']);
const normalize = (token) => {
  const clean = token.toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '');
  if (clean.length > 5) return clean.replace(/(ingly|edly|ing|ed|es|s)$/i, '');
  return clean;
};
const tokenize = (text) => (text.toLowerCase().match(/[a-z0-9']+/g) || [])
  .map(normalize)
  .filter((token) => token.length > 1 && !stopwords.has(token));

const expansions = new Map([
  ['past', ['preterite', 'finished', 'ago', 'yesterday']],
  ['present', ['habit', 'routine', 'general', 'current']],
  ['continuous', ['progressive']],
  ['question', ['interrogative', 'auxiliary', 'inversion']],
  ['negative', ['negation', 'not', "don't", "doesn't", "didn't"]],
  ['agreement', ['concord', 'subject', 'verb']],
  ['article', ['determiner', 'definite', 'indefinite']],
  ['student', ['learner', 'teaching', 'difficulty']],
  ['error', ['difficulty', 'mistake', 'incorrect', 'learner']],
]);

const expand = (text) => {
  const base = [...new Set(tokenize(text))];
  const all = new Set(base);
  for (const term of base) for (const related of expansions.get(term) || []) all.add(normalize(related));
  return { base, all: [...all] };
};

const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
const headingStack = [];
const sections = [];
let current = null;

const closeSection = (endLine) => {
  if (!current) return;
  current.lineEnd = Math.max(current.lineStart, endLine);
  current.text = current.body.join('\n').trim();
  if (current.text) sections.push(current);
};

for (let index = 0; index < lines.length; index += 1) {
  const heading = lines[index].match(/^(#{1,6})\s+(.+?)\s*$/);
  if (heading) {
    closeSection(index);
    const levelNumber = heading[1].length;
    headingStack.length = levelNumber - 1;
    headingStack[levelNumber - 1] = heading[2].replace(/[*_`]/g, '').trim();
    current = {
      id: `section-${String(sections.length + 1).padStart(4, '0')}`,
      heading: headingStack[levelNumber - 1],
      headingPath: headingStack.filter(Boolean).join(' > '),
      level: levelNumber,
      lineStart: index + 1,
      body: [],
    };
  } else if (current) {
    current.body.push(lines[index]);
  }
}
closeSection(lines.length);

const passages = [];
for (const section of sections) {
  const words = section.text.split(/\s+/).filter(Boolean);
  const target = 220;
  const overlap = 40;
  if (words.length === 0) continue;
  for (let start = 0, part = 1; start < words.length; start += target - overlap, part += 1) {
    const slice = words.slice(start, start + target);
    const approximateStart = section.lineStart + Math.floor((section.lineEnd - section.lineStart) * (start / words.length));
    const approximateEnd = section.lineStart + Math.ceil((section.lineEnd - section.lineStart) * (Math.min(words.length, start + target) / words.length));
    passages.push({
      id: `${section.id}-p${part}`,
      sectionId: section.id,
      heading: section.heading,
      headingPath: section.headingPath,
      lineStart: approximateStart,
      lineEnd: Math.max(approximateStart, approximateEnd),
      text: slice.join(' '),
    });
    if (start + target >= words.length) break;
  }
}

const topicTerms = expand(query);
const objectiveTerms = expand(objective);
const misconceptionTerms = expand(misconception);
const levelTerms = expand(level);
const rankingTerms = [...new Set([...topicTerms.all, ...objectiveTerms.all, ...misconceptionTerms.all, ...levelTerms.all])];
const documentTokens = passages.map((passage) => tokenize(`${passage.headingPath} ${passage.text}`));
const documentFrequencies = new Map();
for (const tokens of documentTokens) {
  for (const term of new Set(tokens)) documentFrequencies.set(term, (documentFrequencies.get(term) || 0) + 1);
}
const averageLength = documentTokens.reduce((sum, tokens) => sum + tokens.length, 0) / Math.max(1, documentTokens.length);

const bm25 = (tokens, terms) => {
  const frequencies = new Map();
  for (const token of tokens) frequencies.set(token, (frequencies.get(token) || 0) + 1);
  let score = 0;
  for (const term of terms) {
    const tf = frequencies.get(term) || 0;
    if (!tf) continue;
    const df = documentFrequencies.get(term) || 0;
    const idf = Math.log(1 + (passages.length - df + 0.5) / (df + 0.5));
    const denominator = tf + 1.5 * (1 - 0.75 + 0.75 * tokens.length / Math.max(1, averageLength));
    score += idf * (tf * 2.5 / denominator);
  }
  return score;
};

const coverage = (text, terms) => {
  if (!terms.length) return 0;
  const present = new Set(tokenize(text));
  return terms.filter((term) => present.has(term)).length / terms.length;
};

const scored = passages.map((passage, index) => {
  const searchable = `${passage.headingPath} ${passage.text}`;
  const lower = searchable.toLowerCase();
  let score = bm25(documentTokens[index], rankingTerms);
  score += 5 * coverage(searchable, topicTerms.base);
  score += 2 * coverage(searchable, objectiveTerms.base);
  score += 3 * coverage(searchable, misconceptionTerms.base);
  if (lower.includes(query.toLowerCase())) score += 8;
  if (passage.heading.toLowerCase().includes(query.toLowerCase())) score += 10;
  if (/typical difficulties|key considerations|teaching/i.test(passage.headingPath)) score += misconception ? 2.5 : 0.8;
  if (/answers|index|contents|consolidation exercises/i.test(passage.headingPath)) score -= 2.5;
  return { ...passage, score, index };
}).filter((passage) => passage.score > 0).sort((left, right) => right.score - left.score);

const selected = [];
const sectionCounts = new Map();
for (const passage of scored) {
  if ((sectionCounts.get(passage.sectionId) || 0) >= 2) continue;
  selected.push(passage);
  sectionCounts.set(passage.sectionId, (sectionCounts.get(passage.sectionId) || 0) + 1);
  if (selected.length >= limit) break;
}

const results = selected.map((passage) => {
  const neighbors = [];
  for (let offset = -neighborCount; offset <= neighborCount; offset += 1) {
    if (offset === 0) continue;
    const candidate = passages[passage.index + offset];
    if (!candidate) continue;
    neighbors.push({ id: candidate.id, headingPath: candidate.headingPath, lineStart: candidate.lineStart, lineEnd: candidate.lineEnd, excerpt: candidate.text.slice(0, chars) });
  }
  return {
    id: passage.id,
    score: Number(passage.score.toFixed(4)),
    headingPath: passage.headingPath,
    lineStart: passage.lineStart,
    lineEnd: passage.lineEnd,
    excerpt: passage.text.slice(0, chars),
    neighbors,
  };
});

if (jsonOutput) {
  console.log(JSON.stringify({ query, objective, misconception, level, source: path.basename(file), mode: 'markdown-bm25', results }, null, 2));
} else if (results.length) {
  console.log(`Source: ${path.basename(file)} | retrieval: heading-aware Markdown BM25`);
  for (const result of results) {
    console.log(`\n[${result.id}] score=${result.score} lines=${result.lineStart}-${result.lineEnd}\n${result.headingPath}\n${result.excerpt}`);
    for (const neighbor of result.neighbors) console.log(`  ↳ context lines=${neighbor.lineStart}-${neighbor.lineEnd}: ${neighbor.excerpt.slice(0, 240)}`);
  }
} else {
  console.log('No relevant Markdown passage found. Try a related grammar term or inspect the book headings directly.');
}
