# Recovered Protocol Longevity Design

> Status: Recovered design context — non-normative
>
> Captured: 2026-07-11
>
> Authority: The longevity commitments in [Vision](../VISION.md),
> [Architecture](../ARCHITECTURE.md), [Principles](../PRINCIPLES.md), and
> accepted [RFC 0000](../../rfcs/0000-project-foundation.md) take precedence.
> This note records mechanisms and choices still requiring evidence.
>
> Promotion rule: A compatibility, versioning, extension, migration,
> canonicalization, or conformance rule becomes authoritative only through an
> accepted RFC and incorporation into a versioned specification with schemas,
> fixtures, and independently testable behavior.

## Purpose

The intended lifetime is longer than the first runtime and any database or
model it uses. “Avoid legacy for three years” cannot mean that every dependency
or UI remains current. It means that replaceable components may age without
making the canonical knowledge unreadable, semantically ambiguous, or trapped.

The accepted documents state this direction. This note recovers the operational
mechanisms that would make the claim testable.

## Status vocabulary

- **Working hypothesis** — candidate rule to prototype.
- **Alternative** — viable competing design.
- **Open question** — evidence is not yet sufficient.
- **Experiment** — bounded evidence-producing work.
- **RFC candidate** — likely durable semantic or interoperability decision.
- **Deferred** — explicitly not required for the first protocol slice.
- **Superseded** — an earlier assumption replaced by current direction.

## What “long-lived” should mean

**Working hypothesis.** A released corpus is long-lived for a declared support
scope when a future implementation can, without the original runtime:

1. identify the applicable protocol, schemas, profiles, and extensions;
2. distinguish semantics it understands from semantics it cannot safely apply;
3. preserve unknown optional material without reinterpretation;
4. validate structure and declared integrity;
5. locate retained evidence or report explicit availability exceptions;
6. reconstruct specified lifecycle, temporal, policy, and provenance views;
7. migrate along a documented path while retaining an audit mapping;
8. rebuild every exact projection claimed by the archive;
9. interpret retained analysis outputs and their reproducibility limits;
10. render critical records for human inspection.

Longevity is conditional on the declared archive contents and does not promise
that deleted, licensed, remote, encrypted-with-lost-keys, or unavailable model
dependencies can be recovered.

**Superseded.** Package installation continuing to work is not an adequate
longevity definition. It is useful operational evidence, but protocol survival
requires independent reading and migration.

## Independent version axes

A single version number cannot safely stand for every evolving artifact.

| Axis | What it versions | Why it must remain distinct |
| --- | --- | --- |
| Protocol/specification edition | Normative semantic contract | A runtime refactor need not change meaning |
| Record envelope or schema | Machine-checkable representation | Multiple schema revisions may implement one semantic edition, or a semantic change may require several schemas |
| Profile version | Optional coherent semantic capability | A corpus can support different profile sets under one core version |
| Extension version | Namespaced third-party or experimental semantics | Extension owners and cadences differ from the core |
| Canonicalization version | Deterministic representation used for comparison/digests/signatures | Changing canonical bytes can break identities without changing high-level meaning |
| Migration artifact version | A particular transformation and its bug fixes | The same source/target pair can have multiple implementations or corrected mappings |
| Conformance-suite edition | Fixtures and interpretation of requirements | Errata and added coverage should be traceable |
| Runtime/package version | Shipped software | No semantic authority and potentially many independent packages |
| Projection generation | Builder/model/configuration over a corpus snapshot | Rankings and index formats may change without protocol change |

**Working hypothesis.** Canonical records identify or unambiguously inherit the
protocol version and required profile closure. Runtime and package versions are
reported in provenance but never used as a substitute for protocol support.

**Alternative.** A coordinated release manifest may group compatible versions
for convenience. The manifest must not imply that matching one bundle number is
the compatibility rule.

**RFC candidate.** Define stable identifiers and comparison rules for each
version axis before publishing compatibility promises.

## Compatibility is an operation, not a boolean

Two artifacts are not simply “compatible.” A tool may be able to preserve a
record without interpreting it, read it without writing it, or migrate it
without validating every required profile.

### Candidate capability relation

**Working hypothesis.** A support declaration should state, per protocol and
profile range, whether an implementation can:

- **identify** — recognize the envelope and version identifiers;
- **preserve** — round-trip material without loss or reinterpretation;
- **read** — expose defined values and relationships;
- **validate** — check all requirements claimed by a conformance class;
- **write** — produce records satisfying that version/profile;
- **apply** — compute specified lifecycle, time, policy, or other normative
  behavior;
- **migrate** — transform to a named target with a declared loss class;
- **render** — produce a faithful human-readable view;
- **rebuild** — construct a named projection class from declared inputs.

A compatibility matrix can then report capabilities rather than infer them from
version ordering.

### Candidate change classification

| Change | Possible compatibility treatment | Evidence required |
| --- | --- | --- |
| Editorial clarification with no observable semantic change | Erratum within an edition | Review and fixtures showing unchanged behavior |
| Additive optional field whose absence has defined meaning | Potentially forward-preservable | Unknown-field round-trip and old-reader tests |
| New optional profile | Core remains readable without profile semantics | Dependency closure and fallback tests |
| New required semantic field | New incompatible envelope/profile version | Migration and explicit old-reader failure |
| Changed lifecycle, time, policy, or identity meaning | New protocol version | Positive/negative fixtures and migration analysis |
| Canonicalization or digest change | New algorithm/version identifier | Cross-implementation vectors and identity mapping |
| Removal of previously accepted meaning | Incompatible and potentially lossy | Retention/audit plan and explicit loss declaration |

**Open question.** Whether semantic versions, date editions, monotonic integers,
or content-addressed releases best communicate these relations. SemVer alone
does not solve profile combinations or migration availability.

## Self-description and offline resolution

**Working hypothesis.** A record or enclosing bundle should provide enough
stable identifiers for a reader to discover:

- core protocol edition;
- required and optional profiles/extensions and their versions;
- payload schema/media type;
- canonicalization, digest, and signature algorithm identifiers where used;
- namespace definitions;
- migration origin where the record was transformed;
- archive manifest and completeness statement.

Identifiers that resemble URLs must remain meaningful when the network or
original domain is unavailable. A released archive should include or reference
frozen, integrity-checked copies of all semantics required for its declared
offline use.

**Alternative.** Central online resolution simplifies discovery and governance.
It is useful as a cache or distribution service but cannot be the only copy of
required semantics.

**Experiment.** Disconnect the network, remove the current runtime, and give an
archive plus its release bundle to a minimal independent reader.

## Extensions and profiles

### Recovered distinction

- An **extension** adds namespaced material or behavior without claiming broad
  ecosystem agreement.
- A **profile** is a coherent declared capability with dependencies,
  requirements, and conformance fixtures.
- The **core** contains only semantics required by nearly every useful corpus or
  necessary to preserve unknown advanced material safely.

### Candidate extension envelope

**Working hypothesis.** Every extension occurrence declares:

```text
stable namespace/identifier
extension version or compatible range
optional versus semantically required status
dependency profile/extension closure
payload and schema identifier
fallback/preservation behavior
```

### Unknown-material behavior

**Working hypothesis.** A reader encountering unknown material should:

- preserve an unknown optional extension during a claimed lossless round trip;
- expose that some semantics are unavailable;
- avoid applying extension-dependent acceptance, lifecycle, identity, causal, or
  other decisions it cannot interpret;
- fail explicitly for an operation requiring an unknown required extension;
- never reinterpret an unknown field as a similarly named local concept;
- never silently strip extension data while reporting success.

Preservation may mean semantic-value preservation rather than byte preservation;
that distinction itself needs specification.

**Open question.** Can unknown nested extension values be losslessly represented
across every allowed canonical serialization, especially when number and map-key
models differ?

### Namespace and dependency governance

**Alternative: reverse-domain or URI namespaces.** Familiar delegation and low
collision risk; domains can expire and online identity can outlive ownership.

**Alternative: content-addressed extension definitions.** Immutable and
offline-verifiable; inconvenient naming and evolution.

**Alternative: project registry with short names.** Ergonomic; introduces a
central longevity and governance dependency.

**Working hypothesis.** Use stable globally unique identifiers with frozen
definition artifacts and optional human aliases. Do not require a live registry
to interpret an archived required profile.

**Deferred.** Public registry governance, trademark disputes, revocation, and
federated namespace delegation until independent extension authors exist.

### Promotion and retirement

An extension should be promoted only after repeated independent use shows that
its semantics are stable and broadly needed. Promotion must preserve the old
namespace or provide an auditable migration; renaming a concept into the core
must not strand historical records.

Retirement should distinguish deprecated authoring from continued reading.

**RFC candidate.** Define profile dependency closure, unknown-required failure,
promotion, deprecation, and archival availability before relying on extensions
for durable private data.

## Canonicalization and algorithm agility

Canonicalization may be needed for stable comparison, content identity,
signatures, or interchange. It must not become a hidden ontology normalizer.

### Questions a canonicalization profile must answer

- Which semantic value model is canonicalized?
- Are map keys ordered, unique, typed, or Unicode-normalized?
- How are duplicate keys rejected?
- How are integers, decimals, floating values, negative zero, NaN, and infinity
  represented?
- How are timestamps, offsets, zones, granularity, and uncertain intervals
  represented?
- Are strings normalized, and if so under which Unicode version/form?
- How are unknown extensions retained?
- Are absent, null, empty, and default values distinct?
- How are binary values and media types represented?
- Is canonicalization applied to the envelope, payload, artifact bytes, or an
  explicit subset?

**Working hypothesis.** Every digest or signature records an algorithm identifier
and its input domain. Never store an unlabeled “hash” whose canonical bytes must
be guessed later.

### Algorithm agility

Hash, signature, compression, encryption, and canonicalization algorithms age.
The protocol should permit multiple labeled algorithms and an auditable process
for adding stronger identities without replacing historical identifiers.

**Alternative.** A multihash-like representation can make algorithm identity
self-describing. It still needs collision handling and a policy for algorithms
that are no longer trusted.

**Open question.** Whether one object may carry several representation digests,
which one participates in its stable reference, and how upgraded identities are
linked.

**RFC candidate.** Canonical bytes, content identities, signature envelopes,
and algorithm deprecation require shared test vectors.

## Migration as a first-class protocol concern

Migration is not merely reading old input and writing new output. It changes the
representation or meaning of durable history and therefore needs its own audit
boundary.

### Candidate migration descriptor

**Working hypothesis.** A migration artifact declares:

```text
source protocol/schema/profile set
target protocol/schema/profile set
transformer identity and version
preconditions and unsupported inputs
loss classification
identifier/reference mapping behavior
canonicalization changes
expected diagnostics
postconditions and validation suite
rollback or source-retention policy
```

A migration report records the actual source snapshot, output snapshot,
per-record mapping or mapping strategy, warnings, exceptions, and verification
result.

### Candidate loss classes

- **Representation-only lossless** — defined semantic values and unknown required
  preservation survive; bytes or layout may change.
- **Reversible** — the target plus retained migration metadata can reconstruct
  the supported source meaning.
- **Semantically lossless but not byte-reversible** — every specified meaning is
  preserved, but comments, ordering, or original representation is not.
- **Conditionally lossy** — only declared features or extension material are
  unavailable, with affected records enumerated.
- **Lossy** — specified meaning is discarded or approximated.
- **Destructive** — source evidence/history is removed under explicit authority;
  it must never be labeled as an ordinary upgrade.

### Required operational properties

- idempotent retry or an explicit transaction boundary;
- interruption recovery without mixed-version ambiguity;
- source and target validation;
- stable diagnostics and machine-readable loss report;
- preservation of record provenance and transformation identity;
- explicit mapping for changed IDs and evidence selectors;
- a tested chain when no direct source-to-target migration exists;
- no implication that a lossy migration is conforming to a lossless support
  promise.

**Alternative: immutable original plus migrated branch.** Strongest audit and
rollback, with higher storage and privacy cost.

**Alternative: in-place logical supersession.** Lower duplication, but much
harder to prove that original semantics remain reconstructible.

**Working hypothesis.** During incubation, retain the original archive for every
protocol-significant migration unless privacy or law prohibits it.

**Experiment.** Generate corpora at every supported version, migrate through all
supported paths under interruption, compare semantic views, and verify that loss
reports identify every changed meaning.

**RFC candidate.** Migration descriptors, loss vocabulary, ID mapping, and
support-lifetime promises need a dedicated RFC.

## Conformance model

### Candidate implementation roles

The protocol may need distinct conformance claims:

- **Preserving reader** — identifies the envelope and retains unknown optional
  material but may not apply advanced semantics.
- **Semantic reader** — exposes defined values and relationships for a declared
  version/profile set.
- **Writer** — produces conforming records for a declared set.
- **Validator** — checks all machine-testable requirements in a declared class
  and emits stable diagnostics.
- **Transformer/migrator** — implements named transformations with loss reports.
- **Policy/view evaluator** — computes specified temporal, lifecycle, and
  acceptance behavior for supplied policy inputs.
- **Archiver** — produces and verifies a completeness-scoped bundle.
- **Full runtime** — supplies product behavior but gains no extra protocol
  authority.

**Open question.** Which minimum role deserves the unqualified phrase
“GraphTruth-compatible.” A single badge would hide important limitations.

### Normative algorithms

Zone 1 should prefer observable input/output behavior, invariants, failure
conditions, and vectors over mandating a programming technique. Zone 2 may ship
reference code, but conformance must be achievable independently.

Candidate deterministic surfaces include:

- canonical parsing and invalid-input behavior;
- reference and integrity validation;
- revision visibility and lifecycle reduction;
- valid-time/recorded-time filtering;
- applicability and revocation of acceptance decisions;
- extension/profile dependency resolution;
- canonicalization and digest inputs;
- declared lossless migrations.

**Working hypothesis.** Every machine-testable normative rule has at least one
positive and one negative fixture, plus boundary/property tests where the input
space makes examples insufficient.

### Diagnostics

Long-lived tools need failures that remain interpretable. Candidate diagnostics
should identify protocol/profile version, stable rule identifier, object and
location, severity, whether preservation remains possible, and remediation or
migration link.

Human wording can improve without changing stable rule identity.

## Frozen protocol release bundle

**Working hypothesis.** Each released protocol edition should be independently
archivable as a bundle containing:

- normative specification and errata state;
- schemas and vocabularies;
- required profile and extension definitions;
- positive and negative conformance fixtures;
- canonicalization and cryptographic test vectors;
- migration descriptors and guides from supported predecessors;
- compatibility/capability matrix;
- media types, namespace identifiers, and reference-resolution metadata;
- stable diagnostic rule catalog;
- a human-readable rendering guide;
- integrity inventory and release provenance;
- minimal bootstrap instructions that do not depend on the default runtime.

**Alternative.** Depend on repository tags and hosted documentation. These are
useful distribution channels but insufficient as the only preservation form.

**Experiment.** Archive a release bundle in more than one independent location,
then validate it offline using an implementation built from its specification.

## Governance and change discipline

Longevity is partly social. A technically extensible format can still become
ambiguous if semantic changes are made through code, schema edits, or prose
errata without a decision record.

### Candidate change classes

- editorial correction with no observable behavior change;
- clarification backed by existing fixtures;
- compatible additive capability;
- new optional profile or extension;
- incompatible semantic change;
- migration-only implementation correction;
- security deprecation or emergency restriction;
- governance or namespace ownership change.

Each class needs an authority, review evidence, release effect, and historical
record.

**Working hypothesis.** An accepted RFC records a decision, but a released
protocol changes only when the new specification edition incorporates it.
Accepted-but-unimplemented decisions remain visible debt, not implicit behavior.

**Deferred.** Multi-maintainer standards governance and external extension
registration until licensing and contribution rules exist. Frozen artifacts and
unambiguous founder authority are sufficient for personal incubation, but not a
permanent ecosystem model.

## Three-year anti-legacy programme

### What can age safely

- UI frameworks and APIs;
- index engines and vector databases;
- embedding and language models;
- ingestion connectors;
- orchestration and deployment topology;
- package managers and runtime languages;
- ranking, contradiction discovery, and question-priority heuristics.

They can age safely only if their durable outputs are either reconstructible or
retained as attributed analysis with explicit limitations.

### What needs active maintenance

- the frozen specification release bundle;
- parsers/validators for every still-supported version;
- migration paths and fixtures;
- artifact codecs and human renderers;
- hash/signature/encryption algorithm policies;
- EoL export and recovery tests;
- dependency and platform support for Zone 2 tooling;
- documentation of discontinued capabilities.

### Candidate cadence

**Working hypothesis.** During active development:

- run the ordinary projection rebuild test continuously;
- rehearse backup/restore and clean-environment bootstrap at least quarterly;
- perform an offline EoL drill at each protocol release and at least annually;
- build or update a small independent reader before declaring a stable protocol;
- review cryptographic algorithms, codecs, action/toolchain pins, and external
  dependencies at least quarterly;
- never end support for a corpus version without a tested migration or an
  explicit permanent-reader/archive plan.

Calendar cadence is operational policy, not protocol semantics.

## Longevity threat register

| Threat | Consequence | Candidate mitigation |
| --- | --- | --- |
| Hidden state in a database, prompt, or model | Archive loses intended meaning | Delete-and-rebuild drills and projection manifests |
| Link rot or expired domain | Required semantics/evidence cannot resolve | Frozen definitions and retained artifacts or explicit exceptions |
| Unsupported codec | Binary evidence exists but is unreadable | Media inventory, open formats where feasible, human renderings for critical artifacts |
| Lost encryption key | Retained bytes are unusable | Key-lifecycle declaration and completeness downgrade |
| Hash/signature weakness | Integrity identity becomes unreliable | Algorithm labels, multiple identities, upgrade mapping |
| Schema/spec drift | Tools agree structurally but disagree semantically | Specification authority and cross-artifact conformance checks |
| Unknown extension stripping | Silent loss during round trip | Preserve-or-fail behavior and fixtures |
| Lossy migration presented as upgrade | Historical meaning is falsified | Loss taxonomy, source retention, per-record report |
| Runtime conventions leak into protocol | Independent implementation cannot reproduce behavior | Independent reader/tooling and boundary review |
| Stochastic model disappears | Historical inference cannot be regenerated | Retained output and inputs/provenance; no exact-replay promise |
| Trust or signing key expires | Old signature is misinterpreted | Validation-time policy and retained timestamp/trust context |
| Maintainer disappearance | Releases and namespaces become ambiguous | Self-contained artifacts and future governance/succession plan |

## Open decision register

1. **RFC candidate:** protocol/version/profile identifier scheme.
2. **RFC candidate:** compatibility capability vocabulary and declaration
   format.
3. **RFC candidate:** extension/profile envelope, dependencies, and unknown-data
   behavior.
4. **RFC candidate:** canonicalization, content identity, and algorithm agility.
5. **RFC candidate:** migration descriptor, loss classes, and support policy.
6. **RFC candidate:** conformance roles, rule identifiers, and fixture format.
7. **RFC candidate:** archival release bundle and offline resolution.
8. **Open question:** semantic versioning versus editions plus compatibility
   matrices.
9. **Open question:** semantic-value versus byte-preserving round trips.
10. **Open question:** minimum human-readable fallback for each media/profile.
11. **Open question:** how long old-version writers, readers, and migrators are
    separately supported.
12. **Deferred:** global namespace registry and certification authority.
13. **Deferred:** federation negotiation and network protocol handshakes.
14. **Deferred:** ecosystem governance and succession policy.

The core longevity strategy is deliberately conservative: freeze meaning in
self-describing artifacts, make compatibility an explicit capability claim,
preserve unknown material, record loss, test independent recovery, and allow the
software around those contracts to be replaced.
