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

## Current evidence checkpoint — 2026-07-14

GraphTruth is moving from foundation work toward its first real utility test.
The foundation documents, experiment method, public synthetic preflight, and an
isolated S0-S1 runtime-boundary rehearsal exist. Stage 0 has not formally exited:
its independent-review and invariant-to-conformance evidence is not yet
complete. The [current invariant map](INVARIANTS.md) makes those implemented
mechanisms and missing proofs explicit.

The [recorded runtime-boundary rehearsal](../runtime/rehearsal/observed.md)
passed its declared isolation, crash/resume, rebuild, and controlled-deletion
checks, and the
[owner confirmed the exact report](../runtime/rehearsal/owner-signoff.json)
separately. It was not the full synthetic dress rehearsal required before a
private run: it did not deliberately exhaust every declared budget or execute
the frozen baseline, scoring, and decision workflow. The result admits continued
experiment preparation. It does not show that GraphTruth is useful on real work,
admit private bytes to a changed runner, or satisfy Stage 1.

The evidence ladder remains deliberately narrow. Its integration step is
complete:

1. **Completed 2026-07-14:** align Issue #6 and project notes with the
   boundary-rehearsal evidence published in PR #14 and the hardening and
   integration completed in PR #15–16, including focused time already consumed
   from the issue-wide time box;
2. **In progress 2026-07-14:** freeze one external private evidence contract of
   three to five sources with at least eight tasks, withheld oracle, Markdown
   plus `rg` baseline, capture-tax accounting, handling rules, and a
   predeclared `keep / shrink / stop` gate;
3. implement only the private chronological lane needed for that pack, repeat
   the isolated runtime-boundary rehearsal because the runtime identity and
   attack surface changed, and then complete the full synthetic dress rehearsal,
   including declared budget-exhaustion behavior; before revealing private
   bytes, bind the exact admitted code, configuration, policy, and rehearsal
   report to the frozen contract in a final run card;
4. run the frozen baseline and GraphTruth lanes plus a separate correction
   fork, score the full denominator, and record **expected / observed /
   learned**;
5. if the result is `keep`, run the bounded order-robustness successor; otherwise
   select one smaller hypothesis or stop. Only then choose the next major work
   track.

Preparation for step 2 is complete: PR #18 published and independently checked
a sealed four-source, eight-task fictional twin plus the owner-only freeze
procedure before any private episode was selected. This strengthens the
non-derivation boundary but does not complete step 2. The real episode,
manifest, exact private task set and oracle, two closed reviews, and external
private seal remain pending; no evaluated run has occurred.

The existing Issue #6 budget covers integration through the chronological
decision in steps 1–4: five working days with a hard stop after two calendar
weeks. A working day is one distinct Europe/Moscow date with material
GraphTruth repository activity on or after Issue #6 was opened. Multiple
commits, pull requests, or substantive issue updates on the same date count
once; a date with no repository activity counts zero. Foundation work on
2026-07-11 predates the issue and is outside its budget. The current ledger is:

| Day | Active date | Retained repository evidence |
| ---: | --- | --- |
| 1 | 2026-07-12 | Issue #6, experiment design, and preflight |
| 2 | 2026-07-13 | starter-corpora plan |
| 3 | 2026-07-14 | runtime rehearsal integration, hardening, G1 twin, and state synchronization |

Therefore three of five days are accounted for and two remain. Further work on
2026-07-14 remains inside day three; the next new active date is day four.
Before the first project activity on day five, the owner must explicitly choose
to continue, shrink the contract, or stop. Subdividing the work does not reset
the activity-day budget. The 2026-07-26 calendar stop remains independent. The
order successor after `keep` starts under a new issue and time box. If the
current budget is exhausted before its decision, record the learning and close
or explicitly replace the experiment before continuing.

The validated [OpsKarta work map](planning/graphtruth.plan.yaml) decomposes this
near path and leaves later capabilities as sparse horizons. Its milestone names
are operational identifiers; the numbered stages below remain the authority
for capability maturity.

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
