# Idea map and research agenda

GraphTruth's active work is intentionally narrow, but the project did not begin
as an experiment-control framework. This map keeps the larger product idea
visible without turning research notes into commitments.

The original problem was continuous, evidence-backed documentation over a
changing stream of notes, code, messages, decisions, observations, and open
questions. The system would discover useful domains, maintain overview pages,
surface missing links, and revise its organization as the corpus changed.
Design pressure moved the source of authority below those generated views:
portable evidence, assertion history, policy-scoped acceptance, and explicit
unknowns now form the durable ledger. The earlier documentation idea remains a
product destination; it is safer because documents and classifications are
derived, attributable, invalidatable views rather than hidden truth.

## Authority and use

This document is a non-normative navigation and status map.

| Layer | What it means | Current home |
| --- | --- | --- |
| Foundation decision | Deliberate project direction; substantive change requires a superseding RFC. | [RFC 0000](../rfcs/0000-project-foundation.md) |
| Durable design intent | A constraint that should survive implementation changes but is not yet a protocol requirement. | [Vision](VISION.md), [principles](PRINCIPLES.md), and [architecture](ARCHITECTURE.md) |
| Evidence-gated product hypothesis | A valuable capability that must earn its complexity in a complete workflow. | This map, the [design archive](drafts/README.md), and the [design backlog](drafts/DESIGN-BACKLOG.md) |
| Active work | The one admitted experiment or feature, with explicit gates and evidence. | [Roadmap](ROADMAP.md), [operational plan](planning/README.md), and the owning issue |

The map does not authorize work, assign RFC numbers, or make draft record names
normative. An item moves into active work only through the evidence-driven
[development process](DEVELOPMENT.md).

## Product threads worth preserving

### Durable epistemic ledger

**Status:** foundation accepted; protocol still unimplemented.

Preserve exact evidence, provenance, assertion revisions, assessments,
policy-scoped acceptance, questions, time, and disagreement in portable files.
A current fact or answer is a reconstructible view, not an authority-bearing
primitive.

This is the substrate for every other thread. The next missing proof is a small
independently readable record-and-bundle slice rather than another broad model.

Sources: [RFC 0000](../rfcs/0000-project-foundation.md),
[Vision](VISION.md), and backlog `GT-D001`–`GT-D018`.

### Guarded project documentation from code and work evidence

**Status:** strategic product direction; deferred until a trustworthy personal
vertical slice exists.

GraphTruth should eventually assemble project documentation from versioned
source code together with schemas, tests, build results, repository history,
issues, decisions, incidents, and runtime observations. Code alone can establish
structure and some behavior, but usually cannot establish intent, operational
truth, or historical rationale. The useful output is therefore an
evidence-backed document view that:

- traces material claims to exact source or attributed analysis;
- distinguishes static structure, declared behavior, observed behavior, and
  human rationale;
- exposes uncertainty, disagreement, missing evidence, and version scope;
- invalidates affected sections after source or policy changes;
- detects common ancestry and never uses generated prose to corroborate itself;
- can be rebuilt from declared retained inputs.

The first honest test is one bounded maintenance task—such as understanding a
request path, planning a change, or diagnosing an incident—against code plus
ordinary search. Success is better judgment with acceptable capture and review
cost, not more generated prose.

Sources: [ontology and document views](drafts/ONTOLOGY-AND-DOCUMENT-VIEWS.md),
[technical artifacts](drafts/TECHNICAL-ARTIFACTS.md), and backlog `GT-D029`,
`GT-D040`, and `GT-D041`.

### Emergent, purpose-relative organization

**Status:** durable product direction with an evidence-gated implementation;
Issue #8 owns the later structural-shock experiment.

Domains are overlapping, versioned views rather than a closed taxonomy imposed
at capture. Records may be unclassified or belong to several views. A newly
observed bridge may justify a split, merge, reparenting, or new domain, but each
topology generation must preserve its corpus horizon, method, alternatives, and
lineage.

Ordinary facets and saved queries are the baseline. Clustering, Formal Concept
Analysis, or richer ontology machinery is justified only if it improves a real
navigation or judgment task without unacceptable churn.

Sources: [Vision](VISION.md#domain-organization-evolves-with-the-corpus),
[ontology and document views](drafts/ONTOLOGY-AND-DOCUMENT-VIEWS.md), and
backlog `GT-D038`–`GT-D041`.

### Contextual dossiers

**Status:** required personal-v0 product capability; portable dossier semantics
remain optional until interoperability evidence exists.

Retrieval should assemble the evidence, provenance, time, scope,
counterevidence, revision history, relevant experience, and known omissions
needed to judge a question. A dossier is a query-specific view over small
canonical records, not a replacement for them.

The first comparison is deterministic exact/lexical retrieval plus typed
expansion against ordinary text search. Hybrid graph, vector, and model-assisted
ranking remains replaceable.

Sources: [Vision](VISION.md#access-should-produce-knowledge-in-context),
[retrieval and dossiers](drafts/RETRIEVAL-AND-DOSSIERS.md), and backlog
`GT-D015` and `GT-D021`.

### Contradictions, dark zones, and active acquisition

**Status:** central product hypothesis; structural cases follow the minimal
ledger, while semantic discovery and acquisition remain later experiments.

GraphTruth should preserve disagreement and identify useful missing evidence.
A dark zone is always relative to an explicit expectation; absence from the
corpus alone proves nothing. A reported gap should be convertible into the
smallest useful question, source request, observation, measurement, or safe
experiment proposal, with cost, risk, authorization, and a stopping rule.

Success is an acquisition that changes a decision or resolves a meaningful
uncertainty often enough to justify interruption cost. Low-yield automatic
questions are a reason to shrink back to user-authored questions.

Sources: [contradictions, gaps, and
acquisition](drafts/CONTRADICTIONS-GAPS-ACQUISITION.md) and backlog
`GT-D022`–`GT-D028`, `GT-D047`, `GT-D049`, and `GT-D050`.

### Experience, mechanisms, and transfer

**Status:** strategic hypothesis and likely optional profile; requires
prospective evidence.

The project aims to preserve a path through experience: situation, goal,
constraints, prediction, decision, intervention, observation, outcome,
surprise, and later interpretation. Causal claims remain separate from
sequence and association. Mechanism patterns and transfer attempts become
valuable only when predictions are recorded before outcomes and both successful
and failed transfers survive.

If prospective transfer does not outperform reading or ordinary retrieval, keep
episodes as attributed records and drop the richer mechanism machinery.

Sources: [experience, causality, and
transfer](drafts/EXPERIENCE-CAUSALITY-TRANSFER.md) and backlog
`GT-D032`–`GT-D037`.

### End-of-life recovery and protocol longevity

**Status:** foundation constraint; broad proof remains open.

Useful meaning should survive loss of the original runtime, indexes, model
providers, and accounts, within an explicitly declared archive boundary.
Version negotiation, unknown extensions, migrations, conformance fixtures,
static human-readable views, and an independent reader are the mechanisms that
could make that claim credible.

The current runtime rehearsal proves only its named S0–S1 boundary. It does not
prove a general protocol, cross-version recovery, or practical end-of-life
usability.

Sources: [protocol longevity](drafts/PROTOCOL-LONGEVITY.md),
[EOL recovery drill](drafts/EOL-RECOVERY-DRILL.md), and backlog `GT-D030`,
`GT-D051`, and `GT-D053`.

### Privacy and disclosure closure

**Status:** foundation constraint; detailed portable semantics remain open.

Local control, explicit external processing, least privilege, retention,
redaction, deletion, and derived-copy tracing are part of correctness. A future
privacy claim must include indexes, embeddings, prompts, logs, backups,
exports, and provider copies rather than only the canonical files.

Sources: [Principles](PRINCIPLES.md#17-prefer-local-control-and-explicit-disclosure)
and backlog `GT-D008` and `GT-D052`.

## Evidence-gated RFC pipeline

Only [RFC 0000](../rfcs/0000-project-foundation.md) is accepted. The following
clusters preserve its open questions and the recovered candidate sequence; they
are not scheduled RFCs.

| Candidate decision cluster | Evidence required before drafting | Backlog |
| --- | --- | --- |
| Record and bundle envelope | Representative positive and negative golden journeys | `GT-D001`, `GT-D002`, `GT-D007` |
| Identity, sources, and evidence addressing | Exact-span cases across source versions and transformations | `GT-D003`, `GT-D004`, `GT-D042`, `GT-D043` |
| Serialization, canonicalization, and integrity | At least two encodings and an independent semantic comparison | `GT-D005`, `GT-D006`, `GT-D053` |
| Revision, time, assessment, and acceptance | Historical-view and policy-divergence fixtures | `GT-D010`, `GT-D011`, `GT-D044`, `GT-D046` |
| Profiles, extensions, migration, and conformance | Preserve-or-refuse fixtures and one exercised migration | `GT-D012`–`GT-D017` |
| Privacy, retention, redaction, and deletion | A threat model and full derived-copy deletion drill | `GT-D008`, `GT-D052` |
| Archive exchange and end-of-life recovery | Clean-room reconstruction from a declared export boundary | `GT-D030`, `GT-D051` |
| Optional dossier contract | Repeated independent need for portable dossier semantics | `GT-D015`, `GT-D021` |
| Optional experience and causal profiles | Prospective episodes and measured transfer value | `GT-D032`–`GT-D036` |
| Multi-writer or federation semantics | An observed second-writer or independently governed-corpus conflict | `GT-D055` |

The fuller dependency ordering remains in the [design
backlog](drafts/DESIGN-BACKLOG.md#candidate-rfc-sequence). If concrete evidence
does not yet exist, the right output is a fixture or experiment rather than an
RFC.

## Line of sight from current work

Issue #24 reached a pre-run procedural `stop` after producing bounded evidence
about procedure and reproducibility, not GraphTruth utility. Its accepted v2
learning result localized the first public-synthetic author-call failure to
`payload-json-byte-mismatch`; `reduced-echo-contract` is now a candidate
successor. The Python corpus is research-only, and a first confirmation requires
a fresh identity.

The single-major-WIP slot is free. The next project choice should be made
explicitly from evidence:

1. use a fresh corpus for the first confirmatory comparison if the procedure is
   worth continuing;
2. use the learned fixtures to finish representative golden journeys and the
   comparison harness (`GT-D001`, `GT-D009`);
3. earn the smallest record, evidence, revision, acceptance, projection, and
   dossier slice (`GT-D002`–`GT-D018`);
4. dogfood that slice before activating generated project views, richer domain
   topology, active acquisition, or experience-transfer machinery.

This ordering protects the early ideas rather than discarding them. It gives
them a durable substrate and an observable reason to exist.

## Maintenance rule

Update this map when an idea gains an accepted RFC, enters the roadmap, receives
an owning issue, is falsified, or is deliberately retired. Keep detailed
alternatives and historical reconstruction in `docs/drafts/`; keep active task
state in OpsKarta and issues. Do not copy transient execution history into this
map.
