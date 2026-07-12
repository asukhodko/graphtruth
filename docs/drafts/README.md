# GraphTruth design drafts

> **Status:** Non-normative design archive.
> **Archive established:** 2026-07-11.
> **Latest expansion:** 2026-07-12.
> **Authority:** None. These notes do not define GraphTruth conformance and do
> not amend an accepted RFC, the specification, schemas, or project principles.

This directory preserves valuable reasoning that would otherwise remain only in
design conversations: precursor formulations, alternatives, working hypotheses,
failure analyses, algorithm candidates, research snapshots, and tasks that may
later deserve experiments or RFCs.

The archive is deliberately more inclusive than the normative project surface.
It may contain mutually exclusive options and superseded sketches. That is a
feature: losing the rejected path makes later decisions look more obvious and
better supported than they really were.

## Authority and conflict rule

The authority order remains the one described in [the documentation
index](../README.md) and [the RFC process](../../rfcs/README.md). Drafts always
come last.

If a draft conflicts with an accepted RFC, the emerging specification, a
schema, or a durable principle, the authoritative artifact wins. The conflict
is evidence that the draft is historical, incomplete, or needs promotion; it
is not permission to choose the convenient interpretation.

In particular, these already established foundations must not be weakened by a
draft:

- GraphTruth is a file-first protocol for a durable epistemic ledger, not a
  graph database or model product.
- A logical graph does not require a graph database.
- Assertions and their revisions are records; a fact is a policy- and
  time-dependent view, not a context-free primitive.
- Generated output is attributable candidate or analysis material and cannot
  grant itself authority.
- Canonical and disposable, and direct and derived, are independent axes.
- Provenance, sequence, association, and causation remain different relations.
- The three zones have different authority even while they share a monorepo.

See [Vision](../VISION.md), [Principles](../PRINCIPLES.md),
[Architecture](../ARCHITECTURE.md), and [RFC 0000](../../rfcs/0000-project-foundation.md).

## Status vocabulary used inside drafts

| Marker | Meaning |
| --- | --- |
| **Accepted elsewhere** | Restates an established decision and must link to its authoritative source. |
| **Recovered context** | A paraphrase of a prior design discussion retained to prevent context loss. |
| **Working hypothesis** | Plausible direction that needs evidence from a complete workflow. |
| **Alternative** | One option in a design space; no preference is implied unless stated. |
| **Experiment** | Reversible test with observable success and stop criteria. |
| **Open question** | Missing decision or evidence, not an invitation to guess in code. |
| **RFC candidate** | Potential durable semantic or hard-to-reverse decision that requires examples and the RFC process. |
| **Deferred** | Intentionally postponed until its dependency or motivating evidence exists. |
| **Superseded** / **Superseded context** | Earlier idea retained for history but incompatible with the current foundation. |
| **REVALIDATE BEFORE DECISION** | Time-sensitive external research or implementation detail that must be checked again. |

Unmarked prose in this directory is descriptive context, not a decision.

## Promotion rule

A draft becomes authoritative only through the normal development process:

1. connect the idea to a real workflow, failure, risk, or invariant;
2. create a focused issue or time-boxed experiment;
3. collect synthetic examples and counterexamples;
4. use an RFC for durable semantics or a hard-to-reverse commitment;
5. add normative prose, schemas, positive and negative fixtures, migrations,
   and conformance behavior where applicable;
6. dogfood the result and record expected, observed, and learned evidence.

Copying a paragraph from this directory into runtime code does not promote it.
Repeated usefulness also does not promote it automatically: the boundary must
be reviewed explicitly.

Priority labels such as P0–P4 inside thematic drafts are local decompositions,
not a second project-wide queue. `GT-D###` items in
[the design backlog](DESIGN-BACKLOG.md) are the sole cross-document promotion
and experiment index. When a thematic item becomes actionable, create or update
its backlog entry before opening an implementation issue.

## Ownership and drift

The drafts intentionally overlap so each design surface remains readable in
context. To keep that redundancy useful, update the canonical draft owner first
and then reconcile summaries and cross-links elsewhere.

| Design material | Canonical draft owner |
| --- | --- |
| Session chronology, coverage, and recovery limits | [Session context](SESSION-CONTEXT-2026-07-11.md) |
| Historical progression and superseded foundations | [Design evolution](DESIGN-EVOLUTION.md) |
| Domain organization, ontology induction, and generated document views | [Ontology and document views](ONTOLOGY-AND-DOCUMENT-VIEWS.md) |
| Canonical vault, atomic publication, and disposable indexes | [Storage and indexing](STORAGE-AND-INDEXING.md) |
| Versioning, extensions, migrations, conformance, and governance | [Protocol longevity](PROTOCOL-LONGEVITY.md) |
| EoL rehearsal and ambiguous zone placement | [EoL recovery drill](EOL-RECOVERY-DRILL.md) and [zone boundary cases](ZONE-BOUNDARY-CASES.md) |
| Full algorithm inventory and authority placement | [Algorithm capability map](ALGORITHM-CAPABILITY-MAP.md) |
| Future-reveal corpus replay and experiment methodology | [Corpus replay experiment harness](CORPUS-REPLAY-EXPERIMENT-HARNESS.md) |
| Contradiction, dark-zone, question, and acquisition loop | [Contradictions, gaps, and acquisition](CONTRADICTIONS-GAPS-ACQUISITION.md) |
| Search, expansion, context budgets, and dossiers | [Retrieval and dossiers](RETRIEVAL-AND-DOSSIERS.md) |
| Episodes, causal claims, mechanisms, and transfer | [Experience, causality, and transfer](EXPERIENCE-CAUSALITY-TRANSFER.md) |
| Prior-art comparisons, risk model, and validation thesis | [Landscape and validation](LANDSCAPE-AND-VALIDATION.md) |
| Code-domain artifacts, adapters, MCP, and runtime patterns | [Technical artifacts](TECHNICAL-ARTIFACTS.md) |
| Cross-document promotion sequence and task identifiers | [Design backlog](DESIGN-BACKLOG.md) |

## Archive contents

- [Session context](SESSION-CONTEXT-2026-07-11.md) — chronology, coverage map,
  established outcomes, recovered candidates, and known recovery limits.
- [Design evolution](DESIGN-EVOLUTION.md) — how the idea moved from incremental
  automatic documentation and a knowledge graph toward an epistemic protocol.
- [Ontology and document views](ONTOLOGY-AND-DOCUMENT-VIEWS.md) — recovered
  domain/subdomain, FCA, multi-classification, drift, generated-page, and
  cross-domain-insight design space.
- [Storage and indexing](STORAGE-AND-INDEXING.md) — physical file-vault and
  access-plane design space, atomic publication, projection manifests, and open
  storage choices.
- [Protocol longevity](PROTOCOL-LONGEVITY.md) — independent version axes,
  compatibility, extensions, migrations, conformance, registries, governance,
  and archival releases.
- [EOL recovery drill](EOL-RECOVERY-DRILL.md) — an operational rehearsal for
  reading an archive after the original runtime and providers disappear.
- [Zone boundary cases](ZONE-BOUNDARY-CASES.md) — ambiguous capabilities split
  among protocol semantics, reference tooling, and product policy.
- [Algorithm capability map](ALGORITHM-CAPABILITY-MAP.md) — end-to-end algorithm
  slots, authority, inputs, outputs, failure modes, and evaluation.
- [Corpus replay experiment harness](CORPUS-REPLAY-EXPERIMENT-HARNESS.md) —
  future-reveal processing of private project documents, reproducible runs,
  checkpoints, baselines, metrics, privacy controls, and the first walking
  skeleton.
- [Contradictions, gaps, and acquisition](CONTRADICTIONS-GAPS-ACQUISITION.md) —
  candidate taxonomies and the closed loop from uncertainty to the next useful
  question, observation, or experiment.
- [Retrieval and dossiers](RETRIEVAL-AND-DOSSIERS.md) — query modes, hybrid
  retrieval, graph expansion, context budgeting, and dossier assembly.
- [Experience, causality, and transfer](EXPERIENCE-CAUSALITY-TRANSFER.md) —
  episodes, prospective predictions, causal claims, mechanism patterns,
  experience replay, and cross-context transfer attempts.
- [Landscape and validation](LANDSCAPE-AND-VALIDATION.md) — dated prior-art
  map, the defensible GraphTruth thesis, risks, falsifiers, and six-month versus
  three-year tests.
- [Technical artifacts](TECHNICAL-ARTIFACTS.md) — code as a special input,
  code-intelligence adapters, a guarded auto-documentation loop, MCP access,
  and optional runtime-control patterns.
- [Design backlog](DESIGN-BACKLOG.md) — dependency-ordered experiments, RFC
  candidates, research tasks, deliverables, and stop conditions.

## Recovery limits

These files are a careful synthesis, not a verbatim transcript. Some detailed
assistant responses were recoverable only as summaries. Where exact wording or
a complete list was unavailable, the archive records the known gap rather than
pretending reconstruction is exact.

The external landscape is especially time-sensitive. Links and product
descriptions were useful as of the capture date, but every adoption or novelty
claim must be researched again. This archive is not a freedom-to-operate review
and must not be cited as proof that GraphTruth is unique.

## Privacy boundary

Only project design context and synthetic examples belong here. Do not preserve
private corpus excerpts, credentials, personal data, confidential logs, or
third-party code. A useful private dogfood observation should be abstracted into
a minimal synthetic case before it enters this archive.
