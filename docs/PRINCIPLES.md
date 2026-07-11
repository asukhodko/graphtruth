# Design Principles

These principles constrain the protocol, tooling, and default runtime.
They are more stable than current schemas or technology choices. Normative
requirements will ultimately live in the specification; the language below
states the design intent from which those requirements should follow.

## 1. Record epistemic state; do not declare truth

GraphTruth records observations, reports, assertions, interpretations,
acceptance decisions, disputes, and withdrawals as different things. An
`AssertionRevision` has a lifecycle describing the history of its claim; an
`AcceptanceDecision` separately records how a named policy or consumer treats
it. There is no global `accepted` assertion status. A fact is a policy- and
time-dependent view over both kinds of record, not a privileged primitive.

**Consequence:** a consumer must be able to disagree with another consumer's
trust policy while using the same canonical records, without rewriting the
assertion lifecycle.

## 2. Preserve evidence before extracting meaning

Every meaningful assertion should be traceable to exact source evidence, direct
observation, or an explicitly named derivation. Evidence uses a stable,
versioned representation and integrity addressing where feasible. Source
versions and evidence boundaries are preserved wherever law, privacy, and
practicality permit; controlled redaction and required removal are explicit
audited exceptions, not silent mutation.

**Consequence:** summaries and extracted triples cannot be the only surviving
representation of a source.

## 3. Provenance is part of meaning

Who or what produced a record, from which inputs, using which version and
process, and at what time affects how the record may be interpreted. Provenance
is structured protocol data, not an optional citation string.

**Consequence:** machine-generated and human-authored claims can coexist without
being confused, and a derived artifact can be traced and challenged. Each
process declares its reproducibility target; stochastic model outputs carry no
promise of byte-identical regeneration.

## 4. Context and time are not decorations

Claims apply within scopes, conditions, and time intervals. Valid time means
when an assertion claims to apply. Recorded time means when its record became
visible in the ledger. Neither timestamp by itself establishes objective truth,
human knowledge, or information available to a decision maker.

**Consequence:** schemas and queries must support bitemporal reconstruction, and
contradiction detection must compare applicability before declaring conflict. A
decision-time information set is reconstructed separately and states its
evidence and completeness limits.

## 5. Preserve history; revise by addition

Correction is normal. Revisions, supersessions, retractions, entity merges, and
entity splits must remain attributable and reversible. Earlier decision-time
views cannot be reconstructed if their inputs have been destructively updated.

**Consequence:** canonical records favor append-oriented evolution and stable
identifiers; garbage collection must never erase epistemically relevant history
without an explicit retention policy.

## 6. Contradictions and unknowns are first-class

Disagreement, weak evidence, stale knowledge, missing connections, and open
questions are useful states. The system must not manufacture consensus to make
its graph look clean.

**Consequence:** questions and conflicts have identifiers, provenance,
lifecycle, priority, and resolution evidence. "Unknown" is a valid result.

## 7. Distinguish provenance, sequence, association, and causation

`B was derived from record A`, `A preceded B`, `A is associated with B`, and `an
intervention on A changes B` are different relations. No implementation may
promote one into another implicitly.

**Consequence:** causal assertions carry a comparison, scope, evidence basis,
assumptions, uncertainty, and alternative explanations. Counterfactuals identify
the model that produced them. Causal discovery produces candidates, not facts.

## 8. Preserve the path through experience

A lesson without its situation, goal, constraints, alternatives, prediction,
decision, action, observation, and outcome is difficult to evaluate or transfer.
Failures and surprises can be more informative than polished success stories.

**Consequence:** GraphTruth models experience episodes and transfer attempts,
not just retrospective lessons. Planned action, executed action, received
intervention, observed outcome, and causal interpretation remain distinct.

## 9. Optimize for transferable mechanisms, not surface similarity

Reusable knowledge is often a relational structure that appears under different
vocabulary in another domain. Retrieval should be able to compare problem
shape, forces, constraints, interventions, state changes, mechanisms, and
failure boundaries.

**Consequence:** text similarity is one access signal among others. A proposed
analogy must expose its source-to-target mapping and important mismatches, and a
successful transfer becomes new evidence rather than proof of universality.

## 10. Turn uncertainty into acquisition work

A knowledge system should not only answer from what it has. It should identify
which question, observation, source, comparison, or safe experiment would most
usefully reduce an important uncertainty.

**Consequence:** active acquisition is a closed loop: detect a gap, formulate an
answerable question, acquire evidence, evaluate the result, and retain both the
result and the process. Cost, risk, privacy, reversibility, and expected value
must constrain suggestions.

## 11. Canonical data lives in portable files

The authoritative representation is documented, versioned, human- and
machine-readable, and usable without a particular database vendor or hosted
service. Files may contain or reference larger versioned, integrity-addressed
artifacts; file-first is a retention and authority rule, not a ban on efficient
storage.

**Consequence:** canonical/disposable and direct/derived are independent axes. A
derived analysis may be retained canonically without becoming authoritative.
Databases, graph projections, vector stores, full-text indexes, caches, and
materialized views designated disposable must be rebuildable from an archive
complete for their supported profiles and referenced artifacts. Essential
meaning cannot live only in an index, prompt, embedding, or model state.

## 12. Human-readable and machine-actionable are simultaneous requirements

Humans must be able to inspect and review canonical records with ordinary tools.
Machines must be able to validate and transform the same records without
guessing their semantics.

**Consequence:** narrative text alone is insufficient, but opaque encodings are
also insufficient. Examples, schemas, deterministic validation, and clear
rendering are all part of protocol quality.

## 13. Algorithms have bounded authority

Deterministic protocol behavior, executable reference behavior, and heuristic
product behavior are separate. Statistical models and language models are
valuable proposal engines, but confidence does not grant write authority.

**Consequence:** a heuristic output is an attributable, versioned candidate or
analysis artifact. Canonical retention preserves it but does not accept it; an
accepted view requires a separate `AcceptanceDecision` under an explicit policy
or review. There is no untraceable model-to-truth path.

## 14. Derived views must explain themselves

Search results, summaries, dossiers, scores, and answers should identify the
canonical records, policy, time horizon, and transformations on which they
depend. A fluent answer is not a substitute for a support boundary.

**Consequence:** retrieval returns relevant context, conflicts, and gaps rather
than isolated text fragments, while still allowing a user to descend to the
smallest exact evidence span.

## 15. Evolve explicitly and degrade gracefully

A long-lived protocol needs declared versions, compatibility rules, extension
namespaces, migration guides, conformance fixtures, and preservation of unknown
extensions. Readers should fail clearly on semantics they cannot safely
interpret and retain data they do not understand when round-tripping.

**Consequence:** changes that alter meaning require an explicit migration path.
Optional features cannot make base records unreadable, and a minimal reader
should recover useful information even when advanced profiles are unavailable.

## 16. Keep the implementation replaceable

The initial system exists to make GraphTruth useful, test the protocol, and
expose missing semantics. It is not the permanent definition of GraphTruth.
Interfaces should follow durable data boundaries rather than current framework
boundaries.

**Consequence:** protocol, conformance tooling, and runtime are distinct zones.
They remain in one monorepository while coordinated evolution is an advantage,
and split only when an observed technical or governance constraint outweighs
that advantage.

## 17. Prefer local control and explicit disclosure

Knowledge may include personal, confidential, or legally constrained material.
Capture and analysis should minimize unnecessary disclosure, and remote model or
service use must be a visible policy choice.

**Consequence:** access control, redaction, retention, and provenance of external
processing are design concerns from the beginning, even when the first system is
single-user.

## 18. Fail safely, visibly, and reversibly

Missing evidence, invalid records, ambiguous identity, unsupported versions,
and unavailable indexes must not be disguised as successful knowledge. A
partial system should report what it cannot establish.

**Consequence:** validation errors are actionable; destructive operations are
exceptional; automated merges and promotions are reversible; rebuilding an
index cannot change canonical meaning.
