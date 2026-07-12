# Algorithm Capability Map

> **Status:** Recovered design context — non-normative
>
> **Captured:** 2026-07-11
>
> **Completeness review:** 2026-07-12. The inventory was independently checked
> across ingestion/modeling, retrieval/acquisition/causality, and
> protocol/operations/safety surfaces; the resulting gaps were incorporated.
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

Here, **complete** means structurally complete relative to the current mission:
every material state transition, authority boundary, feedback path, severe
failure, and recovery path has an algorithmic responsibility or an explicit
deferral. It does not mean every possible technique is named, every domain is
covered, or every listed capability belongs in the first implementation. The
inventory must remain revisable as dogfood exposes new states and transitions.

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

Detailed owners for the major surfaces are:

- [contradictions, dark zones, and active acquisition](CONTRADICTIONS-GAPS-ACQUISITION.md);
- [retrieval, chunks, and dossiers](RETRIEVAL-AND-DOSSIERS.md);
- [experience, causality, mechanisms, and transfer](EXPERIENCE-CAUSALITY-TRANSFER.md);
- [ontology, domains, and generated document views](ONTOLOGY-AND-DOCUMENT-VIEWS.md);
- [storage, indexing, and projection publication](STORAGE-AND-INDEXING.md);
- [protocol compatibility, migrations, and conformance](PROTOCOL-LONGEVITY.md);
- [clean-room end-of-life recovery](EOL-RECOVERY-DRILL.md);
- [code and runtime-control proving grounds](TECHNICAL-ARTIFACTS.md).

This map owns the cross-surface inventory. The linked drafts own detail. A
capability is not absent merely because its detailed algorithm remains in a
thematic owner, but every material family should appear here with an authority
boundary and a promotion or deferral path.

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
- model selection, orchestration, model-training active learning, and product
  policy.

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

#### Source-state reconciliation and snapshot completeness

Downstream absence and change analysis needs to know what the connector actually
saw. A candidate source-snapshot algorithm should:

- discover the logical source closure: root object, ordered or paginated
  members, attachments, embedded artifacts, and declared external references;
- acquire an atomic source view where supported, or record start and end
  frontiers, observed version skew, and a bounded completeness claim;
- detect pagination gaps, truncation, concurrent updates, deletions,
  inaccessible members, unsupported members, and interrupted capture;
- distinguish `absent`, `deleted`, `not fetched`, `inaccessible`, `redacted`,
  `unsupported`, and `unknown` instead of collapsing them into missing;
- build source-version lineage and a typed change set without overwriting prior
  snapshots;
- emit a coverage manifest that gap, freshness, and replay algorithms can
  inspect;
- evaluate source authenticity or chain-of-custody claims separately from byte
  integrity.

A partial crawl must never masquerade as evidence that the source lacked an
object. The exact portable boundary of a `SourceSnapshot` remains a profile and
adapter question.

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

#### Locator correctness versus semantic grounding

Evidence alignment has two independent dimensions. A selector may point to the
right bytes while the selected material fails to support a candidate's claimant,
negation, unit, condition, temporal scope, or other qualifier. Candidate
grounding algorithms should therefore:

- align every material proposition field to evidence that states, supports,
  challenges, mentions, or merely contextualizes it;
- represent joint grounding across non-contiguous spans and source versions;
- detect qualifiers or argument roles that fall outside the selected evidence;
- retain alternative alignments and explicit unsupported fields;
- distinguish quotation, paraphrase, translation, inference, and summary;
- re-evaluate grounding after an OCR, parser, transcription, or extractor
  change.

Semantic grounding remains an attributable assessment. Even complete grounding
does not prove that the source is correct or that the proposition is true.

#### Revision-aware source reprocessing

When a source changes, reprocessing should match old and new fragments, classify
spans as surviving, moved, changed, deleted, or unresolved, and reuse only
results whose input identity and deterministic conditions are still valid. It
must not retarget an old `EvidenceSpan` to new bytes. Canonically retained
analyses may become stale and should receive explicit invalidation or
supersession candidates; disposable projections can be recomputed. A comparison
between extraction runs should explain candidate additions, removals, and field
changes instead of presenting an opaque model delta.

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
- model-training active-learning selection of examples whose review would most
  improve later proposals.

#### Interpretation lifecycle and assertion construction

Extraction should not jump directly from text fragments to an already coherent
revision history. Candidate construction algorithms need to preserve the
transitions among a proposition, its concrete occurrence, and an attributed
assertion revision:

- retain who stated what, where, when, and in which words before normalization;
- distinguish a normalized proposition from each occurrence and evidence chain;
- resolve direct statement, quotation, copy, paraphrase, translation, and
  multi-hop attribution without assigning the claim to the ingesting system;
- preserve alternative decompositions of conjunctions, disjunctions,
  conditions, quantifiers, and nested reports;
- classify a new occurrence as independent testimony, copied repetition,
  restatement, clarification, correction, supersession, or claimant withdrawal;
- restrict revision lineage to an evidenced claimant and claim lifecycle rather
  than treating every changed document as an authorial revision;
- retain ambiguous and rejected construction candidates and their reasons;
- keep candidate-retention, `Assessment`, and `AcceptanceDecision` operations
  separate.

The output may be a proposed occurrence-to-proposition mapping or revision
relation. A heuristic must not rewrite canonical assertion history merely to
make later text appear consistent.

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

Identity workflows should also retain explicit non-match and `cannot-link`
decisions, their scope, evidence, and expiry conditions. Otherwise a rejected
false merge will be repeatedly proposed and may reappear after model replacement.

#### Predicate and concept resolution

Predicate identity needs its own lifecycle rather than one lexical mapping:

- detect predicate mentions, senses, argument roles, direction, and arity;
- handle inverse, symmetric, qualified, n-ary, and reified relations;
- compare domain, range, unit, cardinality, type, temporal, and context
  constraints;
- distinguish equivalence from broader, narrower, conditional, partial,
  one-to-many, and explicitly lossy mappings;
- scope every mapping to vocabulary/profile versions and applicability
  conditions;
- create a local unresolved predicate candidate instead of forcing alignment;
- retain evidence, alternatives, reviewer decisions, and impact previews;
- invalidate affected contradictions, classifications, derived views, and
  queries after a mapping changes.

Concept and predicate normalization may improve access without making the mapped
vocabularies globally identical.

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

#### Deterministic protocol and cryptographic mechanics

Where exact interoperation is required, candidate Zone 1/2 responsibilities
also include:

- strict parsing and value-model validation, including duplicate-key,
  Unicode, number, timestamp, and unknown-material behavior;
- lossless parse/serialize round trips and explicit conversion from authoring
  forms to any canonical form;
- domain-separated canonicalization and digest inputs so the same bytes cannot
  be confused across object roles;
- digest agility, collision handling, and multi-digest transition maps;
- signature-envelope construction and cryptographic verification, separately
  from trust, timestamp, key-expiry, revocation, and purpose policy;
- profile dependency closure and version-constraint solving across
  preserve/read/validate/apply/refuse capability modes;
- stable diagnostic identifiers and deterministic error locations where the
  specification promises them;
- staged durable commit, compare-and-swap ref publication, interrupted-write
  recovery, and orphan detection where a repository profile standardizes these
  observable guarantees;
- resumable or rollback-safe migration execution with per-record mappings and
  declared loss.

A valid signature proves only the claimed origin and integrity under its
validation context. It does not establish epistemic correctness or acceptance.

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

Each projection generation also needs an operational publication protocol:

- validate a manifest of canonical horizon, profile and policy versions,
  algorithm/model identity, parameters, and dependency generations;
- reconcile source watermarks and detect skipped or duplicated updates;
- build into an isolated generation, checkpoint or safely discard interrupted
  work, and verify completeness before exposure;
- atomically select the new generation while retaining a rollback target;
- define stale-read behavior during rebuild and mixed-generation refusal rules;
- compare clean and incremental results under the same declared semantics;
- support shard repartition, compaction, and model replacement without allowing
  index-local identity to leak into canonical references.

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

The closed loop additionally requires:

- attributable `ExpectationCandidate` induction from repeated workflows,
  schemas, peer cases, motifs, competency questions, and episode roles, with
  coverage and selection-bias warnings before an expectation can drive a gap;
- decision-dependency modeling from goals, options, criteria, constraints,
  deadlines, and claim dependencies, followed by sensitivity, robustness, and
  regret analysis without allowing the algorithm to choose for the user;
- dependency-aware multi-step acquisition planning under shared cost, latency,
  privacy, interruption, and risk budgets, with cooldowns, stopping rules, and
  replanning after partial or refused answers;
- answer assimilation that links new evidence to the originating question,
  checks named answer criteria and identity/scope/time, classifies sufficient,
  partial, conflicting, negative, inconclusive, unavailable, or refused
  results, updates attempt costs, reopens dependants, and recomputes affected
  gaps and contradictions.

### 10. Retrieval, chunking, and dossier assembly

This family makes knowledge simple to access without presenting an isolated hit
as sufficient context. Its detailed pipeline is preserved in
[`RETRIEVAL-AND-DOSSIERS.md`](RETRIEVAL-AND-DOSSIERS.md).

It includes query interpretation, hybrid candidate generation, score fusion,
applicability and temporal filtering, counterevidence-aware reranking, graph and
provenance expansion, chunk construction, context-budget optimization, dossier
assembly, traceable summarization, and explicit omission reporting.

It also includes iterative query sessions with attributable relevance feedback,
progressive expansion and stopping, saved-query monitoring, and semantic dossier
diffs that explain added, removed, revised, newly accepted, newly disputed, or
newly inaccessible material without leaking authorization-protected existence.

### 11. Experience, causality, mechanisms, and transfer

This family preserves the route by which knowledge was learned and makes
structural cross-context reuse possible. Its detailed hypotheses are preserved
in [`EXPERIENCE-CAUSALITY-TRANSFER.md`](EXPERIENCE-CAUSALITY-TRANSFER.md).

It includes episode reconstruction, decision-time replay, anti-hindsight
separation, causal candidate analysis, mechanism abstraction, structural analogy,
role mapping, prospective predictions, safe transfer attempts, and learning from
negative transfer.

The family also includes adaptive practice selection from a learner-evidence
state, staged reveal, spacing and interleaving, near-miss and counterexample
selection, delayed near- and far-transfer evaluation, and calibrated abstention.
Causal work must select a task-specific contract—effect estimation, causal
discovery, root-cause attribution, counterfactual explanation, experiment
design, or transportability—rather than running one generic pipeline. Mechanism
lifecycle algorithms may split, merge, narrow, version, retire, and compose
patterns only as attributable design hypotheses with compatibility checks and a
safe prospective test.

### 12. Observation and measurement processing

Active acquisition can return an observation or measurement, not only another
document. Candidate algorithms should preserve:

- instrument, sensor, procedure, operator, calibration, and environment
  identity;
- observation or sampling time separately from receipt and recorded time;
- sampling frame, selection method, aggregation window, repeated measures, and
  known coverage limits;
- original value and unit alongside any normalized conversion;
- precision, resolution, detection and quantification limits, censored values,
  saturation, missingness, and measurement error;
- raw observations separately from cleaned values, aggregates, features, and
  model-derived metrics;
- chain of custody and transformations from acquisition through interpretation;
- outlier, anomaly, sensor-fault, and drift proposals without deleting or
  silently repairing the original observation;
- uncertainty propagation and sampling-bias diagnostics under a named method.

An observed number is not automatically a proposition about its cause. A
measurement profile should be earned only where domain-independent semantics
remain useful.

### 13. Knowledge derivation, explanation, and repair

GraphTruth may derive a candidate from retained knowledge, but the derivation
must be more explicit than “the model concluded.” Candidate responsibilities
include:

- select an applicable rule, constraint, query, model, or reasoning profile;
- bind inputs only after identity, scope, time, modality, units, and policy are
  compatible;
- support forward, backward, query-driven, abductive, defeasible, probabilistic,
  or constraint reasoning as separately named methods rather than one generic
  inference relation;
- retain a `Derivation` or analysis artifact with exact inputs, rule/model and
  version, ledger horizon, assumptions, intermediate steps where available,
  uncertainty, and producer;
- compute minimal support or proof sets and preserve alternative derivations and
  counterarguments;
- detect cycles, self-support, double-counted ancestry, and invalid use of a
  generated result as independent evidence;
- remain contradiction-tolerant and prevent unrestricted logical explosion;
- perform dependency-aware truth maintenance when an input, identity mapping,
  rule, policy, or evidence state changes;
- propose minimal repair sets—re-scope, split identity, revise mapping, withdraw
  a derivation, or request evidence—with downstream impact preview;
- explain why a candidate follows, fails, or remains undecidable under the named
  method.

A derivation may be canonical for audit and still remain an unaccepted inferred
candidate. Sound deterministic rule profiles may later have conformance vectors;
abduction, repair ranking, and model reasoning normally remain Zone 3.

### 14. Ontology, domain, classification, and generated-view induction

The detailed owner is
[`ONTOLOGY-AND-DOCUMENT-VIEWS.md`](ONTOLOGY-AND-DOCUMENT-VIEWS.md). The family
includes:

- terminology, definition, predicate, synonym, and relation candidates;
- polysemy, homonymy, abbreviation, and multilingual-sense resolution;
- attributed multi-membership and named-domain-view construction;
- clustering, community, facet, hierarchy, polyhierarchy, and concept-lattice
  candidates;
- stable concept and view identity across rename, split, merge, and retirement;
- domain/range, cardinality, disjointness, satisfiability, definition-cycle, and
  competency-query checks;
- minimal ontology repair proposals with semantic and navigation impact preview;
- active selection of ambiguous classifications for review;
- view dependency extraction, citation verification, circularity prevention,
  invalidation, and clean rebuild;
- evaluation on real navigation and query tasks, not only clustering scores.

Inferred organization remains a view or candidate until an attributed decision
accepts it for a purpose. It must not silently enlarge the universal core.

### 15. Review, assessment, and acceptance workflow

Automation may organize review and execute explicitly authorized policy
mechanics without silently supplying human judgment or acceptance authority.
Candidate workflow algorithms include:

- construct review queues by ambiguity, downstream impact, severe-error risk,
  staleness, representativeness, and bounded information value;
- select samples for audit, calibration, disagreement analysis, and model
  comparison without treating unreviewed material as negative labels;
- assign or route work according to actor authorization, competence, conflicts
  of interest, privacy, and workload policy;
- assemble balanced review dossiers with exact evidence, counterevidence,
  alternatives, uncertainty, provenance dependence, and affected records;
- record candidate-retention decisions, `Assessment`, and policy-scoped
  `AcceptanceDecision` as different operations;
- validate actor, target revision, policy and version, purpose, decision time,
  and revocation authority;
- preserve independent and conflicting reviews rather than manufacturing
  consensus;
- support escalation or adjudication as another attributable decision, not an
  overwrite;
- preview downstream effects of merge, split, mapping, acceptance, revocation,
  redaction, or policy change;
- explain which records a supplied policy included or excluded and why.

Scores may prioritize review. They must never become implicit acceptance.

### 16. Vault, exchange, synchronization, and recovery

The physical design space is owned by
[`STORAGE-AND-INDEXING.md`](STORAGE-AND-INDEXING.md), longevity by
[`PROTOCOL-LONGEVITY.md`](PROTOCOL-LONGEVITY.md), and recovery by
[`EOL-RECOVERY-DRILL.md`](EOL-RECOVERY-DRILL.md). Candidate algorithms include:

- stage objects and blobs, verify references, publish an atomic commit manifest,
  compare-and-swap a ref, and recover or inventory orphaned work;
- compute reachable-set inventories and retention-aware garbage-collection
  candidates without deleting audit, legal-hold, or publication dependencies;
- create consistent snapshots and incremental backups, scrub integrity, select
  a usable restore point, and verify restored semantic horizons;
- compute disclosure-scoped export closure, enumerate omitted or unavailable
  dependencies, pack a self-describing bundle, and verify its manifest;
- quarantine an import, resolve protocol/profile support offline, validate
  integrity and signatures, map identifier collisions without silent identity
  merges, preserve provenance, and integrate atomically or refuse;
- diff archives and publications by semantic record identity and lifecycle, not
  merely filesystem paths;
- bootstrap a minimal reader, rebuild exact projections, regenerate heuristic
  access with declared differences, and verify human-readable fallback.

Multi-writer and federation algorithms—lease or CAS coordination, commit-DAG
ancestry and merge bases, semantic conflict preservation, replicated-set
reconciliation, partial replication, namespace/capability negotiation, and
distributed recorded-order semantics—are explicitly deferred. They remain in
the inventory so a single-writer v0 does not accidentally make them impossible.

### 17. Security, privacy, access, and disclosure lifecycle

Security must operate over canonical records, every projection, model context,
tool call, log, backup, and publication. Candidate responsibilities include:

- authenticate claimed actors, tools, sources, and execution identities while
  keeping authentication distinct from epistemic trust;
- evaluate versioned access and capability policy before retrieval, traversal,
  transformation, disclosure, model invocation, acquisition, or external action;
- enforce object-, field-, span-, edge-, and purpose-level authorization without
  leaking protected existence through counts, scores, embeddings, graph paths,
  caches, errors, or timing where the threat model requires it;
- propagate sensitivity, provenance, license, consent, retention, and disclosure
  labels through derivations and materializations;
- minimize data sent to providers and select only authorized local or remote
  execution routes;
- schedule retention, expiry, legal or audit holds, redaction, and erasure under
  explicit authority, with conflict reporting rather than silent policy choice;
- trace deletion and redaction closure through canonical references, indexes,
  caches, prompts, logs, backups, exports, and publications, then verify residue
  and record unavoidable evidence unavailability;
- manage encryption, key rotation, revoked or expired keys, and cryptographic
  erasure without equating key loss with successful semantic deletion;
- scan or quarantine secrets, malware, prompt injection, poisoned artifacts,
  and unsafe generated instructions;
- produce privacy-safe diagnostics and audit records that do not restate the
  forbidden material.

Portable privacy semantics require dedicated threat modeling and RFCs. Local
policy, key custody, and disclosure UX remain Zone 3 unless independent
interoperation proves otherwise.

### 18. Runtime orchestration, observability, and resource governance

The default implementation needs algorithms that keep every preceding family
bounded and recoverable:

- plan dependency-aware job DAGs and maintain leases, idempotency keys,
  checkpoints, retries, cancellation, and dead-letter state;
- apply backpressure, admission control, rate limits, priorities, fairness,
  deadlines, and per-capability concurrency limits;
- enforce token, model, network, storage, latency, energy, and monetary budgets;
- batch and coalesce work without crossing authorization or snapshot boundaries;
- select providers or local implementations and use circuit breakers, failover,
  load shedding, and degraded modes with explicit semantic limitations;
- monitor queue lag, watermarks, projection generation, stale dependencies,
  error budgets, integrity scrubs, health, and service-level objectives;
- trace a result across capture, canonical commit, analysis, projection, query,
  and action while protecting sensitive payloads;
- estimate capacity and storage amplification and rehearse provider loss,
  process crashes, full disks, corrupted queues, and incident replay.

These are normally Zone 3 operations. Only observable safety or recovery
invariants needed by independent implementations should move toward Zone 1.

### 19. Feedback, evaluation, and lifecycle management

Algorithms improve only if corrections and failures become durable evidence
about their behavior.

Candidate tasks include:

- distinguish exposure, impression, open, dwell, save, citation, use, agreement,
  correction, action, outcome, and explicit assessment as different feedback
  events; none is a context-free truth label;
- tie feedback to the exact query, dossier generation, ranking position,
  visible alternatives, policy, and decision context that elicited it;
- diagnose exposure, position, selection, survivorship, automation, and
  non-response bias before using implicit behavior for training or evaluation;
- convert reviewed false positives, false negatives, corrections, and ambiguous
  cases into evaluation fixtures where privacy permits;
- maintain public synthetic fixtures separately from private dogfood corpora;
- version datasets, splits, prompts, policies, graders, and benchmark horizons;
  detect train/test, temporal, and source-lineage leakage;
- preserve reviewer disagreement, adjudication, and changed guidance rather than
  overwriting a label with the latest consensus;
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

### P3 — Close the active knowledge-acquisition loop

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

### P5 — Earn ontology and generated views

- Compare named views, facets, clustering, typed vocabularies, and Formal
  Concept Analysis on the same corpus and navigation tasks.
- Preserve inferred membership, hierarchy, labels, and repairs as attributable
  candidates.
- Rehearse concept/view rename, split, merge, retirement, invalidation, and
  semantic before/after comparison.
- Verify generated pages cite canonical dependencies, cannot self-confirm, and
  become stale deterministically.
- Promote only the minimum portable view or vocabulary semantics demonstrated by
  independent consumers. See `GT-D038`–`GT-D041` in the
  [design backlog](DESIGN-BACKLOG.md).

### P6 — Close cross-cutting algorithm contracts

This is an inventory bucket, not a promise to implement every item after P5.
Each capability should be pulled earlier only when its dependency or a real
failure requires it. The cross-document task index is `GT-D042`–`GT-D055` in the
[design backlog](DESIGN-BACKLOG.md).

- Test source-snapshot completeness, semantic evidence grounding, assertion
  construction, predicate resolution, and measurement return paths.
- Test derivation invalidation and repair explanations before adding a general
  reasoner.
- Exercise human review boundaries and policy-scoped acceptance without
  score-based authority.
- Prove disclosure-scoped export/import, redaction/erasure closure, and clean
  recovery across every retained copy.
- Add bounded scheduling, observability, and resource enforcement before
  background enrichment becomes operationally important.
- Keep multi-writer synchronization and federation deferred until a second
  writer or independent corpus supplies evidence.

## Cross-cutting failure corpus

The evaluation corpus should deliberately include:

- duplicate and out-of-order capture;
- a paginated or concurrently changing source reported as a complete snapshot;
- mutable or redacted evidence;
- a byte-valid evidence span that does not ground a material claim qualifier;
- lost negation and wrong attribution;
- a copied occurrence incorrectly turned into an authorial assertion revision;
- ambiguous identity and a false merge;
- a forced predicate mapping that changes arity, scope, or meaning;
- copied sources masquerading as corroboration;
- a circular or stale derivation presented as independent support;
- different scopes or times masquerading as contradiction;
- confidence that is high but miscalibrated;
- prompt injection or policy instructions inside source content;
- stale indexes after revision, split, or redaction;
- retrieval that omits decisive counterevidence;
- a fluent answer unsupported by its evidence;
- a gap inferred from absence without an expectation;
- an acquired result that is never assimilated into the originating question;
- an unsafe or privacy-violating acquisition suggestion;
- an incomplete import accepted atomically or an export leaking a dependency
  outside its disclosure scope;
- a cryptographically valid signature from an untrusted, expired, or revoked
  context presented as trustworthy knowledge;
- a stale or incomplete projection generation selected as current;
- redacted material surviving in an embedding, cache, log, backup, or
  publication;
- a non-idempotent retry, exhausted budget, or missing backpressure duplicating
  work or external action;
- a transformed measurement losing its original value, calibration, censoring,
  or sampling context;
- a click or fluent answer treated as an acceptance or correctness label;
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
13. What completeness claim can a source adapter make across pagination,
    attachments, concurrent change, and inaccessible members?
14. Which semantic-grounding relationships and assertion-construction steps are
    portable enough for profiles rather than local analysis?
15. Which derivation classes require interoperable proof semantics, and how is
    contradiction-tolerant invalidation specified?
16. What authorization and disclosure-policy semantics, if any, must be portable
    without exposing protected existence?
17. How do redaction, required erasure, audit retention, publications, backups,
    and legal or policy holds interact without a hidden winner?
18. What trust, timestamp, revocation, and algorithm-upgrade context is required
    to interpret historical signatures?
19. What minimum import/export contract preserves dependency closure,
    identifier conflicts, provenance, and explicit omissions?
20. Which operational invariants—idempotency, atomic generation selection,
    budgets, or recovery—belong in supported runtime claims?
21. What future evidence would justify multi-writer ordering, merge, replication,
    or federation semantics?
