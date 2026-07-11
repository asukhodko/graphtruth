# Algorithm Capability Map

> **Status:** Recovered design context — non-normative
>
> **Captured:** 2026-07-11
>
> **Authority / Promotion:** This draft preserves design hypotheses and a
> capability inventory. It neither defines protocol semantics nor selects an
> implementation. Promote a behavior only through the RFC process and, where
> interoperability requires it, the versioned specification, schemas, examples,
> and conformance fixtures.
>
> **Material provenance:** Core stages and candidate types were directly
> recovered from the session. Detailed taxonomies, boundaries, and evaluation
> structure were reconstructed and expanded during this archive pass; exact
> original wording is unavailable.

## Purpose

GraphTruth needs algorithms across its whole knowledge loop: from receiving an
imperfect event to finding useful knowledge, exposing contradictions and dark
zones, asking for missing evidence, and learning from outcomes. This document
records that algorithmic surface before implementation choices make it appear
smaller than it is.

The authoritative architectural boundaries remain in
[`ARCHITECTURE.md`](../ARCHITECTURE.md), the stable intent remains in
[`PRINCIPLES.md`](../PRINCIPLES.md), terminology remains in
[`GLOSSARY.md`](../GLOSSARY.md), and capability maturity remains in
[`ROADMAP.md`](../ROADMAP.md). In particular:

- algorithms do not acquire epistemic authority from accuracy, complexity, or
  canonical retention;
- probabilistic results begin as attributable candidates or analysis artifacts;
- an algorithm must not silently issue an `AcceptanceDecision`, establish
  causation, irreversibly merge identities, suppress counterevidence, or perform
  an external action;
- canonical files retain durable meaning, while indexes and most rankings are
  rebuildable projections;
- candidate techniques below are research options, not commitments.

The deeper recovered notes for three especially important surfaces are:

- [contradictions, dark zones, and active acquisition](CONTRADICTIONS-GAPS-ACQUISITION.md);
- [retrieval, chunks, and dossiers](RETRIEVAL-AND-DOSSIERS.md);
- [experience, causality, mechanisms, and transfer](EXPERIENCE-CAUSALITY-TRANSFER.md).

## Placement by authority, not importance

An algorithm belongs in a zone according to the agreement independent
implementations need, not according to how valuable the algorithm is.

### Zone 1: normative semantics

Zone 1 may define a deterministic procedure or, preferably, observable inputs,
outputs, invariants, failure behavior, and conformance vectors when two
implementations must agree. Candidate areas include:

- record and reference integrity;
- canonical representation required for comparison, digests, or signatures;
- recorded-time visibility and valid-time interval semantics;
- assertion revision, supersession, and withdrawal reduction;
- `AcceptanceDecision` applicability and revocation;
- named-policy fact-view construction;
- protocol, profile, and extension negotiation;
- preservation and safe refusal for unknown required semantics;
- migration guarantees such as lossless, explicitly lossy, or unsupported.

Zone 1 should not standardize a ranking model, embedding, entity matcher,
contradiction classifier, causal discovery technique, or question policy merely
because the default runtime finds it useful.

### Zone 2: executable protocol mechanics

Zone 2 may provide conservative reference implementations of specified
behavior, including:

- parsers and lossless serializers;
- structural and semantic validators;
- canonicalizers and reference-integrity checkers;
- revision and bitemporal reducers;
- provenance closure and timeline reconstruction;
- migration planning and execution;
- deterministic renderers and dossier-profile renderers;
- archive completeness and rebuild verification;
- positive, negative, property, fuzz, and migration fixtures.

These tools explain and test the protocol. Their implementation is replaceable
when another implementation produces conforming behavior.

### Zone 3: proposal, discovery, access, and product policy

Zone 3 owns rapidly changing algorithms such as:

- event and document segmentation;
- extraction and evidence alignment;
- entity-match and assertion-equivalence proposals;
- graph, lexical, vector, temporal, spatial, and structural indexing;
- semantic retrieval and ranking;
- contradiction and dark-zone discovery;
- question generation, ranking, and acquisition planning;
- causal discovery and root-cause candidates;
- experience reconstruction, mechanism abstraction, and transfer proposals;
- model selection, orchestration, active learning, and product policy.

Some capabilities cross all three zones. For example, Zone 1 may define the
semantics of an identity decision, Zone 2 may validate merge and split records,
and Zone 3 may propose likely matches. Likewise, Zone 1 may later define a
portable dossier profile, Zone 2 may render it deterministically, and Zone 3 may
select and rank its query-specific contents.

## Common envelope for heuristic results

Every heuristic, statistical, or model-based result should be explainable as a
function of an identified input and process. A candidate analysis envelope may
eventually include:

- input canonical record identifiers and a ledger snapshot or recorded-time
  horizon;
- referenced source-artifact versions and evidence spans;
- algorithm, model, provider, prompt, code, and version identities as
  applicable;
- parameters, thresholds, configuration, and named policy;
- producer actor or process and creation time;
- assumptions, declared scope, and required extensions;
- output candidates and their relationships to the inputs;
- separate uncertainty dimensions rather than one context-free confidence
  number;
- warnings, omitted inputs, known failure conditions, and reproducibility limits;
- review, assessment, promotion, invalidation, or supersession state where the
  relevant profile permits it.

This is a design direction, not yet a proposed base record. A transient result
may remain disposable. A result retained for audit or later use may become a
canonical analysis artifact without becoming accepted or true.

## End-to-end capability inventory

### 1. Capture and ingestion

The capture boundary converts external change into attributable input without
interpreting that input as accepted knowledge.

Candidate algorithmic tasks include:

- polling, webhook consumption, filesystem observation, import, and manual
  capture;
- connector checkpoints, retries, replay, and bounded backoff;
- idempotency-key construction and duplicate-delivery suppression;
- exact duplicate and near-duplicate source detection;
- source type, encoding, language, media, and representation detection;
- stable source identity, source-version detection, and integrity digesting;
- late and out-of-order event handling without falsifying event time;
- atomic canonical append or a recoverable staging protocol;
- quarantine and diagnostic handling for malformed, unsupported, or partially
  captured input;
- access and sensitivity classification before projection into indexes or model
  contexts;
- detection of embedded instructions as untrusted source content rather than
  executable authority.

Possible techniques worth later experiments include content hashing, rolling
hashes, locality-sensitive hashing, MIME and encoding classifiers, change-data
capture, append journals, and content-addressed artifacts. None is implied by
the protocol before concrete requirements and fixtures exist.

Expected durable output is normally a source-artifact identity, an `Event`, and
capture provenance. Connector queues, delivery cursors, retry state, and
deduplication indexes may remain operational state if losing them cannot erase
already captured knowledge.

Important failure modes are duplicate canonical events, silent loss, evidence
pointing to mutable content, incorrect event order, disclosure to an
unauthorized service, and treating source instructions as capabilities.

Useful measurements include duplicate and loss rates, replay correctness,
capture latency, unsupported-format diagnostics, interrupted-ingestion recovery,
and the proportion of captured records with verifiable source identity.

### 2. Representation transformation and evidence anchoring

Sources often need decoding, OCR, speech recognition, parsing, transcoding, or
normalization before a useful evidence span can be selected. Every such step can
move or distort evidence boundaries.

Candidate tasks include:

- decode and normalize representation without silently changing meaning;
- OCR, transcription, table extraction, layout analysis, and structured-data
  parsing;
- preserve a transformation graph from derived representation to its source;
- map derived text coordinates back to original bytes, pages, regions, frames,
  or time intervals where possible;
- select stable evidence spans against a particular source version;
- represent approximate, composite, or unavailable evidence honestly;
- propagate controlled redaction without retargeting a span to changed content;
- verify span bounds, artifact identity, media type, and integrity.

Transformation quality is separate from evidence identity. A perfect selector
into a poor OCR transcript does not make the transcript accurate. Candidate
metrics include character or word error rate, layout and table fidelity, span
alignment accuracy, round-trip integrity, and the percentage of displayed claims
that descend to exact or explicitly approximate evidence.

### 3. Segmentation and interpretation extraction

Interpretation converts artifacts and events into candidates that people and
systems can inspect. It is an explicitly fallible proposal stage.

Candidate tasks include:

- structural, semantic, conversational, temporal, and event segmentation;
- mention detection, coreference, and provisional entity typing;
- assertion or proposition boundary detection;
- attribution of a statement to its claimant rather than to the ingesting
  system;
- preservation of quotation, negation, modality, quantification, tense,
  conditionality, and reported speech;
- extraction of scope, context, valid time, place, units, and uncertainty;
- detection of observations, hypotheses, questions, decisions, alternatives,
  rationales, actions, interventions, and outcomes;
- exact evidence alignment for every candidate interpretation;
- candidate clustering, duplicate proposal suppression, and cross-fragment
  consolidation;
- calibration and routing of ambiguous candidates to human review;
- active-learning selection of examples whose review would most improve later
  proposals.

Possible techniques include deterministic parsers, rules, sequence models,
language models, structured decoding, constrained generation, ensembles, and
human-in-the-loop workflows. The important contract is attributable proposal
generation, not one technique.

Failure modes include lost negation, wrong claimant, scope leakage, incorrect
time, assertion boundaries that omit qualifications, fabricated evidence,
overconfident consolidation, and confusing an observed event with an assertion
about the world.

Evaluation should separate detection, field accuracy, evidence alignment,
calibration, and correction effort. One aggregate extraction score would hide
the failures most dangerous to epistemic use.

### 4. Identity and semantic normalization

Identity is both an access aid and a source of catastrophic false connections.
The runtime may propose identity; durable merge or split semantics remain
explicit and reversible.

Candidate tasks include:

- candidate blocking so matching does not compare every mention with every
  entity;
- alias, name, identifier, context, temporal, and relationship-based match
  scoring;
- within-source and cross-source coreference;
- temporal aliases, renamed entities, and identity valid-time handling;
- candidate clustering without erasing original identifiers;
- assertion duplicate, equivalence, specialization, and subsumption proposals;
- predicate and vocabulary mapping across profiles;
- unit, quantity, date, interval, locale, and spatial normalization;
- validation of authorized merge, split, relink, and alias records;
- dependency tracking so changed identity decisions invalidate affected
  analyses and projections.

Potential implementations include deterministic identifiers, assigned UUID-like
identifiers, content identities, blocking keys, probabilistic record linkage,
graph context, vector similarity, and constraint-based clustering. Selecting one
requires concrete lifecycle and migration design.

Metrics should distinguish candidate recall from false-merge risk, report
calibration, measure the cost and completeness of correcting a merge, and test
that a split restores the original references and invalidates downstream views.

### 5. Ledger mechanics and temporal reconstruction

This group contains the strongest candidates for Zone 1 semantics and Zone 2
reference algorithms.

Candidate tasks include:

- structural validation against a declared schema and profile;
- semantic invariant and reference-integrity checks;
- lossless preservation of unknown extension material;
- deterministic canonical representation where required;
- revision-graph traversal and lifecycle reduction;
- branching supersession, claimant withdrawal, and tombstone handling;
- recorded-time visibility at a declared horizon;
- valid-time filtering over exact, interval, coarse, open, and uncertain time;
- ledger-relative reconstruction of timelines and separately evidenced
  decision-maker information sets, with explicit completeness limits;
- `AcceptanceDecision` applicability, purpose, policy, and revocation handling;
- named-policy fact-view construction;
- profile dependency and version negotiation;
- migration-path selection, validation, and explicit loss accounting;
- provenance closure and dependency tracing;
- archival-completeness and restore verification.

Candidate techniques include interval algebra, partial-order traversal,
deterministic reducers, schema and shape validation, dependency DAGs, migration
graphs, and integrity trees. These are implementation options unless a protocol
requirement makes observable agreement necessary.

Critical tests include permutation and idempotence properties where applicable,
past-horizon reconstruction, late-entry behavior, revocation, unknown-extension
round trips, migration round trips, explicit failure on unsupported semantics,
and cross-implementation conformance vectors.

### 6. Evidence, support, and uncertainty analysis

Evidence aggregation must preserve attribution and dependency. Ten copied
reports are not ten independent observations.

Candidate tasks include:

- construct attributed support, challenge, and methodological-assessment
  relationships;
- detect common provenance and avoid false corroboration;
- detect circular support and derivation cycles;
- characterize freshness, independence, directness, and methodological quality;
- identify single-source dependence and fragile support chains;
- represent uncertainty dimensions such as extraction, identity, source,
  measurement, temporal, scope, applicability, and model calibration;
- propagate or aggregate uncertainty only under a named, inspectable policy;
- compare assessments without collapsing them into a global truth score;
- identify stale, outlier, or distribution-shifted analyses for review.

Possible approaches include argument graphs, dependency-aware aggregation,
Bayesian or evidential models, calibration curves, and rule-based quality
profiles. They must remain policy choices until their assumptions and intended
meaning are explicit.

Failure modes include double-counting copied evidence, circular confirmation,
context-free source reputation, false numerical precision, and allowing a high
score to bypass review or issue an acceptance decision.

### 7. Projection and index construction

Indexes exist to make access fast and flexible. The runtime may combine several
specialized projections:

- artifact catalog and exact identifier lookup;
- source and evidence-span locators;
- inverted full-text index;
- entity and alias index;
- graph adjacency, relationship, and path indexes;
- recorded-time and valid-time interval indexes;
- provenance, revision, and decision indexes;
- vector and embedding indexes;
- question, contradiction, and dark-zone indexes;
- episode, mechanism, structural-pattern, and transfer indexes;
- spatial or domain-specific indexes where a profile justifies them.

Index algorithms also include incremental update, dependency invalidation,
merge/split propagation, redaction and deletion propagation, compaction,
partitioning, corruption detection, clean rebuild, and semantic consistency
checks against canonical files.

An index may retain locators and derived features but not sole durable meaning.
Embedding identifiers, model state, proprietary score semantics, and index-local
relationships must not become required to interpret the archive.

Metrics include rebuild completeness and time, incremental freshness, lookup
latency, storage amplification, stale-entry rate, access-control leakage, and the
ability to replace the index or model while preserving documented query
semantics.

### 8. Graph and constraint analysis primitives

Several later capabilities can share a library of graph and constraint
operations. Candidate primitives include:

- reachability and bounded neighborhood expansion;
- shortest or lowest-cost explanatory paths;
- transitive provenance closure;
- topological ordering and partial-order reconstruction;
- cycle and strongly connected component detection;
- connected components, clustering, and community candidates;
- centrality and downstream decision-impact propagation;
- dangling, orphan, and broken-chain detection;
- motif and subgraph matching;
- graph edit distance and role-constrained structure mapping;
- link-prediction candidates;
- minimal inconsistent or unsatisfied constraint sets;
- critical-path or cut analysis to find missing evidence blocking a decision.

Rules, constraint solvers, interval reasoning, SAT or SMT techniques, graph
algorithms, learned models, or hybrids may be compared in experiments. No named
technique is part of the GraphTruth protocol merely by appearing here.

### 9. Contradiction, gap, question, and acquisition analysis

This family detects conflicting or insufficient knowledge and turns it into
work. Its detailed taxonomy, safeguards, outputs, and metrics are preserved in
[`CONTRADICTIONS-GAPS-ACQUISITION.md`](CONTRADICTIONS-GAPS-ACQUISITION.md).

At a high level it includes:

- efficiently find candidate claims worth comparing;
- distinguish genuine incompatibility from differences in identity, vocabulary,
  scope, time, context, modality, or policy;
- find missing, weak, stale, conflicting, or structurally absent knowledge
  relative to an explicit expectation;
- turn a gap into the smallest useful answerable question;
- prioritize questions by decision impact, uncertainty, expected information
  gain, answerability, cost, latency, risk, privacy, and reversibility;
- choose among retrieval, requesting a source, asking a person, observation,
  measurement, or proposing a safe experiment;
- retain attempts, partial answers, failures, costs, and resolution evidence.

### 10. Retrieval, chunking, and dossier assembly

This family makes knowledge simple to access without presenting an isolated hit
as sufficient context. Its detailed pipeline is preserved in
[`RETRIEVAL-AND-DOSSIERS.md`](RETRIEVAL-AND-DOSSIERS.md).

It includes query interpretation, hybrid candidate generation, score fusion,
applicability and temporal filtering, counterevidence-aware reranking, graph and
provenance expansion, chunk construction, context-budget optimization, dossier
assembly, traceable summarization, and explicit omission reporting.

### 11. Experience, causality, mechanisms, and transfer

This family preserves the route by which knowledge was learned and makes
structural cross-context reuse possible. Its detailed hypotheses are preserved
in [`EXPERIENCE-CAUSALITY-TRANSFER.md`](EXPERIENCE-CAUSALITY-TRANSFER.md).

It includes episode reconstruction, decision-time replay, anti-hindsight
separation, causal candidate analysis, mechanism abstraction, structural analogy,
role mapping, prospective predictions, safe transfer attempts, and learning from
negative transfer.

### 12. Feedback, evaluation, and lifecycle management

Algorithms improve only if corrections and failures become durable evidence
about their behavior.

Candidate tasks include:

- convert reviewed false positives, false negatives, corrections, and ambiguous
  cases into evaluation fixtures where privacy permits;
- maintain public synthetic fixtures separately from private dogfood corpora;
- measure calibration and performance by capability and failure class;
- detect data, model, embedding, vocabulary, and policy drift;
- compare old and new algorithm outputs on the same recorded input horizon;
- trace every derived result to the algorithm version that produced it;
- invalidate and recompute dependent projections after canonical changes;
- retain historically consequential analysis while expiring disposable
  candidates and caches;
- test removal of an inference or embedding provider;
- test complete rebuild, backup, restore, migration, and archival export.

Metrics must match the capability. Candidate examples include:

- extraction and evidence-alignment precision, recall, field accuracy, and
  correction effort;
- entity candidate recall, false-merge rate, split recovery, and calibration;
- contradiction and gap precision by subtype and decision severity;
- expected calibration error or other appropriate uncertainty diagnostics;
- retrieval recall, ranking quality, dossier coverage, counterevidence presence,
  temporal correctness, and evidence traceability;
- question resolution rate, realized information gain, cost, and actionability;
- prospective causal or transfer prediction error and negative-transfer rate;
- index freshness, access-control leakage, rebuild integrity, and recovery time;
- user evidence such as useful forgotten context, contradictions, or actionable
  unknowns ordinary search did not expose.

No single aggregate score should hide a severe failure class.

## Algorithm replacement hypothesis

GraphTruth should remain useful while models, libraries, databases, and
providers change. A possible replacement discipline is:

1. Define a capability contract around canonical inputs, candidate outputs,
   provenance, and failure reporting rather than a specific implementation.
2. Keep model- and index-specific state outside durable protocol semantics.
3. Run a proposed replacement in shadow or dual-run mode over fixed fixtures and
   a privacy-controlled dogfood slice.
4. Compare output deltas, calibration, severe-error budgets, correction effort,
   latency, resource cost, and rebuild behavior.
5. Sample disagreements for human review rather than trusting an aggregate
   benchmark alone.
6. Switch the runtime's named policy or materialization only after the evidence
   meets the locally declared threshold.
7. Keep rollback possible by rebuilding disposable projections; do not rewrite
   canonical history to make the new algorithm appear to have run earlier.
8. Retain only analysis artifacts whose audit, decision, or future learning value
   justifies durable storage, with their historical reproducibility limits.

This is an operational hypothesis for dogfooding, not a protocol requirement.

## Dependency-oriented ordering

The ordering below is a recovered implementation hypothesis. It complements,
but does not replace, the evidence-based stages in
[`ROADMAP.md`](../ROADMAP.md).

### P0 — Make analysis inspectable

- Define an experimental candidate and analysis provenance envelope.
- Create a small synthetic golden-journey corpus covering ambiguous identity,
  revision, valid time, contradiction, weak evidence, an unanswered question,
  an episode, and a failed or successful transfer.
- Define capability-specific metrics and severe failure classes.
- Establish fixtures for correction, redaction, unknown extensions, and
  interrupted rebuild.

### P1 — Complete a deterministic walking skeleton

- Capture source artifacts and events with exact evidence locators.
- Validate and store portable canonical files.
- Provide explicit identities and manual correction paths.
- Reconstruct revisions, recorded-time visibility, valid time, and provenance.
- Build exact, lexical, graph, and temporal access sufficient for one real
  workflow.
- Render a deterministic contextual dossier and rebuild all claimed projections.

### P2 — Add inspectable proposal engines

- Add extraction, evidence alignment, and entity-match candidates.
- Add hybrid retrieval and query-specific dossier selection.
- Detect high-precision structural contradiction and expectation-based gap
  candidates.
- Implement first-class Question lifecycle and a transparent ranking policy.
- Measure false merges, false contradictions, calibration, and correction cost.

### P3 — Close the active learning loop

- Add semantic conflict discovery behind review.
- Generate and prioritize questions using explicit decision, cost, risk, and
  privacy constraints.
- Route acquisition to existing evidence, people, observation, or safe
  experiment proposals.
- Re-ingest outcomes and use reviewed failures to improve fixtures and policies.
- Exercise algorithm and provider replacement through shadow rebuilds.

### P4 — Test experience and transfer profiles

- Reconstruct and review `ExperienceEpisode` candidates.
- Exercise decision-time replay and prospective prediction.
- Introduce `CausalClaim` candidates only with explicit comparator, assumptions,
  alternatives, and uncertainty.
- Abstract tentative `MechanismPattern` records from multiple cases, including
  failures and counterexamples.
- Test structural analogy and record prospective `TransferAttempt` outcomes.
- Promote any portable semantics only after separate RFCs and profile fixtures.

## Cross-cutting failure corpus

The evaluation corpus should deliberately include:

- duplicate and out-of-order capture;
- mutable or redacted evidence;
- lost negation and wrong attribution;
- ambiguous identity and a false merge;
- copied sources masquerading as corroboration;
- different scopes or times masquerading as contradiction;
- confidence that is high but miscalibrated;
- prompt injection or policy instructions inside source content;
- stale indexes after revision, split, or redaction;
- retrieval that omits decisive counterevidence;
- a fluent answer unsupported by its evidence;
- a gap inferred from absence without an expectation;
- an unsafe or privacy-violating acquisition suggestion;
- post-outcome hindsight inserted into a decision-time episode;
- temporal association promoted to causation;
- surface analogy that causes negative transfer;
- replacement of a model whose historical output cannot be reproduced exactly.

## Open design questions

1. What is the smallest reusable analysis-result envelope without expanding the
   base protocol prematurely?
2. Which identity and reference operations require byte-for-byte agreement, and
   which require only equivalent observable behavior?
3. How should uncertain and coarse intervals interact with bitemporal queries?
4. How should transformation coordinate maps survive OCR, transcoding, source
   versioning, and controlled redaction?
5. What minimum uncertainty dimensions are portable across domains?
6. Which evidence dependency relationships are needed to detect false
   corroboration?
7. Which contradiction classes can become deterministic profile constraints?
8. What expectation representation makes a dark-zone result reproducible?
9. What is the portable dossier boundary, and how does it report incompleteness?
10. Which metrics and severe-error budgets gate an algorithm replacement?
11. Which analysis artifacts deserve durable retention after their model or
    provider reaches end of life?
12. In what order, if any, should Experience, Causality, Mechanism, and Transfer
    become optional protocol profiles?
