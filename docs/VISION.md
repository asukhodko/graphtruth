# Vision

## The problem

Most knowledge systems optimize for producing an answer now. They are much less
good at preserving the epistemic conditions under which that answer was made.

Source material is reduced to detached text chunks. Inferences become
indistinguishable from observations. A later conclusion overwrites an earlier
one. Contradictions are hidden by synthesis. Confidence is compressed into a
single unexplained number. Context disappears. Time is treated as metadata
rather than part of meaning. Valuable structure accumulates inside proprietary
databases, indexes, prompts, or model state and is lost when the implementation
is replaced.

The result may look like a connected knowledge base while remaining unable to
answer basic questions:

- What information was ledger-visible at a particular moment, and what belonged
  to a reconstructed decision-time information set?
- Which source span supports this assertion?
- Is this the source's claim, a human interpretation, or a machine inference?
- Do two statements truly contradict one another, or do their contexts differ?
- Which conclusion was later revised, and why?
- What evidence would resolve an open disagreement?
- Why did an action appear to work, and can its mechanism transfer elsewhere?

GraphTruth exists to make those questions first-class.

## Mission

**GraphTruth turns streams of incomplete events and fragments of knowledge into
a durable epistemic memory that remains inspectable, contestable,
reconstructible, and reusable across people, tools, and time.**

It preserves not merely a current conclusion, but the trace by which the
conclusion became available: source material, assertions, context, evidence,
time, revisions, disagreements, decisions, interventions, observations, and
remaining questions. It then provides replaceable mechanisms for finding,
assembling, comparing, and testing that knowledge.

The mission has an explicit end-of-life condition. If every GraphTruth service,
index, model, and default application disappears, a sufficiently complete
archive should still retain useful meaning. A future implementation supporting
the recorded protocol profiles should be able to read, validate, and migrate
the canonical files and rebuild equivalent access structures, provided required
referenced artifacts were retained.

## The idea in one sentence

GraphTruth is a **file-first protocol for a durable epistemic ledger**, with
conformance tooling and a replaceable default runtime built around it.

Each part of that sentence matters:

- **Epistemic**: the system records the state, origin, support, and limitations
  of knowledge, rather than pretending to possess context-free truth.
- **Ledger**: history is preserved through attributable additions, revisions,
  supersessions, assessments, acceptance decisions, and withdrawals; current
  views are derived.
- **File-first**: canonical meaning resides in documented, portable,
  human- and machine-readable files; specialized stores are rebuildable from a
  complete archive for supported profiles.
- **Protocol**: longevity comes from shared semantics, invariants, versioning,
  extension rules, and conformance behavior, not from one codebase.
- **Replaceable system**: ingestion, models, indexes, ranking, and interfaces
  may improve or disappear without taking the knowledge with them.

## GraphTruth records claims, not truth

The name GraphTruth describes an ambition toward epistemic honesty, not a claim
that the system can act as an oracle.

A statement can be reported by a source, asserted by an agent, derived by an
algorithm, revised, superseded, or withdrawn. Its `AssertionRevision` lifecycle
records that claim history. Whether a consumer accepts it is expressed by a
separate, attributable `AcceptanceDecision`, scoped to a policy rather than
stored as a global assertion status. All are meaningful records; none silently
becomes an eternal fact.

Conceptually, a fact is a view such as:

```text
Fact(policy, valid_at, recorded_as_of) =
    assertion revisions visible at recorded_as_of
    whose claimed applicability includes valid_at
    and which have an applicable AcceptanceDecision
    under policy, visible at recorded_as_of
```

The exact protocol will refine that expression, but the separation is
fundamental. `valid_at` means when an assertion claims to apply;
`recorded_as_of` means when a record was visible in the ledger. Neither says
that the assertion was objectively true or known to a particular person. A
decision-time information set is a separate reconstruction requiring evidence
about what information was available to the decision maker.

Source evidence has a stable, versioned representation and is
integrity-addressed where feasible. Corrections create new versions; controlled
redaction or legally required removal may replace payloads while preserving the
permitted audit trail. An assertion is an attributable interpretation of the
retained evidence. An `AcceptanceDecision` is policy-specific. A rendered
answer is a temporary view.

This permits multiple consumers to use the same ledger with different trust
policies without corrupting the shared history.

## A conceptual model

The following terms describe the intended semantics; their final serialization
belongs to the specification.

### Source artifacts and events

An event is something received or observed: a message, document revision,
measurement, decision, action, import, or external change. A stable version of
the payload, or an integrity-checked durable reference to it, is retained where
possible and subject to explicit retention and redaction policy. Exact evidence
spans connect later records back to that source version.

### Assertions and revisions

An assertion expresses a claim with explicit subject, predicate, value or
object, context, claimed temporal applicability, provenance, and evidence. Its
revisions have a content-history lifecycle independent of policy-specific
acceptance decisions. Revisions do not erase the history that informed earlier
decisions. Entities may be merged or split without losing their previous
identities.

### Questions and dark regions

Unknowns are data. A question can have origin, scope, urgency, candidate
answers, required evidence, dependencies, and resolution status. Contradictory,
weakly connected, stale, or unexplained areas of the graph are signals for
further acquisition, not blemishes to conceal.

### Experience and causal claims

Useful experience contains a path, not only a lesson: situation, goal,
constraints, hypotheses, alternatives, decision, action or intervention,
observation, outcome, surprise, interpretation, and attempted transfer.

A causal claim is distinct from provenance, temporal order, and association. It
must state its scope, comparison, evidence basis, model or assumptions,
uncertainty, and plausible alternative explanations. An inferred causal model
is a versioned analysis artifact, never an invisible mutation of the ledger.

### Analysis artifacts

Clusters, summaries, embeddings, inferred links, causal graphs, rankings, and
generated answers are useful outputs of named processes over named inputs.
Direct versus derived and canonical versus disposable are independent axes. A
derived result worth preserving for audit, citation, or historical comparison
may become a canonical, versioned analysis record; that retention grants no
truth authority. Other outputs may remain disposable and be recomputed.

Reproducibility claims are explicit and proportional to the process.
Deterministic normative transformations should reproduce specified semantics;
for stochastic or externally hosted models, GraphTruth preserves the retained
output and available inputs, model identity, configuration, and provenance, but
does not promise byte-identical regeneration.

## From captured fragments to usable knowledge

GraphTruth is intended to support an end-to-end knowledge cycle:

1. **Capture without premature interpretation.** Preserve an event and its
   source boundary before extracting meaning.
2. **Normalize reversibly.** Establish identifiers, formats, times, and exact
   evidence spans while retaining the source version, except for controlled
   retention or redaction actions.
3. **Propose structure.** Detect entities, candidate classifications,
   assertions, questions, decisions, and experience episodes as attributable
   candidates.
4. **Reconcile without erasing disagreement.** Resolve identities where
   justified, connect support, detect incompatible claims, and preserve
   alternatives.
5. **Derive views.** Apply explicit trust, time, privacy, and relevance policies
   to create useful projections.
6. **Retrieve dossiers.** Assemble a relevant body of evidence and context
   rather than return a fragment in isolation.
7. **Acquire actively.** Turn contradictions, low-confidence assertions, and
   dark regions into ranked questions, observations, or experiments.
8. **Learn from the result.** Add the new evidence and experience to the same
   ledger, including failures and surprises.

No single machine-learning technique defines this cycle. Deterministic rules,
graph algorithms, information retrieval, statistics, causal inference, language
models, and human judgment can all participate, but every participant has an
explicit role and authority boundary.

## Preserving experience, mechanism, and transfer

Reading a correct explanation does not automatically create the practical
ability to recognize and reuse its mechanism in a different situation.
GraphTruth cannot serialize tacit, embodied experience in full. It can,
however, preserve the generative structure around experience and help turn
passive information into tested capability.

For important external knowledge, a GraphTruth workflow may ask for a prediction
before revealing an outcome, propose a safe contrasting case or
micro-experiment, record the actual observation, expose the prediction error,
and ask which mechanism explains it. It can later find a structurally similar
problem in a different domain and record an explicit transfer attempt.

The reusable object is therefore not a slogan such as "use pattern X." It is a
mechanism pattern containing:

- the shape of the problem and goal;
- relevant forces and constraints;
- the available intervention;
- the proposed state transformation;
- conditions required for the effect;
- expected side effects and failure boundaries;
- successful, failed, and counterexample episodes.

Evidence that a person or agent encountered, recalled, explained, predicted
with, applied, adapted, or transferred a mechanism should remain separate.
"Knowledge ownership" is not reduced to one score. Successful transfer in one
class of contexts does not imply universal mastery.

## Access should produce knowledge in context

Canonical records should be small enough to reference, validate, revise, and
reuse. They should not be mistaken for the unit presented to a user.

The primary retrieval result is a query-specific **dossier** assembled from
relevant records. Depending on the question, it may include:

- the current candidate answer and competing assertions;
- exact source evidence and provenance;
- scope and claimed temporal applicability;
- the separately reconstructed decision-time information set, where relevant;
- supporting, challenging, and superseded material;
- relevant entities, classifications, and neighboring claims;
- experience episodes, mechanisms, and counterexamples;
- unresolved questions and missing evidence;
- the assumptions and policy used to assemble the view.

This is how GraphTruth provides a complete knowledge chunk without making a
generated chunk canonical. Search indexes, graph traversals, embeddings, and
rerankers help build the dossier; the dossier remains explainable in terms of
the underlying ledger.

## The protocol is the long-lived core

GraphTruth deliberately separates three zones.

### Zone 1: protocol and specification

This zone defines identities, record envelopes, semantics, invariants,
extension rules, version negotiation, lifecycle transitions, temporal behavior,
canonicalization where required, and compatibility expectations. Mandatory
algorithms belong here only when independent implementations must produce the
same result.

### Zone 2: core tooling

This zone makes the specification usable: validators, canonicalizers,
migrations, deterministic reducers, renderers, conformance fixtures, and
reference implementations of normative algorithms. It should be possible to
replace these tools with conforming alternatives.

### Zone 3: default implementation

This zone delivers immediate utility: connectors, ingestion workflows, model
assistance, search, disposable indexes, graph projections, user interfaces,
question ranking, and experiment suggestions. It is expected to evolve fastest
and has no special authority over the protocol.

These zones will initially coexist in one monorepository. Clear internal
boundaries matter; separate repositories do not yet.

## What GraphTruth is not

GraphTruth is not intended to be:

- a universal arbiter that decides which statements are absolutely true;
- merely a property graph, ontology, vector database, RAG framework, or notes
  application;
- a replacement for domain-specific measurement, experimentation, or expert
  judgment;
- a requirement to put every payload into Git or one serialization format;
- a mechanism for hiding uncertainty behind fluent generated prose;
- an autonomous system allowed to rewrite history based on model confidence;
- a promise that the first default runtime will remain permanent.

It may use property graphs, ontologies, databases, retrieval models, language
models, and domain tools where useful, without delegating protocol semantics or
epistemic authority to them. Its identity lies in durable epistemic semantics
and the ability to rebuild disposable access layers from a sufficiently
complete archive — not in reproducing every model output byte for byte.

## Measures of success

GraphTruth succeeds when:

- a person can trace a conclusion to exact evidence and understand the
  transformations in between;
- the system can reconstruct the recorded information set available to an
  earlier decision, with its completeness limits made explicit;
- disagreement and uncertainty survive summarization;
- a correction preserves, rather than falsifies, history;
- retrieval returns sufficient context to judge applicability;
- the system turns important gaps into answerable acquisition tasks;
- an experience can be compared with other episodes by mechanism rather than
  vocabulary alone;
- an independent implementation supporting the recorded profiles can validate
  the same complete archive and rebuild equivalent indexes;
- useful knowledge remains available after the original software reaches end of
  life when required source and analysis artifacts were retained.

The first milestone is not universal adoption. It is a complete personal system
that earns trust through daily use, exposes weaknesses in the protocol, and
produces canonical data worth keeping even if the implementation is later
replaced.
