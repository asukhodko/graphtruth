# GraphTruth RFCs

RFCs are the durable decision record for changes that affect GraphTruth's protocol, architectural boundaries, interoperability, or difficult-to-reverse commitments.

An RFC explains the problem, decision, alternatives, consequences, compatibility impact, and unresolved questions. It does not replace the normative specification: an accepted RFC must still be reflected in `spec/`, schemas, fixtures, and implementation work where applicable.

## When an RFC is needed

Use an RFC for:

- new or changed protocol concepts and invariants;
- incompatible file-format or schema changes;
- versioning, extension, migration, or conformance policy;
- changes to the three-zone architecture or monorepo strategy;
- security, trust, privacy, or governance decisions;
- adoption of a foundational dependency or irreversible data representation;
- repository extraction.

Routine fixes, internal refactors, experiments, and implementation-local features do not need an RFC unless they change a public contract.

## Naming and status

Files use `NNNN-short-title.md`. Number `0000` records the initial project foundation. Later numbers are allocated monotonically and are never reused.

An RFC has one of these decision statuses:

- **Draft** — under exploration; no commitment;
- **Accepted** — the decision is approved, though implementation may be incomplete;
- **Rejected** — considered and intentionally not adopted;
- **Withdrawn** — removed by its author before a decision;
- **Superseded** — replaced by a named later RFC.

Decision status is separate from implementation status. An accepted RFC may be not started, partially realized, or fully realized; acceptance alone does not make behavior available or conforming.

Accepted RFCs are historical records. Correct typographical mistakes in place, but use a new RFC to change a substantive decision. Mark the earlier RFC as superseded and link both directions.

## Suggested structure

```markdown
# RFC NNNN: Title

- Decision status:
- Implementation status:
- Created:
- Supersedes:
- Superseded by:

## Summary
## Motivation
## Decision
## Detailed design
## Compatibility and migration
## Alternatives considered
## Consequences
## Security and privacy
## Open questions
## Acceptance criteria
```

Sections may be omitted when genuinely irrelevant. Important uncertainty should be stated explicitly rather than hidden by a complete-looking template.

## Decision process

During the project's personal incubation phase, the project founder accepts or rejects RFCs after the proposal has enough concrete examples to evaluate. Publishing a draft does not make it normative. Acceptance records a decision; conformance begins only when the specification identifies the corresponding requirement and the relevant artifacts implement it.

The decision process may be replaced by a governance RFC before external contributions are invited.

## Current register and candidate pipeline

| RFC | Decision status | Implementation status | Role |
| --- | --- | --- | --- |
| [0000 — Project foundation](0000-project-foundation.md) | Accepted | Partial | Establishes the file-first epistemic-ledger direction, three zones, authority boundaries, and open protocol questions. |

There is no allocated next RFC. The evidence-gated candidate clusters are kept
in the [idea map](../docs/IDEAS.md#evidence-gated-rfc-pipeline), with the fuller
dependency sequence and stop conditions in the [design
backlog](../docs/drafts/DESIGN-BACKLOG.md#candidate-rfc-sequence). This keeps
early protocol questions visible without treating a topic list as accepted
design or implementation priority.
