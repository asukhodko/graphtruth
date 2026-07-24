# Codex author-call qualification v1

This fixture records the separately prepared tooling and terminal outcome of one
authorized diagnostic call. It isolates the transport and lifecycle boundary
that the terminal `evaluation-freeze v2` attempt reported only as
`AUTHOR_MODEL_CALL`.

## Synthetic boundary

The controller generates four ASCII RST files from one fixed seed. Their sizes
approximate the already public shape of the accepted projection, but their
contents contain no Python, PEP, corpus, projection, task, oracle, or evaluation
contract material. The generated response has eight work-unit records, 64
matrix-cell records, and 32 check records solely to exercise structured-output
volume.

The checked-in
[`SYNTHETIC-MANIFEST.json`](SYNTHETIC-MANIFEST.json) fixes every generated file,
the 232,192-byte prompt, the 32,768-byte payload, and the output-schema digest.
The model receives no owner URL, path, credential metadata, or other variable
input.

## Result boundary

[`QUALIFICATION-RESULT.schema.json`](QUALIFICATION-RESULT.schema.json) permits
only fixed identities, normalized stages, byte counts, digests, lifecycle
flags, and the closed result classes. It excludes raw streams, free-form errors,
thread identifiers, paths, environment variables, and authorization data.

The live controller retained bounded raw stdout and stderr only under a new
owner-only `.nosync` diagnostic root outside the repository. Those files are
synthetic diagnostics, are never publication artifacts, and must be removed no
later than 30 days after Issue #24 receives the qualification disposition.
Provider-side retention or deletion is not claimed.

## Authorization boundary

Repository tests use injected runners and make no OpenAI request. Preparing this
fixture did not authorize a live call. The sole live run required both:

1. owner acceptance of the exact `TOOLING-MANIFEST.json` SHA-256 and every
   component it binds;
2. a later Issue #24 comment that separately authorizes one call and names that
   accepted identity.

The controller commits the one-call slot durably before spawn. It has no retry
or resume path. A success proves only that this synthetic author-call boundary
works; a failure is terminal diagnostic evidence at its normalized stage.

## Observed terminal result

The owner accepted the exact tooling identity and separately authorized one
external public-synthetic call in
[Issue #24 comment 5054897423](https://github.com/asukhodko/graphtruth/issues/24#issuecomment-5054897423).
The call is consumed and cannot be retried or resumed.

The publication-safe
[`CODEX-AUTHOR-CALL-QUALIFICATION.json`](CODEX-AUTHOR-CALL-QUALIFICATION.json)
has SHA-256
`aa07980cd8b9a05d699f5a491733ea2dd2a710955d13a783249a4e9721979b94`.
It records `not-qualified / result-schema`: the admitted Codex process exited
zero, remained within both stream budgets, produced the exact four-event
zero-tool JSONL trace, and passed model identity and cleanup checks, but its
structured answer did not pass the combined strict-JSON, exact-shape, and
expected-payload check. The safe result does not localize which subcondition
failed. No corpus, projection, terminal state, freeze, implementation, baseline,
rehearsal, scoring, or experimental run was admitted or performed.

The owner chose `diagnose-first` in Issue #24 comment 5061017045. Only public
diagnostic-tool preparation, artificial fixtures, and one no-retry public-code
audit were authorized. A local candidate was prepared, but the sole audit ended
`audit-call-failed` before an auditor verdict. Its [safe terminal
record](https://github.com/asukhodko/graphtruth/issues/24#issuecomment-5062148530)
leaves the candidate unaccepted and unpublished.

The owner then selected the exploratory-learning route and authorized only
public preparation of its exact goal and boundary in the current session,
without protected bytes or a separate external call, in
[comment 5062645199](https://github.com/asukhodko/graphtruth/issues/24#issuecomment-5062645199)
and the separate [gate-accounting
record](https://github.com/asukhodko/graphtruth/issues/24#issuecomment-5062674740).
The resulting [boundary proposal](EXPLORATORY-LEARNING-BOUNDARY.md) admits one
future retained-stdout exposure to the current GraphTruth session. On
repository-active date 4/5 the owner accepted its exact merged SHA-256
`4065f91cd930181eae6eeed520b978fb31361b636944e4bed4b8b7b11b02d58e`
in [comment
5066292679](https://github.com/asukhodko/graphtruth/issues/24#issuecomment-5066292679).
The boundary is frozen but inactive. The retained stdout and stderr remain
unread. Its internal proposal-state text remains unchanged because those exact
bytes define the accepted identity; Issue #24 records the current gate state.
The terminal diagnostic candidate cannot transfer into this route.
Execution-pack preparation still requires separate authorization, followed by
exact pack acceptance and later processing authorization; no raw read,
separate external call, successor work, corpus processing, or experiment is
authorized. The raw-diagnostic deletion deadline remains
`2026-08-22T16:39:58Z`.
