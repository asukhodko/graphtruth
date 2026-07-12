# Run card template

> **Use:** Copy into the private run root. Never fill this public template with
> real corpus names, people, paths, answers, identifiers, or digests.
>
> **Authority:** Non-normative Zone 3 experiment metadata.

## Identity and decision

- Run identity:
- Owner:
- Created at:
- Hypothesis:
- Decision this run can change:
- Explicit non-claims:
- Current state: `planned`
- Predecessor or fork, if any:

Allowed lifecycle:

```text
planned → frozen → running → completed
                         ↘ aborted
                any invalid boundary → invalid
```

Only the trusted controller changes state. Record the time, actor, and reason
for every transition. A completed run can still be judged invalid during review.

## Frozen inputs

- Corpus snapshot identity:
- Corpus manifest digest:
- Reveal schedule digest:
- Source-ancestry map digest:
- Code revision:
- Configuration digest:
- Environment and dependency identity:
- Sandbox policy digest:
- Disclosure and processing policy digest:
- Task pack digest:
- Oracle digest:
- Review rubric digest:
- Human-exposure plan digest:
- Incident policy digest:
- Immutable inventory or pack-lock digest:
- External location where the lock digest was recorded:
- Freeze time:
- Freeze actor:

Digests are private and must cover unambiguous bytes and the digest algorithm
identifier. The run card cannot seal itself: create a non-circular pack lock
that includes this completed card and every immutable artifact, then record the
lock digest in a protected location outside the mutable run pack. The system
under test must not receive future inventory, filenames, item counts, oracle
material, or full-corpus summaries.

After `frozen`, any change to a value above creates a new run identity. Do not
overwrite history or select the most favorable rerun. Append deviations below.

## Roles and prior knowledge

| Role                            | Private actor reference | Inputs visible | Conflicts or overlap |
| ------------------------------- | ----------------------- | -------------- | -------------------- |
| Corpus curator                  |                         |                |                      |
| SUT operator                    |                         |                |                      |
| Task/oracle author              |                         |                |                      |
| Current-workflow baseline user  |                         |                |                      |
| Files-plus-search baseline user |                         |                |                      |
| Scorer                          |                         |                |                      |

For every task, record whether each participant knew the answer or later source
as `known`, `vaguely remembered`, `forgotten`, or `unknown`. If roles overlap,
state why the run remains useful and label primary claims exploratory.

## Comparison design

- Lane: `frozen-passive` / `interactive-fork`
- System under test:
- Honest current-workflow baseline:
- Minimal files-plus-search baseline:
- Permitted tools and assistance per arm:
- First-exposure rule:
- Order variants or repeats:
- Nondeterminism controls:
- Earliest step at which each task is answerable:

Manual capture, correction, annotation, review, and maintenance are measured as
capture tax. Give baselines comparable source visibility and labor budget, or
declare and quantify the asymmetry.

### Order robustness and semantic convergence

- Closed corpus and terminal horizon:
- Distinct item count and expected permutation denominator (`n!` for 3–5):
- Seed-slot count and execution denominator `P × S`:
- Eligible-task and automated-arm counts:
- Automated evaluation-cell denominator `P × S × T × A`:
- Per-arm and paired-comparison denominator `P × S × T`:
- Separate human first-exposure-cell denominator:
- Historical-order authority:
- Permutation suite: exhaustive / seeded sample / adversarial:
- Permutation generator and enumeration rule:
- Exact permutation list or seed-list digest:
- Clean empty-state procedure before every run:
- Initial ledger, projection, cache, and learned-state identity:
- Confirmation that future inventory and oracle remain hidden:
- Rule separating valid/event, publication/availability, arrival/reveal, and
  recorded time:
- Frozen passive-lane and interactive-fork separation:
- Clean-batch GraphTruth reference:
- Clean-rebuild comparator:
- Deterministic semantics expected to converge:
- Fields explicitly excluded from semantic normalization:
- Normalization and stable-ID alignment used for comparison:
- Heuristic differences explicitly permitted:
- Stochastic seed or repeat schedule:
- Required and forbidden oracle relations or task outcomes:
- Frozen structural and task-level tolerance:
- Raw-files-plus-search baseline:
- Raw baseline command, query-to-result contract, and scoring procedure:
- Ordinary-current-workflow baseline:
- Optional full-information comparator:
- Primary automated non-inferiority baseline:
- Primary human utility comparator and claim boundary:
- Human first-exposure allocation or counterbalanced subset:
- Terminal hard gates that every permutation must pass:
- Trajectory measures, including abstention and resolution lag:
- Earliest-answerable-prefix and allowed detection-lag rule:
- Worst-order and lower-tail reporting rule:
- Missing, aborted, invalid, and contaminated permutation rule:
- Pre-reveal infrastructure-only retry rule and retained attempt log:
- Whole-suite invalidation and new-generation rule:
- Cost, review, and capture-tax threshold:
- Order-robustness pass / shrink / stop threshold:

For a corpus of three to five items, execute all `n!` permutations. If the frozen
budget cannot support that denominator, reduce the corpus or label the run a
partial diagnostic that cannot pass order robustness; do not silently sample.
Random arrival must never change declared event/valid chronology, authority, or
version precedence. Compare deterministic semantics only where order
independence is promised; retain different arrival histories and measure their
trajectory quality. Do not use graph density or production of one cluster as a
success metric.

## Endpoint and adjudication

- Primary endpoint:
- Exact eligible task identities:
- Numerator or statistic formula:
- Fixed denominator:
- Secondary measures:
- Severe-error classes:
- Correct abstention rule:
- Timeout rule:
- Missing-result rule:
- Tie rule:
- Aborted-run rule:
- Invalid-run rule:
- Scoring disagreement process:

Every frozen eligible task stays in the registered denominator. Missing and
timed-out results follow their frozen scoring rule. An abort retains the
denominator and makes the result non-evaluable; a safety-boundary failure
invalidates the whole run rather than disappearing from analysis. Freeze the
task pack, required evidence and counterevidence, withheld oracle, and review
rubric before any evaluated reveal. Do not tune them after observing results
under the same run identity.

## Budgets

| Budget               | Limit | Measurement method | Exhaustion behavior |
| -------------------- | ----- | ------------------ | ------------------- |
| Wall time            |       |                    |                     |
| Operator time        |       |                    |                     |
| Review time          |       |                    |                     |
| Memory               |       |                    |                     |
| Storage              |       |                    |                     |
| External processing  |       |                    |                     |
| Manual interventions |       |                    |                     |

## Boundary readiness

- [ ] Synthetic dress rehearsal passed against the same boundary shape.
- [ ] Real run root is outside checkout, Git, and cloud synchronization.
- [ ] Controller, evaluator, SUT, baseline, and future bundles are isolated.
- [ ] Network, tools, credentials, environment, home, and temporary storage are
      denied unless explicitly permitted.
- [ ] Logs contain metadata only; source text, prompts, paths, answers, and
      credentials are excluded.
- [ ] Retention, backup, restore, deletion, and whole-run purge were tested.
- [ ] Incident runbook is reachable without opening private material.
- [ ] All frozen artifacts and digests agree.

## Decision gate

- Boundary `ready` if:
- Boundary `not ready` if:
- `keep` if:
- `shrink` if:
- `stop` if:
- Zero-tolerance invalidation conditions:
- Maximum next-run scope if kept:

`Keep / shrink / stop` compares GraphTruth with the frozen baselines after
capture, setup, maintenance, and review cost; it is separate from boundary
readiness. This first run evaluates feasibility and learning value. It is not
product proof and cannot establish protocol semantics.

## Append-only deviations

Add entries; never edit or delete an earlier entry. Record time, state and step,
departure, cause, information exposed, validity impact, decision, and actor.
