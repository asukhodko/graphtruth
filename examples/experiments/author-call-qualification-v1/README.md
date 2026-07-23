# Codex author-call qualification v1

This fixture defines a provider-free preparation for one future diagnostic call.
It isolates the transport and lifecycle boundary that the terminal
`evaluation-freeze v2` attempt reported only as `AUTHOR_MODEL_CALL`.

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

The future live controller may retain bounded raw stdout and stderr only under a
new owner-only `.nosync` diagnostic root outside the repository. Those files are
synthetic diagnostics, are never publication artifacts, and must be removed no
later than 30 days after Issue #24 receives the qualification disposition.
Provider-side retention or deletion is not claimed.

## Authorization boundary

Repository tests use injected runners and make no OpenAI request. Preparing or
merging this fixture does not authorize a live call. A live run requires both:

1. owner acceptance of the exact `TOOLING-MANIFEST.json` SHA-256 and every
   component it binds;
2. a later Issue #24 comment that separately authorizes one call and names that
   accepted identity.

The controller commits the one-call slot durably before spawn. It has no retry
or resume path. A success proves only that this synthetic author-call boundary
works; a failure is terminal diagnostic evidence at its normalized stage.
