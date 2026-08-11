# Class Data Use

`../../copu_classes_full.json` is the local source of truth. Its top-level `classes` map uses class codes such as `1D` and `2E`. Each class supplies:

- `count` and `roster` for attendance-aware activities and name selection;
- `schedule` for lesson-day/time checks;
- `ppsa_2026` summary (`minScore`, `maxScore`, `avgScore`, and tier counts) for class-level scaffolding decisions.

## Planning rules

Use aggregate evidence to decide the balance of retrieval, modelling, guided practice, independent practice, and extension. Do not expose individual score, grade, TP, tier, or comparative information in a deck. Do not use assessment records to randomly select, exclude, or publicly group students.

For Form 1, target A2 Revise: reactivate familiar language, use short clear models and sentence frames, then build toward confident application. For Form 2, target A2 High: retain clear support but include more independent reading, explanation, and transfer. Let the objective and current teacher feedback override a historic score summary.

## Name picker data boundary

At build time, select only `classes[requestedClass].roster` and embed it as a local JavaScript array. The completed deck must work offline and contain no full source file, tier data, scores, or other classes' names. Use full names only if the teacher intends to display them; otherwise transform them to the preferred display name during build.
