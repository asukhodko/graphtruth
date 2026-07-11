# Retrieval, Knowledge Chunks, and Dossiers

> **Status:** Recovered design context — non-normative
>
> **Captured:** 2026-07-11
>
> **Authority / Promotion:** This draft records access goals, candidate
> algorithms, and evaluation hypotheses. It does not define a ranking function,
> query language, chunk format, or portable dossier profile. Promote portable
> behavior only through an RFC and the versioned specification, with schemas and
> conformance fixtures where interoperability requires them.

## Purpose

Finding one relevant fragment is not the same as recovering enough knowledge to
reason or act. GraphTruth should make discovery simple while returning the
evidence, history, disagreement, uncertainty, applicability, and open questions
that keep a hit from being interpreted in a vacuum.

The authoritative file-first and bounded-authority constraints are documented in
[`ARCHITECTURE.md`](../ARCHITECTURE.md) and
[`PRINCIPLES.md`](../PRINCIPLES.md). Terms such as `KnowledgeChunk`, `Dossier`,
`Index`, and derived view are defined in
[`GLOSSARY.md`](../GLOSSARY.md). The roadmap for a first complete access loop is
in [`ROADMAP.md`](../ROADMAP.md).

This draft preserves implementation hypotheses. Full-text, vector, graph, and
other named techniques are complementary candidates, not protocol commitments.

## Distinctions to preserve

### Canonical record

A durable event, evidence selector, assertion revision, assessment, acceptance
decision, question, or profile record. It remains independently inspectable and
is not optimized solely for one model context window.

### Search hit

A locator or scored match produced by one access path. It may be useful for
navigation, but it normally lacks enough context to support an answer.

### Knowledge chunk

A bounded derived unit assembled for indexing, retrieval, display, or model
consumption. It can combine local context and pointers to several records, but it
remains rebuildable and traceable. Chunk boundaries and text are not evidence
identities.

### Dossier

A query-specific assembly that restores material needed to interpret or act on
the retrieved knowledge: claims, exact evidence, provenance, scope, time,
revisions, support, counterclaims, uncertainty, questions, experience,
mechanisms, and applicability boundaries. A dossier can be incomplete; that
limit must be visible.

### Answer or summary

A further derived interpretation over a dossier. Fluency does not expand its
support boundary. It should identify its query, policy, time horizon, canonical
dependencies, transformation, and material omissions.

### Index

A rebuildable access structure containing locators and derived features. It may
make traversal or ranking practical, but no essential claim, decision, evidence
reference, or historical state may live only in it.

## Access goals

The runtime should eventually support several access modes without forcing a
user to know where or how an item was stored:

- exact lookup by stable record, artifact, or evidence identifier;
- source-centered navigation from artifact to spans and interpretations;
- entity-centered lookup across aliases, time, assertions, and events;
- assertion-centered “what supports or challenges this?”;
- provenance-centered “where did this come from?”;
- timeline and “what changed?” reconstruction;
- decision-time “what was visible in this ledger then?” reconstruction;
- current policy- and time-scoped fact views;
- contradiction and competing-interpretation exploration;
- dark-zone and “what should be learned next?” exploration;
- experience and outcome lookup;
- causal, mechanistic, and “why/how might this work?” lookup;
- cross-context structural analogy and transfer lookup;
- natural-language, structured, faceted, and graph-oriented discovery;
- direct descent from any derived result to the smallest available exact
  evidence.

The interface may expose a universal search box, navigation, saved queries,
backlinks, facets, or APIs. Those are replaceable product choices. The durable
requirement is that relevant context remains addressable.

## Retrieval request envelope

A query-specific result should be reproducible enough to explain even when exact
ranking cannot be recreated. Candidate request context includes:

- original query and any structured interpretation;
- actor and access scope;
- recorded-time horizon and valid-time query;
- named acceptance, visibility, ranking, or dossier policy;
- enabled protocol profiles and extensions;
- entity or vocabulary mappings applied;
- requested result type, context budget, and completeness expectations;
- index, embedding, model, and algorithm versions used;
- privacy and disclosure boundaries;
- creation time and warnings about stale or unavailable projections.

This envelope may be transient unless a query or resulting analysis has durable
audit value.

## Candidate retrieval pipeline

### 1. Interpret the request

Candidate tasks include:

- classify intent without discarding the original query;
- recognize entity mentions and preserve ambiguous candidates;
- identify requested predicates, relationships, evidence, or question types;
- extract valid-time, recorded-time, location, scope, modality, and purpose;
- distinguish “what did source X say?” from “what is accepted under policy P?”;
- separate lexical terms from conceptual, structural, or causal constraints;
- expand aliases and vocabulary only with attributable mappings;
- decompose compound questions into linked subqueries;
- identify missing query context that should be asked of the user rather than
  guessed.

Natural-language interpretation may be model-assisted, but a structured query
plan should remain inspectable and correctable.

### 2. Apply authorization before retrieval

Access filtering should occur before material reaches candidate generators,
embeddings, remote services, logs, or model prompts. Late filtering can leak
sensitive existence, terms, vectors, counts, or snippets.

Candidate checks include actor capability, source and field classification,
purpose, retention and disclosure policy, external-service permission, and
whether a result may expose that inaccessible material exists.

### 3. Generate candidates through several access paths

No single channel is sufficient for all query modes.

#### Exact and structural lookup

Stable identifiers, artifact paths, evidence locators, schema fields, and exact
relations provide high-precision access and recovery when language changes.

#### Lexical retrieval

Inverted indexes and field-aware text ranking can preserve rare terms, names,
quoted phrases, numbers, and code that semantic models may blur. Candidate
implementations might use BM25-like or other replaceable lexical ranking.

#### Semantic retrieval

Embeddings or learned retrievers may find paraphrases and conceptually related
material. Their model identity, input representation, access scope, and
rebuildability matter. Semantic similarity alone does not establish identity,
applicability, support, or causation.

#### Graph retrieval

Traversal may follow entity, evidence, provenance, revision, support, dispute,
question, experience, mechanism, and decision relationships. Candidate
operations include bounded neighborhoods, typed paths, reachability, shortest
explanatory paths, and provenance closure.

#### Temporal retrieval

Interval and ordering indexes support valid-time filtering, recorded-time
visibility, timeline assembly, state transitions, and decision-time views.

#### Faceted and profile-specific retrieval

Structured filters can target claimant, source, record role, status, context,
policy, evidence availability, question state, uncertainty, location, or enabled
profile fields.

#### Structural and analogical retrieval

Episode shape, constraints, forces, state transitions, mechanisms, and role
mappings may find useful cross-domain cases missed by text similarity. These are
high-risk proposal engines and should expose mappings and mismatches.

### 4. Normalize and fuse channel scores

Scores from different indexes are not naturally comparable. Candidate strategies
include rank fusion, calibrated score mapping, learned reranking, explicit policy
weights, Pareto selection, or staged high-recall then high-precision retrieval.
Reciprocal-rank-fusion-like methods are possible baselines, not commitments.

Fusion should retain channel provenance so a user can see whether a result was
found by an exact identifier, shared evidence, graph path, text match, embedding,
or structural analogy.

### 5. Filter applicability and temporal state

Candidate relevance is not enough. Before presenting claims together, the
runtime should account for:

- valid-time overlap and uncertainty;
- recorded-time visibility at the requested horizon;
- assertion revision lifecycle;
- context, population, scope, modality, and purpose;
- identity and vocabulary mapping uncertainty;
- applicable `AcceptanceDecision` records when the query requests an accepted
  view;
- required extension support.

A result that fails applicability may still be useful as a contrast or historical
record, but it must be labeled rather than silently mixed with current material.

### 6. Rerank for epistemic usefulness

A dossier seed may use dimensions beyond topical relevance:

- evidence exactness and availability;
- provenance independence and source diversity;
- applicability to the query context;
- temporal freshness and requested historical horizon;
- support and counterevidence coverage;
- uncertainty and disagreement;
- revision significance;
- decision impact;
- novelty and redundancy;
- question and dark-zone relevance;
- mechanism or experience applicability;
- privacy and disclosure cost.

No dimension should silently mean truth. A ranking policy is named and
replaceable. A scalar display may be convenient, but decisive dimensions and
known exclusions should remain inspectable.

### 7. Expand the evidence and relationship neighborhood

Seed hits need context. Candidate expansion steps include:

- exact evidence and source-artifact versions;
- claimant and transformation provenance;
- assertion revision ancestry and current or historical successors;
- attributed support, challenge, and methodological assessments;
- applicable acceptance decisions and named policy;
- related counterclaims and contradiction candidates;
- relevant earlier and later events;
- unresolved questions and dark zones;
- decisions, interventions, observations, and outcomes;
- mechanisms, examples, counterexamples, and transfer attempts;
- applicability conditions and known failure boundaries.

Expansion requires limits to prevent a high-degree entity or provenance ancestor
from consuming the entire context budget.

### 8. Assemble, render, and explain

The final result should state:

- what the query was interpreted to mean;
- which policy, time horizon, profiles, and access scope were used;
- why each major item was included;
- which exact evidence supports displayed assertions;
- which counterclaims, uncertainty, and questions remain;
- what was omitted because of budget, authorization, unavailability, or
  unsupported semantics;
- how to descend from summaries and chunks to canonical records and evidence.

## Knowledge chunk construction

### Candidate chunking strategies

Chunks may be based on:

- source structure such as section, paragraph, message, table, or record;
- semantic topic or discourse boundary;
- event or conversation boundary;
- temporal window;
- assertion plus its local evidence and qualifiers;
- entity neighborhood;
- experience episode or decision sequence;
- mechanism, causal chain, or transfer attempt;
- query-specific dynamic assembly.

Overlap can preserve dependencies crossing a boundary, but excessive overlap
duplicates evidence and distorts retrieval. Fixed token windows are useful as a
fallback, not a sufficient epistemic model.

### Chunk requirements hypothesis

A useful chunk should retain:

- stable pointers to every contributing canonical record and exact evidence
  span;
- source and transformation provenance;
- boundary method and algorithm version;
- context, time, and applicability carried into the chunk;
- indication of truncation, synthesis, overlap, and omitted qualifications;
- enough structure to prevent a quoted or negated claim from changing meaning;
- access classification derived from all contributing material.

The chunk text, embedding, and ranking features normally remain disposable. A
chunk selected for durable audit could be retained as an attributed analysis
artifact, but that does not turn it into source evidence.

### Chunk failure modes

- separating a claim from negation, claimant, condition, or time;
- mixing incompatible revisions or contexts;
- losing the link to exact evidence;
- copying restricted content into a less protected vector store;
- treating fixed-size boundaries as semantic boundaries;
- overlapping chunks inflating apparent corroboration;
- stale chunks surviving a source redaction or identity split;
- model-oriented compression hiding material uncertainty.

## Dossier assembly

### Candidate dossier sections

A query-specific dossier may include:

1. interpreted question, scope, policy, and time horizon;
2. concise orientation with an explicit support and completeness boundary;
3. relevant assertion revisions and their claimants;
4. exact supporting and counterevidence;
5. provenance and transformation history;
6. revision, decision, and event timeline;
7. attributed assessments and applicable acceptance decisions;
8. contradiction and competing-interpretation candidates;
9. unresolved questions and dark zones;
10. relevant experience episodes and outcomes;
11. causal claims, mechanisms, assumptions, and alternatives;
12. applicability conditions, important mismatches, and failure boundaries;
13. omitted, unavailable, redacted, or unauthorized material;
14. retrieval explanation and canonical locators.

Not every query needs every section. A dossier profile or policy should determine
which omissions are harmless and which make the result incomplete for purpose.

### Candidate assembly algorithm

1. Fix query interpretation, actor, access scope, policy, profiles, and time.
2. Retrieve high-recall seeds through complementary channels.
3. align entities, vocabulary, context, units, and temporal state;
4. select a diverse set of relevant assertion and event seeds;
5. expand exact evidence, provenance, revision, support, and counterclaim
   neighborhoods;
6. add decision-relevant contradictions, gaps, and open questions;
7. add applicable experience, mechanism, causal, and transfer material;
8. identify missing mandatory context and unavailable dependencies;
9. allocate context budget across evidence, history, disagreement, and
   applicability rather than topical relevance alone;
10. order material by explanatory role, evidence relationship, or timeline;
11. produce traceable compression only where needed;
12. verify every material statement against included canonical dependencies;
13. report omissions, uncertainty, unsupported extensions, and retrieval
    limitations;
14. emit canonical locators and the algorithm or policy provenance.

### Context-budget optimization

The runtime must often fit a large knowledge neighborhood into a human display or
model context. Candidate approaches include constrained optimization,
submodular selection, diversity-aware ranking, maximal marginal relevance,
cluster representatives, graph summarization, staged expansion, and explicit
quotas for counterevidence or independent provenance.

The objective is not merely maximum similarity. A useful budget policy may
balance:

- question coverage;
- exact evidence coverage;
- independent support;
- material counterclaims;
- revision and temporal context;
- applicability boundaries;
- unresolved uncertainty;
- diversity without redundancy;
- explanation cost and user attention;
- privacy and disclosure limits.

Any compression should identify the material left outside the budget and permit
progressive expansion.

## Traceable summaries and answers

A summarizer may help orient the user, but it should not become the sole retained
knowledge. Candidate safeguards include:

- generate from an authorized dossier rather than unconstrained corpus search;
- attach canonical support locators to material propositions;
- distinguish source report, system synthesis, policy-accepted view, and open
  question;
- preserve negation, scope, time, claimant, uncertainty, and disagreement;
- refuse unsupported synthesis or label it as a hypothesis;
- include decisive counterevidence and not only majority material;
- make policy, recorded-time horizon, model, prompt, and creation time visible;
- test entailment or support as a diagnostic, not an authority;
- state incompleteness caused by budget, access, redaction, or unsupported
  extension;
- allow descent from the answer to dossier, records, and exact evidence.

## Index portfolio and maintenance

### Projection families

A default runtime may choose an index portfolio rather than one universal
database:

- exact identifier and artifact catalog;
- full-text and fielded lexical search;
- graph projection for typed relationships and traversal;
- temporal interval and ledger-order lookup;
- entity, alias, and vocabulary lookup;
- provenance and revision dependency lookup;
- vector or learned semantic retrieval;
- contradiction, question, and gap work queues;
- episode, mechanism, and structural analogy retrieval;
- cached dossier fragments or materialized views.

The canonical file corpus remains the reconstruction source. A graph database is
optional even though the logical data forms a graph.

### Incremental maintenance

Candidate maintenance algorithms include:

- tail or manifest-based change detection;
- idempotent projection updates;
- dependency-driven invalidation;
- revision, merge, split, and redaction propagation;
- stale embedding detection after model or source change;
- background rebuild and atomic generation switching;
- per-index checkpoints and recovery;
- canonical-to-index consistency sampling;
- full clean rebuild and result-semantic comparison;
- removal verification for access and deletion obligations.

Historical scores and embeddings need not reproduce byte-for-byte. A rebuild
must preserve whatever documented access semantics the implementation claims,
and it must report changed model-dependent behavior.

## Privacy and security

- Index only material authorized for that projection and operator.
- Treat embeddings and derived features as potentially sensitive copies.
- Do not send queries, chunks, or corpus context to a remote model without an
  explicit disclosure policy.
- Prevent source content from changing retrieval policy or granting tool
  capabilities.
- Keep existence leakage, snippets, counts, facets, autocomplete, logs, and
  timing side channels in the access model.
- Propagate redaction, retention, merge, split, and access changes to every
  dependent projection.
- Mark partial results caused by authorization without revealing protected
  details.
- Separate retrieval from authority to message, purchase, publish, or act.

## Retrieval failure modes

- exact rare terms disappear under semantic similarity;
- lexical match misses paraphrase or structural analogy;
- embedding proximity is treated as support or identity;
- recent or popular sources crowd out applicable evidence;
- copied sources dominate ranking as apparent corroboration;
- different time, context, or modality is mixed into one answer;
- counterevidence is omitted to maximize coherence;
- a revision is shown without the corrected historical state or vice versa;
- high-degree graph nodes create irrelevant context explosion;
- a dossier fills the token budget before including exact evidence;
- policy-accepted and merely asserted material are rendered identically;
- stale index entries survive correction or redaction;
- access control is applied after a remote embedding or model call;
- a fluent answer hides an empty, weak, or incomplete support set;
- cross-domain analogy hides material mismatches and causes negative transfer.

## Evaluation framework

### Candidate relevance metrics

- recall at a budget for exact, lexical, semantic, graph, and hybrid paths;
- precision, reciprocal rank, discounted cumulative gain, or task-specific
  ranking measures;
- entity, temporal, scope, and policy filter correctness;
- retrieval latency and index freshness.

These standard measures are necessary but insufficient.

### Candidate epistemic metrics

- exact evidence coverage for displayed assertions;
- provenance traceability and independent-source diversity;
- counterevidence and competing-interpretation coverage;
- revision and temporal-state correctness;
- applicability-boundary presence;
- question and dark-zone coverage where decision-relevant;
- dossier completeness against a declared profile;
- unsupported statement and citation-misalignment rate;
- explicit omission and unavailable-evidence reporting;
- user effort to reach exact evidence or correct a result.

### Candidate resilience metrics

- clean rebuild completeness and time;
- incremental-to-clean index equivalence for specified semantics;
- behavior after removing or replacing an embedding or inference provider;
- stale projection rate after revision, merge, split, migration, and redaction;
- access-control and deletion leakage tests;
- comparison of old and replacement algorithms on fixed fixtures;
- usefulness when vector or graph indexes are unavailable.

### Dogfood evidence

The most meaningful early test is whether contextual retrieval repeatedly
recovers forgotten, conflicting, or decision-relevant knowledge that ordinary
search missed, while keeping evidence inspection and correction cheap. Record
both successful discoveries and cases where the dossier was noisy, misleading,
or incomplete.

## Algorithm replacement hypothesis

Retrieval is likely to change faster than canonical semantics. A possible
replacement process is:

1. Freeze representative queries, relevance judgments, exact-evidence checks,
   counterevidence expectations, and privacy fixtures.
2. Record old and new index, embedding, model, prompt, and policy versions.
3. Build a new generation from the same authorized canonical snapshot.
4. Shadow-run both pipelines and compare not only rank metrics but temporal,
   provenance, counterevidence, omission, and access-control behavior.
5. Review material disagreements and severe regressions manually.
6. Switch the named runtime policy or index generation atomically.
7. Roll back by selecting or rebuilding the prior projection, without changing
   canonical history.
8. Preserve a historical dossier only when it mattered for audit or a decision;
   otherwise retain sufficient run provenance and allow the result to expire.

Model-specific vectors, index-internal identifiers, and proprietary rank scores
must not become the only route to durable knowledge.

## Zone placement hypothesis

### Zone 1 candidates

- addressability of records, evidence, provenance, time, questions, and profile
  material required to build a dossier;
- semantics of policy- and time-scoped views;
- a possible portable dossier envelope, completeness signal, and canonical
  locators if interoperability demonstrates a need;
- preservation and safe refusal for unsupported required extensions.

### Zone 2 candidates

- exact lookup, temporal and revision reconstruction, provenance closure, and
  deterministic rendering of specified fields;
- conformance fixtures for a future portable dossier profile;
- archive and projection rebuild validation.

### Zone 3 candidates

- query understanding and decomposition;
- all index technology, embedding, candidate generation, fusion, ranking, and
  context-budget policy;
- chunk boundary selection;
- query-specific dossier selection and traceable summarization;
- UI, API, cache, and operational scaling choices.

## Dependency-oriented work

### P0

- Build a synthetic retrieval corpus with revision, time, copied provenance,
  counterevidence, ambiguous identity, redaction, and a cross-domain analogy.
- Define query modes, support boundaries, severe failure cases, and a candidate
  retrieval-run envelope.

### P1

- Implement exact identifier, lexical, basic graph, and temporal lookup.
- Render a deterministic dossier from manually curated seeds.
- Verify descent to exact evidence and a clean rebuild from files.

### P2

- Add semantic candidate generation, score fusion, applicability filtering, and
  query-specific context selection.
- Measure counterevidence, temporal, provenance, and correction failures in
  dogfood.

### P3

- Add question, dark-zone, episode, and mechanism-aware retrieval.
- Exercise privacy-safe provider replacement and shadow index rebuilds.
- Experiment with budget optimization and traceable summaries.

### P4

- Add structural analogy and transfer retrieval with explicit role mapping and
  mismatch display.
- Consider a portable dossier profile only after multiple consumers demonstrate
  stable common needs.

## Open design questions

1. What are the minimum access modes for the first complete personal loop?
2. What information belongs in a portable dossier versus a runtime query result?
3. How should a dossier declare completeness, authorization-limited coverage,
   unsupported extensions, and budget omissions?
4. Which canonical locators and provenance paths must every chunk retain?
5. How should chunks preserve scope, negation, attribution, and time across
   source boundaries?
6. How should hybrid scores be explained without promising comparability they do
   not have?
7. What counterevidence or source-diversity guarantees should a dossier policy
   provide?
8. How can decision-time retrieval state its limits without implying complete
   knowledge of what a person knew?
9. Which query and dossier artifacts deserve canonical retention?
10. How are access controls enforced across text, graph, vector, cache, logs, and
    remote model contexts?
11. What semantic equivalence is required when a projection is rebuilt using a
    different model?
12. Which evaluation set and severe-error budget gates replacement of a
    retrieval algorithm?
