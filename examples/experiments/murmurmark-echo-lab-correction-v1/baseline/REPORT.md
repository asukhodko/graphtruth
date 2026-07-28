# Files plus rg baseline report

Identity: `murmurmark-echo-lab-correction-v1`.

This is the retained result of the single `same-files-plus-rg-v1` attempt. The
search plan was fixed at SHA-256
`8400fe85511d0bd85ad42ff54748bfe0b6bf90f25e243ca4b565a19b56d1669e`.
The exact eight-query transcript has SHA-256
`008f23eab5effb8671feeff792f560b9ed3c51edc8239e221d10fbd2a5628e99`.
The search process took 54.630292 ms; that number excludes plan preparation,
answer composition, and later scoring.

The current session was already familiar with the episode. The result is a
descriptive within-operator baseline, not a blind comparison.

## Answers

### `task.pre-fix-bounds`

At H1 the selected `ffmpeg` invocation loops its input with
`-stream_loop -1`, but supplies `-t` with `duration_sec`; this is an intended
output-duration bound (`q.h1.ffmpeg-loop`, lines 147–157). The validator
computes the expected frame count and rejects a non-mono result, the wrong
sample rate, a different frame count, non-finite samples, or excess peak
(`q.h1.validation`, lines 369–400).

The full-file lexical query for `timeout|flock|LOCK_` finds timeouts in other
launcher operations but none on the stimulus-generation call and no lock term
(`q.h1.process-bounds`). Within this selected complete launcher file, elapsed
generation time and concurrent-prepare exclusion are therefore not
established. This does not make H1 wholly unbounded and does not establish an
observed failure or its cause.

### `task.post-fix-safeguards`

At H2 the launcher calls `materialize_looped_stimulus`; the checker and launcher
also import or call it (`q.h2.materialization`). The prepare path takes a
non-blocking exclusive `flock`, and the selected `say` call has
`timeout=120` (`q.h2.process-bounds`, lines 156–166 and 247–253). Checker
source calls the helper for 2.5 seconds at 48 kHz and requires 120,000 frames
(`q.h2.materialization`; `q.h2.checker`, lines 395–400).

The exhausted query set does not expose the helper body. This branch therefore
cannot establish from its retained output that the helper computes, tiles and
truncates to the exact frame count, rejects clipping, or publishes through a
temporary file and `os.replace`. The checker text is source code, not evidence
that it ran. The answer is intentionally incomplete rather than filled from
operator memory.

### `task.residual-unknowns`

The corrective commit subject says `fix: prevent runaway echo lab stimulus
generation` (`q.metadata.corrective-subject`, lines 27–34). It names the
change; it is not an incident report. The closed source search returns no
`incident` or `root cause` match. It does find the runbook statement that each
*capture* stops after about 7 minutes 40 seconds
(`q.h2.capture-and-incident`, runbook lines 1–11); that does not bound
preparation.

The retained output establishes checker requirements, not test execution. It
contains no basis for an observed incident, cause, impact, frequency,
production safety, power-loss behavior, cross-host exclusion, or complete
resource bounds. The practical question therefore has only a qualified
partial answer.

## Frozen scoring

| Cell | Result | Reason |
| --- | --- | --- |
| `task.pre-fix-bounds × files-rg` | pass | Required H1 bounds, validation, scoped absences, and abstentions are present. |
| `task.post-fix-safeguards × files-rg` | fail | The retained query output does not expose four required helper-body safeguards. |
| `task.residual-unknowns × files-rg` | pass | The response preserves the incident, time, execution, and safety unknowns. |

The branch passes 2 of 3 cells. The failed cell remains in the denominator.
No retry or supplementary search was performed.

## Execution note

An initial launcher invocation failed with `ENOENT` before the output root or
`ATTEMPT-COMMITTED.json` existed, because the script did not create the
`baseline/` parent. No query ran and no attempt state existed. The directory
creation was corrected, and the single committed attempt above then ran. This
pre-commit failure is retained here as adaptation cost rather than counted as a
second baseline attempt.
