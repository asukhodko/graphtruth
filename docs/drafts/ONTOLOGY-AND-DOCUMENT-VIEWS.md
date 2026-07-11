# Emergent Ontology, Domains, and Document Views

> **Status:** Recovered design context — non-normative.
> **Captured:** 2026-07-11.
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
- discover the bounded but initially unknown domains behind that stream;
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

- streaming hierarchical clustering;
- online topic models such as online LDA or nonparametric topic candidates;
- graph community detection over several typed projections;
- co-citation, co-reference, and co-use graphs;
- density- or embedding-based clustering;
- incremental FCA and implication discovery;
- change-point and concept-drift detection;
- ensemble comparison to expose unstable boundaries.

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
- split/merge proposals with impact previews;
- orphan and overly broad node detection;
- navigation optimization based on real retrieval paths;
- drift alarms when membership or meaning changes materially.

### Cross-domain insight candidates

- link prediction with explicit evidence paths;
- bridge and articulation analysis;
- shared mechanism or graph-motif retrieval;
- rare but supported co-occurrence;
- structural analogy and role mapping;
- contradictions or shared questions spanning views;
- change correlation followed by causal discipline, never automatic causation.

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

## Evaluation questions

### Classification quality

- precision and recall against curated memberships where a gold set exists;
- stability under new events and model updates;
- false merge and false split rates;
- coverage of multi-classification;
- explanatory evidence for every membership;
- sensitivity to vocabulary versus relational structure.

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

### Experiment O2 — hierarchy drift

Add events that force a domain split, merge, and cross-classification. Verify
that stable record IDs survive, historical views remain reconstructible, and
generated pages show the change rather than silently rewriting history.

### Experiment O3 — code as a demanding domain

Combine text with symbols, definitions/references, call paths, configuration,
schemas, and an incident. Compare text-only organization with structural
adapters. Success is improved troubleshooting or change analysis, not a larger
graph.

### Experiment O4 — cross-domain mechanism retrieval

Plant two episodes with different vocabulary but the same relational mechanism.
Compare topic/embedding similarity with role-constrained structure mapping.
Require a prospective transfer prediction before calling the result useful.

## Promotion and ownership questions

The following may remain entirely in Zone 3:

- clustering and topic models;
- inferred memberships and labels;
- preferred navigation hierarchy;
- generated prose and page layout;
- ranking and restructure suggestions.

Potential profile or Zone 1 questions, only if interoperability evidence appears:

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
