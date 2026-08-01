# Owner-facing workbench v1 candidate format

This document freezes the implementation-private serialization selected for
the first `owner-facing-workbench-v1` release candidate. It is bound to the
[product contract](README.md) with SHA-256
`1e6428fe7912481893b833ede69711fed2b85f5dd6cf179bc9faffb346254fbe`.

The format remains a Zone 3 implementation detail. It is not a GraphTruth
protocol schema, compatibility promise, or migration source. The candidate
manifest identifies the exact code, tests, and copy of this document that may
be shown to the owner.

## Physical workspace

The workspace root is a real owner-only directory with mode `0700`. Its public
logical paths remain the three areas named in the contract:

```text
canonical -> .active/canonical
draft     -> .active/draft
derived   -> .active/derived
```

`.active` is an atomically replaced symlink to exactly one private immutable
generation below `.states/`. A generation contains:

```text
.META.json
.STATE.json
canonical/
draft/
derived/
```

Every directory has mode `0700`; every regular file has mode `0600`.
`.STATE.json` commits to the byte-and-mode inventory digests of all three
areas and to `.META.json`. Its schema value is
`owner-facing-workbench-v1-state`. The generation name commits to the complete
generation inventory and has a random non-semantic suffix so that rebuilding
the same bytes can replace a damaged generation without reusing its directory.

Every mutation copies the active generation to a private sibling stage,
validates the proposed limits and invariants, finalizes its digests, and then
renames one new `.active` symlink over the old selector. A failure before that
rename removes the stage and leaves the selected generation unchanged. The old
generation is removed only after the selector commit. `.writer.lock` is an
exclusive transient file and is never part of a generation.

## Canonical JSON and hashes

All retained JSON is UTF-8, ends with one LF, and recursively orders object
keys by unsigned lexicographic comparison of their UTF-8 bytes. Arrays retain
their explicitly defined semantic order. JSONL contains one such object per
line and no blank line.

SHA-256 is lowercase hexadecimal over exact bytes. Each journal record stores
the SHA-256 of its canonical JSON core before the `recordSha256` member is
added. `previousRecordSha256` is `null` only for sequence 1 and otherwise equals
the preceding record hash.

Generated IDs match `[a-z]{3}_[a-f0-9]{32}`. The prefixes are `wrk`, `hor`,
`src`, `ast`, `rev`, `evd`, `qst`, and `cls`. Their spelling is private to this
candidate. Retained times use UTC `YYYY-MM-DDTHH:mm:ss.sssZ`.

## Canonical files

`canonical/JOURNAL.jsonl` is the additive record stream. Every later close
retains all earlier bytes as an exact prefix. Every record has exactly:

```text
body, horizonId, id, kind, previousRecordSha256, recordedAt,
recordSha256, schema, sequence
```

`schema` is `owner-facing-workbench-v1-record`. Sequence starts at 1 and is
contiguous. The kinds and exact body members are:

| Kind | Exact body members |
| --- | --- |
| `WorkspaceInitialized` | `owner` |
| `HorizonOpened` | `coverage`, `name`, `scope` |
| `SourceSnapshot` | `alias`, `identity`, `logicalPath`, `sha256`, `size`, `snapshotPath` |
| `EvidenceSpan` | `byteEnd`, `byteStart`, `lineEnd`, `lineStart`, `sha256`, `sourceId` |
| `AssertionRevision` | `alias`, `assertionId`, `evidenceSpanId`, `predecessorRevisionId`, `reason`, `scope`, `text`, `uncertainty` |
| `QuestionOpened` | `alias`, `evidenceSpanId`, `status`, `text` |
| `HorizonClosed` | `coverage`, `name`, `scope` |

The first assertion revision has `predecessorRevisionId: null` and
`reason: null`. Every later revision has both values. A question without
evidence has `evidenceSpanId: null`. Question status is always `open` in v1.

`SourceSnapshot.identity` has exactly `ctimeNs`, `dev`, `ino`, `mtimeNs`, and
`size`, serialized as decimal strings. It records file identity without a host
path. `snapshotPath` is `snapshots/<sha256>.bin`; snapshots are unique by
content hash.

`canonical/HEAD.json` has schema `owner-facing-workbench-v1-head` and exactly:

```text
headHorizonId, headHorizonName, headSha256, horizons, journalSha256,
owner, recordCount, schema, workspaceId
```

Each `horizons` item has `closedAt`, `coverage`, `headSha256`, `id`, `name`,
and `scope`. `recordCount` counts the initialization record and every record
published through the selected closed head. A successful close reports this
same total. Its `snapshotCount` is the number of unique retained content
hashes.

## Draft

With no open horizon, `draft/` is empty. An open horizon has
`draft/STATE.json` with schema `owner-facing-workbench-v1-draft` and optional
captured files below `draft/sources/`.

The state has exactly `actions`, `coverage`, `horizonId`, `name`, `openedAt`,
`schema`, `scope`, and `sourceRoot`. `sourceRoot` is the only retained host
locator and exists only in the unpublished draft. It is removed by close or
abort.

Actions preserve entry order. Their exact members are:

| Kind | Exact action members |
| --- | --- |
| `source` | `alias`, `capturedFile`, `identity`, `kind`, `logicalPath`, `recordedAt`, `sha256`, `size`, `sourceId` |
| `assertion-add` | `alias`, `assertionId`, `evidenceSpanId`, `kind`, `lineEnd`, `lineStart`, `recordedAt`, `revisionId`, `scope`, `sourceAlias`, `text`, `uncertainty` |
| `assertion-revise` | `alias`, `assertionId`, `evidenceSpanId`, `kind`, `lineEnd`, `lineStart`, `predecessorRevisionId`, `reason`, `recordedAt`, `revisionId`, `scope`, `sourceAlias`, `text`, `uncertainty` |
| `question` | `alias`, `evidenceSpanId`, `kind`, `lineEnd`, `lineStart`, `questionId`, `recordedAt`, `sourceAlias`, `text` |

A source action retains its no-follow host identity and relative captured-file
locator. Revisions retain their reason and generated predecessor. A question
without evidence has null source, line, and span members. The internal
`EvidenceSpan` is calculated again from retained bytes when the horizon
closes.

At close, source records are emitted first in the fixed bytewise logical-path
order. Semantic actions then remain in draft order. An evidence record is
immediately followed by the assertion revision or evidenced question that
uses it.

## Views and dossiers

`VIEW.json` has schema `owner-facing-workbench-v1-view` and exactly:

```text
asOf, assertions, coverage, horizons, questions, schema, sources, workspace
```

`asOf` identifies one closed horizon and its close time and head hash.
`coverage` contains `mode` and nullable `scope`. `sources` contains every
source available by the selected head. `assertions` selects the latest
revision available by that head and embeds its exact source, line, byte, and
hash evidence. `questions` contains every still-open question available by
that head and nullable evidence. No absence field exists.

`DOSSIER.md` renders every semantic member of the sibling view. Operator text,
aliases, paths, nullable scope, uncertainty, and reasons use JSON string
quoting so their exact values remain recoverable. IDs, times, ranges, hashes,
coverage, predecessors, and open status are printed explicitly.

The current pair is always generated for the latest closed horizon. A named
as-of request adds that horizon name to the sorted private requested set and
publishes its pair. Rebuild regenerates the current pair and every previously
requested as-of pair. `rebuiltFiles` is the bytewise-sorted list of their
workspace-relative paths.

Projection status is:

- `absent` when no supported derived file or directory remains;
- `current` when the complete generation is byte-exact and private-mode;
- `stale` when the current pair is internally exact for a known earlier head;
- `invalid` for any other supported projection mismatch.

Rebuild may replace missing, stale, modified, or wrong-mode supported
projections. It refuses an unexpected file, directory, symlink, or special
node, so it never broadens deletion beyond the supported derived inventory.

## Command results

The JSON envelopes and per-command result keys are exactly those frozen in the
product contract. Object insertion order follows that contract rather than the
canonical retained-JSON sorter. Before dispatch, a usage failure with no
recognized command uses `command: "init"` as the closed-schema sentinel; it
does not attempt initialization.

Human success is exactly two LF-terminated lines: one `OK <command>:` summary
and one `NEXT` hint. Human failure is one LF-terminated
`<CODE>: <stable message>` line on stderr. JSON mode writes exactly one object
and one LF to stdout and leaves stderr empty.

## Limit accounting

The 64-record limit includes the initialization record. The 96-file limit
counts every regular file in the proposed active generation, including
implementation-private metadata. The 2 MiB limit counts their exact retained
bytes. Directories, symlinks, the transient lock, the host source root, and a
pre-commit staging generation do not count. A proposed operation is rejected
before selector publication when any limit would be exceeded.
