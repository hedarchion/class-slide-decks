# Feedback Learning Protocol

Use this protocol when the teacher comments on a deck, worksheet, answer key, interaction, visual check, or classroom outcome.

## Classify the evidence

Record one primary type:

- `preference`: an explicit durable choice such as larger text, fewer choices, or a favored routine;
- `artifact-defect`: clipping, broken interaction, wrong answer, weak distractor, unclear instruction, or inconsistency;
- `instructional-outcome`: evidence about student understanding, misconception, pacing, engagement, or accessibility;
- `one-off-request`: a change tied only to the current lesson;
- `policy-boundary`: privacy, safety, accessibility, sourcing, or assessment-integrity concern.

Separate the user's observation from the inferred cause. Preserve short evidence; do not store private student names, individual scores, or sensitive narrative.

## Act at the right layer

| Evidence | Current artifact | Preferences | Skill/reference | AGENTS.md |
| --- | --- | --- | --- | --- |
| One-off request | revise | no | no | no |
| Explicit durable preference | revise | update now | only if broadly reusable | no |
| Repeated defect or outcome | revise | if personal | promote after 2 independent artifacts | only if routing/policy changes |
| Factual, privacy, accessibility, or scoring defect | fix now | if relevant | promote after confirmation | promote immediately when it is a workspace boundary |
| User explicitly generalizes (“always…”, “from now on…”) | revise | update now | promote to the narrowest reusable rule | update only if it governs orchestration |

Prefer the narrowest durable layer. Put visual and teaching rules in this skill or its references, assessment rules in `worksheet-assessment-design`, and routing/privacy/output contracts in `AGENTS.md`.

## Record the observation

Run:

```text
node instructional-slide-decks/scripts/record-feedback.mjs \
  --artifact "<relative path>" \
  --type "<classification>" \
  --observation "<what the user reported>" \
  --action "<revision or next action>" \
  --scope "current|preference|candidate|promoted"
```

The script appends a privacy-safe JSONL record to `learning/feedback.jsonl`. Use `learning/user-preferences.md` for concise active preferences, not a chronology.

## Promote safely

Promote a lesson only when one of these is true:

1. the user explicitly states a future-facing rule;
2. the same pattern appears in at least two independent artifacts or classroom reports;
3. a confirmed correctness, privacy, accessibility, or scoring problem requires a guardrail.

Write the rule as an observable action or check. Include its trigger and success condition. Replace conflicting guidance instead of adding another exception. Do not preserve obsolete instructions merely as history.

After promotion, validate the affected skill, inspect related instructions for conflict, and test the smallest representative artifact or script. Tell the user which durable behavior changed and why.
