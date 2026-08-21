---
name: instructional-slide-decks
description: Create, revise, and improve concise teacher-led classroom slide decks as interactive HTML, including lesson continuity, heading-aware retrieval from the local grammar reference book, formative interactions, viewport verification, and learning from teacher feedback. Use for lessons, teaching presentations, formative-assessment slides, whiteboard-replacement decks, or requests to turn a topic, curriculum objective, prior deck, or classroom comment into projected student-facing slides.
---

# Instructional Slide Decks

Build a deck for a teacher operating one shared classroom display. Treat slides as a focused teaching surface, not a document or self-paced course.

## Resolve the operating frame

Infer before asking. Use the explicit request, target lesson folder, recent same-class decks, `copu_classes_full.json`, timetable, and workspace defaults in that order. Establish the class, objective, prior learning, lesson date, duration, week, language level, target viewport, and requested deliverables. Ask one concise question only when unresolved ambiguity materially changes the result. Never invent a class.

Lesson continuity is part of the operating frame, not a decorative opener. Some lessons happen offline or outside this app, so local deck history may be incomplete. When the most recent same-class files do not clearly establish the previous lesson, ask the teacher what was taught before, what students seemed to understand, and what must be bridged into the new lesson.

Default to `1366 × 768`, 16:9. Continue at `1280 × 665` when the class's existing deck uses that viewport. Fix the canvas at the selected size, scale it to the browser window, and keep all essential content and controls above the fold.

For Form 1 classes, `1 Devotion` / `class-1d`, and `2 Devotion` / `class-2d`, design for laptop-to-smart-TV projection rather than a smartboard unless evidence says otherwise. Prefer shorter visible copy, larger interaction targets, stronger contrast, and more slides over dense text. Treat text legibility as a content requirement.

Create work at:

```text
decks/<class-slug>/<YYYY>/week-<NN>/<YYYY-MM-DD>-<topic-slug>/
├── index.html
├── assets/
└── notes.md
```

Keep worksheets and keys aligned to the deck in the same lesson folder. Keep reusable assets in `templates/`.

## Build a compact context pack

Before drafting, inspect the most recent relevant same-class deck and notes. Capture internally: objective, prerequisite knowledge, prior coverage, likely misconception, class-level scaffolding need, duration, display, source evidence, and durable preferences from `learning/user-preferences.md`. Do not make the user restate discoverable context.

Read [references/class-data.md](references/class-data.md) before using `copu_classes_full.json`. Use aggregate data only. Never embed rosters, names, individual scores, tiers, or the class JSON in a publishable deck. Use `teacher-tools/name-picker/index.html` in a private teacher window when needed.

Use Form 1 **A2 Revise** and Form 2 **A2 High** language targets unless the user overrides them. Differentiate through modelling, prompts, task demand, and optional extension—not public labels.

## Ground grammar accurately

For grammar or language-form lessons, query the private workspace-root `grammar for english teachers.md.md` before writing explanations, examples, distractors, or feedback:

```text
node instructional-slide-decks/scripts/search-grammar-book.mjs "<topic or contrast>" --objective "<learning objective>" --misconception "<likely error>" --limit 5
```

Run separate queries for the central rule, contrast, and likely misconception. Read the strongest distinct heading paths and adjacent passages; record the headings and line numbers in `notes.md`. Prefer explanatory and learner-difficulty sections over index entries, contents tables, or answer keys. Translate evidence into concise original A2-appropriate teaching; do not publish the book or copy long passages.

If no relevant evidence appears after related terminology and misconception queries, inspect the table of contents and headings directly. Ask for another source or permission to proceed without book grounding only after both routes fail.

## Ground non-grammar English pedagogy

For English lessons or assessments outside grammar, such as listening, reading, writing, speaking, vocabulary, genre, comprehension, test design, or rubrics, do not rely on memory alone when the local materials do not cover the pedagogical decision. Search authoritative web sources, official curriculum or exam guidance, or reputable language-teaching references. Record sources in `notes.md`, then adapt the findings into concise A2-appropriate activities, prompts, and teacher notes.

## Plan the learning sequence

Read [references/instructional-design.md](references/instructional-design.md) while mapping or reviewing a lesson.

Reserve the first 5–10 minutes of a new lesson for 2–4 retrieval prompts, including at least one explanation or application. Bridge the evidence explicitly into the new objective rather than reteaching the prior lesson.

Sequence prior knowledge → bridge → model → guided practice → check → explanatory correction → transfer. Give each slide one visible teaching move and one dominant learning question or action. Split dense ideas instead of shrinking type. Keep teacher talk tracks, wait time, anticipated responses, and transitions in `notes.md`.

## Design the projected surface

Use the smallest visual system that makes the teaching move obvious. Prefer one composition, strong hierarchy, high contrast, and direct examples over decorative panels or generic chrome. Use Tailwind CSS for layout and state styling, with custom CSS only for canvas scaling, reusable behavior, and necessary animation.

Design for pupils who are nearsighted by default: at least 28 px body text, 34 px questions, and 38 px slide titles at the target viewport. Do not rely on color alone, muted gray, thin strokes, low-opacity text, or interaction below the navigation safe zone.

Support `ArrowLeft`, `ArrowRight`, and `Space`, plus visible previous/next controls and a clear slide indicator.

## Add formative interactions

Read [references/formative-interactions.md](references/formative-interactions.md) when adding interactions. Use the smallest interaction that reveals useful thinking: predict/reveal, choose, order, categorise, complete, or error analysis.

Every interaction needs a prompt, response path, teacher-controlled check or reveal, explanatory feedback, reset, keyboard access, and non-digital fallback. Visible controls that do not change state are failed interactions, not decoration. Refactor inherited slide code or shared button handlers when needed so the actual click and keyboard paths work. Avoid scores, timers, confetti, accounts, and competitive mechanics unless they directly serve the objective.

## Align worksheets

When a worksheet is requested, also use the `worksheet-assessment-design` skill. Default unspecified administration to brief, individual, formative, ungraded, teacher-marked work with ordinary classroom supports; record the assumption rather than stopping the build.

Derive worksheet outcomes from the deck objective and taught practice. Build the blueprint and key/rubric together. Use fresh examples, sample important outcomes more than once when practical, and keep learner material separate from scoring guidance. Ensure slide instruction, exit evidence, worksheet items, and scoring rules make the same learning claim.

## Verify before delivery

Inspect every slide at the exact viewport, including answer, error, reset, and final states. Fix clipping, overlap, wrapping, below-fold content, tiny text, broken focus, inaccessible controls, and navigation faults. Check that every slide advances the objective and that feedback explains the reasoning.

For a worksheet, verify outcome coverage, item clarity, answer defensibility, distractor plausibility, scoring consistency, fairness, accessibility, and the stated limits of an unpiloted instrument. Cross-check all answers against the learner version.

## Learn from use

When the user comments on an artifact or reports student response, read [references/feedback-learning.md](references/feedback-learning.md). Apply requested revisions, record the evidence, and update durable preferences without waiting for the phrase “update the skill.” Promote only well-supported, reusable lessons; do not turn one-off content choices into universal rules. Validate the skill after any change and briefly disclose durable improvements to the user.
