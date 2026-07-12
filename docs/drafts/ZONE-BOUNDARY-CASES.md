# Recovered Zone Boundary Cases

> Status: Recovered design context — non-normative
>
> Captured: 2026-07-11
>
> Authority: The three-zone architecture and dependency rules in
> [Architecture](../ARCHITECTURE.md), [Principles](../PRINCIPLES.md),
> [Vision](../VISION.md), and accepted
> [RFC 0000](../../rfcs/0000-project-foundation.md) take precedence. This note
> explores placement cases; it does not move a capability into the protocol.
>
> Promotion rule: A runtime convention becomes Zone 1 only after repeated
> evidence shows that independent implementations must agree, an RFC states the
> semantic decision, and specification requirements plus positive and negative
> conformance cases define its observable behavior.

## Purpose

The three zones are clear at their centers and easy to blur at their edges. A
parser can embody protocol grammar, a migration can mix semantic and operational
work, and a dossier can combine portable context with product-specific ranking.
This note retains concrete placement tests so that “important” is not confused
with “normative.”

## Status vocabulary

- **Working hypothesis** — candidate placement pending implementation evidence.
- **Alternative** — another placement retained for comparison.
- **Open question** — boundary not yet justified.
- **Experiment** — evidence-producing implementation work.
- **RFC candidate** — boundary that would change durable semantics.
- **Deferred** — deliberately postponed.
- **Superseded** — a tempting placement replaced by the authority model.

## Zones classify authority, not artifacts

- Zone 1 defines portable meaning, invariants, compatibility, and observable
  deterministic behavior required for independent agreement.
- Zone 2 supplies conservative executable tooling and reference behavior without
  acquiring authority over the specification.
- Zone 3 supplies operational usefulness, policy choice, heuristics, models,
  indexes, and interfaces and is expected to change fastest.

**Superseded.** The zones are not “data, backend, frontend,” nor “important,
supporting, optional.” They are also not automatically identical to repository
directories. A conformance fixture may live in `examples/` while testing Zone 1
semantics; a retained Zone 3 analysis may be canonical without becoming Zone 1.

## Placement test

For any behavior, ask in order:

1. Would two implementations that disagree produce different durable meaning,
   corrupt references, violate compatibility, or reconstruct different views
   that the protocol promises?
2. Can the required result be stated independently of a language, database,
   model, UI, and optimization strategy?
3. Are inputs, outputs, invariants, boundary cases, and failure behavior precise
   enough for independent conformance tests?
4. Does the behavior select local trust, relevance, cost, privacy, or product
   policy rather than apply a supplied portable policy?
5. Is the output heuristic, statistical, nondeterministic, or dependent on a
   changing external provider?
6. Does a generic executable implementation help users agree on the protocol
   without itself defining meaning?

Candidate outcome:

- “yes” to the first three points suggests a Zone 1 semantic contract;
- a replaceable deterministic implementation of that contract belongs in Zone 2;
- local selection, orchestration, optimization, heuristics, and provider choices
  belong in Zone 3;
- insufficiently precise behavior remains an experiment, not an implicit Zone 1
  rule.

## Boundary matrix

| Capability | Candidate Zone 1 responsibility | Candidate Zone 2 responsibility | Candidate Zone 3 responsibility |
| --- | --- | --- | --- |
| Record envelope | Meaning, required identifiers, unknown-material behavior | Parser, validator, renderer | Authoring UI and storage batching |
| Serialization | Allowed semantic values and interoperability encoding | Lossless codecs and diagnostics | Physical packing, compression, local layout |
| Schema | Structural constraints traceable to specification | Schema validation and binding generation | Product forms and internal DTOs |
| Canonicalization | Inputs, deterministic result, invalid cases | Reference canonicalizer and vectors | Invocation, caching, optimized implementation |
| IDs and references | Identity categories, resolution/integrity semantics | Mint/verify/reference tools | Local allocation service and lookup cache |
| Commit/order model | Recorded-visibility semantics, only if portable | Commit verifier/reducer/exporter | Locks, atomic filesystem protocol, queues |
| Source artifacts | Version and evidence-reference semantics | Integrity/selector validators and renderers | Connectors, blob backend, retention operations |
| Validation | Normative invariants and rule identifiers | Validators and conformance harness | UX, scheduling, admission workflow |
| Migration | Source/target semantics and loss requirements | Reference migrator and reports | Backup, rollout, retry, deployment orchestration |
| Lifecycle/time | Revision visibility, intervals, supersession behavior | Deterministic reducers and timeline renderer | Query defaults and display choices |
| Acceptance | Decision envelope and semantics of applying supplied policy | Reference policy/view evaluator | Policy selection, configuration, authorization UX |
| Entity identity | Auditable identity-decision meaning | Merge/split validation and deterministic application | Match proposals and ranking |
| Ingestion | No connector semantics unless a portable event contract is needed | Generic import/export transforms | Polling, dedup heuristics, OCR/STT, queues |
| Extraction | Candidate/provenance envelope | Mechanical mappings where fully specified | LLM/statistical assertion, relation, entity extraction |
| Contradiction | Portable exact types only if evidence earns them | Structural checks and renderers | Semantic discovery, calibration, prioritization |
| Questions | Portable question meaning/lifecycle if adopted | Validation and deterministic dependency utilities | Generation, decomposition, ranking, notification |
| Dark zones | Possibly a portable expectation/evidence envelope | Mechanical coverage checks for a supplied model | Coverage-model choice, discovery, impact ranking |
| Indexes | At most portable projection/rebuild claim semantics | Reference exact projectors/verifiers | Engines, schemas, incremental builds, tuning |
| Retrieval | Addressable support boundary and optional dossier contract | Reference closure/renderer if specified | Query understanding, recall, fusion, reranking |
| Chunks | Traceability requirements if exchanged | Deterministic chunk transform if specified | Segmentation, context budgets, model packaging |
| Dossiers | Optional minimum portable envelope, if justified | Deterministic assembly/rendering of supplied selection | Candidate generation, relevance and presentation policy |
| Analysis artifacts | Durable envelope, provenance, status, reproducibility claims | Validation and comparison tools | Models, clustering, summaries, rankings, causal discovery |
| Experience/causality | Optional profile semantics after RFC | Profile validators and reference views | Episode extraction, effect estimation, suggestions |
| Mechanism/transfer | Optional profile semantics after RFC | Mapping validation and renderers | Analogy search, adaptation and transfer ranking |
| Archive/EoL | Completeness and support-claim semantics if standardized | Export/verifier/minimal reader | Backup schedule and storage provider |
| Privacy/redaction | Portable meaning and failure boundaries where required | Validators, policy-neutral transforms | Local access policy, key management, disclosure UX |
| Digests/signatures | Algorithm identifiers and verification semantics | Reference signing/verifying tools | Key custody, trust policy, scheduling |
| API/UI | None unless an interchange protocol is separately adopted | Optional language-neutral library interface | Product APIs, UI, automation |
| Monitoring | Portable diagnostic semantics only where needed | Conformance and integrity reports | Metrics backend, alerts, SLOs, tracing |

Every row is a **Working hypothesis**. It is a decomposition aid, not an accepted
package plan.

## Detailed ambiguous cases

### Parsing and tolerant import

Zone 1 can define valid syntax, semantic values, and required invalid-input
behavior. Zone 2 can implement a strict parser. A Zone 3 importer may tolerate
external malformed data, but it must emit an explicit normalized candidate and
retain source provenance; tolerance must not silently redefine valid canonical
records.

**Superseded.** “The reference parser accepted it, therefore it is valid” gives
Zone 2 accidental normative authority.

### Schema versus specification

A schema is a machine-checkable expression of selected requirements. It cannot
define lifecycle, policy, causality, or unknown-extension semantics that are
absent from Zone 1 prose.

**Working hypothesis.** Every schema rule maps to a stable specification rule,
and every machine-testable specification rule identifies its schema or fixture
coverage. Gaps remain visible rather than resolved in implementation folklore.

### Canonical storage layout

File-first authority is accepted, but a directory layout is not automatically
Zone 1. If exchange occurs as a logical bundle whose records can be packed in
several equivalent ways, physical paths remain Zone 3 and codecs/exporters Zone
2. If paths or commit manifests participate in stable references or recorded
visibility, the relevant semantics may require Zone 1.

**Open question.** Whether the candidate commits/refs model is protocol-visible
or only one runtime repository implementation.

### Migration

The meaning of source and target versions, allowed loss, ID mapping, and
postconditions can be normative. The reference transform is Zone 2. Scheduling,
backups, retries, staged rollout, and UI are Zone 3.

**Alternative.** A protocol may specify only observable migration invariants and
permit multiple transforms. It need not mandate the reference algorithm when
different implementations can prove the same result.

### Acceptance policies

Zone 1 needs an interoperable envelope for an acceptance decision and, where a
portable policy is used, semantics for applying that supplied policy. Zone 3
selects which policies and actors are authorized locally. Zone 2 may evaluate a
supplied policy but must not choose what the user should trust.

**Superseded.** A default runtime's “accepted” filter cannot become universal
truth by convenience.

**Open question.** Whether a reusable policy language belongs in a profile, or
whether only decision records and policy identities need interoperability.

### Entity resolution

Stable identities and auditable merge/split decisions affect durable meaning.
Similarity models and matching thresholds do not. A heuristic proposes; an
authorized workflow records an identity decision; deterministic reducers apply
that decision without erasing old IDs.

**Experiment.** Replace the entity matcher and confirm that accepted identity
history and references remain valid while new candidate rankings change.

### Contradiction detection

The general task depends on language, ontology, context, modality, time, and
domain reasoning, so it belongs in Zone 3. Some subtypes may be exact: mutually
exclusive lifecycle states under the same identity/time, incompatible scalar
constraints under a declared unit model, or explicit negation under a portable
predicate definition.

**RFC candidate.** Promote only a demonstrated contradiction subtype with exact
preconditions. Do not standardize “the contradiction algorithm.”

### Dark-zone detection and active acquisition

Absence becomes a dark zone only relative to an expectation. Zone 1 might one
day define how a coverage expectation or question is represented. Zone 3 chooses
coverage models and ranks gaps by impact, uncertainty, answerability, cost, risk,
privacy, and expected information gain.

Zone 2 may mechanically compare a supplied finite expectation against records,
but must not decide which knowledge the owner ought to acquire.

### Indexing and projection rebuilds

Index engines and tuning are Zone 3. A portable claim such as “this exact
projection implements revision visibility under protocol version X” may have a
Zone 1 semantic contract and Zone 2 reference projector. Approximate vector
ranking remains Zone 3 even when it is central to product quality.

**Working hypothesis.** Standardize rebuild claim classes before standardizing
any index format.

### Retrieval, chunks, and dossiers

Retrieval ranking is local and fast-moving. The protocol's responsibility is to
make context addressable. A future dossier profile might define query/policy/time
metadata, selected canonical references, support/counterevidence closure, and
known omissions. Zone 3 would still choose recall, ranking, context budget, and
presentation.

**Alternative.** Keep all dossier structure in Zone 3 and retain important
results as general analysis artifacts. This avoids premature standardization but
reduces cross-tool portability.

**Experiment.** Assemble equivalent dossiers through two retrieval engines and
identify the smallest common support structure needed for honest interpretation.

### Experience and causality

Experience episodes, causal claims, mechanisms, and transfer attempts are
candidate profile semantics, not accepted core. If adopted, their record meaning
would be Zone 1 and validators/renderers Zone 2. Episode detection, causal
discovery, effect estimation, counterfactual generation, analogy matching, and
transfer recommendation remain Zone 3 proposals.

**Superseded.** An inferred `causes` edge cannot cross into the ledger as
authority merely because an algorithm has high confidence.

### Security capabilities

The distinction among ingesting content, proposing analysis, recording an
assessment, issuing an acceptance decision, publishing, administering, and
performing an external action may require Zone 1 attribution semantics. Concrete
authentication, key custody, access-control products, and deployment roles are
Zone 3.

Zone 2 tools should default to the least capability needed and never combine
validation with hidden acceptance or publication.

## One capability across all three zones

A useful pattern is semantic contract → reference behavior → optimized product.

### Example: temporal fact view

- Zone 1: defines valid time, recorded visibility, assertion lifecycle,
  acceptance applicability, supplied policy inputs, and expected result.
- Zone 2: provides a deterministic reducer with fixtures.
- Zone 3: chooses local policy, builds interval indexes, caches common views, and
  renders the UI.

### Example: migration

- Zone 1: defines source/target meaning, loss class, mapping requirements, and
  postconditions.
- Zone 2: implements a reference migrator and report validator.
- Zone 3: schedules backup, rollout, retry, progress, and rollback operations.

### Example: contradiction

- Zone 1: may define a precise structural contradiction subtype after evidence.
- Zone 2: implements and tests that subtype.
- Zone 3: discovers broader semantic contradictions, ranks them, and proposes
  questions.

The optimized implementation need not call the reference implementation. It
must satisfy the same observable contract where it claims conformance.

## Promotion from Zone 3 toward Zone 1

**Working hypothesis.** Promotion requires all of the following:

1. repeated real episodes show that disagreement between implementations harms
   exchange, recovery, or durable interpretation;
2. the concept is not merely one domain's ontology or one product's policy;
3. examples include ambiguity, invalid cases, and failure behavior;
4. inputs and observable results can be specified without naming the current
   model, database, framework, or code;
5. unknown-version and extension behavior is explicit;
6. compatibility and migration consequences are understood;
7. an RFC is accepted;
8. specification, schemas where applicable, and conformance fixtures agree;
9. an independent implementation can pass without importing runtime internals.

Popularity, code reuse, high accuracy, or presence in the default runtime is not
sufficient.

### Demotion and correction

An accepted behavior that proves too implementation-specific must be changed
through a superseding RFC and migration/compatibility path. Moving prose to a
runtime document does not erase released semantics.

**Deferred.** Formal deprecation epochs and ecosystem voting until stable
protocol releases and external implementers exist.

## Dependency and test boundaries

### Candidate dependency rules

- Zone 1 prose and maintained schemas import no runtime code or vendor model.
- Zone 2 may consume Zone 1 artifacts and shared public fixtures, never Zone 3
  internals.
- Zone 3 may use Zone 2 public interfaces and conforming Zone 1 representations.
- A conformance fixture is understandable without private runtime state.
- A product test may be stricter than the protocol but must label local policy.
- Generated bindings do not become the source specification.
- An optimized Zone 3 implementation claiming normative behavior is tested
  against the same conformance corpus as Zone 2.
- Cross-boundary cycles are design defects, even inside one package workspace.

### Candidate review questions

1. Is this change defining meaning or only implementing it?
2. Is a default, threshold, model, or storage engine being mistaken for a
   portable rule?
3. Can another implementation know the required behavior without reading this
   code?
4. Does the PR update every affected specification/schema/fixture/tool layer?
5. Is a heuristic result still attributable and reversible?
6. Does canonical retention accidentally imply acceptance?
7. Can runtime projections be deleted without changing canonical meaning?
8. Are unknown versions and extensions handled safely?

## Common boundary failures

| Failure | Why it is dangerous | Correction path |
| --- | --- | --- |
| Validator code invents a rule absent from the spec | Zone 2 becomes hidden authority | Record the gap; remove rule or pursue RFC/spec/fixture |
| Schema adds semantic constraints not explained in prose | Schema becomes a second protocol | Link rule to specification or classify as runtime policy |
| Runtime writes inferred links as unqualified relations | Heuristic becomes truth layer | Persist attributed candidate/analysis and separate decision |
| Index score is stored as universal confidence | Access behavior becomes epistemic status | Scope score to builder, model, snapshot, query, and purpose |
| Product default changes fact-view meaning | Local policy mutates protocol | Version policy and keep application semantics fixed |
| Reference implementation is required to interpret records | Protocol is not independently implementable | Specify observable behavior and create independent fixtures |
| Physical monorepo path is treated as semantic namespace | Repository layout becomes accidental protocol | Use stable explicit identifiers |
| Canonical analysis is described as authoritative | Persistence axis is confused with acceptance | Retain provenance/status and require separate decision |
| Tolerant import silently repairs canonical input | Invalid history is fabricated | Preserve source, emit diagnostics, write explicit transformed candidate |
| EoL export requires runtime database | Hidden durable state exists | Fix canonical boundary and rerun recovery drill |

## Experiments and open decisions

1. **Experiment:** implement one record parser independently from the Zone 2
   reference and compare invalid-case behavior.
2. **Experiment:** replace entity, vector, and contradiction algorithms while
   preserving the canonical corpus and exact views.
3. **Experiment:** build the same temporal/acceptance reducer twice from prose and
   fixtures.
4. **Experiment:** assemble dossiers with two ranking engines and compare support
   boundaries separately from presentation.
5. **Experiment:** run a migration using a reference implementation and an
   independent implementation and compare declared semantics.
6. **RFC candidate:** precise core record envelope and conformance roles.
7. **RFC candidate:** commit/recorded-order semantics, if the vault model needs
   to interoperate.
8. **RFC candidate:** extension/profile required-versus-optional behavior.
9. **RFC candidate:** portable projection/rebuild claim vocabulary.
10. **RFC candidate:** minimal dossier profile, only if experiments justify it.
11. **Open question:** whether policy definitions need a portable execution
    language or only identity and decision envelopes.
12. **Open question:** which structural contradiction types are genuinely
    portable.
13. **Open question:** whether deterministic dossier closure belongs in Zone 2
    before a dossier profile exists.
14. **Deferred:** distributed authority, federation, and multi-party policy
    negotiation.

The boundary rule is intentionally asymmetrical: it is easy to experiment in
Zone 3 and deliberately hard to acquire Zone 1 authority. That friction protects
the long-lived protocol from the first runtime's accidental choices while still
letting the runtime evolve quickly enough to discover what the protocol needs.
