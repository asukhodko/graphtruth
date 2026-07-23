# Experiment preflight

> **Status:** Non-normative Zone 3 experiment support.
>
> These templates help produce trustworthy learning. They do not define the
> GraphTruth protocol, conformance, canonical formats, or supported runtime
> behavior.

This directory contains the minimum paperwork required before a corpus-replay
experiment starts. It operationalizes the design in [Corpus replay experiment
harness](../docs/drafts/CORPUS-REPLAY-EXPERIMENT-HARNESS.md) and the learning
loop in [Development process](../docs/DEVELOPMENT.md).

## Starter public corpora

The [starter corpora laboratory
plan](STARTER-CORPORA-LABORATORY-PLAN.md) selects three small public
diagnostic corpora and orders their sequential, order-robustness, and later
multi-domain experiments. It is a candidate program, not a frozen run pack or
benchmark. Every evaluated lane still requires the templates and integrity
seal described below.

Issue #24 activates the first sequential lane,
[`python-annotations-semantics-v1`](corpora/python-annotations-semantics-v1/README.md),
as the single major WIP. Its public
[corpus-selection and rights record](corpora/python-annotations-semantics-v1/CORPUS-SELECTION.md)
freezes the exact four-item frame, synthetic chronology, one-family treatment,
dark zone, handling policy, and familiarity limits. Its publication-safe
[source manifest](corpora/python-annotations-semantics-v1/SOURCE-MANIFEST.json)
binds the four owner-only originals retained outside the checkout to their Git
blob OIDs, raw-byte SHA-256 digests, sizes, media type, notices, and acquisition
interval. The owner accepted the exact acquisition manifest and actual
owner-only storage boundary, closing `m6-acquire-originals`. The frozen
[projection contract](corpora/python-annotations-semantics-v1/PROJECTION-CONTRACT.md)
and publication-safe [projection
manifest](corpora/python-annotations-semantics-v1/PROJECTION-MANIFEST.json)
bind two verified clean builds of a byte-identical RST text projection. The
owner accepted that exact manifest and the actual output boundary, closing
`m6-freeze-projection`; the separate [acceptance
receipt](corpora/python-annotations-semantics-v1/PROJECTION-ACCEPTANCE.json)
preserves the decision without changing the accepted manifest. The current
gate state comes from that receipt and Issue #24; any pre-acceptance status text
inside the byte-frozen contract or manifest is historical evidence, not a
current authorization. The selection record's earlier Markdown option is also
historical; the accepted common input for this run is byte-identical RST in both
GraphTruth and the files-plus-search baseline. The current runtime is
incompatible by design.

The owner later authorized exactly one evaluation-freeze attempt and two
external Codex calls over the accepted projection. Its independent read-only
audit returned `reject`; no RELEASE or accepted evaluation contract exists. The
publication-safe [terminal
record](corpora/python-annotations-semantics-v1/EVALUATION-FREEZE-TERMINAL.json)
contains only publication-safe identities, hashes, counts, toolchain and
processing metadata, authorization flags, and the rejected outcome. It contains
no task or oracle material, source or projection bytes, or closed paths. The
exact audit result was later read once through the authorized deterministic
extractor. Its safe [diagnostic
receipt](corpora/python-annotations-semantics-v1/EVALUATION-FREEZE-DIAGNOSTIC.json)
publishes only fixed checklist flags, enumerated issue codes, counts, identities,
and no-repair/no-run flags. It identifies incomplete result-class semantics and
a missing operational GraphTruth capture-tax rule. No closed path or report
content is published. This evaluation identity cannot be repaired, retried,
resumed, or reused.

The separate `evaluation-freeze v2` tooling closes both gaps and makes future
audit rejection diagnosable through predeclared safe codes. After its synthetic
verification, the owner accepted the exact tooling identity and separately
authorized one attempt. The sole invocation stopped fail-closed with fixed code
`AUTHOR_MODEL_CALL` and exit status `1`, before a validated author artifact or
independent audit. It returned no public JSON and produced no release or
accepted evaluation contract. That attempt cannot be retried, resumed,
repaired, or reused.

On repository-active date 3/5 the owner chose procedural `shrink`. The corpus,
projection, and accepted v2 bytes stay fixed. The resulting
`codex-author-call-qualification-v1` preparation and fake-provider tests use
only generated public synthetic RST. The owner accepted the exact
tooling-manifest identity and separately authorized one external call. Its
publication-safe
[terminal result](../examples/experiments/author-call-qualification-v1/CODEX-AUTHOR-CALL-QUALIFICATION.json)
is `not-qualified / result-schema`: Codex exited zero with a valid four-event
zero-tool JSONL trace, but the structured answer did not pass the combined
strict-JSON, exact-shape, and expected-payload check. The safe result does not
localize the failing subcondition. The sole call is consumed without retry or
resume. Corpus, projection, terminal state, freeze, implementation, baseline,
rehearsal, scoring, and evaluated run remained untouched. The owner selected
`diagnose-first` in Issue #24 comment 5061017045 and authorized only public
diagnostic-tool preparation plus one no-retry audit of its exact public bytes.
The retained stdout remains unread. Exact diagnostic identity acceptance, one
local read, diagnostic disposition, successor preparation authorization,
qualification identity, one-call authorization, terminal-result disposition,
and any later evaluation successor remain distinct gates. The retained local
raw diagnostics must be deleted no later than `2026-08-22T16:39:58Z`.
Runtime adaptation, implementation, rehearsal, SUT, baseline execution,
scoring, and an experimental run remain unauthorized.

The Python corpus is now exploratory: it supports reproducible algorithm,
procedure, and replay diagnostics, but its result cannot be the first
confirmation of GraphTruth. Confirmation requires a fresh corpus and identity,
with no disclosed Python detail transferred into its tasks or oracle. The public
track also does not replace the private dogfood track that tests value in a real
personal workflow.

The publication-safe [G1 evidence-contract
twin](../examples/experiments/evidence-contract-twin-v1/) is a separate frozen
fixture with four fictional sources and eight closed tasks. It preserves only
the predeclared experiment classes and was created before private episode
access; it contains no runtime admission or evaluated result.

The first run asks whether a small experiment is feasible and informative. It
cannot prove product value, superiority over existing tools, portability to
other corpora, or durable protocol semantics.

## Current private-path status

Issue #6 stopped on 2026-07-21 before an admissible frozen private evidence
contract or evaluated private run existed. Its public synthetic artifacts and
tooling remain useful references, but its private G1 path is no longer current
and authorizes no read, retry, receipt, or successor. Terminal local states are
preserved outside the repository and must not enter the public Python lane.

The private-pack instructions below document the stopped design and reusable
public preparation. A future private dogfood attempt must explicitly supersede
them under a new issue, identity, threat review, evidence contract, and owner
authorization. Nothing in this file grants that authority.

## Private material never belongs here

Keep every real run pack outside the repository checkout, Git worktrees, and
cloud-synchronized folders. This includes source documents, manifests, task
answers, oracle material, run cards, reports, prompts, logs, embeddings,
checkpoints, and backups.

The stopped Issue #6 G1 design permitted one explicitly authorized private
Codex call to review a sealed contract. That design is retained for historical
clarity; its authority is consumed and cannot be reused. Such processing would
be external OpenAI processing, not independent human review or local-only
processing. No assistant, session, processor, model call, or tool execution is
currently approved for private material.

`.gitignore` is a convenience, not a privacy or security boundary. An ignored
file can still be copied, synchronized, logged, attached, or force-added. The
public repository may contain only synthetic fixtures or material whose
redistribution and processing rights are explicit.

The intended public preflight pack lives at
`examples/experiments/preflight/`. Run `./tooling/preflight` to validate that
checked-in synthetic pack and its declarations. The current command is
deliberately not a private-pack validator: it does not enforce an operating
system sandbox, execute the reveal controller, or prove that a boundary is
safe. Review every private-run item below manually and complete both an
owner-confirmed runtime-boundary rehearsal and the full synthetic dress
rehearsal before admitting real data to the evaluated GraphTruth/SUT runtime.

The separate Zone 3 command `./runtime/replay` executes the public
runtime-boundary rehearsal in the intended local isolation shape. Its checked-in
observations are linked from the runtime README. That command does not execute
the baselines, scoring, decision, or deliberate budget-exhaustion cases required
by the full synthetic dress rehearsal. It also does not turn
`./tooling/preflight` into a private-pack validator or remove the owner's
run-specific confirmation.

The frozen v0 run card uses the legacy phrase `signed synthetic rehearsal`.
Because it is a sealed input, that wording remains unchanged: here `signed`
means an owner-confirmed conversation record bound to the report, not a
cryptographic signature or evidence that the full dress rehearsal passed.

## Required pack

The stopped Issue #6 design used the [private evidence-contract freeze
guide](templates/EVIDENCE-CONTRACT.md) before implementing or admitting an
evaluated GraphTruth/SUT runtime. The guide and records below are retained as
historical preparation; do not use them to close G1 or access private material
under Issue #6.

Copy the G1 records, [review-control template](templates/g1-review-control.json),
[fixed review prompt](templates/g1-review-prompt.md), and
[result schema](templates/g1-review-result.schema.json) into the immutable
private `PACK`. Replace the control template's contract placeholder and complete
the other G1 fields there. Also include a byte-for-byte copy of every regular blob in the
published evidence-contract twin at commit
`234bf9edc7a67cb3f1847e6d60cfe05ddbd13a01`, together with its embedded lock
and a closed snapshot manifest. This lets the isolated Codex reviewer check
non-derivation without reading the live checkout. The run card belongs to the
later M2 freeze. The failure diary and any incident record are mutable execution
evidence under `WORK`; they must not be added to the G1 lock.
Names such as `run-card.json` or `logs/` that occur inside the fixed public-twin
snapshot remain part of that snapshot; this exclusion applies only to private,
run-specific artifacts outside the snapshot subtree.

| Template | Used in | Decision or evidence it records |
| --- | --- | --- |
| [G1 evidence contract](templates/G1-EVIDENCE-CONTRACT.md) | G1 `PACK` | Closed artifact set, baseline, exposure, evaluation, budgets, decision, and explicit M2 boundary |
| [Codex review control](templates/g1-review-control.json) | G1 `PACK` | Exact contract binding and explicit model-processing authorization for the fail-closed review command |
| [Codex review prompt](templates/g1-review-prompt.md) | G1 `PACK` | Fixed non-runtime instructions copied byte for byte and passed only through standard input |
| [Codex review result schema](templates/g1-review-result.schema.json) | G1 `PACK` | Fixed structured `accept` / `reject` shape without private excerpts |
| [Corpus selection](templates/CORPUS-SELECTION.md) | G1 `PACK` | Sampling frame, snapshot, rights, coverage, and anti-cherry-picking rules |
| [Data handling](templates/DATA-HANDLING.md) | G1 `PACK` | Authority, intended isolation, processing, retention, and deletion policy |
| [Review rubric](templates/REVIEW-RUBRIC.md) | G1 `PACK` | Tasks, oracle, scoring, severe errors, and baseline fairness |
| [Incident runbook](templates/INCIDENT-RUNBOOK.md) | G1 `PACK` | Frozen triggers, containment, assessment, recovery, and closure procedure |
| [Run card](templates/RUN-CARD.md) | M2 immutable pack | Exact runtime identity, comparison, budgets, endpoints, state, and admission gate |
| [Failure diary](templates/FAILURE-DIARY.md) | M3 `WORK` | Append-only friction, deviations, failures, and surprises during execution |

G1 also requires a private `artifact-roles.json` that names all and only the
regular files present before lock creation, including the role map itself and
excluding the future `pack-lock.json`. It is run-specific, so no prefilled
public copy exists.
The owner-only [`private-pack-lock`](../tooling/README.md#private-g1-pack-lock)
command checks that role map and creates the non-circular lock from the owner's
local shell. The sealed pack is then reviewed through the native Codex
permission profile. The retained public
[`codex-sandbox-preflight`](../tooling/codex-sandbox-preflight) qualification
shows that the exact zero-tool model command and allowed JSONL trace passed on
synthetic input before private preparation; it does not admit a private attempt.
After the pack is sealed, the fail-closed
[`codex-g1-review`](../tooling/codex-g1-review) command runs a fresh local
identity-and-config preflight with no model call, verifies the lock before and
after the private call, and makes one private Codex call. Review,
attempt-anchor, authorization, and disposable state staging must be strict
canonical descendants of `realpath(os.tmpdir())`; the persistent
private `PACK` and common `ANCHOR` remain outside the repository and
synchronization roots. The review input is a byte-exact read-only attempt copy
of the sealed pack, verified against the external lock anchor; both copies stay
controller-only. The attempt preflight checks pinned identity and configuration;
it does not re-establish the model boundary.

The controller reads every artifact in that sealed attempt copy as strict
UTF-8, permits at most 256 artifacts, and builds one fixed-prompt plus
canonical-JSON standard-input
envelope no larger than 1 MiB (1,048,576 bytes). It rejects the attempt instead
of truncating or summarizing the pack. The private `PACK` remains
controller-only and travels to the model solely in standard input. The
ephemeral model workspace contains only the byte-exact public result schema.
The fixed prompt is the only task-specific instruction admitted from `PACK`;
the pinned CLI and model and platform and system instructions are trusted
controls. Shell and unified execution, code, agents, MCP, apps, plugins,
browser, and web capabilities are disabled. The stock `update_plan`,
`apply_patch`, and `view_image` entries remain declared but are not authorized.
Any tool event or deviation from the exact allowed JSONL trace rejects the
attempt. Model-tool filesystem access is default-deny except for the public
schema, and model-tool networking is denied. The controller validates and
writes the result. This is not a chroot or a sandbox for the Codex client and
controller processes themselves.

The [public G1 receipt](templates/PUBLIC-G1-RECEIPT.json) is an intentionally
unfilled publication example. It is not part of the private pack and is not
evidence that G1 occurred. After a successful private seal, fresh isolated
Codex review, unchanged-pack verification, and owner final acceptance,
the first attested instance may exist only at
`experiments/receipts/g1-evidence-contract-v2.json`. The repository gate rejects
extra keys, incorrect attestation values, non-date timestamps, or changes to
the fixed public claims. Publish only coarse safe attestations: never private
paths, names, exact counts, digests, task or oracle content, excerpts, or
failure details.

The v2 receipt fixes `independentHumanReview` to `false`, records explicit
authorization for OpenAI processing, requires
`runSpecificPostSealIdentityAndConfigPreflightPassed`,
`freshIsolatedCodexReviewAccepted`, and
`privateReviewCompletedWithoutToolCalls` to be `true`, and asserts only that
contract-private material was not published. The preflight field refers only to
the local identity-and-config check performed after seal, not the retained
public model qualification. The receipt does not claim that OpenAI never
received the review input or that provider-side copies were deleted.

The later M2 run must not enter `frozen` until the run card, corpus manifest,
task pack, oracle, rubric, data-handling plan, sandbox policy, budgets, and
digests agree. After that run freeze, changing any of them creates a new run
identity. An unavoidable departure is recorded in the append-only deviation
log and normally makes the primary comparison invalid; it must never be
silently repaired in place.

## Human information boundaries

The G1 evidence-contract review is deliberately owner plus isolated Codex. It
does not satisfy an independent-human-review claim. Human information boundaries
still matter for the later evaluated comparison:

Separate these roles when practical:

- corpus curator;
- system-under-test operator;
- task and oracle author;
- baseline user;
- scorer.

If one person fills several roles, record what they knew before every task and
treat the result as exploratory. Use the first exposure for the primary
comparison. Familiarity with later documents, answers, or expected failure modes
is future leakage even when no filesystem boundary was crossed.

The baseline receives comparable time, tools, source visibility, and assistance.
Manual structure, corrections, and annotations supplied only to GraphTruth are
additional information and labor. Measure them as **capture tax** or grant the
baseline an equivalent budget. Record baseline wins and correct abstentions,
not only GraphTruth successes.

## Preflight sequence

This sequence records the stopped private design. It is not the current
Issue #24 path and cannot be executed without a new private successor decision.

1. Close G1: rely on the retained public synthetic qualification only to admit
   this tooling path; then select the real episode, authorize OpenAI processing,
   prepare the owner-only private root, and freeze sources, tasks, oracle,
   baseline, exposure, evaluation, budgets, decision, and handling. Copy the
   exact fixed public-twin bytes into `PACK`; the owner completes the
   non-derivation comparison before sealing. Create and externally anchor the
   non-circular seal. Only then run the fail-closed command. It must pass and
   retain a fresh local identity-and-config preflight, verify the lock, send the
   complete bounded envelope in one private Codex call, reject every tool event,
   verify the unchanged lock a second time, and write the validated result. The
   owner then records final acceptance against the attempt evidence. No
   evaluated run occurs in G1.
2. In M2, implement only the private chronological lane required by that frozen
   contract. Keep the entire lane deterministic, with no LLM or embedding calls.
   Bind one exact code, configuration, environment, sandbox policy, and
   dependency identity in the final run card.
3. Complete the full synthetic dress rehearsal against that exact boundary,
   including leakage canaries, denied egress, path and symlink attacks,
   interruption, resume, rebuild, deletion, baselines, scoring, decision, and
   every declared budget-exhaustion behavior.
4. Obtain owner confirmation for the exact rehearsal evidence and close the M2
   runtime-admission gate. Until then, the runner must not receive private
   bytes.
5. Run the frozen private S0-S1 comparison. Preserve failures and deviations as
   they occur, then choose `keep`, `shrink`, or `stop` using the frozen decision
   gate and record **expected / observed / learned**.

## Anti-scaffolding rule

The initial runner should be deliberately small: one vertical command, one
lexical access path, temporary versioned experiment formats, and disposable
state. Do not add a public API, plugin framework, universal storage abstraction,
graph database, model platform, or UI merely to prepare for possible future
experiments. Extract an abstraction only after the same need is observed in at
least two independent runs.
