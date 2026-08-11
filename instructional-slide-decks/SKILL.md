---
name: instructional-slide-decks
description: Create or revise concise, teacher-led classroom slide decks as interactive HTML styled with Tailwind CSS. Use for lessons, teaching presentations, formative-assessment slides, whiteboard-replacement decks, or requests to turn a topic, curriculum objective, or lesson plan into projected slides for students.
---

# Instructional Slide Decks

Build a deck for a teacher operating a shared classroom display. Treat the slides as a focused teaching surface, not a document or a self-paced course.

## Set the operating frame

Before implementation, establish the learning objective, learner age/level, lesson duration, and target display device. Ask the user to specify the **class**, **lesson date**, and **week** before creating a new deck; do not silently invent these filing details. For a new lesson, ask what the previous lesson covered and how this lesson should continue it. Use the preceding deck and its notes when available; otherwise ask the user for the prerequisite knowledge, recently taught content, and any misconceptions to revisit.

Reserve the first **5–10 minutes** of every new lesson for retrieval and memory reinforcement. Create a compact refresh sequence that asks students to recall and apply essential prior learning before introducing new content. Do not reteach the whole previous lesson: use 2–4 short prompts, include at least one that requires explanation or application, reveal/correct after thinking time, and use the evidence to bridge explicitly into the new objective.

Choose one viewport and design at that exact size before adding responsive behavior. Default to `1366 × 768`, 16:9 landscape, for a classroom projector/interactive panel if no device is specified. Use these alternatives only when appropriate:

| Display | Viewport |
| --- | --- |
| Classroom display/projector | `1366 × 768` |
| 1080p classroom screen | `1920 × 1080` |
| `laptop` (teacher laptop) | viewport: `1280 × 665`; DPR: `1.50`; screen: `1280 × 800` |
| Student tablet | `1024 × 768` |

Set a fixed deck canvas to the selected viewport (or its 16:9 equivalent), use CSS/Tailwind to scale it to the available window, and verify at the target dimensions. Keep controls large enough for a teacher at the front of the room. Do not allow important text, answers, or controls below the fold.

## Organize the workspace

Keep the skill and generated decks separate. Create each new deck at:

```text
decks/<class-slug>/<YYYY>/week-<NN>/<YYYY-MM-DD>-<topic-slug>/
├── index.html
├── assets/
└── notes.md
```

Use lowercase hyphenated slugs (for example, `year-7-mathematics`) and ISO dates. Store deck-specific images, audio, and data in that deck's `assets/` folder. Put reusable visual assets and starter decks in `templates/`, never inside a particular class or week. Keep `notes.md` teacher-facing: objective, slide map, answers, misconceptions, and delivery notes.

Use a template when it matches the task. Templates should supply the fixed canvas, Tailwind setup, slide navigation, accessible controls, and proven formative-interaction components; they must not impose lesson content or add decorative clutter. Start with a small `templates/teacher-led-html/` baseline and add specialised templates only after a pattern has succeeded in more than one deck.

## Use the class profile source

Treat the workspace-root [copu_classes_full.json](../copu_classes_full.json) as the source of truth for class codes, roster, timetable, and PPSA 2026 class data. Match the requested class to the file before building. Use its timetable to check the lesson date and its class-level distribution to decide how much modelling, guided practice, repetition, and extension the deck needs. Never infer an individual student's ability, behaviour, or likely answer from their score or tier.

Use these stated language targets unless the user overrides them: **Form 1: A2 Revise**; **Form 2: A2 High**. Adapt vocabulary, sentence frames, reading/listening load, and scaffolding to the target, while differentiating through task design, worked examples, prompts, and optional extension—not public student labels.

Do **not** embed real student names, a roster, or the class JSON in any deck that may be committed or published. Use the separate local-only teacher tool at `teacher-tools/name-picker/index.html` for real-name selection. It lets the teacher choose the JSON file on their device, choose a class, draw names without repeats, and reset the draw. Keep the picker in a private laptop window; the public slide may show a neutral prompt or a temporary alias only. Do not fetch the JSON at presentation time, store it remotely, or include other classes' data.

See [references/class-data.md](references/class-data.md) before using class data.

## Ground grammar lessons in the local book

For grammar or language-form lessons, use the workspace-local `embeddings.jsonl` as a private reference before writing explanations, examples, or feedback. Run:

```text
node instructional-slide-decks/scripts/search-grammar-book.mjs "<grammar topic>"
```

Read the most relevant returned chunks, then translate the guidance into concise A2-appropriate teaching moves. Use the book to check accuracy; do not copy long passages into slides or publish the source file. The JSONL contains source text plus 3,072-dimensional vectors. Use vector similarity only when a query embedding generated by the same embedding model is available; otherwise use the bundled local text search.

## Plan the teaching sequence

Write a slide map before building. Start a new lesson with its 5–10-minute retrieval refresh, then make the continuity clear: prior knowledge → bridge to the new idea → guided example → one check → feedback/correction → next idea. Each slide must advance one visible teaching move: orient, elicit, model, practise, check, correct, apply, or retrieve.

Apply these rules:

- Put one learning question or task on every instructional slide. It can be explicit (for example, “Which strategy is more efficient?”) or an action prompt (“Predict the next number”).
- Keep the slide answerable from what students can see or have just learned. Avoid multi-part questions unless the slide is a deliberate structured activity.
- Use one concept, worked step, example, comparison, or decision per slide. Split dense material into a sequence.
- Use progressive disclosure for model answers and procedures. Reveal the next step only after students have had thinking time.
- Include planned wait time and teacher prompts in presenter notes or discreet teacher-only cues—not in student-facing clutter.
- End with a brief retrieval or transfer question that checks the stated objective.

See [references/instructional-design.md](references/instructional-design.md) for the detailed sequencing and cognitive-load checks.

## Design the student-facing surface

Remove everything that does not improve the current teaching move: decorative graphics, repeated prose, dense labels, redundant instructions, and generic navigation chrome.

Use visual hierarchy deliberately: one dominant question/task, a small amount of supporting evidence, and a single obvious next action. Prefer diagrams, worked examples, and manipulable representations when they directly support the concept. Ensure readable contrast and large type from the back of the room.

Design for pupils who are nearsighted (`rabun`) as a default: use at least 28 px for student-facing body copy, 34 px for questions, and 38 px for slide titles at the selected viewport. Use dark text on a light solid background or light text on a dark solid background; do not rely on muted gray text, thin strokes, color-only distinctions, or low-opacity surfaces for essential content. Keep answer choices and feedback at the same high-contrast standard.

Use Tailwind CSS for layout, spacing, typography, states, and responsive scaling. Keep custom CSS limited to deck-level scaling, animation timing, and genuinely reusable behavior. Build keyboard navigation (`ArrowLeft`/`ArrowRight`, `Space`) plus visible previous/next controls. Preserve a clear current-slide indicator; do not show a distracting global UI.

## Add formative interactivity

Use interactions to reveal student thinking to the teacher, not as decoration. Prefer low-friction whole-class routines the teacher can facilitate from one device:

- **Predict, then reveal:** pause for a response; reveal the answer and why.
- **Vote or choose:** selectable options, a confidence check, then teacher-led feedback.
- **Sort, match, or sequence:** drag/tap items; provide a reset and an explicit check/reveal action.
- **Complete the step:** students propose a missing calculation, word, label, or reason; reveal a model response.
- **Spot the error:** show a plausible misconception and let students identify/correct it.

Each interaction needs an answer state, a reset path, and feedback that explains the reasoning. Do not use scores, timers, confetti, or competitive mechanics unless they serve the lesson objective. For non-digital participation, make the response method explicit (think-pair-share, mini-whiteboards, fingers, hand signal) and keep the screen interaction optional.

See [references/formative-interactions.md](references/formative-interactions.md) for implementation patterns and accessibility requirements.

## Build and verify

Deliver a self-contained HTML deck (or the project format the user requests) with Tailwind, clean semantic structure, and minimal dependencies. Keep lesson content separate from rendering/state code where practical.

Before handoff, verify:

- The exact target viewport has no clipping, overlap, tiny text, or hidden controls.
- Inspect every slide at the target viewport individually, including answer-revealed states. Reserve a bottom safe zone above navigation chrome; never place teacher cues or feedback there unless the content area has been shortened to leave clear separation. If a slide is dense, remove projected teacher-only text or move it to `notes.md` before reducing type size.
- Every slide has one purposeful question/task and no unnecessary visual or textual element.
- The sequence follows the objective and makes each new step depend on prior slides.
- Keyboard, click/tap, answer reveal, reset, and slide navigation work.
- Interactive checks have meaningful feedback and can be run by one teacher on a shared display.

## Improve the skill through use

After making or revising a deck, identify any reusable lesson from the build, visual check, teacher feedback, or student response. When a lesson is repeatable and supported by evidence, update this skill in the same workspace so the next deck benefits.

- Turn recurring problems into short, actionable rules; do not record one-off lesson content.
- Add device measurements, proven interaction patterns, accessibility constraints, and review checks when they recur.
- Prefer editing the relevant section or reference over duplicating guidance.
- Preserve the skill's core teacher-led, low-clutter purpose and validate its required frontmatter after every update.
- Tell the user what was improved and why whenever the skill changes.
