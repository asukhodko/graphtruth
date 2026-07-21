# Python annotation semantics corpus selection

> **Selection identity:** `python-annotations-semantics-v1`
>
> **Decision:** `keep`
>
> **Frozen scope:** corpus selection, reveal chronology, rights policy,
> knowledge boundary, and participant-information limits only. No acquired
> local source snapshot, projection, task pack, oracle, runner, or evaluated
> output exists under this record.
>
> **Related experiment:** [Issue #24 — Python annotation semantics sequential
> corpus replay](https://github.com/asukhodko/graphtruth/issues/24)
>
> **Authority:** Non-normative Zone 3 experiment metadata. Once merged, this
> accepted record admits acquisition of four public sources; it does not
> establish a benchmark, GraphTruth conformance, product value, or a successful
> run.

## Decision and use case

This corpus represents one bounded documentation workflow: reconstruct a
technical decision lineage from incrementally revealed primary design records,
answer only within the revealed horizon, preserve exact support and declared
scope, and identify material missing evidence.

The future comparison is the minimal deterministic GraphTruth S0-S1 lane versus
the same projected files plus the frozen ordinary-search baseline. The corpus
can inform whether that lane is worth continuing for this one diagnostic case.
It cannot establish:

- representativeness for Python PEPs, technical documentation, or private work;
- complete Python annotation or typing history;
- exact knowledge or causal beliefs of a historical reader;
- current behavior of an arbitrary Python version or implementation;
- independent corroboration among the four sources;
- acquisition of previously unknown knowledge or absence of model memorization;
- PEP 484 details as corpus-supported facts; or
- order robustness, which requires a separately frozen 24-order successor.

The selection owner and final project decision authority is `asukhodko`. The
current GraphTruth Codex session prepares and checks the public record under
that authority. No independent-human-review claim is made.

## Sampling frame and immutable identities

- **Upstream universe:** the `python/peps` repository.
- **Pinned upstream revision:**
  `339af2b4776a66eab0f88a2800adffdb0c0650e1`.
- **Candidate population:** exactly the four repository-path identities named
  in the public laboratory plan at GraphTruth commit
  `d05c1c16f09cda90132357646317e77d9040055f` on 2026-07-13, before Issue #24
  and before GraphTruth or baseline output for this experiment.
- **Selection unit:** one RST file resolved to one Git blob at the pinned
  upstream commit.
- **Candidate inventory:** [CANDIDATE-INVENTORY.json](CANDIDATE-INVENTORY.json),
  raw-byte SHA-256
  `490fd484fb24b43a72df227c6feea19c8c52447873f909c43d85d6265a863f52`.
- **Population construction:** purposive and theory-driven. It was not produced
  by a mechanical query over all PEPs and is not random, representative, or
  exhaustive for annotation or typing semantics.
- **Selection method:** exhaustive selection of all four items in the closed
  frame. Randomization and seed are not applicable. The inventory records
  canonical serialization and synthetic reveal order as separate fields.
- **Counts:** four candidates, four selected, zero excluded within the frame.
- **Source family:** one; all four items are dependent PEP records.
- **Original media type:** immutable UTF-8 reStructuredText Git blobs, not
  Markdown. A deterministic Markdown or text projection is a later derived
  artifact and cannot alter this selection.
- **Acquisition:** `Pending m6-acquire-originals`. No local source bytes were
  materialized while preparing this record.
- **Replacement:** none. Missing content, a blob mismatch, unresolved rights,
  or unusable transformation rejects this selection identity. Adding, removing,
  or replacing an item requires a new identity and freeze.
- **Selection log:** GraphTruth commit
  `d05c1c16f09cda90132357646317e77d9040055f`, the candidate inventory above,
  and the first merged commit containing this record.

Inclusion requires an exact match to one of the four predeclared diagnostic
roles and to its pinned `(upstream commit, repository path, Git blob OID)`
tuple. Every other PEP, rendered HTML page, auxiliary file, discussion, issue,
implementation, runtime document, and later upstream revision is outside this
frame. PEP 484 is the named external dark-zone control. A selected PEP's
`Rejected`, `Superseded`, or other historical status is retained as evidence,
not used as a late exclusion. Exact or near duplication is recorded as lineage;
missing, inaccessible, unsupported, or identity-mismatched content rejects the
identity rather than changing the denominator.

The public 2026-07-13 record limits result-conditioned selection. It does not
remove curator judgment: the lineage is unusually convenient because PEP
headers and text expose replacement and dependency relations explicitly.

### Selected document roles

| Step | Source | Git blob OID | Required diagnostic role |
| ---: | --- | --- | --- |
| 1 | PEP 3107 | `403f8296fc4a709e6738d2fd7eed3beb0cee2305` | Original annotation syntax and deliberately unspecified semantics |
| 2 | PEP 563 | `0bdb7f2a9caa38e10ac37aeb0c795fbeea7d86a7` | Stringized postponed evaluation and motivating problems |
| 3 | PEP 649 | `d4c8e792468e2b50fb207da481d4f82bbff80c6c` | Deferred-evaluation replacement and trade-offs |
| 4 | PEP 749 | `78b07ba9032d29e708fac3d0814c6e7823e46918` | Implementation refinement and underspecified cases after PEP 649 |

PEP 484 is outside the candidate population. It is a predeclared dark-zone
control because the selected sources name the type-hinting transition while
omitting PEP 484 as primary evidence. An admissible answer may identify that
missing evidence, ask a bounded question, or abstain. It must not import
remembered PEP 484 content as corpus evidence. Adding PEP 484 creates a new
five-item identity and changes a future exhaustive-order denominator from 24 to
120.

## Rights and data handling

The read-only preflight observed the following notices in the exact pinned
blobs. The acquired copy must reproduce and retain each notice; a family-level
license assumption is insufficient.

| Source | Notice at the pinned blob | Accepted operational interpretation | Run policy |
| --- | --- | --- | --- |
| PEP 3107 | Placed in the public domain | Download, retain, transform, process, quote, and redistribute | Retain notice and provenance; do not publish complete source or projection bytes from this lane |
| PEP 563 | Placed in the public domain | Download, retain, transform, process, quote, and redistribute | Retain notice and provenance; do not publish complete source or projection bytes from this lane |
| PEP 649 | Public domain or CC0 1.0 Universal, whichever is more permissive | Download, retain, transform, process, quote, and redistribute | Retain notice and provenance; do not publish complete source or projection bytes from this lane |
| PEP 749 | Public domain or CC0 1.0 Universal, whichever is more permissive | Download, retain, transform, process, quote, and redistribute | Retain notice and provenance; do not publish complete source or projection bytes from this lane |

[PEP 1 at the pinned upstream
revision](https://github.com/python/peps/blob/339af2b4776a66eab0f88a2800adffdb0c0650e1/peps/pep-0001.rst#copyright)
is the upstream process reference for PEP copyright and licensing. The pinned
per-file notices remain the run authority.

The actual policy is narrower than the legal permission:

- acquire over HTTPS from the pinned `python/peps` commit;
- store originals, projections, manifests, and run state outside the checkout,
  Git worktrees, cloud-synchronized folders, and deliberate backups;
- use the owner's local OS account and owner-controlled directory permissions;
- permit local deterministic transformation, indexing, GraphTruth processing,
  and Markdown-plus-search baseline access only after the relevant later gate;
- prohibit local models, embeddings, and model-generated authority in the
  deterministic lane;
- limit the current Codex documentation preflight to public identities, notices,
  and policy; do not send an acquired original, projection, task, oracle, or run
  state to a remote model, processor, telemetry service, or hosted index under
  this gate; any later external processing needs an explicit evaluation freeze
  and owner authorization;
- publish only upstream links, identities, notices, digests, byte sizes, media
  types, transformation metadata, bounded audit excerpts, and reviewed reports;
- retain local working copies until Issue #24 closes plus 30 days, then delete
  them unless the owner explicitly admits a separately governed reusable public
  fixture; and
- treat public author names and addresses as source metadata: retain them only
  in exact originals and avoid unnecessary indexing or report reproduction.

No future external transfer of acquired originals or projections is authorized
by this gate. The applicable legal jurisdiction is not determined; the owner
accepts this as residual risk for a local personal experiment, not as legal
advice. Public-domain status may vary in effect by jurisdiction;
the two newer PEPs additionally carry CC0 1.0. If the two
public-domain-only notices prove insufficient for planned processing, reject
this selection rather than silently broadening the interpretation.

Rights preflight actor: GraphTruth Codex session under owner direction. Rights
preflight time: `2026-07-21T05:21:37Z`. Exact acquired-byte verification remains
`Pending m6-acquire-originals`.

## Source lineage and independence

All four items belong to one source family: the versioned Python PEP process.
Their stated motivation, replacement, dependency, quotation, and summary
relations are evidence about documented lineage, not four independent
confirmations of the same historical claim.

- Assign all selected items to family `python-peps`.
- Count support and uncertainty at family level: maximum independent support is
  one family, while item-level evidence locations remain visible.
- Preserve exact duplicate and near-duplicate passages as related evidence; do
  not increase support counts for them.
- Verify exact `Requires`, `Replaces`, `Superseded-By`, quotation, and other
  lineage relations from the acquired originals before the task/oracle freeze.
- Do not split descendants from this family across supposedly independent
  evaluation strata.
- Treat unavailable or uncertain ancestors as explicit gaps.

## Reveal chronology and time semantics

Chronology type is **declared synthetic**. The frozen sequential reveal is:

```text
PEP 3107 -> PEP 563 -> PEP 649 -> PEP 749
```

This order represents the chosen documented decision lineage. It does not claim
to reproduce exact historical availability, reader knowledge, implementation
state, or causation. The candidate inventory binds it explicitly through each
item's `revealOrder`, and the inventory digest binds those fields.

The controller and records must keep four semantic time axes separate:

1. **event/valid time** — only a source's scoped claims about a proposal,
   decision, Python version, or implementation state;
2. **publication/availability time** — upstream history established from
   retained provenance, with uncertainty preserved;
3. **arrival/reveal time** — synthetic steps one through four; and
4. **recorded time** — the local checkpoint after each reveal.

Git commit and filesystem timestamps are provenance, not substitutes for event
or publication time. Retrospective edits present in the pinned blobs do not
become facts known at an earlier synthetic step merely because they discuss an
older event.

At each step the SUT receives only the current opaque item identity, permitted
metadata, and byte-exact projection. It receives no future path, filename,
content, metadata, oracle information, or controller manifest. The public plan
already states that the corpus has four items, so this experiment makes no
secrecy claim about total count for human or pretrained-model participants.

## Coverage and knowledge boundary

- **Initial ledger:** empty for corpus-supported annotation-semantics claims.
  Prior participant knowledge is familiarity, not evidence.
- **Left-censored:** yes. Earlier Python history, PEP 484, discussions,
  implementations, runtime documentation, issue trackers, and other PEPs are
  outside the corpus.
- **Terminal horizon:** the four selected blobs after synthetic step four.
- **Known outside knowledge:** the existence of a type-hinting transition may
  be named because the public selection plan already names it; its omitted
  primary details remain unsupported.
- **Evidence rule:** every scored factual answer must resolve to evidence
  available at that step or be marked as a question, gap, uncertainty, or
  abstention.
- **Terminal non-claims:** no conclusion about current Python runtime behavior,
  complete typing history, real-world causation, independent confirmation, or
  permanent unanswerability follows from this boundary.

## Roles, familiarity, and first exposure

Design roles may overlap. A primary answer cell is contaminated when its
answerer has already seen the exact task together with its oracle or required
answer, the other arm's answer, or a source that is still in the future at that
cell's reveal horizon. Knowing corpus identities or broad task families, and
likely prior exposure to public PEP content, is recorded as familiarity and
limits claims but does not by itself contaminate a cell. A task or oracle author
cannot answer that task.

At this gate, `asukhodko` and the current GraphTruth Codex session are
design/control actors only. Neither is admitted as a primary answerer or a
blinded independent scorer. SUT and baseline answerers and the scorer remain
`Pending m6-freeze-evaluation`; source acquisition grants no actor an answer or
scoring role.

Before presenting any exact task, `m6-freeze-evaluation` must bind:

- the curator, task author, oracle author, SUT operator, baseline operator, and
  scorer;
- a per-task human familiarity value of `known`, `vaguely remembered`,
  `forgotten`, or `unknown` recorded before presentation;
- for each model-assisted role, `exact pretraining inclusion: unknown` and
  `material prior exposure: likely`, plus controller-verifiable session
  exposure to the exact task, revealed files, future files, oracle, and
  other-arm answer;
- first exposure as the first presentation of the exact frozen task in this
  experiment, not a claim that a person or model never encountered PEP content;
- oracle and future-source isolation; either one primary task-by-arm cell per
  session or an exact counterbalanced first-exposure allocation; arm order;
  the rule for role overlaps; scorer independence; answer-to-arm blinding; raw
  score fixation before arm reveal; and disagreement handling; and
- a private exposure-record identity and digest, with only a safe summary
  eligible for publication.

An independent scorer has no curator, task/oracle-author, operator, or answerer
role; arm blinding only hides the answer-to-arm mapping until the raw score is
fixed. A contaminated cell is excluded or invalidated by the later frozen rule;
calling it exploratory does not restore it to the primary denominator. A
correct remembered answer without evidence from the revealed horizon does not
pass source-grounding criteria.

Any model-assisted answer or scoring role is a conditional future participant,
not part of the deterministic SUT. It requires separate owner authorization and
cannot change the oracle, thresholds, or decision rule. Without an admissible
human first-exposure subset, make no human-utility claim.

## Size and resource limits

- Maximum: four originals, one source family, four sequential reveals.
- Maximum raw input: 512 KiB per file and 1 MiB total; reject rather than
  truncate, summarize, or silently omit content.
- Media type: strict UTF-8 RST originals. Projection support and fidelity are
  `Pending m6-freeze-projection`.
- The whole Issue #24 sequential lane, including selection, acquisition,
  projection, implementation, rehearsal, execution, scoring, and decision, has
  five active repository dates. 2026-07-21 is day 1; the owner decision precedes
  day 5; independent hard stop is 2026-08-04.
- Operator, baseline, review, compute, query, and task budgets are
  `Pending m6-freeze-evaluation`.
- The 24-permutation suite is `Deferred successor` and requires a new identity,
  issue, and budget after a `sequential keep`.
- Any exhausted selection or acquisition limit yields `reject` or a new
  explicitly smaller identity, never silent expansion or truncation.

## Freeze integrity and deferred controls

The first merged commit containing this record and inventory, together with the
inventory's raw-byte digest, is the public selection anchor. Record that commit
in Issue #24 after merge. Any change to population, identities, rights policy,
synthetic order, knowledge boundary, role limits, or size limits creates a new
selection identity or an explicit superseding record; it cannot update this
freeze in place to preserve a favorable result.

The following controls are deliberately not claimed by this record:

- acquired-byte SHA-256, sizes, acquisition UTC, media confirmation, local
  source manifest, and storage-path identity: `Pending m6-acquire-originals`;
- transformer, command, configuration, projected bytes, projection digest, and
  fidelity review: `Pending m6-freeze-projection`;
- exact tasks, oracle, rubric, baseline, exposure allocation, scoring, severe
  errors, denominators, and decision thresholds: `Pending
  m6-freeze-evaluation`;
- runner revision, dependencies, sandbox, rehearsals, and final run card:
  pending their named M6 tasks; and
- all private G1 `PACK`, `ANCHOR`, private-Codex review, and stopped private M1
  controls: not applicable and not reusable by Issue #24.

Freeze preparation actor and time: GraphTruth Codex session,
`2026-07-21T06:43:43Z`. Owner acceptance actor: `asukhodko`. Acceptance time:
`2026-07-21T07:29:40Z`. Authority record: [Issue #24 owner-acceptance
comment](https://github.com/asukhodko/graphtruth/issues/24#issuecomment-5031287768).
No independent-human-review claim is made.

## Selection decision

Decision: **`keep`**.

Observed acceptance evidence:

- the four-item identity predates this experiment's output;
- every path resolves at the pinned upstream commit to the recorded Git blob;
- every blob carries the recorded public-domain or public-domain/CC0 notice;
- a bounded synthetic chronology, one-family treatment, dark zone, publication
  policy, and no-replacement rule are now closed; and
- the limited preflight inspected public identities and file-local notices, but
  no acquired local snapshot, GraphTruth output, baseline output, or oracle was
  inspected to tune this decision.

Reject this identity if acquisition produces a blob mismatch, invalid UTF-8,
an over-limit source, a missing or materially different notice, an unresolved
processing-rights condition, or a source that cannot be transformed without
oracle-relevant undeclared loss. A later unfavorable result is not a reason to
replace a source.

Maximum next scope after owner acceptance and merge:
`m6-acquire-originals`. The decision does not authorize projection, task
construction, a model call, an evaluated run, or a sequential `keep`.
