# GraphTruth documentation

This directory explains why GraphTruth exists, what it is intended to become,
and which constraints should survive implementation changes.

## Start here

- [Vision](VISION.md) — the problem, mission, central idea, and intended outcome.
- [Principles](PRINCIPLES.md) — durable design commitments and non-negotiable boundaries.
- [Invariant map](INVARIANTS.md) — current mechanisms, evidence, and gaps for
  the foundational invariants.
- [Architecture](ARCHITECTURE.md) — the three zones, canonical data, derived views, and data flow.
- [Glossary](GLOSSARY.md) — the project's current vocabulary.
- [Development process](DEVELOPMENT.md) — the evidence-driven workflow, change gates, and definitions of done.
- [Monorepo strategy](MONOREPO.md) — why the project stays together and what would justify a split.
- [Roadmap](ROADMAP.md) — capability-oriented stages from personal dogfooding to a public protocol.
- [Operational planning](planning/README.md) — current work, decision gates, and
  the validated OpsKarta map.
- [Design drafts](drafts/README.md) — non-normative recovered context,
  alternatives, research snapshots, and investigation backlog.

Project-wide design decisions are proposed and recorded under
[`rfcs/`](../rfcs/). The future normative specification belongs under
[`spec/`](../spec/); machine-checkable forms of that specification belong under
[`schemas/`](../schemas/).

## Status and authority

GraphTruth is pre-alpha. These documents establish direction, terminology, and
architectural intent, but they are not yet a stable protocol specification.

Until a versioned specification exists:

1. accepted RFCs record deliberate project decisions;
2. `spec/` defines emerging normative behavior;
3. `schemas/` encode machine-checkable subsets of that behavior;
4. tooling and the default runtime demonstrate behavior but do not
   silently redefine the protocol.

When prose, schemas, and implementation disagree, the disagreement is a defect
to expose and resolve—not an invitation to infer a convenient truth from the
running code.

Documents under [`docs/drafts/`](drafts/README.md) have no authority in this
order. They preserve reasoning and options until a focused issue, experiment,
or RFC deliberately promotes a result.
