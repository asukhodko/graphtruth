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

## Maintenance rules

- Keep the current Issue #6 path detailed through its next decision gates.
- Keep later capabilities as horizon nodes until one becomes the single major
  work item.
- Do not copy private corpus names, paths, tasks, answers, or metrics into the
  public map.
- Update execution facts and gate statuses together with their evidence.
- Account for one issue-wide time box across all of its plan phases; never reset
  a budget by renaming or decomposing the work.
- For Issue #6, count one working day per distinct Europe/Moscow date with
  material GraphTruth repository activity on or after the issue was opened.
  Multiple events on one date count once; a date with no repository activity
  counts zero. Keep the counted-date ledger in Issue #6 and the roadmap.
- Revise the textual roadmap only when capability ordering or transition
  evidence changes; routine task movement belongs here and in the relevant
  issue.
- Review any OpsKarta vendor update separately from changes to the GraphTruth
  plan.
