# Technical Artifacts and Implementation Research

> **Status:** Non-normative research snapshot and recovered context.
> **Observed:** 2026-07-11.
> **REVALIDATE BEFORE DECISION:** The named projects, product capabilities,
> ownership, licenses, APIs, and implementation patterns are moving targets.
> Recheck primary sources and run bounded experiments before selecting or
> depending on any of them.
> **No novelty/FTO claim:** This note records technical analogies and candidate
> artifacts. It is not an exhaustive prior-art search, patent analysis, legal
> opinion, freedom-to-operate review, or commitment to a stack.
>
> **Material provenance:** This document mixes recovered precursor discussion,
> new synthesis from this archive pass, and dated external research. Mutable
> source observations and immutable repository revisions, where available, are
> distinguished in the linked source evidence ledger.

## Purpose

This note preserves technical ideas that may inform GraphTruth's first runtime
and protocol tooling without elevating them into architecture decisions. It
focuses on code intelligence as a concrete knowledge domain, source-aware
retrieval, safe generated documentation, source adapters, MCP delivery, and
operational patterns observed in Clawdbot/OpenClaw.

Repository-head identifiers and explicit gaps for mutable web documentation are
recorded in the [source evidence ledger](LANDSCAPE-AND-VALIDATION.md#source-evidence-ledger).

The governing rule is:

> A useful implementation pattern may be copied, adapted, or rejected in Zone 3.
> It becomes Zone 1 behavior only when independent implementations need the same
> observable semantics and an accepted RFC and specification say so.

## Why code is a valuable GraphTruth proving ground

Codebases provide unusually strong evidence boundaries:

- repository and commit identities;
- exact file, byte, line, syntax-node, and symbol locations;
- parsers, compilers, type checkers, tests, and build results;
- explicit definitions, references, calls, imports, and dependency manifests;
- revisions with review and authorship history;
- runtime observations and incident outcomes.

This makes code a good early domain for validating provenance, revision,
contradiction, retrieval, and causal discipline. It is also unusually forgiving:
many relations can be recomputed from source. Arbitrary human knowledge has no
compiler as a final arbiter, so lessons must not be generalized blindly.

A useful analogy is:

| Code intelligence | General GraphTruth role |
| --- | --- |
| Repository and commit | Versioned source artifact |
| File or syntax-node span | Evidence span |
| Symbol | Entity or scoped identifier |
| Definition/reference/call fact | Source-derived candidate relation |
| Indexer | Attributed transformation process |
| SCIP or code-property-graph schema | Domain profile or derived projection contract |
| Compiler/type-check result | Observation or analysis artifact, not universal truth |
| Generated documentation | Derived candidate assertion or retained analysis |
| Code search result | Query-specific chunk |
| Expanded call/type context | Dossier component |
| Reindex after commit | Projection invalidation and rebuild |

## Context7: source- and version-aware retrieval

[Context7](https://github.com/upstash/context7) retrieves current,
version-specific library documentation and examples for insertion into an AI
assistant's context. The public repository also states that its supporting API
backend, parsing engine, and crawler are private.

### Valuable lessons

1. **Version identity is part of relevance.** The right documentation for the
   wrong library version is dangerous evidence.
2. **Source-aware retrieval is a product, not only an index.** Resolving a library
   identity, version, query intent, and useful context can create immediate value
   with a narrow scope.
3. **A context delivery interface can remain small.** A client need not expose
   the entire indexing pipeline to answer a bounded query.
4. **Source material and access machinery can be separated.** GraphTruth should
   make that separation reconstructible rather than merely operational.
5. **Open endpoint code does not guarantee an open knowledge substrate.** If the
   crawler, normalized corpus, or version map is private and irreplaceable, the
   essential access layer remains a service dependency.

### GraphTruth adaptation

A GraphTruth documentation adapter could capture:

- upstream project and release identity;
- source repository commit or immutable artifact digest;
- documentation path and exact selector;
- declared package version range;
- extraction and normalization process;
- license and retention status;
- mappings between renamed packages, versions, and APIs;
- contradictions between documentation, source, tests, and observed behavior;
- the query and policy used to assemble a dossier.

The canonical record should not be “Context7 returned this text.” It should
distinguish the retained or referenced source, the selected evidence, any
derived summary, and the temporary retrieval result.

**REVALIDATE BEFORE DECISION:** verify the current Context7 data boundary,
version semantics, export options, terms, and availability. It is a comparison
target, not an assumed dependency.

## Code-intelligence protocol lessons

### SCIP

[SCIP](https://github.com/scip-code/scip) is a language-neutral protocol for
source-code indexes used by producers for several languages and consumers that
provide navigation such as definitions, references, and implementations. Its
repository supplies a schema, bindings, CLI tooling, and indexer guidance.

SCIP is a strong precedent for GraphTruth's zone model:

- narrow semantic contract;
- multiple independent producers;
- multiple consumers;
- generated language bindings;
- tooling and conformance around a portable artifact;
- implementation freedom behind agreed observable meaning.

The most important negative lesson is scope. SCIP succeeds by describing a
bounded derived code index, not every aspect of software knowledge. GraphTruth
should define writer and reader profiles that do not require the entire vision.

SCIP artifacts are normally rebuildable from source and can remain disposable.
GraphTruth canonical records instead preserve intended durable epistemic history.
The two should not be conflated merely because both are protocols.

**REVALIDATE BEFORE DECISION:** verify schema evolution, active ownership,
supported indexers, compatibility guarantees, and whether a direct adapter would
provide enough value to justify maintenance.

### Glean

Meta's open-source [Glean](https://github.com/facebookincubator/Glean) collects,
derives, stores, and queries facts about source code: symbol locations and
types, cross-references, call and type hierarchies, and other indexed structure.
It supports its own schemas and query language and can consume SCIP/LSIF data.

Relevant ideas include:

- fact schemas separated from language-specific indexers;
- stored base facts plus derived facts;
- efficient cross-language queries;
- explicit predicates and schema evolution;
- facts tied to source locations;
- a clear distinction between code and the queryable code index.

For GraphTruth, a fact database such as Glean would be a Zone 3 projection unless
the canonical archive independently retains every durable meaning. Glean's
“facts” are program-analysis results, not GraphTruth policy-accepted facts.

**REVALIDATE BEFORE DECISION:** inspect current releases, schema evolution,
operational complexity, supported languages, license, and export/rebuild paths.
The similarly named enterprise-search company is unrelated to this candidate.

### Joern and code property graphs

[Joern](https://joern.io/) and its [code property graph specification](https://cpg.joern.io/)
combine syntax, control-flow, data-flow, call, and type information in a
queryable graph used especially for security analysis.

Relevant ideas include:

- several complementary structures over the same source;
- derived edges whose meaning comes from a documented graph schema;
- reusable queries that encode analysis knowledge;
- paths and neighborhoods as context rather than flat text chunks;
- running domain analysis without making the graph the source code.

GraphTruth can learn from the compositional graph model: provenance, temporal,
argument, causal, and domain relations may be separate projections joined by
stable record identifiers. It should not adopt a single generic `RELATED_TO`
edge or assume that graph proximity means epistemic support.

**REVALIDATE BEFORE DECISION:** check current language support, CPG schema,
licensing, storage requirements, export formats, and suitability outside
security analysis.

### Provisional `Graph-Code` candidate

The exact project referred to as “Graph-Code” in recovered context is ambiguous.
One plausible candidate is [Code-Graph-RAG](https://github.com/vitali87/code-graph-rag),
which uses Tree-sitter to extract multi-language code structure, stores a
knowledge graph, supports graph-assisted natural-language retrieval, source
snippets, incremental updates, and an MCP-facing workflow.

Potential lessons, if this is the intended project:

- AST-derived entities provide better anchors than arbitrary chunks;
- code graph plus lexical/vector signals can assemble richer context;
- incremental invalidation is essential during active development;
- graph storage can remain a derived service if source and extraction rules are
  retained;
- natural-language-to-query generation must never be trusted as a canonical
  interpretation without validation.

**REVALIDATE BEFORE DECISION:** first identify the intended project. Then verify
its current architecture, graph schema, database requirements, language
coverage, export behavior, license, benchmarks, and maintenance. Do not cite it
publicly as “Graph-Code” until identity is resolved.

### Provisional `CTX` candidate

The exact “CTX” reference is also ambiguous. One plausible current candidate is
[ctx-sys](https://github.com/david-franz/ctx-sys), an alpha local-first code and
documentation index that combines Tree-sitter structure, lexical search,
embeddings, graph relationships, source attribution, incremental Git-aware
reindexing, and MCP delivery.

Potential lessons, if this is the intended candidate:

- a small local SQLite projection can combine lexical, vector, and graph access;
- retrieval can be kept separate from conversational memory;
- Git-aware invalidation reduces stale code context;
- a health/doctor surface matters as much as query APIs;
- packaged knowledge bases and export require explicit provenance and version
  semantics before they can be trusted across projects.

**REVALIDATE BEFORE DECISION:** resolve identity first. The candidate describes
itself as alpha; verify package availability, schema stability, security,
language extraction quality, export fidelity, and license before any adoption.

## A code-to-knowledge experiment

The following is a Zone 3 experiment, not a protocol commitment.

```text
versioned code and build inputs
        |
        v
deterministic and heuristic indexers
        |
        v
source-anchored base facts + attributed candidate facts
        |
        v
guarded summaries, docstrings, architectural claims, and questions
        |
        v
review / compile / test / static analysis / policy decision
        |
        v
accepted code or documentation change, or retained rejected candidate
        |
        v
new commit and observations
        |
        v
dependency-aware invalidation and reindex
```

### Step 1: capture source identity

For each repository state, preserve or reference:

- repository identity and remote provenance;
- commit, tree, submodule, and working-tree status;
- file path, digest, media type, and encoding;
- generated/vendor/binary classification;
- language and parser identity;
- build manifest and lockfile versions;
- capture actor, process, and recorded time.

A dirty working tree is a different source state from its parent commit. A line
number without a file digest or commit is not durable evidence.

### Step 2: emit source-anchored base facts

Prefer deterministic facts where tooling supports them:

- symbol declaration and scope;
- definition and reference locations;
- import/include/dependency edges;
- call and type relations;
- syntax and control-flow structure;
- configuration keys and schema references;
- test-to-code associations where explicitly declared;
- commit, review, and authorship links.

Every fact names its extractor, version, parameters, input tree, and exact source
span. Unsupported or heuristic language features remain candidates rather than
silently acquiring deterministic status.

### Step 3: derive guarded documentation candidates

Model-assisted candidates may include:

- function or module summaries;
- docstrings;
- architectural responsibility claims;
- invariants and pre/postconditions;
- risk or security observations;
- missing-test questions;
- likely rationale;
- links between code and external design documents.

These candidates must not overwrite source or become accepted merely because
they are fluent. A candidate records:

- exact input snapshot and selected evidence;
- prompt/template or analysis definition;
- model/tool identity and version;
- parameters and relevant environment;
- output and uncertainty dimensions;
- known unsupported statements;
- review and acceptance state;
- invalidation dependencies.

“Guarded docstring” means that generation is constrained by source evidence and
verification, and that the resulting text keeps its derivation identity. It
does not mean the model is trusted to edit canonical code autonomously.

### Step 4: validate through independent signals

Useful checks include:

- parser and formatting success;
- compiler and type-check results;
- unit, integration, and property tests;
- static and security analysis;
- documentation examples executed against the exact version;
- human review;
- comparison with external specification or issue evidence;
- detection of claims not grounded in selected spans.

Each check produces a new observation or analysis artifact. Passing a test
supports a bounded proposition; it does not validate every sentence in a
generated summary.

### Step 5: commit or reject explicitly

If a candidate becomes a source change, preserve:

- the candidate and its provenance;
- review or policy decision;
- produced patch;
- validation results;
- resulting commit;
- later correction or rollback.

Rejected candidates may be valuable counterexamples. They should not remain in
active retrieval without a clear rejected/superseded state.

### Step 6: invalidate and reindex

After a new commit:

1. identify changed source artifacts;
2. traverse derivation dependencies;
3. mark affected facts and analyses stale or superseded;
4. rebuild deterministic facts;
5. rerun only justified expensive analyses;
6. compare old and new facts and dossiers;
7. retain historical results with their original source version;
8. expose unrebuilt or failed regions explicitly.

Never retarget an old evidence span to new content at the same path.

## Defenses against hallucination and circular support

### Source classes and authority

Keep at least these classes distinguishable:

1. retained source bytes or externally identified source;
2. deterministic parse/index result;
3. observed build/test/runtime result;
4. human-authored claim;
5. model- or heuristic-generated candidate;
6. assessment;
7. explicit acceptance decision;
8. rendered or retrieved view.

No class automatically inherits authority from another.

### Common-ancestry detection

Two derived records are not independent support when they share the same source
or generation chain. Support aggregation should compute provenance closure and
report:

- shared ultimate source artifacts;
- shared model run or prompt;
- copy, quotation, summary, or translation relations;
- common external publication;
- whether evidence is genuinely independent or only differently worded.

Ten summaries of one mistaken comment are one evidential lineage, not ten votes.

### Generated documentation must not self-confirm

- A generated docstring cannot independently support the claim from which it was
  generated.
- Reindexing that docstring must retain a derivation link to the original
  analysis, not misclassify it as fresh human evidence.
- A later answer that cites the generated docstring must still expose the code
  and generation lineage.
- A generated edit must pass independent checks before an acceptance workflow,
  and acceptance remains scoped.
- Copying a model output into a source file does not erase its origin.

### Evidence diversity before confidence aggregation

Confidence policies should consider evidence-lineage diversity, not record
count. Potential dimensions include:

- direct observation versus derivation;
- deterministic versus heuristic process;
- independent source owners;
- independent measurement methods;
- temporal separation;
- adversarial or counterexample evidence;
- source freshness and applicability.

The protocol need not prescribe a universal score. It should preserve the data
needed for a policy to explain its result.

### Structural and execution guards

- resolve symbols and spans with a parser rather than model text when possible;
- verify generated symbol names against the indexed commit;
- reject evidence spans whose digest or selector no longer resolves;
- run examples and tests in a sandbox;
- prohibit network or external actions unless separately authorized;
- use idempotency keys for side-effecting jobs;
- preserve stdout, stderr, exit status, tool version, and environment identity;
- treat compiler success as evidence about compilation only;
- keep retrieval context and executable instructions in separate channels.

### Retrieval guards

- label every returned component by source and epistemic origin;
- cap repeated material from one derivation lineage;
- prefer exact source spans for factual code questions;
- include conflicting and stale candidates when materially relevant;
- show source-version mismatch prominently;
- state why each dossier component was selected;
- never let an embedding neighbor silently become a support edge;
- record query, index snapshot, ranking policy, and truncation.

## Source-adapter design

An adapter captures events and artifacts. It does not decide truth, acceptance,
or irreversible identity.

### Common adapter contract

Every adapter should define:

- source system and account/tenant identity;
- cursor, checkpoint, or replay boundary;
- source object and version identity;
- event ordering and timestamp limitations;
- payload media type and encoding;
- retention, license, privacy, and redaction policy;
- integrity metadata where feasible;
- idempotency and duplicate detection;
- deletion and update semantics;
- rate limits and partial-failure behavior;
- parsing transformations and their provenance;
- least-privilege credentials and secret handling;
- what can be reconstructed after the connector disappears.

### Candidate adapters for the first code-centered slice

#### Git repository adapter

Captures commits, trees, blobs, refs, authorship metadata, diffs, tags,
submodules, and optionally a declared dirty working-tree snapshot. Git identity
is transport and history evidence, not proof that the content is correct.

#### Pull request and issue adapter

Captures versioned descriptions, comments, reviews, patches, labels, checks, and
merge events with stable source identifiers. Review approval is not automatically
a GraphTruth acceptance decision for every claim in the change.

#### Build and CI adapter

Captures workflow/job/step identity, input commit, environment, command, output,
artifacts, status, retries, and timing. A green build is a bounded observation;
it must not be generalized to “the system works.”

#### Compiler, type checker, and static analyzer adapter

Captures tool version, configuration, source snapshot, diagnostics, rules, and
result locations. Diagnostics are analysis artifacts that can be assessed and
superseded.

#### Test adapter

Captures test identity, code version, fixture/data version, environment,
outcome, duration, retries, and flaky classification. Passing and failing runs
can both be evidence for scoped assertions.

#### Documentation and API-schema adapter

Captures repository docs, generated docs, OpenAPI/GraphQL/JSON Schema artifacts,
package versions, examples, and exact source generation. Generated documentation
must preserve its code or schema dependency.

#### Dependency adapter

Captures manifests, lockfiles, resolved artifacts, registries, advisories, and
license information. Registry metadata is time-sensitive and may require a
retained snapshot.

#### Runtime observation adapter

Captures logs, traces, metrics, incidents, deployments, feature flags, and
environment identity subject to aggressive privacy and retention limits. These
events can test design claims but may contain sensitive data and sampling bias.

### Later general adapters

- local files and notes;
- web captures with immutable snapshots or explicit external references;
- email and chat with conversation and edit boundaries;
- PDFs, scans, OCR, audio, and transcription;
- calendars, tasks, decisions, and reminders;
- sensors and measurements;
- experiment notebooks and datasets.

No adapter should convert source instructions into capabilities. Untrusted text
can propose a record; it cannot authorize acceptance, publication, credentials,
or an external action.

## Derived indexes and access artifacts

The first runtime may experiment with several projections, all rebuildable:

- exact identifier and reference index;
- full-text/BM25 index;
- source-span index;
- entity and relation adjacency index;
- provenance closure index;
- revision and bitemporal timeline index;
- contradiction-candidate index;
- unanswered-question and coverage index;
- vector/embedding index;
- symbol/call/type index for code;
- dossier cache.

Each projection should publish a build manifest containing:

- projection kind and schema version;
- canonical input frontier or archive digest;
- builder/tool/model identity;
- parameters and policy;
- start/end time and environment;
- source exclusions and privacy scope;
- errors, omissions, and unsupported records;
- invalidation cursor;
- rebuild cost and duration;
- semantic guarantees and expected nondeterminism.

The build manifest may be retained as an analysis or operational record. The
projection contents remain disposable unless a separate decision promotes a
specific derived result to canonical history.

## MCP belongs in Zone 3

The [Model Context Protocol](https://modelcontextprotocol.io/) is a useful access
and integration surface for assistants. It can expose capture, search, dossier,
question, validation, and proposal operations.

It must not become GraphTruth's durable protocol:

- MCP describes tool interaction, not canonical epistemic semantics;
- an MCP server can disappear while files remain readable;
- tool schemas can evolve faster than corpus schemas;
- model context is a transient, truncated view;
- tool availability does not prove archival completeness;
- authorization to call a tool is different from permission to accept a claim
  or perform an external action.

### Candidate MCP tools

Read-only tools:

- `resolve_record`;
- `get_source_span`;
- `search`;
- `assemble_dossier`;
- `trace_provenance`;
- `show_timeline`;
- `find_conflict_candidates`;
- `find_questions`;
- `validate_archive`;
- `projection_status`.

Proposal tools:

- `propose_assertion`;
- `propose_entity_link`;
- `propose_assessment`;
- `propose_question`;
- `propose_episode_structure`;
- `propose_transfer`.

Privileged tools, if ever exposed, require explicit separate capabilities:

- append canonical record;
- issue acceptance decision;
- merge or split identity;
- redact or delete evidence;
- publish data;
- trigger acquisition;
- execute an external action.

Tool output should return record identifiers and provenance, not only rendered
text. Clients must be able to distinguish candidate, accepted-for-purpose, and
unknown states.

## Optional runtime patterns recovered from Clawdbot/OpenClaw

OpenClaw is a moving implementation reference, not a dependency or protocol
authority. The patterns below may be useful in GraphTruth's default runtime.

**Source limitation.** Behavior below is paraphrased from mutable OpenClaw
documentation observed on 2026-07-11. No immutable documentation revision was
exposed in this research pass; pin or archive the relevant source before making
a dependency decision.

### Long-lived local gateway

The [OpenClaw gateway architecture](https://docs.openclaw.ai/concepts/architecture)
uses a long-lived local control plane with typed clients, events, health, and
device nodes.

Possible GraphTruth adaptation:

- one local runtime process owns ingestion cursors and background jobs;
- CLI, UI, MCP, and adapters are clients;
- canonical files remain the durable authority outside gateway memory;
- process state and queues are disposable or reconstructible;
- health reports distinguish corpus, projection, adapter, and model status;
- shutdown and restart never leave valid-looking partial canonical writes.

Do not require a daemon for basic reading, validation, export, or migration.

### Strict schemas, safe configuration, and diagnostics

OpenClaw's [configuration design](https://docs.openclaw.ai/gateway/configuration)
uses schema validation, safe defaults, atomic replacement, rejected-candidate
inspection, last-known-good state, and doctor-style repair.

Possible GraphTruth adaptation:

- publish machine-readable config schemas for the runtime;
- reject unknown or invalid security-sensitive keys;
- keep protocol config separate from local runtime policy;
- write configuration atomically;
- preserve a rejected configuration for diagnosis without applying it;
- expose `doctor`, `status`, and structured health output;
- never repair canonical records silently;
- make destructive repair an explicit, reviewable plan.

Runtime config schemas are not canonical corpus schemas.

### Idempotency and event sequencing

OpenClaw requires idempotency keys for side-effecting gateway requests and uses
typed request/response/event envelopes.

Possible GraphTruth adaptation:

- adapter events have stable source keys;
- ingestion retries deduplicate without dropping distinct revisions;
- append requests carry an operation identifier and expected corpus frontier;
- background jobs record attempt number and source frontier;
- stale workers cannot commit against an incompatible migration state;
- event sequence gaps trigger rescan or reconciliation rather than guessing;
- idempotency never collapses two source events that merely share content.

### Durable scheduled jobs

OpenClaw's [scheduled-task model](https://docs.openclaw.ai/automation/cron-jobs)
is a reference for persisted schedules, isolated runs, delivery, retries, and
operator visibility.

Potential GraphTruth jobs include:

- adapter polling and checkpoint verification;
- index rebuild or compaction;
- stale-evidence review;
- unanswered-question reprioritization;
- integrity verification;
- backup and restore rehearsal;
- migration dry runs;
- provider-removal and EoL drills.

Each run should have a stable job definition, run identity, input frontier,
lease/lock, retry policy, resource budget, output, and failure record. Cron state
must not be the only place a durable question or decision exists.

### Skills as replaceable capability packages

OpenClaw's [skills mechanism](https://docs.openclaw.ai/tools/skills) illustrates
discoverable, scoped packages that teach an agent how to perform a task.

Potential GraphTruth skill packages:

- capture from a source type;
- inspect evidence and provenance;
- review extraction candidates;
- assemble a domain dossier;
- conduct a migration rehearsal;
- run a contradiction triage;
- record a prospective experience episode;
- perform an EoL export drill.

Skills belong in Zone 3 unless they are merely documentation for Zone 2 tools.
They cannot grant capabilities, amend the protocol, or make generated output
accepted.

### Pairing and explicit capability approval

OpenClaw's [pairing model](https://docs.openclaw.ai/gateway/pairing) distinguishes
device identity from approved capabilities and requires renewed approval when a
capability surface expands.

Possible GraphTruth adaptation:

- clients authenticate with stable local identities;
- read, propose, append, accept, redact, publish, and act are separate scopes;
- a new adapter or plugin declares its requested capability surface;
- widened privileges require explicit approval;
- revocation invalidates active credentials and sessions;
- local convenience does not silently authorize remote clients;
- approval provenance is recorded separately from source content.

This is runtime authorization. It must not be confused with an epistemic
`AcceptanceDecision`.

### Sandboxing and least privilege

OpenClaw's [sandboxing model](https://docs.openclaw.ai/gateway/sandboxing)
illustrates per-agent/session isolation, no-network defaults, read-only roots,
capability reduction, and explicit elevated escape paths.

Possible GraphTruth adaptation:

- parsers and model tools receive only required source subsets;
- untrusted documents are processed without corpus write or external-action
  capability;
- network is disabled unless an adapter explicitly requires it;
- private fields can be omitted from model-facing projections;
- generated code/examples run in disposable sandboxes;
- filesystem writes target a staging area before validation and append;
- elevated operations require an attributable approval;
- sandbox output is still untrusted evidence, not automatic acceptance.

Sandboxing reduces blast radius; it is not proof of correctness or perfect
containment.

### Multi-agent specialization

OpenClaw's [multi-agent routing](https://docs.openclaw.ai/concepts/multi-agent)
provides an example of isolated agents with different workspaces and tool
surfaces.

Potential GraphTruth roles:

- capture agent with no acceptance capability;
- deterministic validator;
- extraction proposer;
- contradiction analyst;
- privacy/redaction reviewer;
- causal-analysis specialist;
- dossier assembler;
- human-facing reviewer.

All roles write attributable proposals or bounded results. Multiple agents using
the same model and evidence are not independent corroborators. Concurrency must
respect corpus append and migration invariants.

### Model and provider failover

OpenClaw's [model failover](https://docs.openclaw.ai/concepts/model-failover)
is a useful operational reference for provider fallback and credential rotation.

Possible GraphTruth adaptation:

- provider selection is runtime policy;
- retained analysis records name the actual provider/model used;
- fallback does not pretend semantic equivalence;
- deterministic paths remain available without a model;
- a provider failure may defer enrichment while raw capture continues;
- model changes trigger evaluation, not automatic replacement of old analyses;
- rate, cost, privacy, and locality constraints participate in selection;
- provider removal is rehearsed periodically.

Failover improves availability. It does not make model outputs reproducible.

### Memory consolidation without hidden state

OpenClaw's [file-based memory](https://docs.openclaw.ai/concepts/memory) offers
additional patterns:

- separate working notes from curated durable summaries;
- keep files intact when prompt budgets require truncation;
- make consolidation reviewable;
- rebuild access indexes;
- record action-sensitive context such as expiry and authority;
- flush important context before session compaction.

GraphTruth adaptation must preserve derivation: a curated summary cannot replace
its evidence or become independent corroboration. Prompt-memory budgets belong
to a runtime view, not the canonical retention policy.

**REVALIDATE BEFORE DECISION:** every OpenClaw pattern above is a July 2026
snapshot from a rapidly changing project. Recheck current docs, security model,
license, schemas, and operational behavior. Copy ideas only after local threat
and failure testing.

## Concrete artifact backlog

These are candidate experiments, not committed directory structure or release
scope.

### Code domain fixtures

- a tiny repository with exact symbol, definition, reference, and call facts;
- a rename that preserves identity evidence but changes paths and spans;
- divergent documentation and code behavior;
- a generated docstring containing one unsupported claim;
- duplicated summaries with one common source lineage;
- a test that passes for one configuration and fails for another;
- a commit that invalidates a summary but not the underlying entity;
- a malicious comment containing prompt injection;
- a missing dependency version and an unavailable external source;
- a rollback and superseded acceptance decision.

### Reference transformations

- Git tree to source-artifact inventory;
- parser output to source-anchored symbol candidates;
- SCIP to a disposable code projection;
- test report to attributed observations;
- candidate docstring to patch plus validation plan;
- provenance closure and common-ancestry report;
- change set to invalidation frontier;
- dossier renderer for a code question;
- EoL archive to static source/provenance browser.

### Runtime experiments

- plain files plus `ripgrep` baseline;
- SQLite full-text and adjacency projection;
- one code-property-graph or fact-store adapter;
- optional embeddings with two swappable providers;
- MCP read-only dossier server;
- crash-safe ingestion journal;
- idempotent background job runner;
- sandboxed parser/model execution;
- provider-removal and clean-rebuild drill.

### Evaluation measures

- exact-source retrieval recall and precision;
- stale-context rate after code changes;
- unsupported statements per generated docstring;
- duplicate-lineage inflation caught;
- time from commit to consistent projection;
- dossier usefulness versus text/vector-only baselines;
- clean rebuild time, cost, and failure recovery;
- percentage of displayed claims traceable to exact evidence;
- capture and review effort;
- corrections that preserve historical views.

## Explicit non-commitments

This note does **not** select:

- RDF, JSON-LD, property graphs, or any canonical serialization;
- SCIP, Glean, Joern, Code-Graph-RAG, ctx-sys, or another code indexer;
- SQLite, PostgreSQL, Neo4j, Memgraph, Qdrant, or another store;
- Tree-sitter, compiler APIs, language servers, or a parsing framework;
- OpenClaw as a runtime, dependency, or host;
- MCP as the GraphTruth protocol;
- a programming language;
- a model or embedding provider;
- a gateway, worker, queue, or deployment topology;
- one file per record;
- Git as the canonical transaction engine;
- generated docstrings as authoritative documentation;
- code as GraphTruth's permanent primary domain.

Adoption requires a bounded experiment that demonstrates value, rebuildability,
privacy, failure behavior, maintenance cost, and a clean boundary between
canonical meaning and replaceable machinery.

## Adoption gates for any candidate technology

Before adding a foundational dependency, answer:

1. What observed dogfood problem does it solve better than a simpler baseline?
2. Which zone owns it, and could its behavior accidentally become normative?
3. What data becomes inaccessible if it disappears tomorrow?
4. Can every intended durable result be exported with provenance?
5. Can a clean rebuild run without the original service?
6. What exact version, license, and maintenance signal were verified?
7. What are the privacy, network, credential, and prompt-injection boundaries?
8. How are partial writes, retries, cancellation, and schema upgrades handled?
9. What is the replacement path and measured migration cost?
10. Which positive, negative, corruption, and recovery fixtures cover it?
11. Does it require the default runtime to interpret canonical records?
12. Is the expected three-year maintenance burden lower than building the
    minimal needed capability?

If these answers are weak, keep the technology in an isolated experiment and do
not let its identifiers or schema leak into Zone 1.
