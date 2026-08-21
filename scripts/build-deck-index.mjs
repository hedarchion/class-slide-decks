#!/usr/bin/env node
/**
 * build-deck-index.mjs — regenerate the workspace homepage (index.html).
 *
 * Scans decks/<class>/<year>/week-<NN>/<YYYY-MM-DD>-<topic>/ lesson folders,
 * extracts class / year / week / date / topic metadata, reads the topic title
 * from each notes.md heading (falling back to the humanised slug), detects
 * slide decks (index.html), and writes a self-contained
 * static index.html at the repository root.
 *
 * Usage:  node scripts/build-deck-index.mjs
 * Re-run after adding, renaming, or removing a lesson folder.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const decksRoot = join(root, 'decks');
const outFile = join(root, 'index.html');

const WEEK_RE = /^week-(\d+)$/i;
const LESSON_RE = /^(\d{4})-(\d{2})-(\d{2})-(.+)$/;

/** Collect every lesson folder: decks/<class>/<year>/week-N/<date>-<topic>. */
function findLessons(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const path = join(dir, entry.name);
    const rel = path.slice(decksRoot.length + 1).split(sep);
    if (rel.length === 4 && WEEK_RE.test(rel[2]) && LESSON_RE.test(rel[3])) {
      out.push(path);
    } else if (rel.length < 4) {
      findLessons(path, out);
    }
  }
  return out;
}

/** Title-case a slug, e.g. "common-illness-past-tense" -> "Common Illness Past Tense". */
function humaniseSlug(slug) {
  return slug
    .split('-')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

/** Strip a leading "Class 1D" token and separators from a notes.md heading. */
function topicFromHeading(heading) {
  let t = heading.replace(/^#\s*/, '').trim();
  t = t.replace(/^Class\s+\d\w+\s*[\u00b7\-—:]*\s*/i, '').trim();
  t = t.replace(/^[\u00b7\-—:]\s*/, '').trim();
  // Generic headings like "Week 28 · 11 August 2026" carry no topic -> fallback.
  if (/^week\s+\d+/i.test(t) || /^\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(t)) return null;
  return t || null;
}

function readTopicTitle(folder, slug) {
  const notes = join(folder, 'notes.md');
  if (existsSync(notes)) {
    const head = readFileSync(notes, 'utf8').split('\n').find((l) => /^#\s+/.test(l));
    if (head) {
      const t = topicFromHeading(head);
      if (t) return t;
    }
  }
  return humaniseSlug(slug);
}

function fileExists(folder, name) {
  return existsSync(join(folder, name));
}

const lessons = findLessons(decksRoot)
  .map((folder) => {
    const cls = folder.slice(decksRoot.length + 1).split(sep)[0];
    const m = LESSON_RE.exec(folder.split(sep).pop());
    const [, year, mm, dd, slug] = m;
    const rel = folder.slice(root.length).split(sep).join('/');
    const date = `${year}-${mm}-${dd}`;
    return {
      class: cls.replace(/^class-/i, '').toUpperCase(), // "1D"
      classSlug: cls,                                    // "class-1d"
      year,
      week: WEEK_RE.exec(folder.split(sep)[folder.split(sep).length - 2])[1],
      date,
      day: weekday(date),
      topic: readTopicTitle(folder, slug),
      topicSlug: slug,
      href: rel + '/',
      hasSlides: fileExists(folder, 'index.html'),
      worksheet: fileExists(folder, 'worksheet.html') ? 'worksheet.html' : null,
      worksheetPdf: readdirSync(folder).find((f) => /worksheet.*\.pdf$/i.test(f)) || null,
      notes: fileExists(folder, 'notes.md'),
    };
  })
  .filter((lesson) => lesson.hasSlides)
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.classSlug.localeCompare(b.classSlug)));

function weekday(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { weekday: 'long' });
}

const classes = [...new Set(lessons.map((l) => l.class))].sort();
const weeks = [...new Set(lessons.map((l) => l.week))].sort((a, b) => Number(a) - Number(b));
const days = [...new Set(lessons.map((l) => l.day))].sort(
  (a, b) => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(a)
    - ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(b)
);

const json = JSON.stringify(lessons).replace(/</g, '\\u003c');
const meta = JSON.stringify({ classes, weeks, days, generated: new Date().toISOString().slice(0, 10) }).replace(/</g, '\\u003c');

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mr. A's Class Slides</title>
    <style>
      :root { color-scheme: light; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; color: #13233a; background: #eef3f9; }
      * { box-sizing: border-box; }
      body { margin: 0; overflow-x: hidden; }
      .wrap { position: relative; z-index: 1; max-width: 1040px; margin: 0 auto; padding: 3rem 1.5rem 4rem; }
      header h1 { font-size: clamp(2rem, 5vw, 3rem); letter-spacing: -.04em; margin: 0 0 .4rem; }
      header p { margin: 0; color: #52657d; max-width: 60ch; }
      .rule-waves { position: fixed; inset: 0; z-index: 0; overflow: hidden; color: #1f5f9e; font-weight: 800; letter-spacing: -.075em; line-height: .73; opacity: .3; pointer-events: none; user-select: none; }
      .rule-wave { position: absolute; display: block; width: max-content; white-space: nowrap; font-size: clamp(5rem, 14vw, 15rem); filter: blur(.25px); transform-origin: center; }
      .rule-wave { animation: worm-rule 30s ease-in-out infinite alternate, worm-colour 30s linear infinite alternate; }
      @keyframes worm-rule {
        0% { transform: translate3d(-30vw, 6vh, 0) rotate(-15deg) skewX(-9deg); }
        32% { transform: translate3d(-6vw, 26vh, 0) rotate(8deg) skewX(10deg); }
        68% { transform: translate3d(-42vw, 59vh, 0) rotate(-7deg) skewX(-12deg); }
        100% { transform: translate3d(-10vw, 82vh, 0) rotate(14deg) skewX(8deg); }
      }
      @keyframes worm-colour {
        0%, 31% { color: #1f5f9e; }
        33%, 67% { color: #087f8c; }
        69%, 99% { color: #7048a8; }
        100% { color: #a85b00; }
      }
      .filters { display: flex; flex-wrap: wrap; gap: .6rem; align-items: center; margin: 1.75rem 0 1rem; }
      .filters select {
        appearance: none; -webkit-appearance: none; font: inherit; color: inherit; background-color: #fff;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='8' viewBox='0 0 14 8'%3E%3Cpath d='m1 1 6 6 6-6' fill='none' stroke='%231f5f9e' stroke-linecap='round' stroke-linejoin='round' stroke-width='2'/%3E%3C/svg%3E");
        background-position: right .85rem center; background-repeat: no-repeat; border: 1px solid #c9d6e4; border-radius: .65rem; min-width: 9.6rem; padding: .58rem 2.75rem .58rem .82rem;
      }
      .filters select:focus-visible { outline: 3px solid #7db3e6; outline-offset: 2px; }
      .count { font-size: .9rem; color: #52657d; margin: 0 0 1rem; }
      .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
      .card {
        background: #fff; border: 1px solid #dce6f0; border-radius: .9rem; padding: 1rem 1.1rem 1.1rem;
        box-shadow: 0 8px 24px #173a6610; display: flex; flex-direction: column; gap: .6rem;
      }
      .card h2 { font-size: 1.06rem; line-height: 1.35; margin: 0; letter-spacing: -.01em; }
      .card h2 a { color: #13233a; text-decoration: none; }
      .card h2 a:hover { text-decoration: underline; text-decoration-color: #2f6fb2; text-underline-offset: 3px; }
      .badges { display: flex; flex-wrap: wrap; gap: .35rem; }
      .badge {
        font-size: .72rem; font-weight: 600; padding: .18rem .5rem; border-radius: 999px;
        background: #e6eef8; color: #2c5583; border: 1px solid #cdddec;
      }
      .badge.new { background: #fff3d6; color: #8a5a00; border-color: #f2d98c; }
      .meta { font-size: .85rem; color: #52657d; }
      .links { display: flex; margin-top: auto; padding-top: .2rem; }
      .links a {
        font-size: .82rem; font-weight: 600; text-decoration: none; border-radius: .5rem; padding: .38rem .7rem;
        background: #eef4fb; color: #1f5f9e; border: 1px solid #cdddec;
      }
      .links a.primary { background: #1f5f9e; border-color: #1f5f9e; color: #fff; }
      .links a:hover { filter: brightness(.96); }
      .empty { padding: 2.5rem 1rem; text-align: center; color: #52657d; background: #fff; border: 1px dashed #c9d6e4; border-radius: .9rem; }
      .reset { display: none; font: inherit; font-size: .85rem; background: #fff; border: 1px solid #c9d6e4; border-radius: .55rem; padding: .45rem .7rem; color: #1f5f9e; cursor: pointer; }
      .reset:hover { background: #eef4fb; }
      @media (prefers-reduced-motion: reduce) { .rule-wave { animation: none; color: #1f5f9e; transform: translate3d(-24vw, 32vh, 0) rotate(-9deg); } }
    </style>
  </head>
  <body>
    <main class="wrap">
      <header>
        <h1>Mr. A's Class Slides</h1>
        <p>Latest lessons first. Filter the slide library by class, week, or day.</p>
      </header>

      <div class="filters" aria-label="Slide filters">
        <select id="f-class" aria-label="Filter by class">
          <option value="">All classes</option>
        </select>
        <select id="f-week" aria-label="Filter by week">
          <option value="">All weeks</option>
        </select>
        <select id="f-day" aria-label="Filter by day">
          <option value="">All days</option>
        </select>
        <button id="reset" class="reset" type="button">Clear filters</button>
      </div>
      <p id="count" class="count"></p>
      <div id="grid" class="grid"></div>
    </main>

    <div class="rule-waves" aria-hidden="true">
      <span class="rule-wave">First Rule of the Class is To Listen When I'm Speaking</span>
    </div>

    <script type="application/json" id="deck-data">${json}</script>
    <script type="application/json" id="deck-meta">${meta}</script>
    <script>
      const DECKS = JSON.parse(document.getElementById('deck-data').textContent);
      const META = JSON.parse(document.getElementById('deck-meta').textContent);
      const state = { cls: '', week: '', day: '' };

      const els = {
        cls: document.getElementById('f-class'),
        week: document.getElementById('f-week'),
        day: document.getElementById('f-day'),
        reset: document.getElementById('reset'),
        count: document.getElementById('count'),
        grid: document.getElementById('grid'),
      };

      META.classes.forEach((c) => els.cls.add(new Option('Class ' + c, c)));
      META.weeks.forEach((w) => els.week.add(new Option('Week ' + w, w)));
      META.days.forEach((d) => els.day.add(new Option(d, d)));

      const fmtDate = (iso) => {
        const [y, m, d] = iso.split('-').map(Number);
        return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      };

      function filtered() {
        return DECKS.filter((l) => {
          if (state.cls && l.class !== state.cls) return false;
          if (state.week && l.week !== state.week) return false;
          if (state.day && l.day !== state.day) return false;
          return true;
        });
      }

      function render() {
        const list = filtered();
        els.count.textContent = list.length === DECKS.length
          ? DECKS.length + ' slide deck' + (DECKS.length === 1 ? '' : 's')
          : 'Showing ' + list.length + ' of ' + DECKS.length + ' slide decks';
        els.reset.style.display = (state.cls || state.week || state.day) ? 'inline-block' : 'none';
        if (!list.length) {
          els.grid.innerHTML = '<div class="empty">No lessons match. Clear a filter or try a different search.</div>';
          return;
        }
        const latest = DECKS[0].date; // DECKS is pre-sorted newest first
        els.grid.innerHTML = list.map((l) => {
          const badges = [];
          badges.push('<span class="badge">Class ' + l.class + '</span>');
          badges.push('<span class="badge">Week ' + l.week + '</span>');
          if (l.date === latest) badges.push('<span class="badge new">Latest</span>');
          const links = '<a class="primary" href="' + l.href + '">Open slides</a>';
          return '<article class="card">'
            + '<h2><a href="' + l.href + '">' + esc(l.topic) + '</a></h2>'
            + '<div class="badges">' + badges.join('') + '</div>'
            + '<div class="meta">' + l.day + ' · ' + fmtDate(l.date) + '</div>'
            + '<div class="links">' + links + '</div>'
            + '</article>';
        }).join('');
      }

      const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

      const onInput = (key) => (e) => { state[key] = e.target.value; render(); };
      els.cls.addEventListener('change', onInput('cls'));
      els.week.addEventListener('change', onInput('week'));
      els.day.addEventListener('change', onInput('day'));
      els.reset.addEventListener('click', () => {
        state.cls = state.week = state.day = '';
        els.cls.value = ''; els.week.value = ''; els.day.value = '';
        render();
      });

      render();
    </script>
  </body>
</html>
`;

writeFileSync(outFile, html);
console.log('Wrote ' + outFile);
console.log('Indexed ' + lessons.length + ' slide decks: ' + lessons.map((l) => l.date + ' ' + l.class + ' ' + l.topic).join(' | '));
