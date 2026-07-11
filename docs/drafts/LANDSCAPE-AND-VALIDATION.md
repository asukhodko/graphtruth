# Landscape, Maturity, and Idea Validation

> **Status:** Non-normative research snapshot and recovered context.
> **Observed:** 2026-07-11.
> **REVALIDATE BEFORE DECISION:** Product capabilities, ownership, licenses,
> interfaces, standards status, and comparative conclusions can change. Verify
> them from current primary sources before architecture, dependency, legal,
> positioning, or procurement decisions.
> **No novelty/FTO claim:** This is a bounded landscape scan, not an exhaustive
> prior-art search, patent analysis, legal opinion, or freedom-to-operate review.

## Purpose and limits

This note preserves research and working conclusions that are valuable to the
GraphTruth design but are not normative project decisions. It compares the
project with adjacent standards, open-source systems, and proprietary products;
states a cautious uniqueness thesis; stress-tests the idea; and records
falsifiable tests for a six-month personal implementation intended to remain
useful for at least three years.

The original discussion could not be recovered verbatim. The conclusions below
were reconstructed from the project documents, the available conversation
history, and primary sources observed on the date above. Absence from this scan
is not evidence that no relevant system exists.

## Executive conclusion

Most primitives in GraphTruth already have mature precedents:

- provenance and lineage;
- statements with qualifiers and references;
- temporal and bitemporal data;
- append-oriented or immutable history;
- local, file-based memory;
- graph, lexical, structural, and vector retrieval;
- argumentation and causal inference;
- active learning and information-gain policies;
- language-neutral index protocols and conformance tooling.

GraphTruth's plausible distinctiveness is therefore not a new database, graph
algorithm, or isolated record type. It is the deliberate combination of:

1. a file-first, end-of-life-recoverable canonical epistemic ledger;
2. exact evidence anchoring and attributable transformation history;
3. separate assertion revision, assessment, and policy-scoped acceptance;
4. facts as policy- and time-dependent views rather than privileged records;
5. bitemporal, non-destructive history;
6. contradictions, unanswered questions, and dark zones as useful state;
7. active acquisition of missing evidence;
8. experience, causal claims, mechanism patterns, and transfer attempts;
9. contextual dossiers rather than detached retrieval fragments; and
10. a durable protocol, conservative core tooling, and a replaceable runtime.

No single system in this bounded scan was verified to combine all ten around an
explicit EoL survival contract. That statement is a research observation, not a
claim of novelty. Several fast-moving neighbors already cover substantial
subsets, and the remaining integration may prove too expensive or too broad to
be useful.

A compact research framing is:

> GraphTruth resembles nanopublication-style attributable records,
> Wikibase-style honesty about statements, PROV-compatible lineage,
> event-sourced bitemporal history, Markdown-like data ownership,
> temporal-context-graph retrieval, assumptions-first causal analysis, and a
> SCIP-like producer/tool/consumer boundary, combined around a testable EoL
> survival contract. This is an analogy, not a selected implementation stack.

## Preliminary maturity assessment

Scores are hypotheses for planning, not quality grades. A high conceptual score
does not imply a working product.

| Area | Maturity | Evidence and limitation |
| --- | --- | --- |
| Problem and mission | High | The failure of answer-first, opaque, context-losing knowledge systems is described clearly. |
| Foundational principles | High | Authority, provenance, history, uncertainty, file-first storage, and replaceability have explicit boundaries. |
| Architectural zones | Medium-high | The dependency and authority model is coherent but has not been tested by implementation pressure. |
| Conceptual record model | Medium | Important distinctions exist, but the minimal core versus optional profiles remains unsettled. |
| Normative protocol | Initial | No released normative specification, version negotiation, serialization, or conformance level exists. |
| Canonical format and migrations | Unstarted | Core format, identity, canonicalization, hashing, packaging, and migration rules remain open. |
| Protocol tooling | Initial | Repository checks exist; protocol validators, migrators, renderers, and fixtures do not. |
| Default runtime | Unstarted | There is no ingestion, corpus store, index, retrieval, or correction loop yet. |
| Dogfood evidence | Unstarted | No sustained real corpus demonstrates capture cost, retrieval value, or trust. |
| Unique-combination thesis | Plausible, unproven | No exact match was found in the bounded scan, but major neighbors overlap strongly. |
| Three-year durability by design | Promising | The architecture targets replaceability and archival completeness. |
| Three-year durability in practice | Unproven | No old corpus, migration chain, clean-room rebuild, or independent reader exists. |

The idea is mature enough to justify a narrow experiment. It is not mature
enough to freeze a broad ontology or promise interoperability. Six months is a
reasonable horizon for one dependable personal vertical slice, not for the full
vision.

## Prior-art and neighboring-system map

### Durable provenance, statements, and interchange

#### W3C PROV

The [W3C PROV family](https://www.w3.org/TR/prov-overview/) defines a mature
model and serializations for entities, activities, agents, derivation,
attribution, versioning, validation, and provenance access. It also includes a
human-readable notation and formal constraints.

**Overlap:** transformation lineage, actors and processes, provenance of
provenance, validation, versioning, and reproducibility metadata.

**GraphTruth-specific work:** assertions, assessments, acceptance decisions,
fact-view policies, contradictions, questions, experience, causal scope, and
retrieval dossiers.

**Design implication:** GraphTruth should conduct an explicit PROV mapping
before inventing generic provenance vocabulary. Reuse may be semantic, an
export profile, or a compatibility mapping; adopting RDF wholesale is not
implied.

#### Wikibase and Wikidata

The [Wikibase data model](https://www.mediawiki.org/wiki/Wikibase/DataModel/Primer)
is a direct conceptual precedent. It represents statements rather than claiming
to encode unqualified truth. A statement contains a claim, optional qualifiers,
references, and rank; multiple divergent statements and explicit unknown/no
value cases can coexist.

**Overlap:** statements instead of truth, entity identifiers, qualifiers,
references, divergent values, unknowns, and revision history.

**Difference worth testing:** GraphTruth proposes exact versioned evidence
spans, separately attributable assessment and acceptance, two time axes,
reconstructible policy views, active questions, and experience/causal profiles.

**Design implication:** neither “claims, not truth” nor referenced graph
statements should be presented as unique. Wikibase should be included in data
model comparison fixtures.

#### Nanopublications

[Nanopublications](https://nanopub.net/) package a small formal assertion with
its provenance and publication information. They are attributable, citable,
linkable, machine-interpretable, and supported by a decentralized publication
ecosystem.

**Overlap:** small attributable records, assertion/provenance separation,
publication metadata, stable identity, and independent reuse.

**GraphTruth-specific work:** event capture, evidence spans, assertion revision
lifecycle, acceptance policies, bitemporal views, questions, dossiers, active
acquisition, and experience/causality.

**Design implication:** investigate nanopublication envelopes, trusty
identifiers, supersession, indexes, and signing before selecting GraphTruth
record packaging or content-addressing rules.

#### Web Annotation, JSON-LD, RDF, and SHACL

The [Web Annotation Data Model](https://www.w3.org/TR/annotation-model/) is
relevant to selectors and evidence anchoring. [JSON-LD 1.1](https://www.w3.org/TR/json-ld11/)
offers linked-data semantics in JSON. [RDF 1.2](https://www.w3.org/TR/rdf12-concepts/)
is relevant to quoted statements and graph identity. [SHACL](https://www.w3.org/TR/shacl/)
defines RDF graph constraints, validation reports, and conformance behavior.

These are candidate substrates or mappings, not automatic choices. Their
expressiveness may improve interoperability while increasing implementation
and human-editing complexity.

**REVALIDATE BEFORE DECISION:** verify the normative status and implementation
diversity of the exact RDF version and features under consideration.

#### OpenLineage

[OpenLineage](https://openlineage.io/docs/) is an instructive protocol precedent:
an extensible event specification for datasets, jobs, and runs, with consistent
identities, custom facets, integrations, and a reference backend.

**Overlap:** event capture, lineage, extensions, producer interoperability, and
separation of a standard from its storage backend.

**Lesson:** a narrow interoperable core can earn integrations. GraphTruth should
avoid requiring every epistemic feature in its minimal writer profile.

#### Argumentation and inference models

The Argument Interchange Format and Argument Web model support, conflict,
preference, and applications of inference rules. CIDOC CRM extensions such as
CRMinf address inference-making and belief in evidence-rich cultural heritage
records.

**Overlap:** support/challenge structure, inference provenance, competing
arguments, and attributed belief.

**Design implication:** compare these models before defining canonical
assessment and argument relations. GraphTruth should not accidentally reduce a
rich argument to an unexplained positive or negative edge.

### Temporal and immutable data systems

Systems such as TerminusDB, XTDB, Datomic, event stores, and versioned data
platforms demonstrate different subsets of immutable values, transaction
history, as-of queries, valid-time support, branching, or diffing. This bounded
scan did not verify that every system supplies every capability.

**Overlap:** append-oriented records, as-of queries, valid-time queries,
non-destructive correction, and reproducible projections.

**Difference:** these are general storage semantics. They do not by themselves
define evidence, claims, assessments, acceptance, questions, or causal
interpretation, and they normally make a database operationally authoritative.

**Design implication:** use them only as replaceable projections unless a
portable export demonstrably preserves all GraphTruth semantics. Database
immutability is not the same as an EoL-readable archive.

### Dynamic context graphs and agent memory

#### Graphiti and Zep

[Graphiti](https://github.com/getzep/graphiti) is one of the closest modern
runtime neighbors found in this bounded scan. Its observed repository state
builds temporal context graphs from episodes, tracks changing relationships and
history, retains provenance to raw episodes, and combines semantic, lexical,
and graph retrieval. Zep supplies managed infrastructure around it.

**Strong overlap:** evolving information, episode provenance, temporal facts,
incremental ingestion, hybrid retrieval, ontology evolution, and agent context.

**Current differentiators to validate:**

- portable canonical files rather than a graph store as the durable authority;
- exact source-version evidence spans;
- assertion revision versus assessment versus acceptance;
- fact views under named policy and two time axes;
- archival completeness and independent conformance;
- active dark-zone acquisition;
- experience, mechanism, causal, and transfer records.

Graphiti could be a Zone 3 experiment or baseline. It must not silently define
Zone 1 semantics.

**REVALIDATE BEFORE DECISION:** check current storage backends, protocol/spec
work, export guarantees, license, provider requirements, and the open-source
versus Zep boundary. Its documented deprecation of a Kuzu backend after upstream
maintenance ended is itself evidence for keeping GraphTruth's indexes
replaceable.

#### OpenClaw, formerly Clawdbot

The [OpenClaw memory documentation](https://docs.openclaw.ai/concepts/memory)
observed on the snapshot date describes plain Markdown memory without hidden
model state, layered daily and long-term notes, rebuildable lexical/vector
indexes, reviewable consolidation, and a knowledge-wiki layer with structured
claims, evidence, contradiction, and freshness tracking.

This is a substantial and fast-moving overlap with GraphTruth's file-first agent
memory and contextual access goals.

**Potential GraphTruth boundary:** a standalone protocol and corpus that can be
read by OpenClaw or other agents, with exact evidence, bitemporal assertion and
acceptance semantics, conformance, EoL completeness, and causal/transfer
profiles. GraphTruth should not compete merely as another assistant memory
plugin.

**Strategic experiment:** evaluate a GraphTruth reader or memory adapter for
OpenClaw. If OpenClaw's wiki format becomes a practical de facto format, prefer
mapping or import/export over gratuitous duplication.

**REVALIDATE BEFORE DECISION:** the Clawdbot/OpenClaw names, plugin model,
schemas, storage, and memory-wiki capabilities have changed rapidly. Current
features may postdate the original discussion.

#### Mem0, Letta, and Cognee

- [Mem0](https://github.com/mem0ai/mem0) supplies agent memory, entity linking,
  temporal retrieval, and managed and self-hosted options.
- [Letta](https://github.com/letta-ai/letta), formerly MemGPT, focuses on
  stateful agents and memory management.
- [Cognee](https://github.com/topoteretes/cognee) combines ingestion, a
  knowledge graph, vector retrieval, and persistent agent memory.

These systems optimize recall, personalization, and agent performance. Their
primary contract is not necessarily an independent epistemic archive with
portable claim history and EoL conformance.

At the Letta repository revision observed in the source evidence ledger, project
documentation pointed active development away from a former server repository.
That observed transition is a useful anti-legacy case: a product can remain
active while a particular architecture and API become legacy.

**REVALIDATE BEFORE DECISION:** distinguish open-source code from managed-only
algorithms and features; verify current licenses, data exports, model
dependencies, and benchmark reproducibility.

### Knowledge graphs, operational ontologies, and GraphRAG

#### Palantir Ontology

The proprietary [Palantir Ontology](https://www.palantir.com/docs/foundry/ontology/overview)
combines objects, properties, links, actions, functions, security, governance,
applications, and operational decision workflows around an organizational
digital twin.

**Overlap:** semantic objects and links, decisions and actions, applications,
derived properties, time, governance, and operational use.

**Difference:** it is a vendor platform and organizational operational layer,
not a portable personal epistemic protocol. Its breadth demonstrates the scope
explosion that occurs when a knowledge graph also becomes an action platform.

**REVALIDATE BEFORE DECISION:** verify export, lineage, historical, and ontology
versioning guarantees before making any precise comparison.

#### Generic knowledge-graph platforms

Wikibase, Neo4j, Stardog, GraphDB, TopBraid, TerminusDB, and similar systems can
store ontologies, relationships, provenance, and inferred facts. Some support
reasoning, federation, constraints, history, or vector retrieval.

They are substrates and possible indexes, not complete answers to GraphTruth's
epistemic lifecycle. A generic graph engine can represent almost any model; that
does not mean it supplies the intended semantics, recovery contract, or user
workflow.

#### GraphRAG and related retrieval frameworks

[Microsoft GraphRAG](https://microsoft.github.io/graphrag/) and related systems
extract entities and relationships, build graph-derived summaries, and retrieve
broader context than flat chunk search.

[OpenSPG KAG](https://github.com/OpenSPG/KAG) is another moving neighbor that
combines a knowledge representation engine, logical-form-guided retrieval and
reasoning, and LLM-assisted domain question answering. It reinforces that
knowledge-guided retrieval and reasoning are not themselves a unique GraphTruth
claim. Its exact storage, reasoning, licensing, and managed/open-source boundary
must be revalidated before any comparison or dependency decision.

**Overlap:** graph-assisted retrieval, context assembly, clustering, and
summarization.

**Difference:** the graph and summaries are usually products of an indexing
pipeline. GraphTruth's durable record must preserve evidence and epistemic
history independently of any particular extraction or summary model.

### File-first personal knowledge systems

Obsidian, Logseq, plain Markdown repositories, and similar tools provide the
most important usability baseline:

- nearly frictionless capture;
- local file ownership;
- ordinary text tools and diffs;
- backlinks and lightweight graph views;
- a large ecosystem and low exit cost.

GraphTruth must demonstrate that its additional structure earns its capture and
maintenance cost. A sophisticated protocol that users avoid is inferior to
Markdown plus links and search.

### Archival packaging and preservation

- [RO-Crate](https://www.researchobject.org/ro-crate/) packages research data
  with lightweight machine-readable metadata and relationships.
- [BagIt, RFC 8493](https://www.rfc-editor.org/rfc/rfc8493) defines a transparent
  filesystem package with payload manifests and integrity checks.
- [OCFL](https://ocfl.io/1.1/spec/) defines an application-independent,
  structured, transparent layout for versioned digital objects.

These are not epistemic models. They are candidates for export packaging,
inventory, integrity, and preservation mechanics. GraphTruth should not invent
an archive container before comparing them.

### Causal-analysis tooling

[DoWhy](https://www.pywhy.org/dowhy/v0.14/) treats causal assumptions as
first-class, separates identification from estimation, and supports sensitivity,
refutation, causal structure, interventions, and counterfactual analysis.

**Overlap:** explicit assumptions, causal graphs, interventions, alternative
explanations, robustness, and counterfactual reasoning.

**Boundary:** GraphTruth should record causal questions, inputs, assumptions,
analyses, and outcomes. It need not reimplement causal estimators. Causal tools
should produce attributable analysis artifacts and candidate causal claims.

## What may actually be distinctive

The strongest defensible thesis is a combination thesis, with four particularly
unusual centers:

### Epistemic separation

An assertion's authorial lifecycle, another actor's assessment, and a named
policy's acceptance decision are different records. Counting all three as a
single status destroys provenance and legitimate disagreement.

### EoL as a conformance property

“File-first” is not merely a local-storage preference. A declared complete
archive should allow a future independent implementation to validate, inspect,
migrate, and rebuild supported access structures without hidden database or
model state.

### Experience-to-transfer path

The system aims to preserve the situation, constraints, alternatives,
prediction, intervention, outcome, mechanism hypothesis, failure boundary, and
later transfer attempt. This does not serialize tacit knowledge, but it creates
a testable scaffold for converting passive information into practiced
capability.

### Ignorance as acquisition work

Contradictions and missing explanatory links are not just warnings. They can
become ranked requests for evidence, observations, experiments, or judgment,
with the result returning to the same ledger.

These centers also create the greatest complexity and must earn their place
through dogfood evidence.

## Strengths of the idea

### Durable value

- Canonical meaning can survive a database, model, vendor, or UI.
- Old decisions can be revisited against ledger-visible records and any
  separately evidenced account of what the decision-maker knew, with explicit
  completeness limits.
- Migrations and corrections preserve, rather than falsify, history.
- A provider or index can be removed without deleting intended durable meaning.

### Epistemic honesty

- Claims do not become truth merely because a model extracted them.
- Contradiction and uncertainty remain visible instead of being smoothed away.
- Multiple trust policies can operate over one corpus without rewriting it.
- Confidence remains attributable to a producer, method, dimension, and time.

### Better use of accumulated knowledge

- Dossiers can restore evidence, temporal scope, disagreement, and open
  questions around a result.
- Dark zones can direct attention toward valuable missing evidence.
- Experience and mechanism records may support transfer by structural roles
  rather than vocabulary alone.

### Architectural adaptability

- Zone 1 can remain independent of language, database, model, and UI.
- Zone 2 can make semantics executable without becoming authoritative.
- Zone 3 can adopt rapidly improving retrieval and inference methods.
- Existing standards and engines can be reused behind explicit boundaries.

## Risks, flaws, and failure modes

### Critical product risks

#### Scope explosion

The full vision combines personal knowledge management, event sourcing,
knowledge graphs, provenance, temporal databases, information retrieval, RAG,
argumentation, active learning, causal inference, agent memory, archival
preservation, and security. That is a research program, not one six-month
feature set.

#### Capture tax

Useful epistemic records need source, context, time, evidence, actor, lifecycle,
and sometimes assumptions. Manual entry may make the system unusable. Fully
automatic extraction introduces silent error. The likely answer is two-speed
capture: preserve the source immediately, then add inspectable candidates and
progressive enrichment.

#### Weak everyday payoff

Auditability is valuable during disputes or retrospectives but may feel costly
during ordinary work. GraphTruth must surface forgotten context, prevent a real
mistake, or produce a useful question often enough to justify its overhead.

#### Parallel-authority failure

If the user keeps an ordinary notebook as the real memory and treats GraphTruth
as a secondary experiment, the product has failed even if its schemas validate.

### Critical protocol risks

#### Premature standardization

The most dangerous legacy is not a replaceable database. It is a stable-looking
protocol that froze a wrong ontology before repeated use. The minimal core must
be smaller than the full conceptual model.

#### Interoperability theater

Language-neutral files do not prove implementability. If a second reader cannot
be built from the specification and fixtures alone, the implementation contains
hidden semantics.

#### Extension fragmentation

Namespaces and safe degradation do not ensure interoperability. Mandatory
profiles can form mutually incompatible dialects, and unknown required
extensions may make large archive regions unusable.

#### Semantic identity drift

Stable identifiers can still point to evolving concepts. Entity merges,
predicate redefinition, ontology revisions, and changed units must preserve the
meaning that historical records had when written.

#### Unbounded append history

Audit history grows indefinitely. Compaction, tombstones, snapshots, and
retention must not make past views unreconstructible or leave indexes dependent
on discarded state.

### Analysis-quality risks

#### False contradictions

Two statements conflict only after aligning entity identity, predicate meaning,
units, scope, modality, context, and overlapping valid time. Naive contradiction
detection will create false alarms and destroy trust.

#### Illusory dark zones

Absence from a corpus is not proof that knowledge is absent from the world or
even from the user. Dark-zone detection requires declared coverage expectations
and impact policy.

#### Misleading confidence

One scalar cannot safely combine extraction certainty, source reliability,
evidence strength, model calibration, relevance, and policy acceptance.
Apparent mathematical precision may hide incomparable dimensions.

#### Circular machine support

One model-generated summary must not support another claim that was derived
from the same source or summary and thereby manufacture independent evidence.
Common derivation ancestry must be visible to support aggregation.

#### Retrieval overload

A dossier can become a context dump. More provenance and neighbors do not
always improve judgment. Context selection needs budgets, diversity, and a
reason for every included component.

### Causality and experience risks

#### Causal overclaiming

Sequence, provenance, rationale, and correlation do not identify an
intervention effect. Retrospective episodes are vulnerable to confounding,
selection bias, and hindsight.

#### Tacit knowledge loss

Embodied skill and pattern recognition cannot be fully serialized. Experience
records can scaffold deliberate practice but cannot guarantee that knowledge
has become usable capability.

#### Narrative mechanism bias

LLMs are good at plausible explanations. A mechanism story without discriminating
predictions, counterexamples, and failure boundaries can be more misleading than
an explicit unknown.

#### Transfer illusion

Surface analogy may conceal a material causal difference. Transfer attempts
need role mappings, differences, prospective predictions, and recorded failure,
not only “similar” cases.

### File-first and operational risks

#### Filesystem limitations

Many small files, high-frequency updates, concurrent writers, atomic multi-record
changes, large media, and remote synchronization all require deliberate layout
and transaction design. “Files” does not mean “one file per fact” or “Git as the
runtime database.”

#### Rebuildability in name only

An index that technically rebuilds over several weeks, at prohibitive model
cost, or only with a vanished service is not operationally replaceable. Rebuild
budgets and the meaning of equivalent results must be specified.

#### Human-readable in name only

Millions of JSON records may be text but not human-usable. Critical archives
need inventories, summaries, renderers, and static views in addition to a
machine representation.

#### Source loss and rights

A URL can disappear or change. Retaining a local source copy may violate
license, confidentiality, or deletion obligations. Each source needs an
explicit retention state: retained, external, licensed, unavailable, redacted,
or removed.

#### Privacy versus immutable history

Append-oriented history conflicts with deletion, consent withdrawal, secret
rotation, and sensitive embeddings. A digest must not become an indirect way to
retain prohibited data.

### Security and authority risks

- Ingested sources can contain prompt injection and malicious instructions.
- A poisoned source can generate many apparently corroborating derived records.
- A signature proves identity and integrity, not correctness.
- Search and vector projections can leak data omitted from visible views.
- Automated acquisition can trigger expensive or unsafe external actions.
- A fluent UI can make a candidate look accepted even when the record model is
  correct.

Ingestion, proposal, assessment, acceptance, publication, administration, and
external action must remain distinct capabilities.

### Governance and ecosystem risks

- Personal dogfood may overfit one person and one corpus.
- A central extension registry can become a fragile authority; a registry does
  not by itself prevent incompatible vocabularies.
- A public protocol without independent consumers is merely an internal format.
- Licensing data, schemas, specification text, examples, and software may need
  different treatment.
- Long compatibility promises before validation can preserve mistakes for years.

## Falsifiable hypotheses

Every major benefit should be expressed as an experiment with a failure signal.

| Hypothesis | Test | Failure or falsification signal |
| --- | --- | --- |
| Canonical files survive runtime loss | Delete all disposable stores and runtime state, then restore on a clean machine. | A decision, evidence relation, or supported view requires hidden DB/model state. |
| Provenance improves real judgment | Compare a task using GraphTruth with the same task using plain notes or ordinary RAG. | Traceability changes neither correctness nor useful decision time. |
| Dossiers outperform isolated hits | Blindly evaluate applicability and error detection with dossier, top chunks, and full-text baselines. | Dossiers add noise or cost without improving outcomes. |
| Capture cost is sustainable | Dogfood for 30–90 days and measure abandoned captures and parallel notes. | The owner maintains another authoritative notebook or defers most capture. |
| Contradiction detection is trustworthy | Use synthetic edge cases and reviewed real conflicts with known entity, scope, modality, and time differences. | False positives cause alerts to be ignored; important conflicts are routinely missed. |
| Dark zones lead to valuable acquisition | Track generated questions through answer, action, and later reuse. | Most questions are ignored, unanswerable, low impact, or redundant. |
| Active acquisition has positive value | Compare expected cost/risk with realized knowledge and decisions. | Acquisition costs more than the uncertainty it resolves or causes unsafe actions. |
| Mechanism retrieval improves transfer | Record predictions before outcome and compare structural retrieval with lexical/vector baselines. | Transfer success is no better, or explanations are only retrospective stories. |
| A protocol exists independently of code | Build a minimal reader or validator from the specification and fixtures, preferably in another language. | Developers must inspect the default runtime to infer meaning. |
| Index implementations are replaceable | Swap graph, lexical, vector, or model-backed components and rebuild from the archive. | Essential semantics or irreplaceable judgments live in an index. |
| Provider removal is survivable | Disable the current LLM and embedding providers. | Existing knowledge becomes unreadable or corrections become impossible. |
| Old corpora remain auditable | Migrate golden corpora through multiple versions and compare declared invariants. | Migration loses provenance, silently changes meaning, or needs undocumented edits. |
| The archive is useful after EoL | Validate offline and inspect static human renderings without the runtime. | The archive is formally valid but practically opaque. |
| Privacy controls are honest | Perform source deletion, evidence redaction, index purge, and key-loss drills. | Sensitive content persists in projections or audit limitations are hidden. |
| Unknown extensions degrade safely | Open a corpus with optional and mandatory unknown extensions. | A reader guesses semantics, drops data, or returns an unsafe fact view. |
| Rebuild is operationally affordable | Measure clean rebuild wall time, compute, model calls, storage, and failure recovery. | Rebuild exceeds the declared recovery budget. |

## Kill, shrink, and defer criteria

These criteria protect the project from preserving attractive but unsupported
complexity.

- If structured canonical records do not produce measurable recovery or
  provenance benefit over plain Markdown, shrink GraphTruth to a minimal file
  convention plus tooling.
- If enrichment cost prevents capture, retain raw events and move most structure
  to optional, reviewable analysis rather than mandatory fields.
- If a second reader is hard to implement, simplify the serialization and
  normative semantics before adding features.
- If contradiction precision remains poor, expose candidate comparisons on
  demand rather than proactive alerts.
- If active questions have low action yield, keep questions user-created and
  treat automatic ranking as an experiment.
- If mechanism-oriented retrieval does not outperform lexical/vector baselines,
  keep experience and causality in an optional profile.
- If causal records become narrative decoration without prospective tests,
  remove causal promotion and preserve only episodes and hypotheses.
- If supported projections cannot meet a recovery budget, narrow the supported
  projection set or retain additional declared artifacts.
- If privacy deletion cannot purge all projections, prohibit sensitive domains
  until the architecture is corrected.
- If an existing standard represents a concept adequately, prefer mapping or
  reuse over a GraphTruth-specific equivalent.
- If no independent consumer appears before a stable protocol release, describe
  the format as an application format, not an ecosystem protocol.

## Realistic six-month vertical slice

The six-month goal should be one narrow, complete, personally useful loop. It
must exercise every durability boundary without pretending to implement the
entire research vision.

### Required scope

1. **One or two source classes.** For example, Markdown/work notes and one
   versioned external artifact type.
2. **Raw-first capture.** Preserve source identity, version, actor/process, and
   recorded time before interpretation.
3. **Minimal record envelope.** Version, identifier, record type, provenance,
   time, extension declarations, and integrity metadata where needed.
4. **Evidence anchoring.** Exact spans against an immutable source version, with
   an explicit unavailable/redacted state.
5. **Minimal epistemic vocabulary.** Entity, assertion revision, assessment,
   acceptance decision, question, and necessary lifecycle relations.
6. **Canonical files and atomic append.** A documented layout with crash-safe
   writes, inventory, and deterministic validation.
7. **Core tooling.** Validator, renderer, import/export, integrity check, and at
   least one exercised migration.
8. **Two access paths.** One lexical and one structural/relational path; vectors
   are optional.
9. **Dossier assembly.** Answer, evidence, provenance, time/scope, conflict, and
   unanswered question under a declared policy.
10. **Correction workflow.** Correct a bad extraction without erasing the source
    or earlier view.
11. **Bounded contradiction.** Support a deliberately small structural case,
    including negative fixtures for false contradictions.
12. **Recovery.** Delete indexes, restore from backup, rebuild, validate, and
    inspect the result on a clean environment.
13. **Replacement.** Swap at least one index or model provider.
14. **Dogfood.** Use the system on real work long enough to produce corrections,
    surprises, and a useful unanswered question.

### Experimental but permitted

- a simple `ExperienceEpisode` captured prospectively;
- predictions recorded before an outcome;
- one manually authored mechanism pattern;
- one explicit transfer attempt;
- LLM-assisted candidates with review;
- a vector index or graph projection;
- MCP access as an adapter.

### Explicitly deferred

- general causal discovery;
- automatic universal mechanism abstraction;
- autonomous experiments or external actions;
- a universal ontology;
- multi-user federation and distributed consensus;
- global extension registries;
- large-scale graph processing;
- a plugin marketplace;
- stable compatibility promises beyond exercised migrations;
- a complete replacement for every notes or agent-memory product.

### Suggested evidence at the end of six months

- the owner uses GraphTruth without a parallel authoritative notebook for the
  selected workflow;
- at least one real correction and one migration preserve historical views;
- one contradiction or forgotten context changes a decision or next action;
- an actionable question is generated and answered;
- all supported projections rebuild within a declared budget;
- the archive validates offline and has useful static renderings;
- a second minimal reader interprets the core without runtime source code;
- removal of the preferred LLM or embedding provider does not destroy existing
  knowledge;
- remaining ontology pressure is documented as evidence, not silently frozen.

<!-- markdownlint-disable MD029 -->

## Three-year anti-legacy contract

Avoiding legacy is a recurring test, not a technology choice. The following
contract should be refined into measurable requirements before a stable release.

### Protocol and meaning

1. Every canonical record declares the protocol version and required profiles.
2. Zone 1 contains no mandatory database, model, provider, programming language,
   service, UI, or transport.
3. Normative behavior states inputs, outputs, invariants, and failure modes and
   has positive and negative fixtures.
4. Unknown optional extensions round-trip without loss; unknown required
   semantics fail explicitly.
5. Identifier, canonicalization, digest, signature, and time semantics are
   versioned independently where necessary.
6. Historical vocabulary meaning remains resolvable even after an ontology
   changes.
7. Assertion lifecycle never silently incorporates assessment or acceptance.
8. Lossy migration is declared, attributable, reviewable, and preserves the
   original record or archive.

### Archive completeness

9. A declared EoL export includes canonical records, source-artifact inventory,
   protocol/schema/profile definitions, policy definitions, media types,
   encoding, integrity manifests, and identifier-resolution information.
10. Missing, external, licensed, redacted, or deleted evidence is enumerated;
    the archive never claims verification it cannot perform.
11. Critical records have human-readable renderings that do not require the
    default runtime.
12. The export can use a proven preservation package such as RO-Crate, BagIt, or
    OCFL if a comparison demonstrates fit; no bespoke container is presumed.
13. Encryption and signature metadata include key-lifecycle and key-loss
    behavior. Integrity cannot depend on a forgotten account or remote KMS.

### Conformance and migration

14. Golden corpora for every supported version run in continuous integration.
15. At least one minimal independent reader or validator exists before a stable
    protocol claim.
16. Supported migrations are rehearsed on real and synthetic corpora and report
    every semantic exception.
17. Compatibility matrices distinguish spec, schema, profile, tooling, corpus,
    and runtime versions.
18. Deprecation has an explicit migration path, evidence, and support horizon.
19. Old canonical files are never rewritten merely to satisfy a new index.

### Replaceable access and inference

20. Every supported projection has a documented source set, build identity,
    invalidation rule, and recovery budget.
21. Derived stores may be deleted at any time without deleting intended durable
    knowledge.
22. “Equivalent rebuild” defines semantic guarantees and allowed ranking or
    stochastic differences; it does not promise identical model bytes.
23. A provider-removal drill occurs at least twice a year.
24. A clean index rebuild and representative dossier comparison occur every
    three to six months.
25. Valuable nondeterministic results are retained, when justified, as
    attributable analysis records rather than assumed reproducible.
26. Basic reading, validation, migration inspection, and human rendering require
    no LLM.

### Operations and security

27. Canonical writes are atomic or recoverably journaled; interrupted ingestion
    cannot leave a valid-looking partial record set.
28. Backups include restoration tests, not only file copies.
29. Redaction and deletion drills include lexical, graph, vector, cache, log, and
    model-facing projections.
30. Source content is always untrusted data and cannot authorize acceptance or
    external action.
31. Capability grants, acceptance decisions, identity merges, publication, and
    external actions remain attributable and reversible where possible.
32. Dependency updates and LTS toolchain changes are practiced in focused work;
    the archive does not depend on a single abandoned parser or binary.
33. Recovery time, rebuild cost, migration failures, index drift, and oldest
    readable corpus are monitored as product health metrics.

### Governance and validation cadence

34. Protocol additions require repeated dogfood evidence, not only conceptual
    elegance.
35. One major protocol experiment is active at a time unless independent
    capacity exists.
36. External standards mappings are versioned and tested rather than asserted in
    prose.
37. Dynamic landscape claims are rechecked before public positioning and at
    least annually while the field changes rapidly.
38. The project explicitly distinguishes “merge-ready,” “implemented,”
    “validated in dogfood,” and “stable for interoperability.”

<!-- markdownlint-enable MD029 -->

## Research and decision backlog

The following work should precede irreversible format choices:

1. Compare GraphTruth's candidate provenance envelope with W3C PROV.
2. Compare `EvidenceSpan` selectors with Web Annotation selectors and state.
3. Map assertion, provenance, and publication metadata to nanopublications.
4. Compare Wikibase qualifiers, references, ranks, and revision semantics with
   GraphTruth assessments and acceptance decisions.
5. Prototype the same synthetic corpus in plain JSON, JSON-LD/SHACL, and one
   simpler alternative; measure readability, round-trip behavior, streaming,
   unknown extension preservation, and tooling burden.
6. Compare RO-Crate, BagIt, and OCFL for EoL packaging and versioned artifacts.
7. Define rebuild equivalence and recovery budgets before selecting indexes.
8. Evaluate Graphiti and OpenClaw as integration targets or baselines, not only
   competitors.
9. Build a contradiction fixture set dominated by near-misses, not easy direct
   negations.
10. Design a prospective experience/transfer experiment with a baseline and a
    precommitted success measure.
11. Conduct a privacy threat model covering source retention, hashes,
    embeddings, logs, redaction, and deletion.
12. Repeat the market and open-source scan before naming a stable release or
    making uniqueness claims.

## Safe public-positioning language

Prefer:

- “GraphTruth explores a combination of durable epistemic records, replaceable
  access layers, and active knowledge acquisition.”
- “In the systems reviewed as of the snapshot date, no exact match was
  identified.”
- “GraphTruth builds on established work in provenance, knowledge graphs,
  temporal data, archival packaging, and causal analysis.”

Avoid without stronger evidence:

- “the first”;
- “the only”;
- “unprecedented”;
- “guaranteed to preserve truth”;
- “causal understanding from documents”;
- “fully reproducible AI outputs”;
- “database-independent” before clean rebuilds prove it;
- “a protocol” before an independent reader proves implementability.

## Source evidence ledger

This table makes the research snapshot more reconstructible. A Git commit is the
repository head observed during this capture, not necessarily a stable release
or the exact revision behind a separately hosted documentation page. Where a
site did not expose an immutable revision, that absence is recorded explicitly.

| Source | Snapshot observed on 2026-07-11 | Use and limitation |
| --- | --- | --- |
| Graphiti | [`526dcad7`](https://github.com/getzep/graphiti/commit/526dcad7a300f3c5c506ff96a68bcdc7ca9f97ed) | Repository/README baseline; product and Zep boundaries still require revalidation. |
| Mem0 | [`17836748`](https://github.com/mem0ai/mem0/commit/17836748d7afe0521516c6a73c6a256680f05527) | Repository baseline; managed-only claims and benchmarks are outside this evidence. |
| Letta | [`b76da909`](https://github.com/letta-ai/letta/commit/b76da9092518cbaa2d09042e52fdcbde69243e18) | Repository baseline for the migration/deprecation observation; current SDK and service docs may differ. |
| Cognee | [`5b32da7c`](https://github.com/topoteretes/cognee/commit/5b32da7c08237e7274342114a72d82667d97c1f4) | Public repository baseline; SaaS-only behavior is not inferred. |
| OpenSPG KAG | [`fdab15b3`](https://github.com/OpenSPG/KAG/commit/fdab15b3929d2ee40dfcdd388f90233096a6afc9) | Repository baseline for a neighboring reasoning/RAG category, not an architectural evaluation. |
| Context7 | [`a9d7c77f`](https://github.com/upstash/context7/commit/a9d7c77f5e4c93c1c875b109d6d057487f2dc437) | Used in the technical-artifact note; hosted backend behavior is not reconstructible from the public repository alone. |
| SCIP | [`e01e97ef`](https://github.com/scip-code/scip/commit/e01e97efac2f6b8c266b4d04825f1f1eab7b8f6c) | Protocol/tooling precedent; language-indexer coverage changes independently. |
| Glean code index | [`19511125`](https://github.com/facebookincubator/Glean/commit/19511125f66f5a543df2c963dc6276c240205ae3) | Code-fact backend precedent; not the unrelated commercial workplace-search product. |
| Joern and the CPG specification | Revision not captured; sites observed 2026-07-11 | Capability-level comparison only. Pin the repository and specification revision before an adapter or schema decision. |
| Code-Graph-RAG | [`b00d8faa`](https://github.com/vitali87/code-graph-rag/commit/b00d8faa285f19fafc0254ce6e3a2797e1361a4a) | Experimental code-graph candidate; maturity and interfaces must be retested. |
| ctx-sys | [`260a0abf`](https://github.com/david-franz/ctx-sys/commit/260a0abf06c56cedd486ada22b582cc035bfe6d2) | Alpha context-assembly candidate; the observed revision explicitly required build-from-source. |
| OpenClaw memory and gateway docs | Revision not exposed; URLs and claims observed 2026-07-11 | Moving documentation may postdate the original discussion. Archive or pin an upstream revision before relying on behavior. |
| Palantir Ontology docs | Revision not exposed; overview observed 2026-07-11 | High-level product-class comparison only; no export or historical guarantee is inferred. |
| Microsoft GraphRAG docs | Revision not exposed by the viewed site; observed 2026-07-11 | Category baseline only; pin the repository/release in a future implementation spike. |
| W3C specifications, RFC 8493, OCFL 1.1, and versioned DoWhy docs | Versioned URLs linked in the relevant sections | Their normative status and implementation diversity still need an explicit mapping study. |

The same snapshot ledger applies to dynamic sources referenced by
[Technical artifacts](TECHNICAL-ARTIFACTS.md). Future research updates should
append a new dated snapshot rather than silently rewriting what was observed.
