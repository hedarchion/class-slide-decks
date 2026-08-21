# Slide and worksheet workspace orchestration

These instructions apply to this folder and its subfolders.

## Route the request

- For any slide-deck task, read `instructional-slide-decks/SKILL.md` and the installed `presentations` skill. The workspace route overrides the installed skill's PowerPoint implementation route: deliver HTML unless the user explicitly requests PowerPoint.
- For any worksheet, quiz, exit ticket, marking guide, or assessment task, also read the installed `worksheet-assessment-design` skill.
- Treat feedback such as “too crowded,” “make the questions harder,” “students could not read it,” or “I prefer this style” as a revision request and as learning evidence even when the user does not say “update the skill.” Follow the feedback-learning loop below.
- Do not invoke slide or worksheet workflows for a simple factual answer about the existing files; inspect and answer directly.

## Minimize handholding

Resolve context in this order: explicit request → current lesson files → same-class recent decks and notes → `copu_classes_full.json` → safe defaults. Ask only when unresolved ambiguity would materially change the lesson, assessment claim, privacy boundary, or requested output.

Lesson continuity is a material requirement. Because some English lessons happen offline or outside this app, actively check for missing prior teaching before planning a new lesson. If the recent same-class files do not clearly show what was taught immediately before, ask the teacher one concise continuity question about the previous lesson, already-taught language, and what must be bridged. Do not pretend the local deck history is complete.

Safe defaults:

- Deliverable: self-contained teacher-led HTML.
- Display: `1366 × 768` classroom screen; use `1280 × 665` when continuing a deck already built for that viewport. For Form 1 classes, `1 Devotion` / `class-1d`, and `2 Devotion` / `class-2d`, assume laptop-to-smart-TV projection with weaker text legibility unless a smartboard is confirmed. Use larger type, fewer words per slide, and verify at the classroom viewport.
- Assessment: brief, individual, formative, ungraded, teacher-marked, with ordinary classroom supports and a separate key. State these defaults in `notes.md`; do not interrupt the build to ask for them.
- Lesson duration: infer from the class timetable. If unavailable, use 60 minutes and record the assumption.
- Date/week: infer from the user request, target folder, timetable, and current Malaysia date. Ask only if two plausible dates lead to different filing or lesson-continuity decisions.

Never invent the class. If the class cannot be resolved from the request or nearby lesson context, ask one concise question.

## Root slide-library policy

When creating or revising the repository-root slide library:

- Use the title `Mr. A's Class Slides` and list only folders containing an actual `index.html` slide deck.
- Sort decks newest-first by default. Keep the interface limited to Class, Week, and Day filters; do not add search or alternative sort controls unless requested.
- Use a single oversized, legible, viewport-bounded animated background string: `First Rule of the Class is To Listen When I'm Speaking`. Give it a slow worm-like path behind the content, preserve strong readability for the library controls and cards, and provide a `prefers-reduced-motion` fallback.
- Use custom filter chevrons with clear inset spacing from the right edge of each select control.
- Regenerate the root index with `node scripts/build-deck-index.mjs` after adding or revising slide-deck folders, then verify all listed deck links and filter behavior.

## Build a context pack before drafting

For a new or revised deliverable, inspect only the relevant material and summarize it internally as a compact context pack:

1. class, level, schedule, lesson date, duration, and display;
2. previous lesson, already-taught language, and likely bridge;
3. objective, prerequisite knowledge, and likely misconceptions;
4. source evidence retrieved from the grammar reference book when applicable;
5. assessment purpose and default or user-specified administration conditions;
6. durable user preferences from `learning/user-preferences.md`, if present.

Do not ask the user to repeat information that can be recovered from these sources. Do not expose private roster or individual assessment data in generated or published artifacts.

For English skills or pedagogy not covered by the grammar reference, such as listening, reading, writing, speaking, assessment design, test validity, task scaffolding, or genre instruction, actively look for knowledge gaps. Use current authoritative web sources or official curriculum/exam guidance when local evidence is insufficient, record the sources in `notes.md`, and translate them into class-appropriate teaching decisions rather than publishing long source text.

## Output contract

- Create slides under `decks/<class-slug>/<YYYY>/week-<NN>/<YYYY-MM-DD>-<topic-slug>/`.
- Put `index.html` at the lesson root. Keep assets local to `assets/` and teacher-facing objective, assumptions, slide map, answers, misconceptions, sources, and delivery notes in `notes.md`.
- Every class slide deck must ultimately be published as a GitHub Pages site. Treat publication as a required final stage of the slide-deck workflow, not as optional follow-up work.
- Publishing changes external state and always requires the user's explicit permission first. After the local deck passes verification, ask the user for permission to publish; do not push, deploy, enable GitHub Pages, modify a publishing workflow, or otherwise make the deck public until the user clearly approves that specific publication.
- If permission has not yet been granted, finish and verify the local deck, report that it is ready for GitHub Pages, and pause before any publishing action. A request to create, revise, preview, or verify a deck does not by itself count as permission to publish it.
- A worksheet aligned to that lesson belongs in the same folder. Keep the learner version separate from its answer key or rubric.
- Do not create, edit, convert to, or use `.ppt` or `.pptx` unless the user explicitly requests PowerPoint. A supplied PowerPoint may be inspected as reference without changing the HTML deliverable.
- Do not reorganize or delete legacy work merely to match the current convention.

## Worksheet print-design defaults

- Keep each worksheet coherent around the requested lesson topic or theme. When a later task asks for extended application such as an email, make the earlier practice directly scaffold the language, content, and organisation needed for that task.
- Use an ink-saving print design by default: white backgrounds, black or dark-grey text, thin outlines, minimal light-grey shading, and no large solid fills or decorative areas that consume ink.
- Show the worksheet title and the `Name`, `Class`, and `Date` fields once, on the first page only. Do not repeat them on later pages unless the user explicitly requests detachable pages.
- Use only the response lines needed for the expected answer length. Remove redundant rules, repeated labels, duplicate checklists, and other learner-facing text that does not improve instructions, accessibility, or assessment evidence.

## Grammar grounding

For grammar, tense, usage, sentence structure, punctuation, or parts-of-speech lessons, use the workspace-root `grammar for english teachers.md.md` as the canonical private reference:

1. Run 2–3 focused queries with `instructional-slide-decks/scripts/search-grammar-book.mjs`, using the topic, target contrast, learning objective, and likely misconception.
2. Read the strongest distinct heading paths and their neighboring passages with enough context to verify the claim. Record the Markdown heading path and line numbers in `notes.md`.
3. Prefer sections titled `Key considerations`, `Typical difficulties for learners`, relevant form/use subsections, and `Teaching` when they directly address the lesson decision. Do not treat answer-key or index occurrences as primary evidence when an explanatory section is available.
4. Translate the teacher reference into concise, level-appropriate explanations and original examples. Do not publish the book or copy long passages.
5. If relevant evidence cannot be retrieved after related terminology and misconception queries, inspect the book's table of contents and headings directly. Ask for another source or permission to proceed without book grounding only after both routes fail.

## Lesson and assessment coherence

- Review the most recent same-class deck before planning. Preserve established terminology, language level, successful interaction patterns, and visual conventions while avoiding needless repetition.
- Start a new lesson with 5–10 minutes of retrieval that samples essential prior learning and bridges into the new objective.
- Use one visible teaching move per slide: orient, elicit, model, practise, check, correct, apply, or retrieve.
- Build worksheet items from the same observable outcomes and taught examples, but require fresh application rather than copying slide questions.
- Create the worksheet blueprint and key/rubric together. Use enough varied evidence for the intended claim, check accessibility and fairness, and avoid claims of statistical validity or reliability for an unpiloted worksheet.

## Verification gates

Do not deliver until the relevant gates pass:

- Content: source-grounded where required, accurate, level-appropriate, and continuous with prior teaching.
- Slides: every slide inspected at the target viewport, including reveal/reset states; no clipping, overlap, below-fold content, tiny type, broken navigation, or inaccessible interaction. Treat visible but non-working buttons as a blocking defect, refactor the slide code when needed, and retest the actual click/keyboard behavior before handoff.
- Worksheet: every item maps to an outcome; directions, administration conditions, scoring, answers, partial-credit rules, and limitations are explicit.
- Cross-artifact: slide objective, practice, exit evidence, worksheet blueprint, and answer key agree.
- Privacy: no real roster, individual score, private corpus content, or class JSON is embedded in publishable artifacts.

Fix failures before handoff. Record material assumptions and unresolved limitations in `notes.md`.

## Feedback-learning loop

Read `instructional-slide-decks/references/feedback-learning.md` whenever the user comments on a generated slide, worksheet, answer key, interaction, or lesson outcome.

Without requiring a separate prompt:

1. Apply the feedback to the current artifact when the user is asking for revision.
2. Record the observation with `node instructional-slide-decks/scripts/record-feedback.mjs ...`.
3. Update `learning/user-preferences.md` immediately for explicit, durable personal preferences.
4. Promote a rule into `instructional-slide-decks/SKILL.md`, its references, or this file only when the evidence meets the promotion rules in the feedback reference.
5. Validate changed skills and run proportionate artifact checks. Tell the user briefly what durable behavior changed.

Do not modify installed system/plugin skills. The user-owned `worksheet-assessment-design` skill may be improved when worksheet evidence meets the same promotion threshold.
