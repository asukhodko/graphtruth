# GraphTruth documentation

This directory explains why GraphTruth exists, what it is intended to become,
and which constraints should survive implementation changes.

## Start here

- [Vision](VISION.md) — the problem, mission, central idea, and intended outcome.
- [Principles](PRINCIPLES.md) — durable design commitments and non-negotiable boundaries.
- [Architecture](ARCHITECTURE.md) — the three zones, canonical data, derived views, and data flow.
- [Glossary](GLOSSARY.md) — the project's current vocabulary.
- [Monorepo strategy](MONOREPO.md) — why the project stays together and what would justify a split.
- [Roadmap](ROADMAP.md) — capability-oriented stages from personal dogfooding to a public protocol.

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
