# Monorepo Strategy

GraphTruth will remain a monorepository until keeping it together creates a demonstrated, persistent engineering or governance problem that cannot be solved with internal boundaries.

This is an intentional product and protocol decision, not merely a convenient initial layout. The specification, schemas, conformance examples, core tooling, and default implementation will evolve together during the project's formative period. Atomic changes across those areas are more valuable now than independent repositories and release processes.

The rule is simple:

> Keep the work physically together while making its logical boundaries explicit from the first commit.

## Why start together

A single repository lets GraphTruth:

- change a protocol rule, its schema, validation behavior, examples, migration notes, and default runtime in one reviewable change;
- test the specification against a working implementation rather than allowing prose and behavior to drift apart;
- dogfood incomplete ideas without publishing a set of prematurely stable packages;
- preserve design history alongside the artifacts produced by each decision;
- run one conformance suite over every relevant layer;
- defer coordination and release machinery until there are real independent consumers.

The monorepo is not permission to build a monolith. It is a coordination boundary around several deliberately separated zones.

## Logical boundaries

| Area | Responsibility | Must not become |
| --- | --- | --- |
| `spec/` | Normative protocol semantics, invariants, versioning, and profiles | Documentation for one implementation |
| `schemas/` | Machine-checkable representations of protocol structures | A second, implicit specification |
| `tooling/` | Validators, canonicalizers, migrations, transformers, and conformance utilities | A policy engine that silently decides truth |
| `runtime/` | The replaceable default runtime used for dogfooding | The source of protocol semantics |
| `examples/` | Valid, invalid, and end-to-end conformance cases | Product-specific sample data coupled to private internals |
| `rfcs/` | Durable design decisions and their rationale | A substitute for updating the accepted specification |
| `docs/` | Vision, architecture, operating guidance, and explanatory material | Normative rules that exist nowhere in `spec/` |

These boundaries should remain recognizable even if the concrete directory layout later gains packages, applications, or language-specific subtrees.

## Dependency rules

Dependencies point from replaceable implementation details toward stable contracts:

1. The specification has no dependency on executable project code.
2. Schemas encode rules defined by the specification. A schema cannot introduce semantics absent from the specification.
3. Core tooling may depend on the specification, schemas, and shared conformance fixtures. Normative behavior must be traceable to an identified protocol rule.
4. The default runtime may depend on public tooling interfaces. Tooling must not depend on the default runtime.
5. Examples and conformance fixtures use public formats and interfaces only. They must not require private implementation details to be understood.
6. Product features may not redefine protocol concepts. A generally useful concept either becomes an explicit extension/profile or remains clearly implementation-local.
7. Cross-boundary imports use declared public interfaces. Importing another area's internal modules is prohibited, even while doing so is technically easy inside one repository.
8. Cyclic dependencies between logical areas are defects. A shared abstraction must be placed at the lowest appropriate stable boundary rather than hidden in a cycle.

Additional invariants apply across the repository:

- Canonical records remain in documented, human- and machine-readable files.
- Databases, search structures, embeddings, caches, and materialized views are derived. Projections that an implementation claims to support must be rebuildable from the retained canonical corpus and declared retained artifacts; the protocol does not promise byte-identical reproduction of unavailable model output.
- A valuable derived result may itself be retained as a canonical analysis record when its inputs, method, version, assumptions, and status are explicit. The disposable projection containing or indexing it does not thereby become authoritative.
- LLM output is a proposal or analysis artifact, never unrecorded protocol authority.
- A test that defines interoperability behavior belongs in the conformance corpus, not only in an implementation test suite.
- File ownership and package boundaries should be enforceable by dependency checks as soon as executable packages exist.

## Change discipline inside the monorepo

A change crossing a logical boundary should normally include all affected artifacts:

- the RFC or rationale when the decision is architectural or protocol-significant;
- the normative specification change;
- updated schemas;
- positive and negative conformance examples;
- validator and migration behavior where applicable;
- compatibility notes;
- default runtime changes.

Not every change needs every item. The point is that a pull request must make omissions visible and intentional.

Protocol compatibility and package compatibility are separate concerns. A refactor of the default runtime need not change the protocol version. Conversely, a protocol change must be versioned even if no public software package has yet been released.

## What does not justify a split

The following are not, by themselves, reasons to create another repository:

- a directory becoming large;
- the use of more than one programming language;
- producing several packages or deployable processes;
- a preference for visually smaller repositories;
- one slow test suite that can be partitioned in CI;
- the arrival of more contributors;
- a temporary difference in development speed;
- a desire to give a component a separate name;
- adopting services or plugins in the default implementation.

Packages, workspaces, sparse test selection, ownership rules, and build boundaries should be exhausted before repository boundaries are used as an architectural tool.

## Objective criteria for a future split

A component becomes a candidate for extraction only when several of the following conditions are sustained across multiple releases or development cycles:

1. **Independent consumers exist.** Other projects need the component without the rest of GraphTruth, and repository size or dependency acquisition imposes a material cost.
2. **Release cadence is genuinely independent.** Coordinated releases repeatedly delay one side or force unrelated version increments.
3. **Atomic cross-boundary changes are rare.** Most changes can be made and validated without simultaneous edits on both sides of the proposed boundary.
4. **The interface is stable.** A documented public contract and a conformance suite already exist at the boundary.
5. **Build or CI isolation has measurable value.** Normal monorepo techniques have been tried and do not adequately address build time, platform, or dependency constraints.
6. **Security or access requirements differ.** A component needs materially different disclosure, credential, audit, or deployment controls.
7. **Governance has diverged.** Distinct maintainers, decision rights, or ecosystem expectations make a shared repository an ongoing bottleneck.
8. **Distribution requires it.** The artifact's delivery mechanism or downstream tooling cannot be served reliably from the monorepo.

Before extraction, all of the following must also be true:

- the dependency direction is acyclic and already enforced;
- the destination, ownership, release process, and support expectations are explicit;
- protocol and implementation version compatibility can be tested across repositories;
- migration preserves history or leaves an unambiguous historical pointer;
- the operational cost of cross-repository changes is lower than the demonstrated monorepo cost;
- there is a rollback or reunification plan if the split proves premature.

The split decision requires an RFC containing the measurements and recurring incidents that satisfy these criteria. “It feels too big” is not sufficient evidence.

## Likely extraction boundaries

No extraction order is predetermined. Plausible future boundaries include:

- the protocol specification and its conformance corpus, once governed and released independently;
- language-specific SDKs or validators with independent user communities;
- large user-facing applications whose release and security concerns differ from the protocol;
- optional indexing or inference engines that have their own operational lifecycle.

These are possibilities, not commitments. The default runtime may remain a monorepo containing several deployable components indefinitely.

## Versioning and releases

During pre-1.0 development, the repository may release components independently while keeping their sources together. A repository tag, package version, schema identifier, and protocol version need not be the same value.

The durable rules are:

- every canonical file declares or unambiguously resolves its protocol version;
- schemas and conformance fixtures are addressable by protocol version;
- incompatible protocol changes include a migration story or an explicit statement that no lossless migration exists;
- implementations publish the protocol versions and profiles they support;
- compatibility is tested from artifacts, not inferred from matching package versions;
- old canonical files remain readable through documented migration paths for as long as the project claims support;
- an extracted repository must continue the same compatibility contract rather than resetting history.

The exact tag format, package versioning scheme, and release automation remain open until real artifacts require them.

## Review point

This strategy should be reconsidered when a measurable split criterion is met, not on a fixed calendar. Until then, GraphTruth optimizes for coherent evolution: one repository, strong internal contracts, and no accidental coupling.
