# Operational planning

GraphTruth uses three planning layers with different responsibilities:

1. `README.md`, the stable documents under `docs/`, and the non-normative
   design archive explain the mission, constraints, architecture, and idea
   space.
2. [`docs/ROADMAP.md`](../ROADMAP.md) defines capability stages and the evidence
   required to move between them.
3. [`graphtruth.plan.yaml`](graphtruth.plan.yaml) is the current operational map:
   near-term work, dependencies, decision gates, and deliberately sparse future
   horizons.

The OpsKarta plan is coordination data, not a GraphTruth canonical record, an
issue tracker, a normative specification, or evidence that a milestone passed.
GitHub issues retain experiment observations and mutable discussion. A gate in
the map changes status only when its referenced evidence exists.

## Format and validation

The plan uses OpsKarta v3 without a schedule overlay. GraphTruth advances by
evidence and `keep / shrink / stop` decisions, so invented calendar dates would
misrepresent the project. Dates may be added later for a genuinely committed
window without changing the work graph.

Validate the plan from the repository root:

```sh
./tooling/opskarta --strict docs/planning/graphtruth.plan.yaml
```

The repository vendors an unchanged validation-only subset of OpsKarta v3 at a
pinned commit. GraphTruth's adapter deliberately accepts one plan file so its
membership is closed and reviewable. It rejects YAML aliases, duplicate or
non-string keys, and non-finite numbers, checks the upstream fragment and
merged-plan schemas, and requires `meta.id` and `meta.title`. Adding Plan Set
fragments requires an explicit closed manifest first. See the
[vendor record](../../tooling/vendor/opskarta/UPSTREAM.md) and the
[compact pinned specification](../../tooling/vendor/opskarta/specs/v3/ru/SPEC.min.md).

OpsKarta is an alpha project-planning dependency under Apache-2.0. It does not
enter GraphTruth's protocol, schemas, runtime, or RFC authority chain. Rendering
tools are not vendored because no generated planning view is currently a
maintained artifact.

## Current position — 2026-07-23

Issue #24 is the single major WIP. Selection, source acquisition, and the
byte-identical RST projection are complete and owner-accepted. The issue has
used three of five repository-active dates: 2026-07-21, 2026-07-22, and
2026-07-23. The owner separately authorized one evaluation-freeze v1 attempt
and two external Codex calls. Its independent read-only audit returned
`reject`; no release or accepted evaluation contract exists. The
publication-safe
[terminal record](../../experiments/corpora/python-annotations-semantics-v1/EVALUATION-FREEZE-TERMINAL.json)
contains only publication-safe identities, hashes, counts, toolchain and
processing metadata, authorization flags, and the rejected outcome. It contains
no task or oracle material, source or projection bytes, or closed paths. The
exact audit result was later read once through an authorized deterministic
extractor. The publication-safe [diagnostic
receipt](../../experiments/corpora/python-annotations-semantics-v1/EVALUATION-FREEZE-DIAGNOSTIC.json)
records only fixed checklist flags, enumerated issue codes, counts, identities,
and no-repair/no-run flags; no closed path or report content is published.

That evaluation identity is terminal and cannot be repaired, retried, resumed,
or reused. The separate evaluation-freeze v2 controller now closes the two
diagnosed gaps with a structured ten-class result contract, complete GraphTruth
capture-tax accounting, and closed safe audit codes. The owner accepted the
exact v2 tooling identity and separately authorized one attempt. That sole
invocation stopped fail-closed with `AUTHOR_MODEL_CALL` and exit status `1`,
before a validated author artifact or independent audit. It returned no public
JSON and created no release or accepted evaluation contract. The attempt cannot
be retried, resumed, repaired, or reused. The Python corpus is exploratory; a
first confirmatory experiment requires a fresh corpus and identity with no
transfer of disclosed Python material.

The owner chose a procedural `shrink` on date 3/5. It leaves the corpus,
projection, and accepted v2 bytes unchanged. The resulting
`codex-author-call-qualification-v1` preparation and fake-provider tests are
complete. The owner accepted the exact tooling-manifest identity and separately
authorized one external public-synthetic call. The consumed call ended
terminally at `result-schema`: Codex exited zero with a valid four-event
zero-tool JSONL trace, but the structured answer did not pass the combined
strict-JSON, exact-shape, and expected-payload check. The safe result does not
localize which subcondition failed. No retry or resume occurred. The owner then
chose `diagnose-first` in Issue #24 comment 5061017045. That same-date decision
authorizes only deterministic public diagnostic tooling, artificial fixtures,
and one no-retry read-only Codex audit of those exact public bytes. A local
candidate was prepared, but the sole audit ended `audit-call-failed` before an
auditor verdict. The [safe terminal
record](https://github.com/asukhodko/graphtruth/issues/24#issuecomment-5062148530)
leaves it terminal, unaccepted, unpublished, and non-reusable.

The owner then selected exploratory learning and separately authorized only
public preparation of its exact goal and boundary in the current session,
without protected bytes or a separate external call. The resulting
[proposal](../../examples/experiments/author-call-qualification-v1/EXPLORATORY-LEARNING-BOUNDARY.md)
admits one future current-session exposure of the retained stdout, but is
neither accepted nor activated. The retained stdout and stderr remain unread;
no reader, processing, external call, or experiment ran. Manifest
`45820302417fa577d89cfce46d3c3b6ea6e18ec4c891661a1af67404f423951d`
cannot be accepted, re-audited, repaired, or reused on this route.

The nearest work is exact owner acceptance of the merged proposal SHA-256.
Acceptance grants no raw access. A fresh public execution pack must then receive
separate preparation authorization, independent public-only review, and exact
owner acceptance. Only a later processing authorization may name its hashes,
the exact retained-stdout path, current-session processor, one-episode budget,
safe outputs, retention, and deletion. A safe learning result grants no
successor work. Only its later disposition may select a targeted successor,
another execution method, prototype-only work, or pre-run `stop`.

All later route nodes are `conditional`. In this map that means “possible after
a future decision,” not “authorized.” The v1 disposition started its one
30-day deadline: retained local raw diagnostics must be deleted no later than
`2026-08-22T16:39:58Z`; the safe public result is retained. Later successor
dispositions do not reset that deadline and must carry their own retention
rules.

`g6-evaluation-contract-accepted`, implementation, rehearsal, SUT, baseline
execution, scoring, and an evaluated run remain planned and unauthorized.

## Maintenance rules

- Keep the current Issue #24 Python sequential path detailed through its
  selection, freeze, rehearsal, run, and decision gates.
- Keep later capabilities as horizon nodes until one becomes the single major
  work item.
- Do not copy private corpus names, paths, tasks, answers, or metrics into the
  public map.
- Update execution facts and gate statuses together with their evidence.
- Represent every owner authorization that changes the permitted work boundary
  as its own milestone; completing a prerequisite never grants that authority.
- Treat `conditional` nodes as possible routes rather than permission. The
  selected learning route still separates proposal preparation, exact
  acceptance, execution-pack preparation and acceptance, processing
  authorization, execution, and disposition.
- Account for one issue-wide time box across all of its plan phases; never reset
  a budget by renaming or decomposing the work.
- Issue #6 is closed at stop with four counted dates: 2026-07-12, 2026-07-13,
  2026-07-14, and 2026-07-21. Do not reuse its remaining nominal day.
- For Issue #24, count one working day per distinct Europe/Moscow date with
  material GraphTruth repository or issue activity on or after the issue was
  opened. Multiple events on one date count once; a date with no activity
  counts zero. Keep the ledger in Issue #24 and the roadmap. Day 1 is
  2026-07-21; require an explicit owner continue/shrink/stop decision before
  day 5 begins, and retain the independent 2026-08-04 hard stop.
- Revise the textual roadmap only when capability ordering or transition
  evidence changes; routine task movement belongs here and in the relevant
  issue.
- Review any OpsKarta vendor update separately from changes to the GraphTruth
  plan.
