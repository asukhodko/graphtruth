# Owner-facing workbench v1

Identity: `owner-facing-workbench-v1`

Issue: [#52](https://github.com/asukhodko/graphtruth/issues/52)

| Gate | Status |
| --- | --- |
| Product and command contract | frozen by this document |
| Implementation | pending |
| Automated qualification | pending |
| Owner walkthrough | pending |
| Disposition | pending |

The execution status is intentionally explicit:

```text
implementation: pending
owner walkthrough: pending
disposition: pending
```

This document freezes the boundary for a future Zone 3 implementation. It is
non-normative: it defines neither the GraphTruth protocol nor a stable schema,
storage format, compatibility promise, or generally reusable runtime. The
implementation requires a separate goal tied to the exact SHA-256 of this
file. No executable workbench or run result exists at this gate.

## Decision to be earned

The workbench tests whether one owner can maintain a small live GraphTruth
corpus with ordinary commands, without an episode-specific adapter, a
prewritten `SOURCE-MANIFEST`, hand-edited canonical JSON, or manually supplied
technical identifiers, sequence numbers, timestamps, hashes, byte bounds, and
revision links.

The first version is a product-shaped precursor to personal v0. It is not a
claim that the complete Stage 1 loop exists. Its result may admit only this
interface, shrink it to an explicitly named subset, or stop the owner-facing
claim altogether.

## Fixed processing boundary

The future implementation may process only:

- public files from the GraphTruth repository selected one by one;
- checked-in synthetic UTF-8 fixtures created for qualification;
- local state below the workbench root selected by the operator.

It must use Node.js 24 built-in modules only. The product path has zero network
requests and zero model calls. GitHub may be used outside the workbench only to
publish public source, contract, and result material through the repository
workflow.

Private data, the Python corpus or projection, Issue #24 terminal state,
private M1 state, retained diagnostics, external processors, and any source not
explicitly selected by the operator are outside this identity.

## Fixed v1 capability

The workbench supports exactly this operator loop:

1. initialize one owner-only workspace;
2. open one named sequential horizon over an explicit source root;
3. add selected files individually;
4. add assertions, additive assertion revisions, and open questions;
5. close the horizon atomically;
6. verify the canonical history and retained source bytes;
7. render current or named-horizon `VIEW.json` and `DOSSIER.md` outputs;
8. delete supported derived files and rebuild them exactly from retained
   canonical records and snapshots.

`Assessment`, `AcceptanceDecision`, question closure, recursive discovery,
search, embeddings, migrations, backup and restore, HTML, a server, a TUI,
multiple users, and concurrent writers are deferred. The workbench does not
infer missing evidence or truth, classify domains, resolve contradictions,
score answers, or promote any Zone 3 record shape into a protocol format.

## Command line

The future entry point is:

```text
node runtime/experimental/owner-facing-workbench-v1/cli.mjs \
  --root <workbench-root> [--json] <command> [arguments]
```

`--root` names the local workbench directory. `--json` is optional, global,
and may appear only once. Options within a command are order-independent, but
unknown, duplicated, or missing options are errors. Text is passed as one
UTF-8 command argument; the CLI performs no shell evaluation.

Aliases and horizon names match `[a-z][a-z0-9-]{0,63}`. They are human handles,
not canonical identifiers. An alias is unique within its kind and workspace.

The complete v1 grammar is:

```text
init --owner <owner-alias>

horizon open
  --name <horizon-name>
  --source-root <host-directory>
  [--coverage partial|closed-selection]
  [--scope <text>]

source add
  --alias <source-alias>
  --path <logical-path>

assertion add
  --alias <assertion-alias>
  --text <text>
  --source <source-alias>
  --lines <first>[:<last>]
  [--scope <text>]
  [--uncertainty <text>]

assertion revise
  --assertion <assertion-alias>
  --text <text>
  --source <source-alias>
  --lines <first>[:<last>]
  --reason <text>
  [--scope <text>]
  [--uncertainty <text>]

question add
  --alias <question-alias>
  --text <text>
  [--source <source-alias> --lines <first>[:<last>]]

draft undo
horizon abort
horizon close
verify
dossier --as-of <horizon-name>
rebuild
```

`init` is the only command allowed against a missing workbench. It records one
owner and creates no horizon. Reinitialization is rejected.

`horizon open` requires an initialized, verified workbench with no open
horizon. The host source root is an operator-supplied locator, not a logical
corpus path and not retained in canonical or rendered output. It must be a real
non-symlink directory. The default coverage is `partial`.
`closed-selection` requires a non-empty `--scope`; it asserts completeness only
for that written scope. Neither coverage value causes automatic absence
inference.

`source add` reads exactly one regular file at
`<source-root>/<logical-path>`. It does not recurse, expand globs, follow a
symlink, or consult Git. It stages the file identity and bytes for the open
horizon. Repeating a logical path, file identity, content identity, or alias in
one horizon is rejected rather than silently deduplicated.

`assertion add` and `assertion revise` require a staged source and a valid
1-based inclusive line range. A single number selects one line. The workbench
creates the exact `EvidenceSpan` internally. Its half-open byte interval starts
at the first UTF-8 byte of the first selected line and ends after the line
terminator of the last selected line, if that terminator exists; the last line
at end of file ends at file size. The span records its own SHA-256. Invalid
UTF-8, an empty or reversed range, or a range outside the retained bytes is
rejected.

`assertion revise` targets the current revision behind the human assertion
alias and creates its predecessor link automatically. It never mutates or
deletes the earlier assertion. `question add` creates an unresolved question;
its optional evidence options must be supplied together. Closing a question is
outside v1.

`draft undo` removes only the most recent unpublished `source add`, `assertion
add`, `assertion revise`, or `question add` action and its internally generated
span. It refuses to remove a source still referenced by another draft action.
`horizon abort` discards the entire open draft after verifying that no part of
it was published. These two commands are the v1 correction path for mistakes
before close; neither can change a closed horizon.

`horizon close` revalidates every selected host file against the identity and
bytes seen by `source add`, validates every draft reference and limit, then
publishes all records, snapshots, and the new current `VIEW.json` and
`DOSSIER.md` as one horizon. Any mismatch or failure leaves the previously
published canonical and selected derived state byte-for-byte unchanged and
keeps no horizon partially visible. A successful close makes the draft
immutable and clears the host source root. Later correction is additive in a
new horizon.

`verify` reads no host source. It checks the complete canonical prefix,
snapshots, hashes, generated links, horizon chain, and all currently published
derived files. `dossier --as-of` accepts only a closed named horizon and
atomically publishes its two supported projections. `rebuild` verifies the
canonical state, discards only the supported projections, reconstructs current
and all previously requested as-of projections in a staging directory, checks
their bytes, and atomically replaces the derived generation. Canonical state
and snapshots are never rebuild targets.

## Path and inventory semantics

A logical source path is a non-empty ASCII POSIX-relative path. Every segment
is non-empty and is neither `.` nor `..`. A path may contain only ASCII letters,
digits, `.`, `_`, and `-` within segments. `/` is the only separator. Absolute
paths, a leading or trailing `/`, repeated `/`, backslashes, NUL, drive-letter
forms, case folding, and symlinks in any traversed component are rejected.

Logical paths are case-sensitive. All inventory ordering uses unsigned
lexicographic comparison of their UTF-8 bytes. Because allowed logical paths
are ASCII, this is also ASCII byte order. Locale, `localeCompare`, filesystem
enumeration order, insertion order, and argument order must not affect the
canonical result. The same explicit inventory in any permutation must produce
the same ordered inventory. Full Unicode filesystem policy is deferred.

The source root and workbench root must be distinct real directories with no
ancestor/descendant overlap. The implementation opens and verifies regular
files without following links and fails closed if identity changes during the
read or before close.

## Generated identity, order, and time

The operator supplies only human aliases and meaning. The workbench generates
opaque stable technical identifiers, contiguous canonical sequence numbers,
UTC recording timestamps, SHA-256 values, byte offsets, snapshot identities,
and assertion predecessor identifiers.

Draft actions retain their creation order. At close, sources are ordered by the
fixed logical-path comparator; semantic actions then retain draft order, with
an internally generated evidence span immediately preceding the record that
uses it. One close instant is generated and retained for the horizon. The
implementation must not ask the operator to copy an internal identifier from
one command into another.

Generated identifiers are implementation-private within this Zone 3 identity.
They must be stable after publication and reject collisions, but their spelling
is not a GraphTruth protocol commitment.

## Published state and projections

The future workspace has three logical areas:

```text
canonical/                 authoritative within this experiment
  JOURNAL.jsonl            verified additive record stream
  HEAD.json                selected closed horizon and chain identity
  snapshots/               exact content-addressed selected-file bytes
draft/                     at most one unpublished mutable horizon
derived/                   disposable, atomically selected generation
  current/VIEW.json
  current/DOSSIER.md
  as-of/<horizon>/VIEW.json
  as-of/<horizon>/DOSSIER.md
```

The exact serialized shapes are an implementation detail of this Zone 3
identity and must be frozen with the future implementation candidate before
the owner walkthrough. The observable contract is already fixed:

- prior `JOURNAL.jsonl` bytes are an exact prefix after every close;
- every displayed assertion and revision traces to one exact retained span;
- the current view selects the latest revision available at the closed head;
- an as-of view contains no source, assertion, revision, question, timestamp,
  or conclusion introduced after its named horizon;
- `DOSSIER.md` is a readable rendering of the same semantic content as its
  sibling `VIEW.json`;
- supported derived output rebuilt from the same verified canonical state is
  byte-identical.

Manual changes anywhere below `canonical/` are forbidden. `verify` must detect
them; it must not repair, normalize, or accept them.

## Machine and human results

Without `--json`, success prints a short action summary and the next legal
action to stdout. Failure prints one stable error code and a concise message to
stderr. Neither mode prints host absolute paths after `horizon close`.

With `--json`, stdout contains exactly one UTF-8 JSON object followed by one
LF and stderr is empty. The success envelope has exactly:

```json
{"schema":"owner-facing-workbench-v1-command-result","ok":true,"command":"<command>","result":{}}
```

The failure envelope has exactly:

```json
{"schema":"owner-facing-workbench-v1-command-result","ok":false,"command":"<command>","error":{"code":"<CODE>","message":"<message>","details":{}}}
```

No other top-level keys are allowed. Each success `result` has exactly these
keys:

| Command | Exact result keys |
| --- | --- |
| `init` | `workspaceId`, `owner` |
| `horizon open` | `horizonId`, `name`, `coverage`, `scope` |
| `source add` | `sourceId`, `logicalPath`, `sha256`, `size` |
| `assertion add` | `assertionId`, `revisionId`, `evidenceSpanId` |
| `assertion revise` | `assertionId`, `revisionId`, `predecessorRevisionId`, `evidenceSpanId` |
| `question add` | `questionId`, `evidenceSpanId` |
| `draft undo` | `undoneKind`, `undoneAlias` |
| `horizon abort` | `horizonId`, `name` |
| `horizon close` | `horizonId`, `headSha256`, `recordCount`, `snapshotCount` |
| `verify` | `headSha256`, `canonicalRecordCount`, `projectionStatus` |
| `dossier --as-of` | `horizonId`, `viewPath`, `dossierPath` |
| `rebuild` | `headSha256`, `rebuiltFiles` |

The envelope `command` value is exactly one of `init`, `horizon.open`,
`source.add`, `assertion.add`, `assertion.revise`, `question.add`, `draft.undo`,
`horizon.abort`, `horizon.close`, `verify`, `dossier`, or `rebuild`. IDs,
aliases, names, hashes, paths, kinds, and owner values are JSON strings. Sizes
and counts are safe non-negative integers. `projectionStatus` is exactly
`absent`, `current`, `stale`, or `invalid`; `rebuiltFiles` is an array of
workspace-relative path strings. Nullable `scope` and `evidenceSpanId` are
present as JSON `null`; keys are not omitted. Paths in results are
POSIX-relative to the workbench root. Arrays are in the fixed bytewise
logical-path order. Object keys are emitted in the order shown in the envelope
and table. Extra keys, prose around the object, NaN, infinity, duplicate keys,
or non-LF output are contract failures.

The failure `details` value is exactly `{}` in v1. `code` is exactly one of
`USAGE`, `INVALID_UTF8`, `INVALID_ALIAS`, `INVALID_PATH`, `UNSAFE_SOURCE`,
`DUPLICATE_SOURCE`, `INVALID_LINE_RANGE`, `LIMIT_EXCEEDED`, `NOT_INITIALIZED`,
`ALREADY_INITIALIZED`, `HORIZON_ALREADY_OPEN`, `NO_OPEN_HORIZON`,
`HORIZON_NOT_FOUND`, `REFERENCE_NOT_FOUND`, `SOURCE_CHANGED`,
`CONCURRENT_WRITER`, `CANONICAL_INTEGRITY`, `SNAPSHOT_INTEGRITY`,
`PROJECTION_INTEGRITY`, `ATOMIC_PUBLICATION`, or `INTERNAL`.

Exit status is `0` on success, `2` for command grammar errors, `3` for invalid
input, `4` for an illegal lifecycle transition, `5` for integrity or
atomic-publication failure, `6` for a frozen resource-limit refusal, and `70`
for an unexpected internal failure. A failure never publishes a partial
canonical horizon.

## Frozen limits

One accepted walkthrough is limited to:

- 64 canonical records across all closed horizons;
- 96 regular files across canonical, draft, and derived state;
- 2 MiB of retained bytes below the workbench root;
- one owner, one writer process, and one open horizon;
- zero network requests and zero model calls;
- zero manual edits below `canonical/`.

The implementation must measure the proposed post-close or post-rebuild state
before publication and refuse an operation that would exceed a limit. It does
not delete old records or snapshots to make room. Concurrent writer detection
fails closed; multi-writer coordination is not promised.

The future implementation and qualification have a budget of at most three
distinct Europe/Moscow dates with material repository or Issue activity. The
walkthrough budgets below are elapsed owner time and are measured separately.

## Severe errors

Any of these is severe and makes `keep` unavailable:

- a published canonical prefix, closed horizon, or earlier revision is changed,
  truncated, hidden, or reordered;
- a failed close exposes some but not all records or snapshots;
- a retained snapshot differs from the bytes and identity validated at close;
- an assertion points outside its source bytes or to bytes different from its
  recorded evidence hash;
- an additive revision has the wrong predecessor or erases its predecessor;
- an as-of result contains future material or loses material available at that
  horizon;
- `partial` coverage is treated as evidence of absence;
- inventory identity or order depends on locale, case folding, filesystem
  enumeration, insertion, or command argument order;
- an unsafe path, symlink, duplicate, changed input, concurrent writer, or
  integrity mismatch is accepted rather than rejected;
- `verify` or `rebuild` repairs or normalizes canonical state;
- a supported derived generation is not rebuilt byte-for-byte;
- the accepted walkthrough exceeds a frozen count, size, network, model, or
  manual-edit boundary without rejecting before publication.

A severe error is retained in the result. It is not removed by retrying until
success.

## Future qualification and walkthrough

Before the owner sees a release candidate, automated checks must cover every
command, lifecycle refusal, atomic close interruption, canonical tamper,
projection deletion and rebuild, historical isolation, limits, unsafe paths,
mixed-case inventories, every permutation of a small inventory, and the exact
M10 ordering regression. They may use only synthetic fixtures. A single release
candidate is then frozen before the [owner episode](EPISODE.md).

There is no baseline, oracle, task denominator, comparative score, or rerun of
M10. The owner must personally execute the H1/H2 loop; an assistant may explain
the frozen commands but may not enter the primary records or edit canonical
state.

Utility budgets are fixed before implementation:

- complete H1 capture in at most 10 elapsed minutes;
- H2 correction, `verify`, and reading the dossier in at most 6 minutes for
  `keep`;
- the same H2 activity in more than 6 and at most 15 minutes is an ergonomic
  `shrink` signal;
- more than 15 minutes is `stop` for the owner-facing claim;
- `verify` and `rebuild` each complete within 10 seconds on the frozen small
  synthetic qualification fixture.

## Disposition

`keep` requires all of the following:

- no severe error;
- the single frozen release candidate passes all automated qualification and
  M10 regression checks;
- the owner completes H1 within 10 minutes and H2 correction, verification,
  and dossier reading within 6 minutes;
- all required records are entered through the CLI with no episode adapter,
  prewritten source manifest, manual canonical edit, model call, or network;
- the H1 assertion remains reconstructible, its H2 revision is additive, and
  the open question remains visible at H2;
- `verify`, current/as-of dossiers, and clean exact rebuild all agree;
- the owner judges the resulting dossier usable for the frozen maintenance
  question.

`shrink` applies only when no severe error occurred and the evidence identifies
a smaller useful boundary before any new run. It includes the 6–15 minute H2
band or a bounded ergonomic failure that leaves an explicitly named command
subset correct and useful. It may remove capabilities prospectively; it may not
drop an unfavorable action, relax a limit, rescore the same walkthrough, repair
M10, or select a winning subset by rerunning.

`stop` applies when a severe error occurs, H1 cannot be completed within 10
minutes, H2 takes more than 15 minutes, the loop requires an episode adapter or
manual canonical edit, the owner cannot obtain the required history and
dossier, a frozen boundary is exceeded, or honest completion would require a
new data class, processor, protocol decision, or product scope.

The owner records exactly one terminal `keep`, `shrink`, or `stop` after the
single walkthrough. Until that decision, implementation, qualification,
walkthrough, and disposition remain unearned.
