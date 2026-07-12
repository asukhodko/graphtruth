# Roadmap

GraphTruth is being built from a personal, working system outward. The first target is not a platform, an ecosystem, or a complete theory of knowledge. It is a fully usable end-to-end version that preserves its owner's records durably and tests and refines the protocol through daily use.

This roadmap is ordered by evidence and maturity, not dates. It deliberately avoids commitments to programming languages, databases, model providers, deployment topology, and release cadence.

## Operating principles

- Build the smallest complete loop before broadening the domain.
- Dogfood real, imperfect information rather than optimizing for demonstrations.
- Keep the canonical corpus in inspectable files and treat indexes as disposable projections.
- Separate normative protocol behavior from replaceable product policy.
- Preserve source material, uncertainty, disagreement, and history instead of prematurely manufacturing a single truth.
- Add automation only where its output can be inspected, traced, and corrected. Retain valuable analysis as attributed canonical records; require supported projections to be rebuildable without promising byte-identical reproduction from unavailable models.
- Let recurring use reveal and continuously revise purpose-relative domain
  structure; do not require a closed domain list or design a universal ontology
  in advance.

## Stage 0 — Foundation

Establish the decisions that future implementation work must not accidentally obscure.

Outcomes:

- a clear mission, scope, principles, glossary, and architectural zones;
- an RFC process and an initial record of foundation decisions;
- an explicit monorepo strategy and dependency direction;
- a draft core protocol vocabulary;
- an initial versioning and extension envelope;
- representative end-to-end examples, including ambiguity, revision, conflict, and unanswered questions.

Exit evidence:

- two human reviewers, working independently, can distinguish normative protocol concepts from default implementation choices;
- each foundational invariant has an intended validation or conformance mechanism;
- unresolved design questions are recorded rather than silently decided in code.

## Stage 1 — Complete personal v0

Deliver one narrow but fully working vertical slice for daily personal use.

The loop must cover:

1. capture a real event or source fragment;
2. preserve exact evidence and provenance;
3. identify entities, form or revise assertions, and record questions;
4. validate and store canonical files;
5. rebuild every projection that the v0 implementation claims to support from retained canonical records and artifacts;
6. find relevant knowledge through more than one access path;
7. return a contextual dossier rather than an isolated search hit;
8. expose contradiction, uncertainty, provenance, and revision history;
9. correct a mistaken extraction without losing the original record;
10. back up, restore, and verify the corpus without the original indexes.

The implementation may support only a limited set of inputs, a single user, and modest corpus sizes. Reliability and reversibility matter more than breadth.

Exit evidence:

- the owner uses GraphTruth on real work repeatedly rather than maintaining a parallel authoritative notebook;
- a clean installation can rebuild all supported disposable projections from the retained canonical corpus and declared retained artifacts;
- every displayed claim can be traced to evidence, transformations, and policy decisions;
- interrupted ingestion and partial failures do not corrupt the canonical corpus;
- useful corrections and schema changes have been exercised through migrations;
- the system has surfaced at least some forgotten context, contradiction, or actionable unanswered question that ordinary search missed.

## Stage 2 — Dogfood expansion and model correction

Broaden the personal corpus only after the first loop is trustworthy.

Outcomes may include:

- additional source adapters and media types;
- stronger entity resolution without irreversible automatic merges;
- richer temporal and contextual retrieval;
- contradiction and dark-zone detection;
- active questions that prioritize valuable missing knowledge;
- experience records connecting situations, decisions, interventions, observations, and outcomes;
- mechanism-oriented and cross-context retrieval;
- discovery of initially unknown domains, soft multi-membership, and explicit
  unclassified states;
- versioned continuous domain-topology updates, including impact-previewed
  abrupt restructuring when new evidence bridges or separates earlier regions;
- operational diagnostics, backups, repair tools, and migration rehearsal.

This stage is expected to invalidate parts of the initial data model. Such corrections are progress when migrations preserve history and the specification records why the change was needed.

Exit evidence:

- several substantially different real workflows fit without product-specific changes to core semantics;
- a future-reveal corpus demonstrates domain birth, multi-membership, drift, and
  at least one missing-link structural shock while preserving prior as-of views;
- false merges, false contradictions, and misleading confidence displays are measurable and correctable;
- the system remains useful when inference or embedding providers are removed or replaced;
- extension mechanisms have been exercised without weakening core invariants.

## Stage 3 — Protocol hardening

Turn a successful personal protocol into one that another implementation could reproduce.

Outcomes:

- precise normative language and declared conformance levels;
- stable identifiers, canonicalization rules, and deterministic validation behavior;
- positive and negative conformance fixtures;
- explicit version negotiation, profiles, extensions, and migration rules;
- compatibility matrices for canonical files, schemas, tooling, and implementations;
- documented security, privacy, redaction, trust, and failure models;
- fuzz, property, migration, recovery, and cross-implementation tests where appropriate;
- removal of accidental assumptions inherited from the default implementation.

Exit evidence:

- a small independent reader or validator can be built from the specification and pass the same fixtures;
- normative behavior does not depend on a particular database, model, language, or deployment architecture;
- incompatible files fail explicitly and diagnostically;
- supported old corpora can be migrated and audited without losing provenance.

## Stage 4 — Open-source readiness

Public visibility does not by itself make a project open source. This stage prepares GraphTruth for responsible external use and contribution after the personal v0 is working.

The stage numbers express capability maturity, not strict release gates. The license decision may be made as soon as the working personal v0 is complete and may proceed while protocol hardening continues; completing every Stage 3 outcome is not a prerequisite for choosing a license.

Outcomes:

- an explicit license decision covering the intended protocol, documentation, data examples, and software artifacts;
- contribution, review, governance, security-reporting, and release policies;
- a reproducible development and conformance workflow;
- installation and first-use paths tested by people who did not design the system;
- clear stability labels and support expectations;
- provenance-safe example data with no private corpus dependencies;
- a public release whose claims match demonstrated behavior.

Exit evidence:

- an external user can install, run, inspect, rebuild its documented supported projections, and remove the system using published documentation;
- an external implementation can determine which behavior is required and which is optional;
- project governance can accept or reject contributions without ambiguity over rights or decision authority.

## Stage 5 — Ecosystem, only if earned

Possible later work includes independent implementations, SDKs, shared extension profiles, specialized inference and indexing engines, federation, collaborative knowledge workflows, and formal interoperability certification.

None of these is assumed to be necessary. Each must solve a demonstrated problem without compromising the durability, inspectability, and epistemic honesty of the core protocol.

## Deferred deliberately

The roadmap does not currently commit to:

- a universal knowledge ontology;
- distributed or multi-user operation;
- autonomous acceptance of machine-generated claims;
- global-scale graph processing;
- a plugin marketplace or hosted service;
- a particular storage engine, model, UI, or deployment environment;
- splitting the monorepo;
- release dates or a promise of backward compatibility before its rules are specified.

Deferral keeps these choices open. It is not a claim that they will never be useful.

## How priorities change

Work moves forward when the exit evidence for the current stage is substantially present. New ideas enter the roadmap when they strengthen the complete personal loop, protect durable protocol properties, or address repeated dogfood failures. Attractive features that do none of those remain experiments or are postponed.
