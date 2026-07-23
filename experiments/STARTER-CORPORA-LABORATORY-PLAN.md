# Starter corpora laboratory plan

> **Status:** Non-normative Zone 3 laboratory plan; the first Python sequential
> lane is active under Issue #24. Its corpus selection and rights are frozen;
> original source acquisition and the byte-identical RST text projection are
> verified and accepted. One separately authorized evaluation-freeze attempt
> ended in terminal independent-audit rejection without a release. No accepted
> evaluation or run pack exists. Its safe diagnosis is published. A separate
> v2 controller was synthetically verified, accepted by exact identity, and
> authorized for one attempt. That sole invocation stopped fail-closed with
> `AUTHOR_MODEL_CALL` before a validated author artifact or independent audit;
> it produced no public result JSON, release, or accepted contract. The Python
> corpus is exploratory; confirmation requires a fresh corpus and identity. On
> repository-active date 3/5 the owner chose procedural `shrink` to preparation
> of a generated-public-synthetic author-call qualification. The owner accepted
> its exact identity and separately authorized one external call. That sole call
> ended terminally `not-qualified / result-schema`; no successor gate is
> authorized.
>
> **Created:** 2026-07-12.
>
> **Related work:** [Issue #24 — Python annotation semantics sequential corpus
> replay](https://github.com/asukhodko/graphtruth/issues/24), the stopped
> [Issue #6 — Local future-reveal corpus replay
> harness](https://github.com/asukhodko/graphtruth/issues/6), and
> [Issue #8 — Continuous emergent domain
> topology](https://github.com/asukhodko/graphtruth/issues/8).
>
> **Authority:** This document selects candidate public corpora and orders
> bounded experiments. It is not a frozen run pack, benchmark, protocol rule,
> conformance claim, or authorization to acquire or redistribute source bytes.
> Every evaluated lane requires its own sealed corpus-selection record, run
> card, task pack, oracle, review rubric, rights record, and integrity digests.

## Decision

Use a three-corpus public laboratory track, one corpus at a time:

1. `python-annotations-semantics-v1` — documented rationale and decision
   evolution;
2. `gitlab-ci-job-token-artifacts-18.11-v1` — applied operational knowledge;
3. `postgresql-cte-materialization-11-12-v1` — version-scoped semantics.

Each initial corpus contains four source items. A first sequential lane precedes
the separately frozen order-robustness successor. Call its decision
`sequential keep`, `sequential shrink`, or `sequential stop`. A sequential
keep authorizes only the successor; it is not a corpus-level keep. The successor
executes all 24 permutations from clean state and records a separate
`order-robustness keep`, `order-robustness shrink`, or
`order-robustness stop`. Only its keep is the public corpus-level keep.

The next public corpus does not start until the active public corpus reaches that
corpus-level keep, is stopped or rejected, or is deliberately paused under the
project's one-major-WIP rule.

After all three corpora produce bounded corpus-level keeps, a separate
multi-domain successor may combine them under Issue #8. The combined experiment
is not part of the first three corpus-level keeps.

## Purpose and program hypothesis

The public track asks whether GraphTruth can turn small, fixed sets of real
technical documents into order-robust, evidence-grounded, contextual knowledge
without confusing arrival time, product time, authority, source lineage, or
documented rationale with independently established causation.

The three corpora deliberately isolate different failure classes:

| Corpus | Items | Exhaustive orders | Primary diagnostic |
| --- | ---: | ---: | --- |
| Python PEPs | 4 | 24 | Rationale, replacement, and gaps |
| GitLab artifacts | 4 | 24 | Conditions, roles, and dossiers |
| PostgreSQL CTEs | 4 | 24 | Version scope and false conflicts |

Passing these public experiments can support claims about capture, grounding,
retrieval, temporal discipline, bounded question generation, and deterministic
semantic convergence for the frozen cases. It cannot establish universal
algorithm quality, unaided learning of previously unknown material, or product
value in a personal workflow.

## Relationship to private dogfood

This plan adds a public laboratory track; it does not replace private dogfood
evidence. Issue #6 stopped before producing an admissible frozen private
contract or an evaluated private run. Its terminal local states are preserved
outside this track and are not inputs to it. A later private dogfood successor
requires a new identity, issue, threat review, and evidence contract.

- The public track uses redistributable or privately retained public-source
  snapshots to make algorithm and replay failures reproducible.
- The private track uses one real personal decision or incident lineage to test
  whether GraphTruth saves work, exposes useful knowledge, and avoids forcing a
  parallel authoritative notebook.
- Public model familiarity and pretraining exposure limit novelty claims. The
  private track has different familiarity, disclosure, and retention risks.
- A `keep` in either track authorizes only its frozen bounded claim. Neither
  track supplies the missing evidence of the other.

The common method remains [Corpus replay experiment
harness](../docs/drafts/CORPUS-REPLAY-EXPERIMENT-HARNESS.md). Run-specific
decisions use [Corpus selection](templates/CORPUS-SELECTION.md),
[Run card](templates/RUN-CARD.md), and [Review
rubric](templates/REVIEW-RUBRIC.md).

## Common laboratory contract

Before inspecting GraphTruth or baseline output for a corpus:

1. Freeze the use case, candidate population, inclusion and exclusion rules,
   selected items, acquisition process, rights, source-family map, coverage
   boundary, chronology type, tasks, oracle, scoring, budgets, and stop gates.
2. Retain the exact acquired source bytes outside the system-under-test input
   area. Record upstream revision, acquisition time in UTC, SHA-256, byte size,
   media type, notices, and transformation identity for every item.
3. Preserve original source bytes and deterministic Markdown or text
   projections separately. The projection is disposable; the baseline and
   GraphTruth receive byte-identical projected items.
4. Treat publication, valid/effective, event, arrival/reveal, and recorded time
   as distinct axes. Random arrival never rewrites product chronology, version
   precedence, provenance, or authority.
5. Reveal one item at a time without exposing future filenames, paths, counts,
   metadata, oracle structure, or content.
6. Treat all source text as untrusted data. It cannot change policy, invoke
   tools, grant authority, accept a claim, or trigger external action.
7. Count related pages from one documentation family as dependent sources, not
   independent corroboration. Preserve parent, summary, copy, and near-duplicate
   relations where known.
8. Compare with the same frozen files plus ordinary search. Count GraphTruth-only
   annotation and review work as capture tax unless the baseline receives an
   equivalent budget.
9. Run the first sequential lane and record a bounded `keep`, `shrink`, or
   `stop`. Only a later run identity may claim exhaustive order robustness.
10. Evaluate every registered order and task cell. Do not average away a severe
    failure or retry an unfavorable order into success.

Before the order-robustness successor, freeze the terminal semantic-equivalence
relation and comparison procedure. It must identify which assertion, evidence,
scope, time, question, contradiction, and dossier properties must agree while
ignoring declared incidental serialization or traversal order. The initial
S0-S1 suite remains deterministic. A later stochastic component requires a
separate repeated-run design that distinguishes order variance from stochastic
variance; one sample per order cannot support a convergence claim.

The detailed isolation, permutation, retry, invalidation, crash, deletion, and
baseline rules are owned by the harness and experiment templates rather than
duplicated here.

## Corpus 1: Python annotation semantics

### Python identity and source set

- Candidate identity: `python-annotations-semantics-v1`.
- Upstream family: Python Enhancement Proposals.
- Initial immutable upstream revision:
  `python/peps@339af2b4776a66eab0f88a2800adffdb0c0650e1`.
- Selected items:

  1. [PEP 3107 — Function
     Annotations](https://github.com/python/peps/blob/339af2b4776a66eab0f88a2800adffdb0c0650e1/peps/pep-3107.rst)
  2. [PEP 563 — Postponed Evaluation of
     Annotations](https://github.com/python/peps/blob/339af2b4776a66eab0f88a2800adffdb0c0650e1/peps/pep-0563.rst)
  3. [PEP 649 — Deferred Evaluation of Annotations Using
     Descriptors](https://github.com/python/peps/blob/339af2b4776a66eab0f88a2800adffdb0c0650e1/peps/pep-0649.rst)
  4. [PEP 749 — Implementing PEP
     649](https://github.com/python/peps/blob/339af2b4776a66eab0f88a2800adffdb0c0650e1/peps/pep-0749.rst)

The public [corpus-selection and rights
record](corpora/python-annotations-semantics-v1/CORPUS-SELECTION.md) binds the
individual blob identities, closed candidate frame, synthetic reveal order,
one-family treatment, PEP 484 dark-zone role, handling policy, and familiarity
limits. The pinned Git identities are not substitutes for acquired-byte
SHA-256 digests, sizes, notices, and acquisition UTC. The publication-safe
[source manifest](corpora/python-annotations-semantics-v1/SOURCE-MANIFEST.json)
records those checks for the four owner-only originals retained outside the
checkout. The owner accepted the manifest and actual storage boundary in the
[Issue #24 decision record](https://github.com/asukhodko/graphtruth/issues/24#issuecomment-5031512080).
The [projection contract](corpora/python-annotations-semantics-v1/PROJECTION-CONTRACT.md)
and [projection
manifest](corpora/python-annotations-semantics-v1/PROJECTION-MANIFEST.json)
record the byte-identical RST text projection and two verified clean builds.
The owner accepted its exact SHA-256 and actual output boundary in the
[separate receipt](corpora/python-annotations-semantics-v1/PROJECTION-ACCEPTANCE.json),
closing only `m6-freeze-projection`. No source bytes, projection bytes, or
private-material paths are published.

### Why it is first

The corpus is one compact decision lineage:

```text
annotations without prescribed semantics
  -> stringized postponed evaluation
  -> runtime and scope problems become material
  -> deferred evaluation replaces the planned default
  -> implementation work exposes underspecified cases
```

It therefore tests whether GraphTruth preserves documented problem/solution
rationale before a larger operational corpus adds many access-control and API
conditions. The source set contains motivation, goals, rejected alternatives,
compatibility concerns, replacement, dependency, and implementation refinement.

### Preparation and boundary

The accepted projection `python-annotations-semantics-v1-verbatim-rst-v1`
retains each RST payload byte-for-byte. GraphTruth and the files-plus-search
baseline must receive the same accepted RST bytes at each horizon. A future
runner that accepts only Markdown must be adapted to this boundary; it must not
silently replace or transform the common input. Any new transformation requires
a new projection identity, fidelity review, and owner acceptance before use.

The acquired originals retain verified public-domain notices in PEP 3107 and
PEP 563, and public-domain-or-CC0 notices in PEP 649 and PEP 749. Each notice is
bound to its file's exact digest rather than treated as one family-wide license.

PEP 484 and current Python runtime documentation are deliberately outside the
four-item corpus. Their absence is part of the knowledge boundary, not proof
that their content is false or permanently unknowable.

The source pages may contain retrospective status updates. The first lane must
therefore declare whether it uses historically evidenced or synthetic reveal
time and must not claim to reconstruct exactly what a historical reader knew at
each original publication date.

### Python task and oracle families

The final task pack should cover at least:

- the original purpose and deliberately unspecified meaning of annotations;
- the forward-reference and import-cost problems addressed by PEP 563;
- why stringized annotations help static analysis but burden runtime users;
- why retaining vanished local scopes has a cost;
- what PEP 649 preserves and changes relative to earlier semantics;
- why PEP 749 was needed after PEP 649 was accepted;
- replacement versus supplementation: PEP 563, PEP 649, and PEP 749;
- version-scoped answers rather than one timeless annotation behavior;
- PEP 484 details and primary evidence outside the corpus, including the exact
  standardization scope and compatibility history;
- abstention about current runtime behavior not established by this corpus.

PEP 484 is a predeclared dark-zone control. The corpus already names the
type-hinting transition, so a useful question should identify which PEP 484
details or primary evidence are absent. It must not treat the transition's
existence as unknown or import remembered PEP 484 content as corpus evidence.

### Python limitations

- Replacement and dependency fields make part of the lineage unusually
  explicit.
- All four items belong to one source family and are not independent evidence.
- Public PEPs are likely present in model pretraining and may be familiar to
  participants.
- A final PEP records a decision and implementation status; it is not by itself
  runtime evidence for an arbitrary Python build.
- One official document family records declared rationale and succession; it
  does not independently establish the actual historical causes or outcomes of
  the language change.

## Corpus 2: GitLab cross-project artifact access

### GitLab identity and source set

- Candidate identity: `gitlab-ci-job-token-artifacts-18.11-v1`.
- Upstream family: GitLab documentation archive.
- Product/documentation scope: GitLab 18.11.
- Selected published views:

  1. [CI job token policy and
     use](https://archives.docs.gitlab.com/18.11/ci/jobs/ci_job_token/)
  2. [Project job token scope
     API](https://archives.docs.gitlab.com/18.11/api/project_job_token_scopes/)
  3. [Job Artifacts
     API](https://archives.docs.gitlab.com/18.11/api/job_artifacts/)
  4. [Job artifact creation and
     lifecycle](https://archives.docs.gitlab.com/18.11/ci/jobs/job_artifacts/)

During freeze, resolve each published view to an exact source revision or retain
the acquired archive bytes, then record both the source and publication
identity. A versioned URL alone is not an immutable-byte guarantee.

### Workflow and diagnostic purpose

The frozen workflow is: a job in source project B retrieves the latest eligible
`build` artifact from target project A using `CI_JOB_TOKEN`.

The four pages contribute different roles:

- credential semantics and inherited user authority;
- target-side allowlist and control-plane configuration;
- data-plane artifact endpoints and selection behavior;
- artifact creation, retention, and ordinary pipeline consumption.

The corpus tests necessary versus sufficient conditions, source/target role
direction, membership versus allowlist, public/internal exceptions, API versus
feature availability, and contextual dossier assembly.

### GitLab task and oracle families

The final task pack should cover at least:

- the complete conditions for project B to retrieve project A's artifact;
- which project owns the allowlist entry and which direction access flows;
- who may change the allowlist and which credential can perform that change;
- how public or internal visibility changes, but does not erase, policy checks;
- artifact selection by ref, pipeline, and job name;
- parent/child and manual-job edge cases where documented;
- facts available only from the artifact lifecycle page;
- endpoint permissions established by the four-item boundary;
- the deprecated `outbound_enabled` field still appearing in 18.11 material;
- the question needed to determine actual 18.11 runtime/API behavior where the
  documentation remains temporally anomalous.

The system must not turn a documented deprecation plan into evidence that a
field is absent at runtime.

### Controlled expansion

[Fine-grained job-token
permissions](https://archives.docs.gitlab.com/18.11/ci/jobs/fine_grained_permissions/)
is a frozen candidate for a later five-item expansion. It is not added merely
because the four-item output looks favorable. Expansion requires the original
corpus to reach `keep`, a new selection identity, 120 registered permutations,
and a new budget.

### GitLab limitations

- The author's GitLab familiarity is useful for oracle review but weakens a
  blind human baseline. Record familiarity per task and keep efficacy claims
  exploratory when roles overlap.
- All pages share a documentation family and may summarize one another.
- The archive currently identifies documentation terms through its footer;
  exact CC BY-SA 4.0 obligations, transformation notices, and processing rights
  must be reverified and sealed before acquisition or publication.
- All four pages share the GitLab 18.11 validity scope. Embedded history blocks
  do not turn random reveal order into product chronology.

## Corpus 3: PostgreSQL CTE materialization

### PostgreSQL identity and source set

- Candidate identity: `postgresql-cte-materialization-11-12-v1`.
- Upstream family: PostgreSQL Global Development Group documentation.
- Product scopes: PostgreSQL 11 and PostgreSQL 12.
- Selected published views:

  1. [PostgreSQL 11 `WITH`
     queries](https://www.postgresql.org/docs/11/queries-with.html)
  2. [PostgreSQL 12 `WITH`
     queries](https://www.postgresql.org/docs/12/queries-with.html)
  3. [PostgreSQL 12 `SELECT`
     reference](https://www.postgresql.org/docs/12/sql-select.html)
  4. [PostgreSQL 12 release
     notes](https://www.postgresql.org/docs/12/release-12.html)

The exact acquired bytes and upstream release/source identities must be frozen.
The [PostgreSQL License](https://www.postgresql.org/about/licence/) permits broad
use of the software and documentation with the required notice, but the
run-specific rights record remains mandatory.

### Diagnostic purpose

This corpus asks whether GraphTruth can preserve simultaneous version-scoped
truths instead of manufacturing one timeless contradiction:

- PostgreSQL 11 generally treats a CTE as a separately evaluated optimization
  fence;
- PostgreSQL 12 can fold eligible side-effect-free, non-recursive, singly
  referenced CTEs into the parent query;
- explicit materialization choices and repeated references change the answer;
- optimization can trade predicate pushdown against duplicate expensive work.

The PostgreSQL 11 `SELECT` reference is deliberately excluded. It mostly adds
an absence-of-new-syntax argument and near-duplicate semantics while increasing
the suite from 24 to 120 permutations. Its exclusion is frozen before output,
not chosen after observing system performance.

### PostgreSQL task and oracle families

The final task pack should cover at least:

- default CTE behavior in PostgreSQL 11 versus PostgreSQL 12;
- the eligibility conditions for folding in PostgreSQL 12;
- one versus multiple references;
- recursive, volatile, or side-effecting cases;
- `MATERIALIZED` and `NOT MATERIALIZED` intent and limitations;
- performance trade-offs without inventing an exact speedup;
- clarification questions required by the unscoped query "Is a CTE
  materialized?";
- historical applicability: PostgreSQL 11 behavior remains valid for a
  PostgreSQL 11 target after PostgreSQL 12 is published;
- an unanswerable control asking for runtime improvement without a concrete
  schema, data, plan, workload, and measurement.

### Chronology and dependence

The meaningful product horizon is PostgreSQL 11 followed by PostgreSQL 12.
The PostgreSQL 12 conceptual page, reference page, and release note are a release
bundle, not three independent historical events or confirmations. Arrival may
permute the four items, but version applicability must not.

## Per-corpus execution sequence

For each corpus, execute the following progression without overlapping major
WIP:

1. **Rights and acquisition preflight** — verify terms, exact upstream
   identities, transformations, storage, processing, attribution, and
   publication boundaries.
2. **Synthetic rehearsal** — exercise the controller, future-metadata canary,
   crash/resume, deletion, rebuild, and budget behavior without corpus bytes.
3. **Frozen sequential lane** — use a historically evidenced chronology where
   defensible; otherwise declare a synthetic chronology and limit the claim.
4. **First comparison** — run the frozen tasks against GraphTruth and the same
   files plus ordinary search under the registered information and labor
   budgets.
5. **Sequential decision** — record `sequential keep`, `sequential shrink`,
   or `sequential stop`, including all failures and costs. Close or deliberately
   pause the lane before successor work. A sequential keep authorizes only the
   order-robustness successor.
6. **Order-robustness successor and decision** — create a new freeze and run
   identity, start every order clean, enumerate all 24 permutations, report the
   worst order and complete denominator, and record `order-robustness keep`,
   `order-robustness shrink`, or `order-robustness stop`. Only this keep is the
   public corpus-level keep.
7. **Learning record** — add expected, observed, learned, both decisions, and the
   permitted next scope to the owning issue.

No corpus advances automatically because preparation cost has already been
spent or because another corpus passed.

## Shared order-robustness acceptance conditions

The exact thresholds belong in each sealed run card. The sequential lane has its
own bounded gates in the harness and can reach only a sequential decision. At
minimum, an order-robustness successor cannot reach `order-robustness keep`,
the public corpus-level keep, unless:

- every displayed claim resolves to exact retained evidence;
- no future item or metadata appears before reveal;
- product version, event, validity, publication, reveal, and recorded time are
  not collapsed into one order;
- source-family dependence is preserved and does not inflate support;
- corrections, replacement, supplementation, and applicability are not
  flattened into a single overwrite relation;
- every declared disposable projection deletes and rebuilds from retained
  inputs with the required semantic equivalence;
- terminal states across all 24 orders satisfy the frozen semantic-equivalence
  relation under deterministic execution controls;
- duplicate delivery is idempotent;
- dark zones and unanswerable controls produce bounded questions or abstention,
  not unsupported confident answers;
- the frozen primary endpoint is non-inferior to files plus ordinary search in
  every eligible registered cell;
- no severe correctness or safety failure occurs in the sequential lane or any
  evaluated permutation;
- setup, transformation, capture, review, correction, query, compute, and
  storage costs are reported separately.

Fluent dossiers and attractive graphs are explanatory evidence, not substitutes
for the frozen decision gate.

## Shared stop and reduction conditions

Stop or shrink the active corpus when:

- acquisition, transformation, processing, or publication rights cannot be
  verified for the intended lane;
- the projection is lossy in a way that changes an oracle-relevant claim;
- the system leaks future material, executes source instructions, loses
  provenance, silently accepts output, or leaves canonical meaning only in an
  index;
- an unfavorable order is omitted, averaged away, or repaired without a new
  run identity;
- ordinary files and search achieve the same task result with materially lower
  total cost;
- human or model familiarity makes the declared claim impossible to support;
- useful behavior requires premature Zone 1 semantics, a universal ontology,
  or an infrastructure platform outside the time box;
- the lane cannot complete one end-to-end loop inside its frozen budget.

Failure remains part of the selection log and learning record. It is not erased
by replacing the corpus with an easier one.

## Derived multi-domain successor

After bounded order-robustness keeps on all three isolated corpora, Issue #8 may
open a separate hidden-domain experiment over their composition.

The system under test must not receive curated domain labels, future item names,
bridge identity, or oracle structure. It should be able to retain unclassified
items, propose soft multiple memberships, preserve independent source lineages,
and revise a topology without rewriting evidence or historical views.

Twelve combined items exceed the small-corpus exhaustive-factorial boundary.
The successor must therefore freeze a larger-corpus strategy before output,
including:

- historically valid within-lineage constraints where applicable;
- seeded interleavings with a published seed-list digest;
- bridge-early and bridge-late adversarial schedules;
- at least one counterexample that prevents an attractive over-merge;
- fixed within-domain and cross-domain retrieval tasks;
- topology-shock, churn, negative-transfer, decisive-counterevidence, and clean
  rebuild measures.

Candidate bridge additions such as PEP 484, GitLab fine-grained permissions, or
another PostgreSQL explanatory source require a new corpus identity. They cannot
be selected after seeing which missing document would make a failed result look
better.

This successor tests emergent organization and abrupt restructuring. It does
not grant inferred domains, memberships, or topology generations truth or
authorization authority.

## Repository and artifact boundary

This public repository may retain:

- this candidate-selection plan and upstream references;
- acquisition and transformation code after review;
- manifests containing only publication-safe metadata;
- independently written synthetic fixtures;
- aggregate reports and generalized failures approved for publication.

Until run-specific rights and disclosure reviews say otherwise, keep outside
the checkout:

- acquired third-party corpus bytes and projections;
- private manifests and source inventories;
- task answers, withheld oracle material, and scorer notes;
- prompts, model output, embeddings, indexes, logs, checkpoints, and backups;
- participant familiarity records or other sensitive run metadata.

The repository's lack of a license does not cancel third-party attribution or
share-alike duties and does not make public readability permission to copy,
transform, process, or redistribute material.

## Immediate deliverables

The owner recorded a project-level `stop` for Issue #6, and Issue #24 activates
`python-annotations-semantics-v1` as the single major WIP. Its accepted public
selection record freezes the bounded corpus, synthetic sequence, rights and
handling policy, knowledge boundary, and familiarity limits. It does not freeze
tasks, oracle, baseline, evaluation budgets, or a run identity. The source
manifest records the technically verified acquisition and
publication-safe metadata. The owner accepted its pre-acceptance SHA-256
`ad63ca3cad51ec67b6e5d8fd2c62dcdfc3ed6a291f47a6809a819eadfa29ff99`
and the actual owner-only boundary, closing `m6-acquire-originals`. The
projection contract and safe manifest now bind a byte-identical RST text
strategy, two verified clean builds, no declared losses, and explicit current
runtime incompatibility. The owner accepted the exact manifest and actual
output boundary, closing `m6-freeze-projection`.

The owner then authorized one evaluation-freeze attempt and two external Codex
calls. It created a private 8-task, 64-cell, 32-judgment core with 10 severe-error
classes, but the independent read-only audit returned `reject`. The safe
[terminal record](corpora/python-annotations-semantics-v1/EVALUATION-FREEZE-TERMINAL.json)
records the outcome; no RELEASE exists. The evaluation identity is terminal and
cannot be repaired, retried, resumed, or reused. Its exact audit result was read
once through the authorized deterministic extractor. The safe [diagnostic
receipt](corpora/python-annotations-semantics-v1/EVALUATION-FREEZE-DIAGNOSTIC.json)
records only fixed flags, enumerated issue codes, counts, identities, and
no-repair/no-run facts. It identifies incomplete result-class semantics and a
missing operational GraphTruth capture-tax rule without publishing the closed
path or report content.

The separate evaluation-freeze v2 controller closes those two gaps and exposes
future audit rejection only through fixed safe codes. It passed public
synthetic tests, and the owner accepted its exact wrapper, controller, and test
identities. A separate authorization admitted one attempt. The sole invocation
stopped fail-closed with `AUTHOR_MODEL_CALL` and exit status `1`, before a
validated author artifact or independent audit. It returned no public JSON and
produced no release or accepted evaluation contract. That attempt cannot be
retried, resumed, repaired, or reused.

The owner chose procedural `shrink` on repository-active date 3/5. The corpus,
projection, and accepted v2 bytes remain unchanged. Preparation and
fake-provider testing of `codex-author-call-qualification-v1` with generated
public synthetic RST completed without corpus, projection, terminal-state, or
owner-authorization-record reads. The owner then accepted the exact
tooling-manifest identity and separately authorized one external synthetic call.
The sole call is consumed and its publication-safe
[result](../examples/experiments/author-call-qualification-v1/CODEX-AUTHOR-CALL-QUALIFICATION.json)
is terminal `not-qualified / result-schema`: the admitted process and zero-tool
JSONL trace passed, while the structured answer did not pass the combined
strict-JSON, exact-shape, and expected-payload check. The safe result does not
localize the failing subcondition. No retry or resume occurred. This shrink is
not the experiment's `sequential shrink` and does not reset the issue-wide
budget. The later progression is:

1. retain the owner's exact `diagnose-first` disposition from Issue #24 comment
   5061017045 and the `2026-08-22T16:39:58Z` raw-diagnostic deletion deadline;
2. retain the completed local diagnostic candidate preparation and the sole
   public-code audit as terminal `audit-call-failed`, with no auditor verdict,
   accepted identity, tooling publication, or retained-output read;
3. obtain a separate owner disposition: a fresh diagnostic-tooling candidate
   under a new manifest and separately authorized audit path, separately
   authorized exploratory-learning expansion, or stop; none is authorized
   implicitly and the terminal candidate cannot transfer;
4. only if that disposition makes an exact diagnostic identity admissible,
   merge and present it, separately obtain owner acceptance and one local
   deterministic read authorization, publish only a fixed-code safe receipt,
   and separately dispose its exact outcome;
5. only if continuation is then selected, separately authorize its exact
   provider-free preparation scope, prepare and independently audit a fresh
   qualification identity, accept its exact bytes, and separately authorize at
   most one synthetic call;
6. dispose every terminal qualification result; only separate owner acceptance
   of an exact `qualified` result closes the author-call boundary;
7. only after qualification, separately authorize and define a fresh successor
   evaluation freeze;
8. only if a successor produces an accepted freeze, accept that exact contract
   and separately authorize implementation;
9. implement and rehearse only the S0-S1 vertical slice required to execute it;
10. accept the exact rehearsal and separately authorize one evaluated run;
11. execute, score the full denominator, and record `sequential keep`,
   `sequential shrink`, or `sequential stop`;
12. after a sequential keep, open only the 24-order successor and record its
   order-robustness decision before corpus 2 starts.

GitLab, PostgreSQL, multi-domain composition, public benchmark packaging, and
model-assisted automation remain queued rather than parallel WIP.

## Current decision after terminal qualification

The owner selected `diagnose-first`, but its admitted route stopped when the sole
public-code audit ended `audit-call-failed` before an auditor verdict. The local
candidate is unaccepted and unpublished, and retained stdout remains unread.

1. Will the owner admit a fresh diagnostic-tooling candidate under a new
   manifest and separately authorized audit path, separately authorize
   exploratory-learning expansion, or stop this route?
2. If an exact diagnostic identity later becomes admissible, will the owner
   accept those exact merged bytes?
3. Will the owner separately authorize one local deterministic read of the
   anchored retained stdout?
4. After a fixed-code receipt, should the owner select a targeted successor,
   another execution method, expanded learning, or `stop`?
5. After a later terminal qualification result, should the owner accept an exact `qualified`
   outcome, choose another identity or method, expand learning separately, or
   stop?
6. Only after an accepted `qualified` result, should a fresh evaluation
   successor be separately authorized and defined?
7. Only after a successor contract is accepted, will the owner separately
   authorize a whole-document adapter that preserves payload bytes, byte
   offsets, and RST media type without changing the common input?

The two safe v1 rejection codes may guide protocol design, but closed material
remains unavailable. Python results are exploratory and cannot serve as the
first confirmation. That confirmation requires a fresh corpus and identity and
must not reuse disclosed Python details in its tasks or oracle. A successor
changes the evaluation identity and requires an explicit plan and authorization
update.

An expanded learning route is separate from this sequence. It may admit exact
currently disclosed artifacts for prototype learning only after a new owner
decision defines readers, processors, outputs, budgets, retention, and deletion.
It cannot close any evaluation or run gate. A pre-run `stop` instead records no
sequential effectiveness result and releases the single-major-WIP slot for a
new track. The v1 disposition started one local raw-diagnostic deletion window
ending `2026-08-22T16:39:58Z`. A later successor disposition does not reset it
and must use its own predeclared retention rule.
