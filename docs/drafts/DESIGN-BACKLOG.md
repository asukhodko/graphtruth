# Recovered design backlog

> **Status:** Recovered design context — non-normative backlog.
> **Captured:** 2026-07-11.
> **Expanded:** 2026-07-12 after the cross-surface algorithm completeness
> review and the continuous domain-topology design in Issue #8.
> **Authority:** The identifiers below organize ideas; they are not accepted
> roadmap commitments or protocol requirements.
> **Promotion:** Create a focused Issue or Draft RFC only when its prerequisite
> evidence exists. Follow [the development process](../DEVELOPMENT.md).

## Why keep a backlog in the repository

The foundation RFC lists the important semantic questions, but a flat list can
hide dependencies and cause an attractive late-stage idea to be implemented
before its substrate exists. This draft converts recovered discussion into a
dependency-ordered investigation map.

It is intentionally broader than the active roadmap. The project WIP limit is
still one major hypothesis or feature. Preservation is not prioritization.

## Task record convention

When promoting an item, retain at least:

- **Evidence needed:** the real workflow, failure, invariant, or comparison that
  justifies work now.
- **Deliverable:** the smallest durable result of the investigation.
- **Exit evidence:** what would support keep, revise, remove, or RFC promotion.
- **Dependencies:** prior questions or capabilities that must be stable enough.
- **Stop condition:** evidence that the idea is premature, harmful, or not worth
  its complexity.
- **Zone and authority:** whether the output is a protocol proposal, reference
  tool, or replaceable runtime experiment.

## Dependency outline

```text
synthetic golden journeys
  ├─ minimal record envelope
  │    ├─ identity and evidence addressing
  │    ├─ serialization and canonicalization
  │    ├─ revision and bitemporal reduction
  │    └─ policy-scoped acceptance
  ├─ generic candidate/analysis provenance envelope
  └─ privacy and threat model

source capture + exact evidence
  └─ source snapshot reconciliation
       └─ field-level semantic grounding
            └─ assertion occurrence/revision construction
                 └─ predicate and vocabulary resolution

minimal deterministic ledger slice
  ├─ exact projections and rebuild verification
  ├─ baseline retrieval and dossier
  ├─ correction and migration
  ├─ independent minimal reader
  ├─ review/assessment/acceptance workflow
  ├─ provenance-aware derivation and repair
  └─ archive exchange and recovery
       ├─ redaction/erasure closure
       └─ protocol/crypto conformance

baseline retrieval + expectations + questions
  ├─ structural contradictions
  ├─ expectation-relative dark zones
  ├─ active acquisition
  │    └─ measurement return + answer assimilation
  │         └─ decision sensitivity + adaptive planning
  └─ domain representation bake-off
       ├─ continuous topology and structural-shock rehearsal
       └─ generated-view invalidation
            └─ code-domain pressure test

experience episodes + prospective predictions
  └─ causal claim profile
       └─ mechanism patterns
            └─ cross-context transfer attempts

operational need
  └─ bounded runtime orchestration

observed second writer or independent corpus
  └─ deferred multi-writer/federation pressure test
```

## P0 — earn the first durable record

### GT-D001 — Representative synthetic golden journeys

- **Evidence needed:** major invariants cannot be made concrete without complete
  examples.
- **Deliverable:** a small public corpus covering source capture, exact evidence,
  extraction candidate, correction, disagreement, question, policy-specific
  acceptance, time travel, redaction boundary, and a clean rebuild.
- **Exit evidence:** every proposed base record field is exercised; at least one
  negative fixture exists for each machine-testable invariant.
- **Stop condition:** examples require a universal ontology or private data;
  reduce the domain and synthesize the case.
- **Dependencies:** none.
- **Active experiment:** [Issue #6](https://github.com/asukhodko/graphtruth/issues/6)
  uses a future-reveal private pilot and a separately authored synthetic twin to
  discover the smallest honest journey before any normative promotion.

### GT-D002 — Minimal record and bundle envelope

- **Evidence needed:** GT-D001 exposes which metadata every record needs.
- **Deliverable:** candidate envelope fields for record ID, type, protocol and
  profile versions, producer, recorded time, provenance, extension declarations,
  integrity metadata, and payload.
- **Exit evidence:** two substantially different record roles fit without
  special hidden fields; unknown optional material round-trips.
- **RFC trigger:** any envelope intended for interoperation.
- **Dependencies:** GT-D001.

### GT-D003 — Source artifact and EvidenceSpan addressing

- **Evidence needed:** exact traceability must survive source versions,
  transcoding, OCR, and representation changes.
- **Deliverable:** compare byte ranges, line/column ranges, selectors, anchors,
  structural paths, content hashes, and W3C Web Annotation-style selectors.
- **Exit evidence:** a span can be verified against the retained source version;
  transformation coordinate maps remain attributable.
- **Stop condition:** one universal selector becomes more complex than
  media-specific profiles; split the design.
- **Dependencies:** GT-D001, GT-D002.

### GT-D004 — Assigned IDs, content addresses, and reference stability

- **Deliverable:** decision notebook covering UUID-like assigned identities,
  content digests, revision IDs, aliases, merge/split lineage, and algorithm
  agility.
- **Exit evidence:** corrections and entity decisions do not change historical
  references, while identical bytes can still be integrity-checked.
- **RFC trigger:** portable identity semantics.
- **Dependencies:** GT-D002, GT-D003.

### GT-D005 — Serialization and canonicalization spike

- **Deliverable:** implement the same tiny corpus in at least two candidate
  encodings; measure strict parsing, duplicate-key and value-model behavior,
  diffs, streaming, validation, canonical bytes, domain-separated digests,
  round-trip preservation, standard tooling, and static human readability.
- **Candidates:** JSON, JSON Lines segments, JSON-LD/RDF packaging, and readable
  generated Markdown views; YAML is an authoring option, not automatically a
  safe canonical encoding.
- **Exit evidence:** a second reader can reproduce required semantic results.
- **Stop condition:** format selection is based only on preference rather than
  the golden journeys.
- **Dependencies:** GT-D002–GT-D004.

### GT-D006 — Atomic file-vault publication prototype

- **Deliverable:** immutable objects, validation, content-addressed placement,
  parent-linked commit manifest, compare-and-swap `HEAD`, crash injection, and
  reader snapshot isolation.
- **Exit evidence:** interruption at every write boundary yields the old or new
  valid head, never a partially published canonical view.
- **Alternative:** append-only segments with an atomic manifest instead of one
  file per record.
- **Dependencies:** GT-D002, GT-D005.

### GT-D007 — Generic candidate and analysis provenance envelope

- **Deliverable:** reusable metadata for input snapshot IDs, method/model and
  version, parameters, prompt or policy where relevant, assumptions, output,
  uncertainty dimensions, producer, time, status, and reproducibility limit.
- **Exit evidence:** extraction, conflict detection, ranking, and causal analysis
  can all use it without gaining acceptance authority.
- **Dependencies:** GT-D002.

### GT-D008 — Privacy, retention, and adversarial threat model

- **Deliverable:** data classes, trust boundaries, local/remote processing,
  authentication versus epistemic trust, object/field/span/edge authorization,
  label propagation, inference leakage, prompt injection, poisoning, secret
  handling, minimization, retention/holds, redaction, deletion, key lifecycle,
  derived-store propagation, and privacy-safe audit expectations.
- **Exit evidence:** synthetic abuse cases and a deletion drill expose every
  retained or derived copy.
- **RFC trigger:** any portable privacy, signature, retention, or deletion
  semantics.
- **Dependencies:** GT-D001–GT-D003.

### GT-D009 — Measurement and comparison harness

- **Deliverable:** fixtures and measures for traceability, correction, identity,
  conflict precision, retrieval coverage, counterevidence, question usefulness,
  rebuild integrity, time, and cost; version datasets, splits, prompts, graders,
  and horizons; distinguish exposure, use, correction, acceptance, action, and
  outcome feedback and test position, selection, lineage, and temporal leakage.
- **Exit evidence:** an algorithm or schema change can be compared without using
  node counts, prose volume, or subjective fluency as the success measure.
- **Dependencies:** GT-D001.
- **Active experiment:** [Issue #6](https://github.com/asukhodko/graphtruth/issues/6)
  predeclares corpus horizons, query tasks, baselines, privacy boundaries, and
  trajectory/cost measures for the first local replay harness.

## P1 — smallest executable ledger and access loop

### GT-D010 — Revision graph and bitemporal reducer

- **Deliverable:** candidate semantics and a reference reducer for visibility at
  recorded time, claimed valid intervals, revision branching, supersession,
  withdrawal, and revocation.
- **Exit evidence:** historical views remain stable after later correction;
  uncertain and coarse time fail visibly rather than being invented.
- **RFC trigger:** normative temporal and lifecycle behavior.
- **Dependencies:** GT-D002, GT-D004, GT-D005.

### GT-D011 — Assessment and AcceptanceDecision boundary

- **Deliverable:** examples separating claim lifecycle, evidence assessment,
  named policy, actor, purpose, decision, and revocation.
- **Exit evidence:** two policies can produce different fact views without
  rewriting shared assertions.
- **Dependencies:** GT-D010.

### GT-D012 — Profile and extension negotiation spike

- **Deliverable:** required versus optional semantics, namespaced extensions,
  dependency closure and version constraints, preserve/read/validate/apply/refuse
  capabilities, and explicit failure for unknown mandatory meaning.
- **Exit evidence:** an older reader safely preserves a newer optional payload;
  it refuses a record it cannot interpret safely.
- **Dependencies:** GT-D002, GT-D005.

### GT-D013 — Deterministic validator and diagnostics

- **Deliverable:** Zone 2 reader/validator with stable rule and diagnostic IDs,
  positive/negative fixtures, and offline operation.
- **Exit evidence:** invalid input fails identically enough for independent
  conformance testing without the default runtime.
- **Dependencies:** GT-D002, GT-D005, GT-D010–GT-D012.

### GT-D014 — Exact projection manifest and clean rebuild

- **Deliverable:** locator, reference, provenance, revision, and temporal index
  manifests containing input inventory, watermark, builder version, projection
  schema, privacy scope, freshness, completeness, validation, and rebuild steps;
  build an isolated generation, reconcile watermarks, resume or discard an
  interruption, atomically cut over, retain rollback, and compare clean with
  incremental output.
- **Exit evidence:** deleting all derived state and rebuilding preserves exact
  semantic query results for declared exact projections.
- **Dependencies:** GT-D006, GT-D010, GT-D013.

### GT-D015 — Baseline access and deterministic dossier

- **Deliverable:** exact-ID and lexical retrieval, typed graph expansion,
  provenance/revision closure, counterevidence inclusion, and a readable
  deterministic dossier renderer over a tiny corpus.
- **Exit evidence:** a displayed claim traces to source and policy; known
  omissions are explicit.
- **Dependencies:** GT-D010, GT-D011, GT-D014.

### GT-D016 — Correction, backup, restore, and one migration

- **Deliverable:** correct an extraction and an identity proposal without
  deleting history; back up, restore, migrate one old fixture, and rebuild.
- **Exit evidence:** old decision-time views remain reconstructible; interrupted
  migration is resumable or cleanly rolled back.
- **Dependencies:** GT-D006, GT-D010, GT-D013–GT-D015.

### GT-D017 — Independent minimal reader

- **Deliverable:** a small reader, preferably in a different implementation
  stack, built from the frozen documentation and fixtures rather than runtime
  internals.
- **Exit evidence:** it validates the corpus and produces the same required base
  views.
- **Stop condition:** hidden implementation knowledge is necessary; simplify or
  repair the protocol draft.
- **Dependencies:** GT-D013–GT-D016.

### GT-D018 — Static human fallback

- **Deliverable:** offline generated inventory, timelines, assertion pages,
  evidence links, questions, and integrity report requiring no GraphTruth
  service.
- **Exit evidence:** the archive is useful with a browser or basic text tools.
- **Dependencies:** GT-D014–GT-D016.

## P2 — heuristic enrichment with bounded authority

### GT-D019 — One-source ingestion and evidence-aligned extraction

- **Deliverable:** ingest one or two source types; extract mentions, entities,
  assertions, questions, and relevant times as candidates tied to exact spans.
- **Exit evidence:** corrections are easy, unsupported fields remain unknown,
  and extraction errors cannot self-accept.
- **Dependencies:** P1 ledger slice, GT-D007, GT-D009.

### GT-D020 — Reversible entity resolution

- **Deliverable:** blocking, candidate scoring, merge/split/relink proposal, and
  visible impact preview.
- **Exit evidence:** false merges are measurable and reversible; original IDs
  and evidence survive.
- **Dependencies:** GT-D004, GT-D019.

### GT-D021 — Hybrid retrieval baseline

- **Deliverable:** lexical, vector, graph, and temporal candidate channels;
  attributed fusion and reranking; access filtering before scoring; iterative
  clarification and explicit relevance feedback; saved-query monitoring and a
  semantic dossier diff over changed evidence, policy, analyses, and indexes.
- **Exit evidence:** compare channel ablations against GT-D015 and ordinary
  text search.
- **Dependencies:** GT-D014, GT-D015, GT-D019.

### GT-D022 — Structural contradiction cases

- **Deliverable:** explicit negation, incompatible functional values, unit-aware
  numeric intervals, mutually exclusive classifications, and impossible
  chronology on synthetic fixtures.
- **Exit evidence:** scope, modality, identity, and time mismatch are not falsely
  labeled contradictions.
- **Dependencies:** GT-D010, GT-D020.

### GT-D023 — Expectation-relative dark zones

- **Deliverable:** explicit expectation sources, coverage states, unsupported
  high-impact claims, missing outcomes, stale evidence, unresolved identity, and
  competing hypotheses lacking a discriminator; propose attributable
  `ExpectationCandidate` records from workflows, schemas, peer cases, motifs,
  competency questions, and episode roles with denominator and selection-bias
  warnings before review.
- **Exit evidence:** every reported gap states the expectation it violates and
  distinguishes unknown, absent, inapplicable, redacted, and inaccessible.
- **Dependencies:** GT-D011, GT-D015, GT-D022.

### GT-D024 — Question lifecycle and ranking

- **Deliverable:** smallest answerable questions, prerequisites, answer and stop
  criteria, deduplication, and a replaceable priority policy over impact,
  information gain, answerability, cost, latency, risk, freshness, and privacy.
- **Exit evidence:** dogfood questions lead to useful evidence often enough to
  justify their interruption cost.
- **Dependencies:** GT-D023.

### GT-D025 — Provider and index replacement drill

- **Deliverable:** shadow-run a second extractor or embedding model over fixed
  fixtures and a dogfood slice; compare deltas and rebuild disposable views.
- **Exit evidence:** switching policy changes candidates and ranking without
  rewriting canonical history or model-specific IDs into durable semantics.
- **Dependencies:** GT-D007, GT-D009, GT-D019–GT-D021.

## P3 — active acquisition and specialized adapters

### GT-D026 — Semantic conflict discovery

- **Deliverable:** NLI, LLM, constraint-solver, or hybrid candidate generators
  after deterministic alignment and blocking.
- **Exit evidence:** measurable improvement over structural cases within an
  explicit false-positive budget.
- **Dependencies:** GT-D009, GT-D020, GT-D022.

### GT-D027 — Acquisition-route selection

- **Deliverable:** choose among existing-source retrieval, a human question,
  observation, measurement, source request, or safe experiment proposal; plan
  dependency-aware multi-step or batched acquisition under shared cost, risk,
  privacy, latency, interruption, and human-burden budgets, with replanning and
  stop/abandon rules.
- **Exit evidence:** route selection is explainable, cost/privacy aware, and
  never executes an unauthorized intervention.
- **Dependencies:** GT-D024.

### GT-D028 — Safe experiment proposal

- **Deliverable:** intervention, comparator, measurement, prediction, risk,
  stopping rule, and authorization boundary.
- **Exit evidence:** proposals are actionable and reversible; execution remains
  a separate explicit decision.
- **Dependencies:** GT-D027 and the privacy model.

### GT-D029 — Code and repository adapter

- **Deliverable:** combine source snapshots with AST or symbol index, call/data
  relationships, schema, config, and repository history; keep analyzer output
  attributed and rebuildable.
- **Exit evidence:** improve one troubleshooting or change-specification task
  over text-only retrieval.
- **Dependencies:** GT-D003, GT-D007, GT-D019, GT-D021.

### GT-D030 — Periodic clean-room EOL rehearsal

- **Deliverable:** execute [the EOL recovery drill](EOL-RECOVERY-DRILL.md) in a
  clean environment without current providers or indexes.
- **Exit evidence:** quantified integrity, missing dependencies, rebuild time,
  cost, semantic equivalence, and static usability.
- **Dependencies:** GT-D016–GT-D018, GT-D025.

### GT-D031 — Standards and prior-art mapping

- **Deliverable:** compare GraphTruth needs with W3C PROV and Web Annotation,
  Wikibase statements, nanopublications, JSON-LD/RDF/SHACL, RO-Crate, BagIt,
  OCFL, OpenLineage, and relevant argumentation models.
- **Exit evidence:** explicit reuse, export, incompatibility, and complexity
  decisions backed by examples.
- **Dependencies:** GT-D001–GT-D005.

## P4 — experience, causality, mechanisms, and transfer

### GT-D032 — ExperienceEpisode and prospective prediction

- **Deliverable:** record the situation, goal, constraints, ledger-visible
  records, separately evidenced decision-maker information with completeness
  limits, alternatives, prediction, rationale, intended and executed action,
  observation, outcome, surprise, and later interpretation.
- **Exit evidence:** retrospective knowledge cannot masquerade as information
  available before the action.
- **Dependencies:** stable base ledger, time, evidence, and dossier capabilities.

### GT-D033 — Experience replay experiment

- **Deliverable:** hide a recorded outcome, ask for a prediction and decision,
  reveal the episode, compare prediction error, and retain the new attempt;
  select and schedule cases from a learner-evidence state using spacing,
  interleaving, near misses, counterexamples, staged reveal, and delayed near-
  and far-transfer tests with calibrated abstention.
- **Exit evidence:** prospective performance or later transfer improves over
  reading and recall alone.
- **Stop condition:** it becomes quiz gamification without decision utility.
- **Dependencies:** GT-D032.

### GT-D034 — CausalClaim candidate profile

- **Deliverable:** separate task contracts for effect estimation, causal
  discovery, root-cause attribution, counterfactual explanation, mediation,
  transportability, and experiment design; each states intervention/exposure,
  comparator, outcome, horizon, population/scope, assumptions, measurement and
  missingness, overlap/positivity, consistency/treatment versions, interference,
  selection and time-varying confounding, uncertainty, falsification controls,
  evidence, and alternative explanations as applicable.
- **Exit evidence:** the system refuses to create a bare `causes` edge from
  sequence or correlation.
- **Dependencies:** GT-D032, prospective cases, causal-method mapping.

### GT-D035 — MechanismPattern induction

- **Deliverable:** problem shape, forces, constraints, intervention, state
  transformation, mechanism, operating conditions, side effects, examples,
  counterexamples, and failure boundaries; rehearse split, merge, narrow,
  version, and retirement under new cases while preserving lineage.
- **Exit evidence:** structural retrieval beats vocabulary-only matching on a
  small set of cross-domain cases.
- **Dependencies:** multiple episodes and causal candidates.

### GT-D036 — TransferAttempt

- **Deliverable:** source-to-target role mapping, mismatches, adaptation,
  prospective prediction, action, result, negative transfer, and revised
  applicability boundary; compose compatible mechanism candidates through
  explicit role/state interfaces, constraints, resources, feedback loops,
  predicted interactions, side effects, and counterexample search, retaining
  the composition as a design hypothesis until safely tested.
- **Exit evidence:** successful and failed prospective transfers are both
  retained; one success does not imply universal mastery.
- **Dependencies:** GT-D033–GT-D035.

### GT-D037 — Multi-corpus protocol pressure test

- **Deliverable:** use at least three substantially different personal or
  synthetic domains, including cross-domain records, to expose owner-specific,
  closed-taxonomy, and vocabulary assumptions before stabilization.
- **Exit evidence:** the core remains small; records survive without forced
  single-domain classification; differences fit profiles and attributable views
  rather than universal ontology growth.
- **Dependencies:** a useful personal v0 and privacy-safe corpora.

## P5 — earn richer ontology and generated views

These tasks preserve the precursor automatic-documentation thread. Their P5
placement is a dependency hypothesis, not a promise that they follow every P4
experiment. See [ontology and document views](ONTOLOGY-AND-DOCUMENT-VIEWS.md)
for the full alternatives, failure modes, and retained open questions.

### GT-D038 — Domain representation bake-off

- **Evidence needed:** flat tags and baseline retrieval fail to organize a real
  corpus well enough for navigation or judgment.
- **Deliverable:** compare a prescribed taxonomy, learned clustering, Formal
  Concept Analysis, typed-core-plus-candidates, and domains-as-named-views on the
  same synthetic or privacy-safe future-reveal slice. Hide domain names and
  counts; require explicit unclassified/ambiguous states, discovery of a novel
  domain, and soft `0..N` membership without a seeded closed taxonomy.
- **Exit evidence:** measured navigation value, stability, review effort,
  explainability, abstention quality, and treatment of multi-membership, novel
  domains, and unknown material.
- **Stop condition:** ordinary facets and saved queries perform as well with
  materially less complexity.
- **Dependencies:** GT-D001, GT-D009, GT-D015, GT-D018, GT-D020, GT-D021,
  and a representative corpus.

### GT-D039 — Continuous domain-topology and structural-shock rehearsal

- **Evidence needed:** repeated domain or concept changes make old links,
  citations, memberships, queries, or views misleading, and a late missing link
  can justify a discontinuous reorganization.
- **Deliverable:** future-reveal additions and corrections that produce domain
  birth, rename, broaden/narrow, reparent, split, merge, bridge, retirement, and
  a no-safe-mapping case. Interleave at least three hidden domains, a novel
  domain, ambiguous and multi-domain records, a withheld bridge that triggers a
  material structural-shock candidate, stable distractors, a late-recorded
  source about an earlier valid interval, and a later counterexample. Build
  immutable attributed topology generations and retain every selected result
  plus selection/supersession history; compare fixed-method incremental versus
  clean maintenance separately from heuristic periodic and shock-triggered
  paths at checkpoints; retain bitemporal scope, lineage,
  alternative repairs, stability/fragility evidence, downstream retrieval,
  dark-zone and generated-view impact previews, and access scope. Also detect
  unsatisfiable concepts, contradictory or circular definitions, and
  domain/range/cardinality/disjointness violations, then compare predeclared
  competency-query behavior before and after repair candidates.
- **Exit evidence:** every change is attributable; no record is forced into a
  domain; old selected generations and as-of horizons remain interpretable;
  late evidence, valid-time change, recorded-time discovery, and retrospective
  reclassification are distinguished; selected stochastic history survives
  producer removal; derived memberships invalidate and rebuild; declared
  deterministic incremental semantics match same-method clean output;
  the bridge is detected without unstable normal-period churn; decisive
  cross-domain evidence stays retrievable; a simulated-acquisition fork measures
  whether a discriminating question advances discovery safely; review/discovery
  cost is measured. Shock statistic, false-alarm controls, baselines, budgets,
  ablations, and settling/reversal criteria are frozen before reveal.
- **Stop condition:** the test requires a universal ontology before a local
  view has demonstrated value, ordinary facets/search perform as well at lower
  cost, topology churn overwhelms review, or the shock cannot be distinguished
  from model/configuration change and retrospective storytelling.
- **Dependencies:** GT-D038 and stable revision/time semantics.
- **Active design:** [Issue #8](https://github.com/asukhodko/graphtruth/issues/8)
  owns the continuous actualization and missing-link structural-shock hypothesis
  without adding a duplicate GT-D task.

### GT-D040 — Generated-view invalidation and circularity test

- **Evidence needed:** generated pages or dossiers are useful enough to retain,
  but risk becoming stale evidence for their own claims.
- **Deliverable:** a view manifest that declares canonical inputs, query and
  renderer versions, omissions, materialization time, freshness state, and
  invalidation dependencies; negative fixtures must reject self-supporting
  derivation cycles.
- **Exit evidence:** a source or policy change deterministically marks every
  affected materialization stale, and generated prose cannot silently become
  independent evidence.
- **RFC trigger:** only if independent readers need portable view-manifest or
  cycle-detection semantics.
- **Dependencies:** GT-D013, GT-D015, GT-D019, and GT-D021.

### GT-D041 — Code-domain ontology pressure test

- **Evidence needed:** a demanding domain is required to expose whether the
  ontology and generated-view model confuses textual similarity, symbol
  identity, structural dependency, behavior, and operational experience.
- **Deliverable:** ingest a small versioned codebase through explicit adapters;
  compare syntax/symbol facts, documentation claims, tests, runtime evidence,
  and generated domain views across a code change.
- **Exit evidence:** every relation retains its evidence class and revision;
  useful troubleshooting or change analysis improves without code-specific
  concepts leaking into the universal core.
- **Stop condition:** the experiment becomes a general code-search product or
  requires proprietary corpus data.
- **Dependencies:** GT-D029 and GT-D038–GT-D040.

## P6 — close cross-cutting algorithm contracts

This is a completeness bucket, not a promise to implement these items after P5.
Pull an item into the active WIP slot only when a real workflow, severe failure,
or dependency requires it. Several tasks will likely run earlier than richer
ontology or causal profiles.

### GT-D042 — Source snapshot reconciliation and reprocessing

- **Evidence needed:** a paginated, nested, or concurrently changing source can
  make incomplete capture look like absence or deletion.
- **Deliverable:** fixtures for source closure, frontiers, version skew,
  pagination gaps, attachments, inaccessible members, typed change sets, and a
  coverage manifest; classify old spans and analyses as surviving, moved,
  changed, deleted, stale, or unresolved after a source revision.
- **Exit evidence:** downstream gap detection can distinguish `absent`,
  `deleted`, `not fetched`, `inaccessible`, `redacted`, `unsupported`, and
  `unknown`; old spans are never retargeted to new bytes.
- **Dependencies:** GT-D003, GT-D006, GT-D009, GT-D019.

### GT-D043 — Field-level evidence grounding and false-citation corpus

- **Deliverable:** align every material proposition field to evidence that
  states, supports, challenges, mentions, contextualizes, or fails to cover it;
  retain multi-span composition, alternatives, and unsupported qualifiers.
- **Exit evidence:** negative fixtures catch valid locators whose content does
  not ground claimant, negation, unit, condition, temporal scope, or argument;
  extractor/OCR replacement triggers re-evaluation.
- **Stop condition:** grounding is represented as an unexplained scalar score;
  keep typed relations and inspectable evidence.
- **Dependencies:** GT-D003, GT-D007, GT-D019, GT-D042.

### GT-D044 — Assertion occurrence and revision-construction spike

- **Deliverable:** preserve occurrence, proposition, attribution chain, copy or
  quotation relation, ambiguity, and proposed lifecycle relation; distinguish
  independent testimony, restatement, clarification, correction, supersession,
  and claimant withdrawal.
- **Exit evidence:** changed documents and copied occurrences cannot silently
  fabricate authorial revision lineage; candidate retention, `Assessment`, and
  `AcceptanceDecision` remain separate.
- **Dependencies:** GT-D010, GT-D019, GT-D043.

### GT-D045 — Predicate and vocabulary resolution lifecycle

- **Deliverable:** resolve predicate sense, roles, direction, arity, inverse or
  qualified form, constraints, version, and scope; represent equivalent,
  broader, narrower, conditional, partial, one-to-many, lossy, rejected, and
  unresolved mappings with evidence and impact preview.
- **Exit evidence:** mapping revision invalidates affected contradiction,
  classification, derivation, and query results; forced lexical equivalence is a
  negative fixture.
- **Dependencies:** GT-D020, GT-D044.

### GT-D046 — Review, Assessment, and Acceptance workflow boundary

- **Deliverable:** risk/impact-aware review queues, authorized assignment,
  balanced dossiers, sampling and disagreement records, attributable
  adjudication, policy-execution validation, and downstream impact preview.
- **Exit evidence:** a score can prioritize review but cannot retain a candidate,
  issue an `Assessment`, or create an `AcceptanceDecision` implicitly; conflicting
  reviews coexist.
- **Dependencies:** GT-D011, GT-D015, GT-D020, GT-D045.

### GT-D047 — Observation and measurement return path

- **Deliverable:** ingest instrument/procedure/calibration/environment identity,
  sampling and observation time, original and normalized units, precision,
  detection limits, censoring, missingness, aggregation windows, raw values,
  derived metrics, and uncertainty.
- **Exit evidence:** anomaly or cleaning candidates never overwrite raw
  observations, and measurement/sampling limitations survive into assertions,
  causal analysis, and dossiers.
- **Dependencies:** GT-D003, GT-D007, GT-D027.

### GT-D048 — Provenance-aware derivation, explanation, and repair

- **Deliverable:** retain explicit derivations with inputs, rule/model, horizon,
  assumptions, intermediate support where available, alternatives, uncertainty,
  cycle/self-support checks, dependency invalidation, minimal proof/support sets,
  and ranked repair candidates with impact preview.
- **Exit evidence:** changed evidence, identity, mapping, policy, or rule marks
  every dependent result stale or invalid; contradictions do not trigger
  unrestricted logical explosion; repair does not rewrite source history.
- **RFC trigger:** only deterministic rule/proof semantics required across
  implementations; abduction and repair ranking remain replaceable.
- **Dependencies:** GT-D007, GT-D010, GT-D011, GT-D045.

### GT-D049 — Answer assimilation and Question-state reducer

- **Deliverable:** link acquired evidence and attempts to the originating
  question, evaluate named answer criteria after identity/scope/time alignment,
  classify sufficient, partial, conflicting, negative, inconclusive,
  unavailable, or refused outcomes, record costs, update dependencies, reopen
  questions, and recompute affected gaps and contradictions.
- **Exit evidence:** ingestion success alone cannot close a question, and a
  later revision predictably reopens dependent states.
- **Dependencies:** GT-D024, GT-D027, GT-D042, GT-D047.

### GT-D050 — Decision dependencies, sensitivity, and adaptive acquisition

- **Deliverable:** extend and reuse the GT-D027 route/portfolio planner while
  representing goal, options, criteria, constraints, deadline,
  claims and assumptions feeding a decision; compare sensitivity, robustness,
  regret, and decision-bound information value; plan and replan multi-step
  acquisition under shared budgets and stopping rules.
- **Exit evidence:** priority changes are explainable and robust to plausible
  alternatives; the algorithm surfaces consequences but never chooses or
  accepts on the user's behalf.
- **Dependencies:** GT-D024, GT-D027, GT-D049.

### GT-D051 — Disclosure-scoped archive exchange and recovery

- **Deliverable:** compute export dependency closure and explicit omissions;
  pack and verify a self-describing bundle; quarantine an import, resolve
  versions offline, validate integrity/signatures, map ID collisions without
  identity merges, preserve provenance, integrate atomically or refuse, restore,
  rebuild, and render a human fallback.
- **Exit evidence:** an independent clean environment reconstructs the declared
  semantic horizon without runtime databases or network services; partial import
  and accidental disclosure fail visibly.
- **Dependencies:** GT-D008, GT-D012–GT-D018, GT-D030.

### GT-D052 — Redaction, erasure, and disclosure-closure drill

- **Deliverable:** evaluate policy before every retrieval/traversal/model/action;
  propagate sensitivity and retention labels; trace authorized redaction or
  erasure through canonical references, indexes, embeddings, caches, prompts,
  logs, backups, imports, exports, and publications; verify residue and record
  unavoidable evidence unavailability.
- **Exit evidence:** protected existence is not leaked through graph paths,
  scores, counts, errors, or stale artifacts under the declared threat model;
  hold conflicts and non-removable copies are explicit.
- **Dependencies:** GT-D008, GT-D014, GT-D051.

### GT-D053 — Protocol and cryptographic conformance matrix

- **Deliverable:** fixtures for strict parse/value rules, canonicalization and
  digest domains, digest upgrade maps, signature envelopes, cryptographic
  validity versus trust/time/revocation policy, stable diagnostics, capability
  modes, and resumable migration reports.
- **Exit evidence:** independent tools agree where bytes or observable behavior
  must match and clearly disagree or refuse where local trust policy differs.
- **Dependencies:** GT-D005, GT-D012, GT-D013, GT-D051.

### GT-D054 — Runtime orchestration and resource-governance drill

- **Evidence needed:** background enrichment, providers, or multiple projection
  jobs make a serial manual runner unreliable or unbounded.
- **Deliverable:** job DAGs, leases, idempotent retries, checkpoints, dead-letter
  state, backpressure, admission and rate limits, priorities, deadlines, cost and
  token budgets, circuit breakers, degraded modes, watermarks, health, tracing,
  integrity scrubs, and crash/queue/provider-loss replay.
- **Exit evidence:** duplicate delivery cannot duplicate canonical or external
  action; budget exhaustion and overload fail boundedly; an operator can explain
  lag and recover without hidden durable state.
- **Stop condition:** a single-process synchronous loop remains simpler and
  sufficient; do not build a distributed control plane early.
- **Dependencies:** GT-D006, GT-D014, GT-D019, GT-D021, GT-D025, GT-D027.

### GT-D055 — Deferred multi-writer and federation pressure test

- **Evidence needed:** a second writer, independently governed corpus, partial
  replica, or extension author creates a real ordering or authority conflict.
- **Deliverable:** compare leases/CAS, commit-DAG ancestry and merge bases,
  semantic conflict preservation, replicated-set reconciliation, partial
  replication, namespace/capability negotiation, and recorded-order models.
- **Exit evidence:** identity, acceptance authority, privacy, and history remain
  explicit under concurrent or federated change; unsupported semantics refuse
  safely.
- **Deferred:** do not schedule from hypothetical scale alone.
- **Dependencies:** GT-D017, GT-D037, GT-D051, GT-D053.

## Candidate RFC sequence

The order below is a dependency hypothesis, not an allocation of RFC numbers:

1. record and bundle envelope;
2. identities, source artifacts, and evidence addressing;
3. serialization, canonicalization, and integrity algorithms;
4. revisions, lifecycle, and bitemporal semantics;
5. assessments, policies, and `AcceptanceDecision` application;
6. profiles, extensions, capabilities, and version negotiation;
7. migrations, conformance roles, and diagnostic stability;
8. privacy, retention, redaction, and deletion propagation;
9. archive/export/import completeness and offline recovery;
10. optional portable measurement and derivation profiles;
11. optional portable dossier contract;
12. optional portable named-view or materialization-manifest contract;
13. optional experience, causal, mechanism, and transfer profiles;
14. multi-writer or federation semantics only after observed need.

Each RFC should be split when its examples, compatibility surface, or
implementation schedule cannot be reviewed coherently.

## Global shrink and kill criteria

Reduce or stop a line of work when evidence shows:

- the canonical model adds cost without outperforming plain Markdown and basic
  search on a real task;
- metadata capture causes a parallel authoritative notebook to remain in use;
- an independent reader requires runtime internals;
- a supposedly disposable backend contains irreplaceable meaning;
- contradiction or question generation exceeds an agreed false-positive or
  interruption budget;
- causal or transfer output cannot be evaluated prospectively;
- privacy deletion cannot reach every retained and derived copy;
- rebuild is theoretically possible but violates time, cost, or dependency
  budgets;
- protocol growth is driven by hypothetical domains rather than repeated
  dogfood evidence.

Shrinking GraphTruth to a smaller provenance convention, a portable assertion
ledger, or a useful personal tool is a valid learned outcome. Preserving this
larger vision does not make its full implementation mandatory.
