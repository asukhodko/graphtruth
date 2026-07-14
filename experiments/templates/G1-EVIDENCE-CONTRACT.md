# G1 evidence-contract record template

> **Use:** Copy this file into the owner-only private pack and complete it there.
> Never put real values in the public template or expose the completed record to
> Git, GitHub, CI, Obsidian, or any processor except the specifically authorized
> fresh isolated Codex reviewer.
>
> **Authority:** Non-normative Zone 3 experiment control. This record freezes
> evidence and evaluation for G1; it does not admit a runtime or define protocol
> semantics.

Every required field must contain a final value or an explicit `reject` /
`invalid` decision. `Pending M2` is valid only in the section that names the M2
boundary. A blank, provisional, contradictory, or open-ended value cannot pass
G1.

## Contract identity and claim boundary

- Opaque local contract identity:
- Candidate state: `draft` / `rejected` / `invalid` / `final-for-seal`
- Owner role reference:
- Decision or incident workflow represented:
- Working decision this experiment may support:
- Exact source count, within three to five:
- Exact closed task denominator `T`, with `T >= 8`:
- Permitted claims if the later experiment succeeds:
- Explicit non-claims:
- Selection decision and reason: `keep` / `reject`
- Confirmation that no evaluated run has occurred:

## Closed G1 artifact set

Record neutral relative references inside the private pack for every item. The
non-circular pack lock later covers their exact bytes; do not put the final lock
digest in this record.

- Logical label and location class for sealed `PACK` (no filesystem path):
- Logical label and location class for mutable `WORK`, excluded from G1 (no
  filesystem path):
- Logical label and location class for protected `ANCHOR`, excluded from G1 (no
  filesystem path):
- Confirmation that all three use approved owner-only private storage and that
  physical paths are recorded only in the controller-only common `ANCHOR`:
- Encryption-at-rest requirement and mechanism, or justified `not required`:

- Completed corpus-selection record:
- Immutable Markdown-only source snapshot:
- Closed corpus manifest and source-state ledger:
- Knowledge-boundary and reveal-order record:
- Future-bundle isolation record:
- Closed task pack:
- Withheld oracle:
- Baseline and first-exposure plan:
- Completed review rubric:
- Evaluation, budget, and decision record: this file
- Completed data-handling plan:
- Completed incident runbook:
- Completed `g1-review-control.json` plus byte-exact fixed
  `g1-review-prompt.md` and `g1-review-result.schema.json`:
- Complete byte snapshot of public twin commit
  `234bf9edc7a67cb3f1847e6d60cfe05ddbd13a01` and its embedded
  `pack-lock.json`:
- Closed public-twin snapshot manifest covering every regular Git blob,
  including `pack-lock.json`, by relative path, byte length, and SHA-256:
- Owner's completed pre-seal non-derivation comparison: `safe` / `reject`
- Complete artifact-role map used by the owner-only lock tool:
- Confirmation that every `PACK` entry satisfies the sealed
  `owner-only-no-acl-v1` access policy:
- Confirmation that `PACK` has no resource fork or xattr outside the sealed
  `darwin-provenance-11-byte-only` policy:
- Other immutable G1 artifact, or `none`:

Outside the fixed public-twin snapshot subtree, the pack lock itself, final
anchor records, public receipt, M2 run card, runtime-specific reveal bundles,
mutable state, logs, reports, code, configuration, environment, final review
records, and backups are deliberately outside this list. Every blob in the
fixed snapshot remains included even when its name is `run-card.json` or below
`logs/`. A lock cannot include its own digest, and final confirmations must bind
the completed lock after it exists.

- Lock placement and inventory rule: the lock is a direct child of `PACK` and
  covers all and only other regular files below it, sorted by neutral relative
  path and recording role, raw-byte SHA-256, and byte length.
- Rejection rule: undeclared or missing file, wrong owner, group or other
  access, ACL, symlink, hard-link count other than one, special file, nested
  mount, path escape, or duplicate relative path.

## Episode and information boundary

- Original candidate population and selection unit:
- Frozen inclusion, exclusion, and replacement rules:
- Rights and processing authority for every source class:
- Version, provenance, lineage, and duplicate policy:
- Confirmation that all three to five selected sources are immutable Markdown:
- Event time, file time, acquisition, publication, availability, and reveal
  chronology:
- Knowledge available before the first reveal:
- Terminal knowledge boundary and known missing classes:
- Prior familiarity for every human role and task:
- Conclusions the boundary permits:
- Conclusions the boundary forbids:

## Task and oracle closure

- Exact task identities and complete-denominator reference:
- Source roles covered:
- Early-answerable task reference:
- Pre-evidence abstention task reference:
- Correction-after-counterevidence task reference:
- Terminal-unresolved task reference:
- Confirmation that each task has one oracle judgment:
- Confirmation that evidence and counterevidence are exact and horizon-bound:
- Oracle and evaluator-only isolation mechanism:
- Missing, timeout, abort, invalid, and correct-abstention rules:
- Severe errors and their task, arm, or whole-run consequences:

## Baselines and first exposure

- Markdown plus literal `rg` command and permitted flags:
- Source horizon and bytes visible to every arm:
- Time, query, tool, assistance, and answer-format budget by arm:
- Review procedure shared by the arms:
- GraphTruth-only work counted as capture tax:
- Ordinary current workflow: registered second baseline / explicitly excluded:
- Claim limitation if the ordinary workflow is excluded:
- Role overlaps and conflict controls:
- First-exposure allocation and arm order:
- Scorer blinding and disagreement procedure:

## Evaluation and decision

- Primary measure and formula:
- Fixed denominator `T`:
- Secondary measures:
- Tie, omission, timeout, abort, and invalid handling:
- Time, verification effort, and capture-tax measurement:
- Zero-tolerance failure classes:
- `keep` threshold:
- `shrink` threshold:
- `stop` threshold:
- Behavior when each budget is exhausted:

The starting recommendation is zero severe regressions and either at least two
additional successful tasks over the baseline or at least 25% lower median time
at equal task success. If the frozen threshold differs, record the reason here
before any evaluated output is visible:

- Threshold change and pre-exposure justification, or `unchanged`:

## Preparation budget

| Budget | Limit | Measurement method | Exhaustion behavior |
| --- | --- | --- | --- |
| Contract-freeze repo-active dates | | | |
| Owner time | | | |
| Fresh isolated Codex review time, queries, and cost | | | |
| Storage | | | |
| Backup copies | | | |
| External processing | | | |
| Manual interventions | | | |

## Frozen evaluated-run resource budget

These limits govern the later frozen comparison and cannot be decided for the
first time in M2. M2 may only bind their already frozen values to the exact
runtime identity.

| Budget | Limit | Measurement method | Exhaustion behavior |
| --- | --- | --- | --- |
| End-to-end wall clock by arm | | | |
| Operator time by arm | | | |
| Scoring and result-review time | | | |
| Query and attempt count by arm | | | |
| Memory | | | |
| Storage, including derived state | | | |
| External processing | | | |
| Manual interventions and retries | | | |

## Handling, reviews, and seal readiness

- Approved owner, actors, roles, and purpose:
- External processing: specifically authorized for the isolated Codex review:
- Metadata allowed in logs:
- Retention and deletion plan:
- Backup decision and boundary:
- Incident-response record:
- Public twin comparison result: `safe` / `reject`
- Public twin source commit, tree path, embedded-lock result, and closed snapshot
  manifest identity:
- Owner role and final-accept authority:
- Fresh isolated Codex reviewer purpose and strict non-runtime role:
- `independentHumanReview`: `false`
- OpenAI processing authorization, affected data classes, and policy basis:
- Pinned Codex CLI, model, permission profile, command, and output-schema
  identities:
- Retained public synthetic qualification identity, exact zero-tool model
  command, allowed JSONL trace, and result:
- Run-specific post-seal identity-and-config preflight identity: `Recorded
  later outside PACK`
- Persistent common `ANCHOR` location class and planned fresh review,
  attempt-anchor, authorization, and state staging as strict canonical
  descendants of `realpath(os.tmpdir())`:
- Planned byte-exact read-only attempt copy of persistent `PACK`, verification
  against the external lock anchor, and cleanup:
- Confirmation that persistent `PACK` and its attempt copy remain
  controller-only, the complete private input travels only through standard
  input, and the ephemeral model workspace contains only the byte-exact public
  result schema:
- Complete strict-UTF-8 inventory; at most 256 artifacts; fixed-prompt plus
  canonical-JSON envelope at most 1 MiB (1,048,576 bytes); no truncation or
  summary:
- Fixed public prompt as the sole task-specific `PACK` instruction; trusted
  platform and system instructions and pinned CLI and model:
- Disabled shell and unified execution, code, agents, MCP, apps, plugins,
  browser, web, and other tool-capable features; inert stock `update_plan`,
  `apply_patch`, and `view_image`; exact allowed JSONL trace; rule rejecting
  every tool event:
- Owner-only authentication carrier; one disposable state root containing
  separate `CODEX_HOME`, `HOME`, and `TMPDIR`; required full-root cleanup;
  fresh-session, no-resume, disabled user-config, and no-unapproved-egress
  controls:
- Deny-root model-tool profile, sole public-schema read exception, broadly
  trusted Codex-client system area, and accepted same-UID process, Keychain, and
  IPC boundary:
- Closed inventory construction and sorting rule:
- Exactly two sealed-lock verifications: before private-envelope construction
  and after the private model call:
- Controller validation and write rule for the structured result:
- Separately qualified Docker fallback condition, or `not selected`; statement
  that Docker is not automatic and does not solve an oversized envelope:
- Owner-only lock-tool Git revision and exact wrapper/module hashes:
- Canonical Node path, version, and exact executable hash:
- Confirmation that every create/verify used the empty-environment wrapper:
- Raw-byte digest algorithm:
- Lock filename excluded from its own inventory:
- Protected common anchor outside the sealed pack, preservation rule for later
  attempt evidence, and rule forbidding reuse of any staging path:

The actual post-seal identity-and-config report, JSONL trace, review result,
review-run record, and state-cleanup confirmations cannot be facts inside this
sealed record. The controller writes them later during the attempt; the owner
preserves and cites the resulting artifacts in the final acceptance or incident
record.

## Explicit pending M2 boundary

Seal these literal limitations as part of G1. Do not fill them with a current
runtime identity and do not mark their tests as passed:

- Exact code revision: `Pending M2`
- Configuration and dependency identity: `Pending M2`
- Environment and sandbox policy: `Pending M2`
- Controller, SUT, baseline, and evaluator runtime isolation: `Pending M2`
- Fresh runtime-boundary rehearsal: `Pending M2`
- Full synthetic dress rehearsal: `Pending M2`
- Run-specific logging test: `Pending M2`
- Restore exercise: `Pending M2`
- Whole-run purge exercise: `Pending M2`
- LLM and embedding calls in M2: `Forbidden; any model-assisted successor
  requires a separate gate`
- Private-data admission to the evaluated GraphTruth/SUT runtime: `Forbidden
  until the M2 admission gate closes`

## Pre-seal completion check

- [ ] The selected episode is eligible and authorized.
- [ ] The exact three-to-five-source Markdown manifest and reveal order are
      immutable.
- [ ] The exact denominator `T >= 8` and withheld oracle are closed.
- [ ] Baselines, first exposure, capture tax, scoring, budgets, and decision
      thresholds are frozen.
- [ ] Data handling and incident rules are approved without claiming M2 tests.
- [ ] The complete public-twin snapshot matches the fixed Git commit and
      embedded manifest byte for byte.
- [ ] The owner's pre-seal public-twin comparison is `safe`.
- [ ] The exact review controller and profile match the retained public
      synthetic qualification; the fixed prompt, schema, and completed control
      record are inside `PACK`.
- [ ] The artifact-role map covers every future lock entry exactly once.
- [ ] Candidate state is `final-for-seal`; `frozen` has not been claimed early.
- [ ] No evaluated baseline, GraphTruth lane, scored task, or private reveal ran.
- [ ] OpenAI processing is specifically authorized for every affected private
      data class.
- [ ] No private material or protected metadata was published or reached an
      unauthorized processor.
- [ ] Every non-G1 control is explicitly pending M2.

Passing this check permits construction of the non-circular pack lock. G1 closes
only after the run-specific identity-and-config preflight passes, the controller
sends the complete bounded pack through standard input in one zero-tool private
Codex call, Codex accepts and separately checks the sealed twin snapshot and
owner's pre-seal comparison, the second lock verification passes, and the owner
records final acceptance against the trace, validated result, cleanup evidence,
and completed lock in `ANCHOR`. Codex cannot override an owner rejection, and
the owner cannot override a Codex rejection. The sealed record remains
`final-for-seal`; only the later attempt and owner records and safe v2 receipt
attest that G1 became `frozen`.
