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
leaves the candidate unaccepted and unpublished. The retained stdout remains
unread. A separate owner disposition must choose a fresh diagnostic-tooling
candidate under a new manifest and separately authorized audit path, separately
authorized exploratory-learning expansion, or stop. The terminal candidate
cannot transfer, and the decision grants no raw read or successor work. The
local raw-diagnostic deletion deadline is `2026-08-22T16:39:58Z`. No successor
evaluation freeze is authorized.
