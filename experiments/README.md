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
safe. Review every private-run item below manually and complete the signed
runtime rehearsal before admitting real data.

## Required pack

Copy these templates into the private run root and complete them there:

| Template | Decision it freezes |
| --- | --- |
| [Corpus selection](templates/CORPUS-SELECTION.md) | Sampling frame, snapshot, rights, coverage, and anti-cherry-picking rules |
| [Run card](templates/RUN-CARD.md) | Hypothesis, comparison, budgets, endpoints, state, and decision gate |
| [Data handling](templates/DATA-HANDLING.md) | Authority, isolation, processing, retention, and deletion |
| [Review rubric](templates/REVIEW-RUBRIC.md) | Tasks, oracle, scoring, severe errors, and baseline fairness |
| [Incident runbook](templates/INCIDENT-RUNBOOK.md) | Containment and recovery after a boundary failure |
| [Failure diary](templates/FAILURE-DIARY.md) | Append-only friction, deviations, failures, and surprises |

A run must not enter `frozen` until the run card, corpus manifest, task pack,
oracle, rubric, data-handling plan, sandbox policy, budgets, and digests agree.
After freeze, changing any of them creates a new run identity. An unavoidable
departure is recorded in the append-only deviation log and normally makes the
primary comparison invalid; it must never be silently repaired in place.

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

1. Complete a fully synthetic dress rehearsal, including leakage canaries,
   denied egress, path and symlink attacks, interruption, resume, rebuild,
   deletion, and budget exhaustion.
2. Put the real corpus in a physically separate, access-controlled private
   root. Freeze its inventory, reveal order, ancestry, permitted metadata, and
   digest without exposing them to the system under test.
3. Freeze the task pack, withheld oracle, scoring rubric, primary endpoint,
   denominator, severe errors, and timeout or missing-result policy.
4. Freeze the run card and data-handling plan; verify sandbox isolation,
   metadata-only logging, retention, backup, whole-run purge, and incident
   response.
5. Run a private S0-S1 slice over three to five items before expanding to ten to
   twenty. Preserve failures and deviations as they occur.
6. Choose `keep`, `shrink`, or `stop` using the frozen decision gate. Record
   **expected / observed / learned** without promoting experimental behavior to
   protocol authority.

## Anti-scaffolding rule

The initial runner should be deliberately small: one vertical command, one
lexical access path, temporary versioned experiment formats, and disposable
state. Do not add a public API, plugin framework, universal storage abstraction,
graph database, model platform, or UI merely to prepare for possible future
experiments. Extract an abstraction only after the same need is observed in at
least two independent runs.
