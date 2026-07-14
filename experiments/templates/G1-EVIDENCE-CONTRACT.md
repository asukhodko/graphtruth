# G1 evidence-contract record template

> **Use:** Copy this file into the encrypted private pack and complete it there.
> Never put real values in the public template or expose the completed record to
> Git, GitHub, CI, Obsidian, an assistant, or an unapproved processor.
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

- Exact sealed `PACK` root:
- Separate mutable `WORK` root excluded from G1:
- Separate protected `ANCHOR` root excluded from G1:
- Confirmation that all three are sibling directories on the approved
  encrypted volume:

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
- Private comparison with the pre-published synthetic twin:
- Complete artifact-role map used by the owner-only lock tool:
- Confirmation that every `PACK` entry satisfies the sealed
  `owner-only-no-acl-v1` access policy:
- Confirmation that `PACK` has no resource fork or xattr outside the sealed
  `darwin-provenance-11-byte-only` policy:
- Other immutable G1 artifact, or `none`:

The pack lock itself, final anchor records, public receipt, M2 run card,
runtime-specific reveal bundles, mutable state, logs, reports, code,
configuration, environment, final review records, and backups are deliberately
outside this list. A lock cannot include its own digest, and final confirmations
must bind the completed lock after it exists.

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
| Independent-review time | | | |
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
| Independent review and scoring time | | | |
| Query and attempt count by arm | | | |
| Memory | | | |
| Storage, including derived state | | | |
| External processing | | | |
| Manual interventions and retries | | | |

## Handling, reviews, and seal readiness

- Approved owner, actors, roles, and purpose:
- External processing: denied / specifically authorized:
- Metadata allowed in logs:
- Retention and deletion plan:
- Backup decision and boundary:
- Incident-response record:
- Public twin comparison result: `safe` / `reject`
- Planned owner and independent reviewer roles:
- Reviewer access path and copy prohibition:
- Closed inventory construction and sorting rule:
- Owner-only lock-tool Git revision and exact wrapper/module hashes:
- Canonical Node path, version, and exact executable hash:
- Confirmation that every create/verify used the empty-environment wrapper:
- Raw-byte digest algorithm:
- Lock filename excluded from its own inventory:
- Protected anchor area outside the sealed pack:

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
- Private-data admission: `Forbidden until the M2 admission gate closes`

## Pre-seal completion check

- [ ] The selected episode is eligible and authorized.
- [ ] The exact three-to-five-source Markdown manifest and reveal order are
      immutable.
- [ ] The exact denominator `T >= 8` and withheld oracle are closed.
- [ ] Baselines, first exposure, capture tax, scoring, budgets, and decision
      thresholds are frozen.
- [ ] Data handling and incident rules are approved without claiming M2 tests.
- [ ] The public twin comparison is `safe`.
- [ ] The artifact-role map covers every future lock entry exactly once.
- [ ] Candidate state is `final-for-seal`; `frozen` has not been claimed early.
- [ ] No evaluated baseline, GraphTruth lane, scored task, or private reveal ran.
- [ ] No private material or protected metadata left the approved boundary.
- [ ] Every non-G1 control is explicitly pending M2.

Passing this check permits construction of the non-circular pack lock. G1 closes
only after the owner and independent reviewer separately bind their final
confirmations to the exact immutable pack, verified all-and-only inventory,
completed lock digest, byte length, and algorithm in protected anchor records
outside the sealed pack. The sealed record remains `final-for-seal`; only those
confirmations and the later safe receipt attest that G1 became `frozen`.
