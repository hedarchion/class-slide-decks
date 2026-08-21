import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'chatgpt-project-knowledge');
fs.mkdirSync(out, { recursive: true });

const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const write = (name, text) => fs.writeFileSync(path.join(out, name), text.trim() + '\n');

const data = JSON.parse(read('copu_classes_full.json'));
const dayNames = { ISNIN: 'Monday', SELASA: 'Tuesday', RABU: 'Wednesday', KHAMIS: 'Thursday', JUMAAT: 'Friday' };

let classes = `# Privacy-safe class context\n\nSource snapshot: ${data.generated}. This file intentionally contains no names, rosters, individual marks, grades, or individual proficiency records. Historic assessment summaries are for planning scaffolds only, never public grouping or high-stakes decisions.\n\n`;
for (const [code, c] of Object.entries(data.classes)) {
  const p = c.ppsa_2026;
  classes += `## Class ${code}\n\n- Form: ${code.startsWith('1') ? '1' : '2'}\n- Planning target: ${code.startsWith('1') ? 'A2 Revise' : 'A2 High'}\n- Class size: ${c.count}\n- Historic PPSA 2026 summary: minimum ${p.minScore}, maximum ${p.maxScore}, mean ${p.avgScore}\n- Attainment distribution: ${p.tiers.map(t => `${t.label}: ${t.count}`).join('; ')}\n- Schedule: ${Object.entries(c.schedule).map(([d,t]) => `${dayNames[d] ?? d} ${t}`).join('; ')}\n\n`;
}
classes += `## How to use the profiles\n\nUse only class-level patterns to choose the amount of modelling, guided practice, sentence framing, retrieval, and extension. Do not infer a fixed ability for any learner. Current teacher evidence and the lesson objective override historic scores. Never display tier labels or comparative attainment to students.\n`;
write('02-class-context-anonymized.md', classes);

const stripHtml = (html) => html
  .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
  .replace(/<!--([\s\S]*?)-->/g, ' ')
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<\/(h[1-6]|p|li|section|article|button|option|label|div)>/gi, '\n')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/[ \t]+/g, ' ')
  .replace(/\n\s*\n\s*\n+/g, '\n\n')
  .trim();

const rosterNames = new Set();
for (const c of Object.values(data.classes)) {
  for (const n of c.roster ?? []) rosterNames.add(typeof n === 'string' ? n : n.name);
  for (const t of c.ppsa_2026?.tiers ?? []) for (const s of t.students ?? []) rosterNames.add(s.name);
}
const redact = (text) => {
  let result = text;
  for (const name of rosterNames) if (name) result = result.split(name).join('[student name omitted]');
  return result;
};

const lessonRoots = [];
const walk = (dir) => {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.name === 'index.html' && p.includes(`${path.sep}decks${path.sep}`)) lessonRoots.push(path.dirname(p));
  }
};
walk(path.join(root, 'decks'));

let archive = '# Lesson and assessment archive\n\nThis is a privacy-safe text extraction of completed teaching artifacts. It preserves objectives, sequences, examples, answers, misconceptions, and delivery knowledge while excluding source code, visual styling, and student identities. Later lessons should build on this history without mechanically repeating it.\n\n';
for (const dir of lessonRoots.sort()) {
  const rel = path.relative(root, dir);
  archive += `## ${rel.replace(/^decks\//, '').replaceAll('/', ' · ')}\n\n`;
  for (const name of ['notes.md', 'worksheet-answer-key.md']) {
    const p = path.join(dir, name);
    if (fs.existsSync(p)) archive += `### ${name}\n\n${read(path.relative(root, p))}\n\n`;
  }
  archive += `### Learner-facing deck text\n\n${stripHtml(fs.readFileSync(path.join(dir, 'index.html'), 'utf8'))}\n\n`;
  const worksheet = path.join(dir, 'worksheet.html');
  if (fs.existsSync(worksheet)) archive += `### Learner-facing worksheet text\n\n${stripHtml(fs.readFileSync(worksheet, 'utf8'))}\n\n`;
}

const inspectPath = path.join(root, 'Simple_Past_Tense_1D_Friday.pptx.inspect.ndjson');
if (fs.existsSync(inspectPath)) {
  const lines = fs.readFileSync(inspectPath, 'utf8').split(/\r?\n/).filter(Boolean);
  const textBits = [];
  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      const serialized = JSON.stringify(obj);
      const matches = [...serialized.matchAll(/"text":"((?:\\.|[^"\\])*)"/g)];
      for (const m of matches) textBits.push(JSON.parse(`"${m[1]}"`));
    } catch {}
  }
  archive += `## Legacy PowerPoint reference · Simple Past Tense 1D Friday\n\n${[...new Set(textBits)].join('\n')}\n`;
}
write('06-lesson-and-assessment-archive.md', redact(archive));

write('07-full-grammar-reference.md', read('grammar for english teachers.md.md'));

const sourceManifest = `# Source manifest and exclusions\n\n## Included knowledge\n\n- Workspace operating rules and privacy boundaries\n- Anonymized class sizes, schedules, aggregate attainment patterns, and planning implications\n- Durable teacher preferences and feedback-derived practices\n- Instructional design, formative interaction, assessment, and verification guidance\n- Text, notes, examples, answer keys, and misconceptions from completed lessons\n- The complete private grammar reference in Markdown\n\n## Deliberately excluded\n\n- Student names, rosters, individual marks, grades, tiers, and individual records\n- Browser profiles, cookies, history databases, caches, session files, and extension state\n- Git internals, temporary screenshots, montages, render caches, and generated binaries\n- Images whose useful meaning is already represented in lesson text\n- HTML/CSS/JavaScript implementation code that does not add instructional knowledge\n- The local name-picker data pathway and any private roster payload\n\n## Source files represented\n\n- AGENTS.md\n- schedule.md\n- copu_classes_full.json (aggregates only)\n- learning/user-preferences.md and privacy-safe feedback history\n- instructional-slide-decks/SKILL.md and references\n- decks/** lesson notes, HTML text, worksheets, and answer keys\n- Simple_Past_Tense_1D_Friday.pptx.inspect.ndjson (text only)\n- grammar for english teachers.md.md\n\nGenerated: ${new Date().toISOString()}\n`;
write('99-source-manifest.md', sourceManifest);

console.log(`Built ChatGPT Project knowledge pack at ${out}`);
