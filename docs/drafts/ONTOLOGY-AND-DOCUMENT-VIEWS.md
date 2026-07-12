# Emergent Ontology, Domains, and Document Views

> **Status:** Recovered design context — non-normative.
> **Captured:** 2026-07-11.
> **Expanded:** 2026-07-12 for the continuous emergent domain-topology
> hypothesis in [Issue #8](https://github.com/asukhodko/graphtruth/issues/8).
> **Authority:** The small-core, file-first, claim-oriented foundation in
> [Vision](../VISION.md), [Principles](../PRINCIPLES.md),
> [Architecture](../ARCHITECTURE.md), and
> [RFC 0000](../../rfcs/0000-project-foundation.md) takes precedence.
> **Promotion:** Ontology, classification, and view semantics require concrete
> corpora and focused experiments; portable meaning requires an RFC.

## Why this precursor thread matters

The earliest GraphTruth problem was not phrased as an epistemic ledger. It was
an incremental automatic-documentation and ontology problem:

- accept a noisy stream of notes, articles, messages, tasks, calendar events,
  data records, code, questions, and unanswered questions;
- discover the open-ended and initially unknown domains behind that stream,
  locally bounded only by purpose, authorization, and the current corpus horizon;
- name and describe domains, subdomains, concepts, and their relationships;
- place one item in every relevant domain without duplicating its meaning;
- maintain overview and routing pages as knowledge changes;
- restructure a hierarchy that has become misleading;
- expose dark zones and newly visible cross-domain connections;
- produce documentation useful for understanding, troubleshooting, and change
  design.

The current project correctly moved canonical authority below those documents
and classifications. Even so, emergent organization and generated views remain
central product capabilities and important pressure on the protocol.

## Boundaries inherited from the foundation

**Accepted elsewhere.** The following constraints already apply:

- a document tree is a view, not canonical truth;
- a logical graph does not imply a graph-database source of truth;
- the core must not freeze a universal ontology before dogfood;
- a classification or inferred relationship is attributable candidate or
  analysis unless separately accepted under policy;
- materialized pages, clusters, embeddings, and lattices are normally
  rebuildable projections;
- a valuable historical classification or analysis may be retained canonically
  with its inputs and process provenance without gaining truth authority;
- unknowns, contradictions, and multiple interpretations must survive the view.

## Vocabulary for the investigation

These are working distinctions, not proposed core record types.

- **Concept:** a referenced meaning or category used in assertions,
  classifications, and queries.
- **Domain:** a purpose-relative region of knowledge; it may be a named query,
  a user-maintained classification, a discovered cluster, or a profile concept.
- **Subdomain:** a narrower domain relation under a declared organization
  policy, not necessarily a universal tree edge.
- **Taxonomy:** a primarily hierarchical classification.
- **Ontology:** declared concepts, relations, constraints, and intended
  semantics.
- **Concept lattice:** an FCA-derived ordering of formal concepts from objects
  and shared attributes; it is not identical to a narrative domain hierarchy.
- **Domain view:** a named, versioned query or policy that selects and organizes
  records for a purpose.
- **Document view:** a rendered narrative or reference artifact assembled from
  canonical records and attributed analyses.
- **Materialized view:** a cached result of a named view over a declared corpus
  snapshot.
- **Domain structure:** a stable, named series of purpose-, policy-, profile-,
  and access-relative organizations. Several incompatible but useful structures
  may coexist over the same records.
- **Topology generation:** one immutable attributed result for a domain
  structure at an identified corpus horizon, including nodes, typed relations,
  memberships, method, predecessor, omissions, and semantic diff.
- **Membership candidate:** an attributable proposal that one record belongs to
  one domain node for a purpose. Membership may overlap and may remain unknown,
  ambiguous, or unassigned.
- **Topology transition:** an attributed lineage proposal such as birth, rename,
  reparent, split, merge, bridge, or retirement between generations.
- **Structural shock:** evidence-driven change large enough to invalidate a
  material part of the current organization or its query behavior. Size does
  not grant truth or acceptance authority.

## Design alternatives

### Prescribed ontology first

**Alternative.** Experts define concepts, predicates, constraints, and a domain
hierarchy before ingestion.

Benefits include consistent vocabulary, validation, and predictable navigation.
Risks include high setup cost, forced classification, poor fit to unseen
domains, and silent encoding of one owner's assumptions.

### Emergent clustering first

**Alternative.** Topics, communities, or semantic clusters emerge from the
corpus; people name and reorganize them later.

Benefits include low initial modeling cost and sensitivity to actual material.
Risks include instability across model versions, vocabulary-driven rather than
mechanism-driven groupings, opaque cluster boundaries, and poor interoperability.

### Formal Concept Analysis

**Recovered context.** FCA and incremental concept-lattice construction were
considered for deriving classifications from objects and attributes. Candidate
families included Godin-style incremental updates and In-Close-style concept
enumeration.

Potential value:

- explain a concept by the attributes shared by its extent;
- expose multiple inheritance naturally;
- discover missing combinations or implications;
- update structure as observations arrive.

Risks:

- the lattice can grow explosively and overwhelm navigation;
- extracted attributes inherit entity and extraction errors;
- formal implication is not domain causation or human explanatory importance;
- small input changes can produce large structural changes;
- a complete lattice is not automatically a useful documentation hierarchy.

**Deferred.** Full FCA belongs after a smaller corpus and useful attribute model
exist. It should first be a Zone 3 analysis projection.

### Typed core plus learned candidates

**Working hypothesis.** Keep a small prescribed epistemic core, allow profiles
to declare domain vocabulary, and let clustering, FCA, relation induction, or
language models propose classifications and new vocabulary. A human or named
policy may accept a useful domain view without promoting its entire inferred
ontology into Zone 1.

This hybrid best matches the current foundation, but it remains untested.

### Domains as named views

**Recovered context.** A domain need not be a mandatory entity type. It may be
a versioned `DomainView` containing:

```text
stable view identifier
human name and purpose
definition or query
owner or producer
input corpus/profile scope
classification and inclusion policy
view version
optional materialized snapshot reference
known omissions and limitations
```

This keeps one record addressable from several domains without copying it. It
also makes different domain organizations coexist. The open question is whether
some domain identity and relation semantics later prove interoperable enough for
an optional profile.

## Multiple classification instead of one tree

The precursor request spoke of a hierarchy, but useful knowledge rarely has one
correct parent. A service may belong simultaneously to a business domain, a
runtime subsystem, a security boundary, an ownership group, and an incident
pattern.

Candidate organization structures include:

- a polyhierarchy with typed broader/narrower relations;
- independent named facets;
- overlapping communities;
- a concept lattice projected into several navigable trees;
- purpose-specific DomainViews;
- manual curated hubs over inferred candidate memberships.

**Working hypothesis.** A view may copy prose for presentation, but durable
semantic objects and evidence retain stable identities. Cross-domain inclusion
references the same underlying records so a correction is not applied to only
one copy.

## Continuous actualization of domain structure

### Working invariant

GraphTruth should not require a predeclared, complete, mutually exclusive, or
permanent domain set. For each named organization purpose, policy, profile, and
authorized corpus horizon, a record can have zero, one, or several attributable
memberships. `Unknown`, `ambiguous`, `unclassified`, `out of scope`,
`inaccessible`, and `redacted` are different states; none should be forced into
a catch-all domain merely to make a partition complete.

A subject taxonomy, runtime-subsystem map, ownership organization, security
boundary, and mechanism-oriented view may all coexist. Their disagreement is
not automatically inconsistency because they answer different organization
questions. No one current tree becomes universal domain truth.

### Structures, generations, and current selection

A candidate domain structure series identifies at least:

```text
stable structure ID
purpose and organization policy
input corpus, profile, and authorization scope
generation ID and parent generation(s)
recorded-as-of ledger/corpus horizon
claimed valid-time or effective interval, basis, granularity, and uncertainty
producer, algorithm/model, features, configuration, and creation time
domain-node definitions and typed relations
record-to-domain membership candidates and uncertainty
lineage transitions and unresolved mappings
known omissions, completeness boundary, and stability evidence
structural, query, privacy, and downstream invalidation diff
```

Generations are immutable analysis results. A named local policy may atomically
select a current generation for one purpose, claimed valid-time scope, and access
scope, but selection is not an `AcceptanceDecision` over every membership and
does not promote discovered vocabulary into the protocol.

Every generation that was selected, published, cited, or used in a consequential
dossier or decision must be retained as a canonical analysis artifact, or as an
equivalent complete interpretable result plus manifest, even when its producing
model later disappears, subject to current authorization, retention, legal hold,
redaction, and required-erasure policy. The corpus also retains append-oriented
attributed selection and supersession events recording the structure and
generation IDs, purpose, policy, actor/producer, access scope, valid-time scope,
recorded-as-of/selection horizon, reason, and predecessor. A mutable `current`
pointer is only a cache over that history. Unselected one-off candidates and
membership indexes may remain disposable and rebuildable.

When policy requires the complete historical result to expire or be erased, the
runtime retains only the permitted scoped tombstone or audit event, never the
restricted labels, memberships, bridges, or derived features. Historical
reconstruction then reports the generation as intentionally unavailable or no
longer verifiable instead of silently substituting a rebuild.

A clean rebuild verifies declared current semantics and exposes path dependence;
it does not replace a retained stochastic generation that was historically
selected. This is necessary for as-of reconstruction and useful EoL recovery.

Labels are not identities. A renamed node can retain identity only when its
meaning and membership policy remain materially stable. A semantic change needs
a new revision or lineage operation rather than being disguised as a rename.

### Transition and lineage semantics

Candidate transitions should distinguish:

- **birth:** mint a new structure-scoped domain identity;
- **rename:** revise labels without claiming a change in meaning;
- **reparent:** add or remove a typed broader/narrower relation in a
  polyhierarchy;
- **broaden or narrow:** change a node's intended boundary with an impact diff;
- **split:** retire or supersede one node, mint two or more identities, and
  re-evaluate memberships without silently cloning them;
- **merge:** mint a new identity with lineage from all inputs while preserving
  the old identities and their as-of views;
- **bridge:** add an evidence-backed mediator or relation between previously
  separated regions; a bridge is not by itself causal proof;
- **retire or revive:** change later selection while retaining history and
  resolvable lineage;
- **no safe mapping:** state that generations cannot be aligned confidently
  instead of fabricating stable identity;
- **membership delta:** add, remove, reweight, or mark an individual membership
  ambiguous independently of node lineage.

These are analysis distinctions, not proposed Zone 1 record types.

### Continuous update loop

Continuous actualization means that every relevant retained change eventually
produces either a fresh identified generation or an explicit stale/pending state.
It does not require a synchronous full-corpus reclustering after every event.

```text
new event, correction, mapping, model, profile, or policy
  → identify the affected authorized semantic neighborhood
  → distinguish noise, outlier, new sense, subdomain, domain, and bridge
  → propose soft 0..N memberships and topology alternatives
  → compare with the selected and clean/shadow candidates
  → measure stability, surprise, fragility, and downstream impact
  → review or apply a named local selection policy
  → publish a new generation atomically
  → invalidate and refresh affected indexes, views, dossiers, and gap analyses
  → retain the old generation and turn corrections into evaluation evidence
```

A clean reconstruction runs on a schedule and after material shocks, algorithm
or feature changes, competency-query regression, or accepted identity and
vocabulary corrections. Declared deterministic semantics should match between
incremental and clean paths. Heuristic structures are compared for material
behavior and path dependence rather than required to be byte-identical.

### Abrupt restructuring from a missing link

Most arrivals may add or adjust local membership. Some evidence legitimately
changes the picture at once. Earlier fragments can support apparently separate
regions until a newly observed source supplies a missing identity distinction,
shared mechanism, intermediate concept, or bridge relation. The best current
organization may then require a birth, split, merge, reparenting, overlap, or
collapse of a large region.

The runtime should treat such a result as a high-impact structural-shock
candidate, not as self-validating truth. It should preserve the new evidence
first, build the candidate generation separately, conservatively align old and
new identities, and expose:

- the exact bridge evidence and why a local attachment was insufficient;
- records, memberships, nodes, paths, queries, gaps, and documents affected;
- alternative topologies and evidence that would distinguish them;
- whether the change improves predeclared navigation or competency tasks;
- whether the apparent shock is evidence-driven or caused by a new model,
  feature representation, configuration, or access scope;
- fragility when the bridge or its source family is removed;
- privacy or existence disclosures introduced by the new connection.

The run predeclares a structural-displacement measure rather than labeling a
large-looking result a shock after inspection. A candidate measure combines,
after conservative lineage alignment, weighted membership movement, domain-node
and typed-relation transitions, competency-query/result-set changes, and
downstream invalidation reach, normalized by the eligible corpus and compared
with a stable-window or synthetic-null distribution. Item novelty, explanatory
gain over local attachment, source-family ablation fragility, and model/config
identity remain separate dimensions. Distractor arrivals provide negative
controls. Exact formula and thresholds are Zone 3 experiment policy, not protocol
semantics.

After the applicable review or policy gate, selection switches atomically and
remains rollbackable. A later counterexample can produce another generation; it
does not edit the shock out of history.

### Stability without suppressing discovery

Continuous discovery needs both plasticity and resistance to meaningless churn.
Candidate controls include stable identities independent of labels, asymmetric
enter/leave thresholds, hysteresis, low-impact dwell windows, complexity
penalties, bootstrap or ensemble stability, lineage-aware source independence,
manual cannot-link constraints, review budgets, and explicit abstention.

These controls are named Zone 3 policy, not universal constants. Minimum-change
alignment is an identity aid and tie-breaker; it must not conceal an evidenced
large reorganization. High impact should increase explanation and review, not
make genuine change impossible.

### History and access scope

Domain-structure queries are bitemporal. Conceptually:

```text
DomainTopology(structure, purpose, valid_at, recorded_as_of, access_scope)
```

At least three questions must remain distinct:

1. Which domain structure and memberships were visible to the ledger at the
   earlier recorded-time horizon for the valid-time scope asked then?
2. What structure does a later-recorded source claim was applicable at an
   earlier valid time, with what temporal evidence and uncertainty?
3. How does a current topology generation classify the records that were
   visible at that earlier horizon?

All can be useful, but the second is a late retrospective claim and the third is
a retrospective analysis. Neither may be presented as what the system or user
knew then. A late old document can revise the current understanding of an older
valid interval without being mislabeled as a domain change in the present world.

Topology is inferred only from an authorized input slice. Node existence,
labels, counts, memberships, bridges, changes, and timing can reveal sensitive
themes even when record text is hidden. Generations, indexes, diffs, and reports
therefore carry access and disclosure scope. A runtime must not build one hidden
global topology and filter it only after inference. Redaction or authorization
change invalidates every dependent generation and projection; historical access
is still evaluated under current authorization and retention obligations.

## Candidate algorithm families

### Terminology and relation discovery

- named-entity and terminology extraction;
- noun-phrase and keyphrase extraction;
- Hearst-style lexical patterns for candidate broader/narrower relations;
- OpenIE and structured relation extraction;
- definition and abbreviation mining;
- schema and predicate induction;
- synonym, alias, and ontology-alignment candidates;
- unit, identifier, and controlled-vocabulary normalization.

All outputs remain linked to exact evidence and the producing method.

### Dynamic domain discovery

- open-set novelty detection that distinguishes a new domain, subdomain, new
  vocabulary sense, boundary case, and noise while permitting abstention;
- calibrated soft and overlapping membership candidates with evidence and
  explicit unassigned states;
- streaming hierarchical clustering;
- online topic models such as online LDA or nonparametric topic candidates;
- graph community detection over several typed projections;
- co-citation, co-reference, and co-use graphs;
- density- or embedding-based clustering;
- incremental FCA and implication discovery;
- change-point and concept-drift detection;
- structural-surprise detection over lineage-aligned memberships, typed
  relations, query behavior, and invalidation reach;
- ensemble, perturbation, and leave-one-source-family-out comparison to expose
  unstable boundaries or single-source shocks;
- dependency-driven affected-neighborhood updates plus scheduled or triggered
  clean rediscovery.

No technique defines domain truth. A cluster is an analysis artifact with a
snapshot, feature representation, parameters, and stability evidence.

### Naming and describing a domain

- representative and discriminative term selection;
- contrastive description against sibling candidates;
- central-example and boundary-example retrieval;
- evidence-backed extractive summary;
- generated candidate names with source terms and counterexamples;
- human edit and acceptance history.

The description should state what the domain includes, excludes, and why it is
useful, not merely list frequent words.

### Hierarchy and lattice maintenance

- subsumption and implication candidates;
- cycle detection and transitive reduction;
- minimum-change remapping of stable view IDs;
- structural diff between corpus snapshots;
- birth, rename, broaden, narrow, reparent, split, merge, bridge, retire, and
  no-safe-mapping proposals with lineage and impact previews;
- orphan and overly broad node detection;
- navigation optimization based on real retrieval paths;
- drift and structural-shock alarms when membership, meaning, or competency-query
  behavior changes materially;
- hysteresis, persistence, churn budgets, and candidate-versus-selected
  generation separation;
- incremental-versus-clean comparison, atomic generation switching, rollback,
  and dependent-view invalidation.

### Semantic consistency and repair candidates

- detect unsatisfiable concepts under the declared vocabulary and constraints;
- detect incompatible domain, range, cardinality, disjointness, and relation
  constraints without treating every local exception as a universal error;
- find contradictory definitions, circular definitions, and definition chains
  whose meaning depends only on one another;
- execute declared competency queries against a fixed corpus snapshot to test
  whether the ontology supports the distinctions and access tasks for which it
  was introduced;
- compute minimal inconsistent or unsatisfied constraint sets and propose the
  smallest candidate repairs;
- preview which classifications, assertions, named views, queries, and
  generated documents each repair would change or invalidate;
- compare semantic behavior before and after a proposed repair, including query
  results, accepted classifications, detected gaps, and newly unsupported
  material;
- retain rejected alternatives, reviewer decisions, assumptions, and the exact
  ontology and corpus versions used by every check.

These checks produce attributed analyses and repair proposals. They do not
silently rewrite a vocabulary, classification, or accepted view. A reported
inconsistency is relative to declared semantics and scope; it is not proof that
one universal ontology is required.

### Cross-domain insight candidates

- link prediction with explicit evidence paths;
- bridge and articulation analysis;
- shared mechanism or graph-motif retrieval;
- rare but supported co-occurrence;
- structural analogy and role mapping;
- contradictions or shared questions spanning views;
- change correlation followed by causal discipline, never automatic causation.

Domain membership is an expansion and explanation signal, not an implicit hard
retrieval filter. Unclassified records, alternative organizations, bridge
evidence, counterevidence, and important mismatches must remain reachable.

An “insight” is a candidate relationship and explanation path, not a truth
promotion caused by novelty score.

## Generated-document pipeline

### Candidate flow

```text
named view + corpus snapshot + policy
  → retrieve relevant assertions, evidence, questions, and analyses
  → group by explanatory structure
  → include disagreements, temporal change, and known omissions
  → generate or deterministically render sections
  → validate citations and unsupported claims
  → publish a versioned document view
```

Potential documents include:

- concept and entity pages;
- domain and subdomain overview pages;
- routing or “start here” pages;
- timelines and change summaries;
- decision and evidence dossiers;
- service architecture and request-flow pages;
- troubleshooting guides and incident-pattern pages;
- open-question and dark-zone reports.

### Invalidation and freshness

A document view should declare:

- named query/view version;
- corpus snapshot or watermark;
- policy and access scope;
- renderer/model identity and configuration;
- source record and evidence dependencies;
- known omissions;
- freshness and validation status.

Changes to dependencies should invalidate affected sections or the whole view.
Incremental maintenance is an optimization; a clean full rebuild remains the
reference recovery path for supported views.

### Circularity and hallucination defense

Generated documents and docstrings can later be ingested as sources, creating
an echo chamber. Safeguards include:

- distinguish code, schemas, source artifacts, manual documents, and generated
  views in provenance;
- do not count a generated restatement as independent corroboration of its own
  inputs;
- detect derivation cycles and common provenance;
- use generated text as a retrieval/navigation signal, not automatic evidence;
- retain exact source citations and expose unsupported sentences;
- require review for high-impact domains;
- invalidate a view when its source assertions are revised or redacted.

See [Technical artifacts](TECHNICAL-ARTIFACTS.md) for the code-specific loop.

## Dark zones in an emergent ontology

Corpus absence alone cannot prove a missing domain. A dark zone is relative to
an expectation such as:

- a profile requires a role, property, or lifecycle stage;
- a user's goal requires a decision dependency;
- a known process has an unexplained input, action, or outcome;
- a domain checklist expects a concept or evidence class;
- a lattice or graph motif exposes an unsupported combination;
- a hub page has no evidence-backed path to an important question;
- a classification changed but no explanation or migration exists.

The system must distinguish not captured, unknown, not applicable, redacted,
inaccessible, and deliberately out of scope.

A topology ambiguity can itself become acquisition work when a missing
definition, identity distinction, bridge, counterexample, scope boundary, or
temporal boundary would discriminate among materially different structures.
The answer re-enters as evidence; it does not directly command a merge or split.

## Evaluation questions

### Classification quality

- precision and recall against curated memberships where a gold set exists;
- stability under new events and model updates;
- false merge and false split rates;
- coverage of multi-classification;
- explanatory evidence for every membership;
- sensitivity to vocabulary versus relational structure;
- novel-domain detection recall, abstention quality, and discovery delay;
- calibration of overlapping memberships and confident forced-classification
  rate;
- topology-lineage accuracy for rename, split, merge, bridge, and retirement.

### Continuous-update quality

- weighted membership, relation, label, and stable-view churn during declared
  stable periods;
- change-point false-alarm rate and detection delay;
- structural-shock magnitude, fragility, and explanatory gain over local
  attachment;
- regression or improvement in predeclared competency queries;
- incremental-versus-clean semantic equivalence for declared deterministic
  behavior and visible divergence for heuristics;
- exact reconstruction of earlier selected generations and distinction from
  retrospective reclassification;
- stale dependent-view invalidation latency and atomic-switch integrity;
- review minutes, corrections, reversions, and unresolved-lineage rate.

### Navigation and documentation value

- time to find a source, answer, contradiction, or owner;
- retrieval success compared with plain search and manual folders;
- fraction of generated sections with traceable evidence;
- counterevidence and unknown coverage;
- stale-view detection time;
- cost of correcting a bad classification or hierarchy;
- whether users keep a parallel authoritative document tree.

### Complexity budget

- lattice or hierarchy growth per object and attribute;
- rebuild time and memory;
- number of manual classification decisions;
- churn in names, memberships, and view URLs;
- profile and extension pressure introduced by the approach.

## Candidate experiments

### Experiment O1 — domain representation bake-off

Use the same small synthetic corpus with:

1. manual tags and folders;
2. streaming clusters;
3. a small FCA lattice;
4. a hybrid named-view approach.

Compare navigation, multi-classification, stability, correction effort,
explainability, and rebuild cost. Stop if the richer methods do not improve a
real task over tags and search.

### Experiment O2 — continuous topology and structural shock

Use the future-reveal discipline from
[the corpus replay harness](CORPUS-REPLAY-EXPERIMENT-HARNESS.md) on a synthetic
stream with at least three hidden latent domains. Include unclassified, ambiguous,
and multi-domain items; a genuinely new domain; vocabulary drift; a withheld
missing link that should trigger a material bridge, reparent, split, or merge;
stable-phase distractors; a late-recorded source claiming an older valid-time
structure; and a later counterexample that prevents or reverses an over-merge.

Do not reveal domain names, counts, future filenames, bridge identity, or oracle
structure to the system under test. The oracle should permit several acceptable
purpose-relative topologies while declaring required and forbidden memberships,
lineage events, decisive bridge/counterexample evidence, and competency queries.

All online baselines receive the same step-scoped reveal bundle, no hidden names,
counts, labels, or oracle, and predeclared human, time, compute, and review
budgets. Compare raw Markdown plus `rg`; online human-maintained facets/tags; a
purely incremental candidate; periodic clean rediscovery; and a hybrid that
triggers clean work after structural surprise. Keep a full-information curated
organization only as a labeled comparator, never an online baseline. Report
one-time setup/annotation separately from per-item maintenance, query, and review
cost. Run the bridge early, late, and in historical order.

Use two comparison axes. First, for one fixed method and configuration, compare
incremental maintenance with a clean rebuild for the deterministic semantics it
claims. Second, compare different heuristic methods for utility, lineage,
stability, and path dependence; they are not expected to converge byte-for-byte
or to one topology. Verify that:

- novelty can remain unknown before evidence supports a new domain;
- topology and membership proposals remain attributed and do not rewrite source
  records or imply acceptance;
- the bridge produces an explained new generation rather than silent mutation;
- pre-bridge and later historical views remain reconstructible, and the
  late-recorded old source changes the appropriate valid-time interpretation
  without masquerading as a present-world topology event;
- deterministic incremental semantics match a clean rebuild;
- stable periods avoid excessive churn without suppressing the seeded shock;
- stable distractors remain below the predeclared false-alarm budget, while
  bridge-source and source-family ablations expose fragility;
- topology settles or produces an explained follow-up generation after the
  counterexample rather than oscillating invisibly;
- cross-domain queries retrieve decisive evidence and counterevidence without a
  user naming the right domain first;
- labels, memberships, counts, and bridges do not leak across access scope.

Freeze discovery-lag, churn, query-value, review-cost, false-alarm, and
severe-error thresholds before reveal. Also freeze a lineage-aligned structural-
displacement statistic over membership/relation change, competency-query delta,
and invalidation reach; stable/null calibration; shock threshold; model/features/
configuration; allowed heuristic divergence; and settling/reversal criteria.

Add a simulated-acquisition fork. A topology-discriminating question may reveal
only the minimal withheld answer that satisfies frozen answer criteria, policy,
authorization, and budget. The responder cannot disclose domain names, counts,
future filenames, or unrelated oracle structure. Compare the fork with the
passive scheduled lane and measure discovery advance, realized information gain,
wrong or redundant questions, interruption cost, and privacy exposure.

Stop if ordinary facets and saved queries perform as well at lower cost, if the
result depends on one arbitrary gold tree, or if every arrival is treated as a
regime change. This is the successor experiment tracked in
[Issue #8](https://github.com/asukhodko/graphtruth/issues/8), not an expansion of
Issue #6's first walking skeleton.

### Experiment O3 — code as a demanding domain

Combine text with symbols, definitions/references, call paths, configuration,
schemas, and an incident. Compare text-only organization with structural
adapters. Success is improved troubleshooting or change analysis, not a larger
graph.

### Experiment O4 — cross-domain mechanism retrieval

Plant two episodes with different vocabulary but the same relational mechanism.
Compare topic/embedding similarity with role-constrained structure mapping.
Require a prospective transfer prediction before calling the result useful.

### Experiment O5 — semantic consistency and repair rehearsal

Create a small versioned vocabulary and corpus containing an unsatisfiable
concept, incompatible domain/range and cardinality constraints, contradictory
definitions, and a circular definition chain. Declare competency queries before
running the check. For each detected problem, generate minimal repair candidates
with impact previews, then compare the query results, classifications, dark-zone
signals, and generated views before and after each repair.

Success requires the checker to identify the seeded problems without rewriting
the ontology, to expose materially different consequences of competing repairs,
and to preserve the original and repaired horizons. Stop or narrow the approach
if its diagnostics depend on undeclared semantics or if the repair machinery is
more complex than the demonstrated navigation or reasoning benefit.

## Promotion and ownership questions

The following may remain entirely in Zone 3:

- clustering and topic models;
- inferred memberships and labels;
- preferred navigation hierarchy;
- generated prose and page layout;
- ranking and restructure suggestions.

Potential profile or Zone 1 questions, only if interoperability evidence appears:

- stable identity, purpose, scope, and immutable generations of a named domain
  structure;
- portable topology lineage and semantic-diff distinctions;
- stable identity and revision of a named view;
- representation of attributed classification assertions;
- broader/narrower relation semantics;
- declared query/view inputs and omissions;
- portable materialization provenance;
- unknown extension preservation;
- export of accepted vocabulary mappings.

Zone 2 may provide deterministic validators, view manifest checks, diff tools,
and reference renderers without standardizing the discovery algorithm.

## Open questions retained from the precursor

1. Is a domain best represented as an entity, a classification assertion, a
   named view, a profile vocabulary term, or several of these at different
   layers?
2. What makes two domain organizations equivalent enough to share data?
3. How can a view preserve unknown optional material it does not render?
4. When does a cluster or concept become stable enough to name and cite?
5. How should a concept split or merge without breaking historical links?
6. Which ontology relations are portable semantics and which are local policy?
7. Can FCA provide useful dark-zone signals without generating an unusable
   lattice?
8. How are multi-lingual labels and language-specific senses represented?
9. What evidence distinguishes an important cross-domain insight from a noisy
   link prediction?
10. How much structure can be inferred before review cost exceeds the value of
    ordinary notes and search?
11. What was the exact earlier “approach B” alternative? The recoverable context
    suggests a more embedding/document-centric route, but its full contract was
    not preserved and must not be reconstructed as certainty.
12. Which evidence and task change justify an immediate structural-shock
    generation rather than an incremental attachment?
13. How should independently useful domain structures be compared without
    collapsing them into one gold hierarchy?
14. Which topology-generation and lineage semantics, if any, become portable
    enough for a future profile after Issue #8 is exercised?

## Deferred work

- universal ontology design;
- full concept-lattice materialization over the personal corpus;
- automated promotion of inferred domains into protocol vocabulary;
- collaborative ontology governance;
- federation and ontology alignment across organizations;
- stable generated-document URLs and publication guarantees;
- autonomous restructuring without an attributable decision.

The first personal slice needs only enough organization to find and judge
knowledge. The richer ontology should be earned by repeated failures of the
simpler approach.
