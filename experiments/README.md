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

The public track supports reproducible algorithm and replay diagnostics. It
does not replace the private dogfood track that tests value in a real personal
workflow.

The publication-safe [G1 evidence-contract
twin](../examples/experiments/evidence-contract-twin-v1/) is a separate frozen
fixture with four fictional sources and eight closed tasks. It preserves only
the predeclared experiment classes and was created before private episode
access; it contains no runtime admission or evaluated result.

The first run asks whether a small experiment is feasible and informative. It
cannot prove product value, superiority over existing tools, portability to
other corpora, or durable protocol semantics.

## Private material never belongs here

Keep every real run pack outside the repository checkout, Git worktrees, and
cloud-synchronized folders. This includes source documents, manifests, task
answers, oracle material, run cards, reports, prompts, logs, embeddings,
checkpoints, and backups.

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
rehearsal before admitting real data.

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

Follow the [private evidence-contract freeze
guide](templates/EVIDENCE-CONTRACT.md) to close G1 before implementing or
admitting a private runner. The guide reuses the records below while keeping
the exact runtime identity and full synthetic dress rehearsal in M2.

Copy these templates into the private run root and complete them there:

| Template | Decision it freezes |
| --- | --- |
| [Corpus selection](templates/CORPUS-SELECTION.md) | Sampling frame, snapshot, rights, coverage, and anti-cherry-picking rules |
| [Run card](templates/RUN-CARD.md) | Hypothesis, comparison, budgets, endpoints, state, and decision gate |
| [Data handling](templates/DATA-HANDLING.md) | Authority, isolation, processing, retention, and deletion |
| [Review rubric](templates/REVIEW-RUBRIC.md) | Tasks, oracle, scoring, severe errors, and baseline fairness |
| [Incident runbook](templates/INCIDENT-RUNBOOK.md) | Containment and recovery after a boundary failure |
| [Failure diary](templates/FAILURE-DIARY.md) | Append-only friction, deviations, failures, and surprises |

The [public G1 receipt](templates/PUBLIC-G1-RECEIPT.json) is an intentionally
unfilled publication example. It is not part of the private pack and is not
evidence that G1 occurred. After a successful private seal and two reviews,
publish only coarse safe attestations: never private paths, names, exact counts,
digests, task or oracle content, excerpts, or failure details.

The later M2 run must not enter `frozen` until the run card, corpus manifest,
task pack, oracle, rubric, data-handling plan, sandbox policy, budgets, and
digests agree. After that run freeze, changing any of them creates a new run
identity. An unavoidable departure is recorded in the append-only deviation
log and normally makes the primary comparison invalid; it must never be
silently repaired in place.

## Human information boundaries

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

1. Close G1: select the real episode, prepare its encrypted private root, freeze
   sources, tasks, oracle, baseline, exposure, evaluation, budgets, decision,
   and handling, review a safe synthetic twin, and externally anchor the
   non-circular private seal. No evaluated run occurs in G1.
2. In M2, implement only the private chronological lane required by that frozen
   contract. Bind one exact code, configuration, environment, sandbox policy,
   and dependency identity in the final run card.
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
