# Owner walkthrough episode

Identity: `owner-facing-workbench-v1-graphtruth-route-transition-h1-h2`

Parent contract: [`owner-facing-workbench-v1`](README.md)

Issue: [#52](https://github.com/asukhodko/graphtruth/issues/52)

Status: frozen input boundary; implementation and owner walkthrough pending.

This document fixes one future public two-horizon owner walkthrough. It is not
an experiment baseline, oracle, score, run result, or authorization to execute
the workbench. The next goal must bind a single implementation release
candidate to the SHA-256 of this document and the parent contract before any
owner action begins.

## Purpose

The episode asks whether the owner can record a small real project-state
transition, preserve the earlier statement, add its correction, verify the
history, and read a useful as-of dossier without an episode-specific adapter or
manual canonical-data editing.

The source material is public GraphTruth project documentation. The episode
does not compare GraphTruth with `rg`, another tool, a human baseline, or an
oracle. It has no task denominator or comparative scoring.

## H1: state before route selection

Git repository: `https://github.com/asukhodko/graphtruth.git`

Commit: `69f9f676e5bf5b9e488f33d4697bf8c184dec2c9`

The four selected files are ordinary UTF-8 Git blobs. No directory traversal
or implicit file is part of the horizon.

| Logical path | Git blob SHA-256 | Size (bytes) |
| --- | --- | ---: |
| `README.md` | `cae7045ccc9862d4aef51a6b904e4cff17557281c61379d5f1224e23e6424c28` | 11,021 |
| `docs/ROADMAP.md` | `15cb92e9e75ece838b57276d064085f26bbf6f4cf0284603cfc48a9478183697` | 49,260 |
| `docs/planning/README.md` | `f44abd65ad8c493040bf829f621132ac07edc2f204ecf5d13fd77d3afd0649b9` | 14,616 |
| `docs/planning/graphtruth.plan.yaml` | `9996311ba8a3b630db5479f4e2b3022dd9498cc3c8b5f109dc61eb744116ce4b` | 120,037 |

H1 means:

- M11 had stopped before semantic or source-selection freeze;
- the single-major-WIP slot was free;
- no next route had been selected or authorized;
- planning material still recommended a portable-inventory v2 / third-public-
  correction successor in places even though the later route review had not
  selected it.

The owner adds one assertion, using one exact supporting line range from
`docs/planning/README.md`:

> At H1, the major-work slot was free and current planning recommended a
> portable-inventory successor, but execution required separate authorization.

The owner selects one exact supporting span accepted by the frozen command
grammar and must not hand-author its byte bounds, hash, IDs, sequence,
timestamp, or predecessor links.

## H2: selected and frozen route

H2 is the squash-merge commit of the preparation PR that adds this document
and freezes the parent contract. Its identity is not guessed in advance. It is
the exact commit GitHub reports for that squash merge, and it must be recorded
in Issue #52 before the implementation goal begins.

H2 selects exactly the same four logical paths. Their bytes are the Git blobs
at that merge commit. Issue #52 must record, for each file, its SHA-256 and byte
size, plus the SHA-256 of this document and the parent `README.md`. No local
checkout path is part of the public identity.

H2 means:

- the stale portable-inventory recommendation has been removed from current
  planning state;
- `owner-facing-workbench-v1` is the selected next product route;
- its Zone 3 product and CLI contract is frozen and linked from the project
  plan;
- implementation, automated qualification, the owner walkthrough, and
  disposition still require a separate goal and have not occurred.

The owner adds one revision to the H1 assertion:

> At H2, `owner-facing-workbench-v1` is the selected route and its contract is
> frozen; implementation and the owner walkthrough remain pending under a
> separate goal.

The earlier H1 assertion must remain present in H1 reconstruction. The H2
record must be an additive revision with an automatically generated predecessor
link, not an edit of the H1 bytes.

## Open question

The owner records this unresolved question no later than H2:

> Can the owner complete this capture-and-correction cycle without an adapter
> or manual canonical-data editing within the frozen time budget?

Question closure is outside workbench v1 and outside this walkthrough.

## Fixed walkthrough order

1. Freeze one implementation release candidate and its synthetic qualification
   evidence under a separate goal.
2. Materialize the four H1 Git blobs and verify this table before timing owner
   work.
3. Start the H1 timer immediately before the owner initializes a new empty
   workbench. The owner opens H1 with `partial`
   coverage, adds exactly the four files, records the H1 assertion and open
   question, closes H1, and stops the H1 timer.
4. The owner requests and reads the H1 dossier.
5. Materialize and verify the same four files from the recorded H2 merge commit.
6. Start the H2 timer immediately before the owner opens H2 with `partial`
   coverage. The owner adds exactly the four H2 files, records the additive
   revision, closes H2, runs `verify`, reads the H2 dossier, and stops the H2
   timer.
7. Delete only supported derived outputs, run `rebuild`, and verify byte-exact
   current and as-of outputs.
8. Record all attempts, elapsed times, failures, limits, and one owner
   `keep / shrink / stop` disposition without retrying away an unfavorable
   result.

Only the owner supplies the primary assertion, revision, question, and
usability judgment. An assistant may explain the already frozen command
contract and prepare exact public source bytes, but may not type the primary
records, alter canonical state, substitute a result, or exclude a failed
action.

## Expected evidence

The future result must bind:

- the exact contract, episode, H1, H2, and implementation identities;
- the one workbench root's closed public inventory and limits;
- the generated canonical head after each horizon;
- H1 and H2 current/as-of projection identities before and after rebuild;
- one attempt ledger, owner elapsed times, and every failure;
- confirmation of zero manual canonical edits, network requests, model calls,
  baseline runs, oracle access, and comparative scoring;
- the owner's terminal decision under the frozen rules.

No outcome from this episode can establish a normative GraphTruth format,
generality beyond the selected files and owner, superiority over search,
privacy readiness, multi-user safety, or completion of personal v0.
