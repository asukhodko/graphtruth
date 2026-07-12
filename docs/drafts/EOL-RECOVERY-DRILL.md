# Recovered End-of-Life Recovery Drill

> Status: Recovered design context — non-normative
>
> Captured: 2026-07-11
>
> Authority: The archival-completeness and rebuild constraints in
> [Architecture](../ARCHITECTURE.md), [Principles](../PRINCIPLES.md),
> [Vision](../VISION.md), and accepted
> [RFC 0000](../../rfcs/0000-project-foundation.md) take precedence. This is a
> candidate test plan, not a current durability claim.
>
> Promotion rule: A recovery guarantee may be published only after its scope,
> retained inputs, exceptions, expected exactness, and failure criteria are
> specified and the drill has passed in a clean environment. Protocol-level
> archive semantics require the RFC/specification/conformance path.

## Purpose

File-first becomes meaningful only when deleting the original access layer does
not delete the intended knowledge. This drill turns “GraphTruth survives its
runtime” into falsifiable evidence. It covers a deliberate end of life, a clean
reinstallation, accidental loss of disposable state, and future replacement of
models or index engines.

This procedure must run on synthetic or explicitly authorized data. A public
test must never copy private dogfood material into the repository, logs, or an
unapproved external service.

## Status vocabulary

- **Working hypothesis** — candidate test or guarantee.
- **Alternative** — another valid recovery strategy.
- **Open question** — a boundary not yet defined.
- **Experiment** — a concrete drill action.
- **RFC candidate** — portable archive behavior needing standardization.
- **Deferred** — outside the first recovery slice.
- **Superseded** — a weaker assumption replaced by a testable claim.

## Recovery claims are scoped

**Superseded.** “The whole system can always be recreated exactly” is neither
credible nor necessary. Evidence may be unavailable, models may be stochastic,
and legally required deletion may make verification impossible.

**Working hypothesis.** An archive declares one or more separately testable
capabilities:

| Candidate capability | Recovery claim |
| --- | --- |
| Core-readable | Generic envelopes and base records can be identified and rendered |
| Semantically validatable | All requirements for named core/profile versions can be validated |
| Evidence-locatable | Each evidence reference resolves to a retained artifact or an explicit availability exception |
| Evidence-verifiable | Declared retained evidence matches its integrity identity and selector |
| Historical-view reconstructible | Named lifecycle, bitemporal, provenance, and policy views can be recomputed |
| Exact-projection rebuildable | Exact index/view classes reproduce specified semantic results |
| Heuristic-access regenerable | Search/analysis capability can be rebuilt to declared quality criteria, not historical bytes or ranks |
| Retained-analysis interpretable | Historical stochastic outputs remain inspectable with their inputs, model/configuration provenance, and limits |
| Analysis replayable | A named retained analysis can be rerun within its declared tolerance because all dependencies remain available |

Failure in one capability must not be hidden by success in another. For example,
records may remain readable while licensed evidence is no longer verifiable.

## Inputs to a drill

### Archive under test

**Working hypothesis.** The export includes or explicitly accounts for:

- canonical records and their revision, assessment, decision, and identity
  history;
- commit/order or equivalent recorded-visibility information;
- retained source artifacts and exact evidence selectors;
- explicit records for external, missing, redacted, licensed, or encrypted
  dependencies;
- named policy definitions needed by claimed views;
- protocol, schema, profile, extension, canonicalization, and migration version
  identifiers;
- frozen required specification/schema/fixture artifacts;
- media types, encodings, integrity algorithms, and identifier-resolution data;
- retained analysis outputs and their reproducibility metadata;
- an inventory, integrity roots, disclosure scope, and archival-completeness
  statement;
- critical human-readable renderings where future tooling cannot be assumed.

### Recovery oracle

Before destroying disposable state, select representative queries and invariants
without treating current runtime bytes as protocol authority:

- a set of canonical IDs and exact evidence spans;
- revision and acceptance views at boundary times;
- at least one contradiction with contextual explanation;
- at least one unanswered question or dark region;
- at least one corrected or superseded assertion;
- a representative dossier with stated policy and time;
- projection-level expected results or quality thresholds;
- known missing/redacted dependency reports;
- expected validation failures for negative fixtures.

The oracle should compare specified semantics. Historical vector scores,
database page layouts, timestamps created by rebuild, and nondeterministic prose
are not exact oracles unless explicitly retained as outputs.

### Clean recovery environment

The environment should not contain:

- the original runtime installation or its source checkout;
- `runtime/catalog.sqlite`, lexical, vector, or graph stores;
- model caches, prompts, hidden candidate tables, or ingestion queues;
- credentials to undeclared services;
- undocumented schemas or migration scripts;
- ambient copies of source artifacts.

**Alternative.** A second independent implementation is stronger than a clean
installation of the same tooling. Both tests are valuable and answer different
questions.

## Drill procedure

### Phase 0 — declare the claim before observing recovery

1. Name the source corpus snapshot or commit.
2. List protocol/profile/extension versions.
3. Select the capability claims above.
4. Inventory required retained artifacts and allowed external dependencies.
5. Record expected exactness for every projection and analysis.
6. Record time, storage, platform, and privacy constraints.
7. Freeze the recovery oracle and negative cases.

Changing these after a failure is a new drill iteration, not a pass.

### Phase 1 — produce and inspect the archive

1. Create a disclosure-scoped export.
2. Verify that no private or secret material crosses an unauthorized boundary.
3. Generate inventory and integrity metadata.
4. Include frozen semantics and bootstrap documentation.
5. Enumerate missing, redacted, encrypted, licensed, remote, and
   non-reproducible dependencies.
6. Open representative files with ordinary tools and inspect the human-facing
   boundary.
7. Store the archive independently from the live vault.

**Experiment.** Have a reviewer inspect the inventory without runtime access and
predict which claims can and cannot be recovered.

### Phase 2 — remove all disposable access state

Within an isolated copy or disposable environment:

- remove every runtime database and index;
- remove caches, embeddings, generated chunks, and materialized views;
- remove model and provider caches;
- remove uncommitted staging and queue state;
- make the original application unavailable;
- disable network access unless the archive claim explicitly permits a named
  dependency.

Never perform this phase against the only copy of a real corpus.

### Phase 3 — bootstrap from the archive alone

1. Verify the archive inventory before interpreting records.
2. Resolve protocol and required profile semantics from included artifacts.
3. Identify unsupported required extensions and fail their dependent operations
   explicitly.
4. Preserve unknown optional material in a lossless round trip test.
5. Parse and validate positive and negative fixtures.
6. Parse and inventory the corpus without building advanced indexes.
7. Produce a minimal human-readable corpus report.

**Failure condition.** Any undocumented file, service, environment variable,
runtime convention, or live URL required to interpret declared core meaning.

### Phase 4 — verify canonical history and evidence

1. Verify record and blob identities using their labeled algorithms.
2. Resolve references and report every dangling target.
3. Reconstruct recorded visibility/order and detect ambiguous or corrupt heads.
4. Locate every sampled evidence span against the correct artifact version.
5. Verify that redacted/unavailable evidence remains explicitly unverifiable
   rather than retargeted.
6. Reconstruct sampled revision, assessment, acceptance, identity, and policy
   histories.
7. Compare valid-time and recorded-time boundary cases with the frozen oracle.

### Phase 5 — exercise migrations

For every archive version within the claimed support range:

1. validate the source before migration;
2. select a documented source-to-target path;
3. retain or protect the source according to policy;
4. interrupt and resume the migration at injected points;
5. validate the target and migration report;
6. verify ID, evidence, and provenance mappings;
7. compare specified semantic views;
8. confirm every loss is classified and enumerated;
9. retry to test idempotence or the documented transaction boundary.

**Failure condition.** A lossy change presented as a lossless upgrade, or a
mixed-version state presented as a valid corpus.

### Phase 6 — rebuild exact projections

Candidate exact projections include record lookup, reference closure, source to
evidence lookup, lifecycle state, temporal membership, provenance dependencies,
and deterministic policy views.

For each projection:

1. create it only from declared retained inputs;
2. record builder/version and source snapshot;
3. compare full rebuild with the semantic oracle;
4. compare incremental rebuild with the full rebuild;
5. test duplicate delivery and interruption;
6. verify that deleting it leaves the canonical corpus unchanged.

Exact internal bytes need not match unless the projection format itself makes
that promise.

### Phase 7 — regenerate heuristic access

Rebuild lexical, vector, graph-analytic, contradiction-discovery, gap-detection,
and ranking capability using the declared available dependencies.

Evaluation should use quality and traceability criteria such as:

- every surfaced item resolves to canonical records and evidence;
- access and privacy filters are applied;
- selected benchmark questions meet recall/relevance thresholds;
- conflicting material is not silently removed;
- stale or unsupported projection generations are visible;
- changed models create a distinct projection identity;
- irreproducible historical outputs are reported rather than regenerated and
  mislabeled as identical.

**Alternative.** Retain an old heuristic index when exact historical search is
operationally important. It remains an archived implementation artifact, not
the canonical knowledge base, and needs its own codec/tool preservation.

### Phase 8 — reconstruct contextual use

For each representative query:

1. state query, purpose, policy, valid time, and recorded-as-of boundary;
2. obtain candidates through more than one supported access path;
3. assemble exact evidence, provenance, applicable revisions, assessments,
   acceptance decisions, and counterclaims;
4. include material uncertainty, open questions, and applicability boundaries;
5. include experience/mechanism context when the relevant profile is supported;
6. compare the resulting semantic support boundary with the oracle;
7. descend from the rendered dossier to the smallest sampled evidence span.

Generated wording may differ. Omitted support, false temporal state, or a claim
that no longer resolves to evidence is a failure.

### Phase 9 — report completeness and exceptions

The report should include:

- archive identity and drill environment;
- capability claims attempted and their result;
- protocol/profile/extension coverage;
- exact and heuristic projection results;
- missing, corrupt, redacted, licensed, external, encrypted, or unsupported
  dependencies;
- migrations applied and loss reports;
- integrity and evidence-verification results;
- time, storage, and manual intervention;
- every undocumented assumption discovered;
- severity, remediation owner, and next rehearsal date.

A partial result is useful if its limits are explicit. It is not a full pass.

## Failure-injection matrix

| Injection | Expected safe behavior |
| --- | --- |
| Truncated object or commit | Validation fails at the affected identity; no silent partial record |
| Missing blob | Evidence exception is reported; selector is not retargeted |
| Unknown optional extension | Material is preserved and dependent interpretation is marked limited |
| Unknown required extension | Dependent semantic operation fails explicitly |
| Unsupported protocol version | Reader identifies but does not guess semantics |
| Corrupt current ref | Recovery uses verified inventory/manual policy, not timestamp guessing |
| Interrupted migration | Source remains valid or transaction resumes; mixed state is not exposed as complete |
| Interrupted index build | Old generation remains selected or projection is marked unavailable/stale |
| Duplicate commit delivery | Incremental projection is idempotent |
| Deleted vector store | Canonical history remains intact; semantic access rebuilds under a new declared generation |
| Unavailable model/provider | Retained output remains interpretable; rerun limitation is explicit |
| Lost encryption key | Completeness is downgraded; ciphertext is not described as usable evidence |
| Expired or untrusted signature | Historical signature data remains; present validation policy reports limitation |
| Corrupt pack member | Damage is localized and inventory reports every affected object |
| Redaction after indexing | All affected projections invalidate/remove material under the declared policy |

## Acceptance measures

**Working hypothesis.** Record measures that can change a design decision:

- fraction of canonical records parsed and fully validated;
- dangling reference and unverifiable evidence counts with denominators;
- exact semantic projection mismatches;
- heuristic retrieval quality against the frozen benchmark;
- number of hidden dependencies discovered;
- time to inventory, validate, migrate, rebuild, and answer;
- manual interventions and whether they required undocumented knowledge;
- bytes required for canonical archive, frozen semantics, and optional retained
  runtime artifacts;
- recovery success after each injected failure;
- ability of an independent reader to reproduce critical views.

Node count, embedding count, generated-text volume, or byte-identical stochastic
answers are not recovery success metrics.

## Cadence over the first three years

**Working hypothesis.** Use nested rehearsals:

- per change: validator, fixture, and affected exact-projection rebuild;
- regularly during dogfood: backup/restore plus full disposable-store deletion;
- before a protocol/profile release: old-version migration and offline bootstrap;
- at least annually: clean-machine or clean-container EoL drill with the network
  disabled;
- before retiring a runtime, model, codec, or algorithm: targeted recovery using
  its replacement;
- before ending version support: prove a migration or freeze a permanent reader
  and its execution instructions.

The exact calendar is runtime policy. The durable insight is to rehearse before
the original environment disappears.

## Human-readable last resort

An archive can be structurally valid yet practically inaccessible without its
tooling. For critical records, consider retaining:

- a plain-text inventory and navigation map;
- rendered source metadata and exact selectors;
- assertion/revision/assessment/decision timelines;
- policy and profile summaries;
- migration and completeness reports;
- a small documented reference reader with no network dependency.

**Open question.** Which renderings are mandatory for an archival profile and
how to prove they do not conceal disagreement or unsupported semantics.

## Security and privacy constraints

- The recovery environment must preserve access boundaries; “offline” does not
  mean “authorized for every operator.”
- Integrity inventories must avoid leaking forbidden content through names or
  predictable digests.
- Decryption keys, trust roots, and their recovery/expiry policies are separate
  dependencies and must be inventoried without exposing secrets.
- Published bundles require an explicit disclosure selection and synthetic-only
  public fixtures.
- Remote model fallbacks are disabled unless declared, authorized, and recorded.
- Recovery logs are treated as potential copies of sensitive data.
- Redacted material must be removed or invalidated in indexes, caches, backups,
  and publications according to the applicable policy.

## Open decision register

1. **RFC candidate:** archival manifest and scoped completeness vocabulary.
2. **RFC candidate:** exact, set-equivalent, quality-bounded, and retained-output
   rebuild claim classes.
3. **RFC candidate:** frozen protocol/profile release bundle.
4. **RFC candidate:** evidence-unavailability and redaction reporting.
5. **Open question:** minimum independent-reader capability for a release.
6. **Open question:** portable dossier recovery oracle.
7. **Open question:** long-term codec and human-rendering requirements.
8. **Open question:** key-loss and signature-expiry effect on completeness.
9. **Deferred:** formal third-party archival certification.
10. **Deferred:** geographically federated preservation and escrow governance.

The drill is successful only when it exposes the archive's real boundary. A
smaller honest recovery claim is more valuable than a broad EoL promise that
depends on hidden state or the continued existence of the original runtime.
