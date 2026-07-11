# GraphTruth

**Durable epistemic memory, built on files.**

> **Status: pre-alpha.** GraphTruth is being designed and dogfooded first as a
> complete personal system. The repository is public so that its design can
> develop in the open, but it currently has **no license** and is **not accepting
> code contributions**. No permission to use, modify, or redistribute the work
> is granted beyond applicable law and GitHub's terms.

GraphTruth is a file-first protocol and toolkit for turning incomplete events,
documents, observations, and fragments of experience into durable epistemic
memory.

It does not store "the truth" as a collection of final facts. It preserves what
was observed or received, what was asserted, by whom or by which process, from
which evidence, in what context, and at what time. It also preserves support,
contradiction, revision, uncertainty, unanswered questions, decisions,
interventions, and outcomes. An assertion's revision lifecycle is separate from
any policy-specific `AcceptanceDecision`; what a consumer treats as a fact is a
reconstructible view over both kinds of record under an explicit policy and
time query, not a global `accepted` status.

## Mission

GraphTruth's mission is to make accumulated knowledge **inspectable,
contestable, reconstructible, and reusable across people, tools, and time** —
including after the software that created or indexed it no longer exists.

The durable product is therefore not a database and not a particular AI
application. It is a documented, portable representation and protocol for an
epistemic ledger, plus tools that let independent implementations validate,
transform, index, and use it.

Read [the vision](docs/VISION.md) for the full problem statement and destination,
and [the principles](docs/PRINCIPLES.md) for the constraints that guide design
decisions.

## The central idea

The durable unit is not an answer, nor only an assertion. It is a set of typed,
traceable records — source artifacts, events, evidence, assertion revisions,
acceptance decisions, questions, experience, and analysis — connected by stable
identifiers, provenance, scope, and time. Together they form a logical graph;
using a graph database is optional.

GraphTruth should be able to answer not only:

- What do we currently believe?
- Where did this claim come from?
- What supports or challenges it?
- In which context and time interval does it apply?
- What changed, and what did we know when a decision was made?
- Where are the contradictions, weakly supported regions, and unknowns?

It should also help answer:

- What action in which situation produced which outcome?
- Was that merely a sequence, an association, or a supported causal claim?
- Which mechanism may explain the result, and on what assumptions?
- Where has the mechanism failed or transferred successfully to another domain?
- What is the smallest useful question, observation, or experiment to perform
  next?

This makes GraphTruth more than a connected knowledge base. It is intended to
be a memory of claims, evidence, decisions, and testable experience — one that
can actively expose what it does not yet know.

## File-first, index-friendly

Canonical records live in documented, versioned, human- and
machine-readable files. Search engines, graph databases, vector stores, caches,
and materialized views are valuable, but they are disposable projections. A
conforming implementation can rebuild equivalent access structures when the
archive is complete for the relevant protocol profiles and referenced artifacts
have been retained.

"File-first" does not require one file per fact, prescribe Git as the runtime,
or reject databases. It establishes authority and recoverability: no essential
meaning may exist only inside an opaque store or model state.

Canonical versus disposable and direct versus derived are independent axes. A
valuable derived result may be retained as a canonical, versioned analysis
record with its inputs and process provenance; canonical retention does not make
the result authoritative. Stochastic model outputs are not promised to be
byte-for-byte reproducible.

## Three zones

GraphTruth is organized as three deliberately different zones:

1. **Protocol and specification** — durable semantics, schemas, invariants,
   lifecycle rules, versioning, and extension points.
2. **Core tooling** — validators, canonicalizers, migrations, renderers, and
   reference transformations that make the protocol executable and testable.
3. **Default implementation** — replaceable ingestion, indexing, retrieval,
   analysis, user interfaces, and model-assisted workflows.

Algorithms may appear in all three zones, but with different authority. A
normative deterministic rule can define protocol behavior; a Zone 2 reference
algorithm can demonstrate it; a runtime heuristic or model may only propose
analysis that remains attributable, reviewable, and reversible. An LLM is never
an authority over the ledger.

## Retrieval returns context, not isolated fragments

Base records remain small and durable. Useful knowledge is assembled on demand
into a dossier: the relevant assertions together with source evidence, scope,
timeline, supporting and conflicting material, unresolved questions, related
experience, and applicability boundaries. Transient chunks, embeddings, and
rankings are normally disposable access structures. A derived result selected
for durable audit or historical value can instead be recorded canonically as an
analysis artifact, without gaining truth authority.

## Monorepository strategy

GraphTruth starts as a monorepository and will remain one until a concrete
technical or governance constraint makes separation necessary. Specification,
schemas, examples, conformance fixtures, tooling, and the first working runtime
need to evolve together while their boundaries are still being discovered.

The intended top-level shape is:

```text
docs/          Vision, principles, architecture, and decisions
spec/          Normative protocol specification
schemas/       Machine-readable schemas and vocabularies
rfcs/          Proposed protocol and architecture changes
examples/      Canonical examples and conformance fixtures
tooling/       Validators, transformers, and developer tools
runtime/       Replaceable default runtime and personal dogfood system
```

These directories are module boundaries, not promises of future repositories.
Code should be separable in design without paying the coordination cost of
splitting it prematurely.

The measurable split criteria and dependency rules are documented in the
[monorepo strategy](docs/MONOREPO.md).

## Project stage

The immediate goal is a complete, useful first version for its author: real
capture, durable storage, validation, indexing, retrieval, contradiction and gap
detection, and active knowledge acquisition. Premature compatibility promises
would make the protocol less durable, so the design may change substantially
while the project is pre-alpha.

The capability-oriented stages and their exit evidence are described in the
[roadmap](docs/ROADMAP.md).

Issues that discuss the model and design may be useful, but please do not submit
code or data contributions until licensing, contribution terms, and the initial
protocol boundary are explicitly established.
