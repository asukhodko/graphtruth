# Review rubric template

> **Use:** Copy into the private run root and freeze it with the task pack and
> oracle before evaluated reveals.
>
> **Authority:** Non-normative Zone 3 experiment evaluation.

## Evaluation claim

- Run identity:
- Decision supported by this review:
- Primary endpoint and denominator:
- Objective ground truth available:
- Human judgment required:
- Utility judgment required:
- Known blind spots:

Separate objective facts from reviewer interpretation and practical usefulness.
Fluent output, confidence, or agreement with an expected answer is not evidence
unless the required source support is present.

## Frozen task definition

For every task record privately:

- opaque task identity and real-work trigger;
- question and allowed interpretation;
- corpus horizon and earliest answerable step;
- allowed source visibility, tools, assistance, and time;
- required answer elements;
- required evidence and counterevidence;
- acceptable uncertainty or abstention;
- withheld oracle references;
- severe errors and scoring rule;
- reviewer prior knowledge.

Do not rewrite tasks, oracle, thresholds, or required citations after seeing a
result. A corrected evaluation design creates a new run identity.

## Per-task scoring

| Dimension | Pass | Partial | Fail |
| --- | --- | --- | --- |
| Answer correctness | All required elements are supported | Useful but incomplete or partly uncertain | Materially wrong or unsupported |
| Evidence traceability | Exact permitted evidence and provenance | Evidence is relevant but imprecise | Missing, future, fabricated, or inaccessible evidence |
| Counterevidence | Material conflict is surfaced | Conflict is mentioned incompletely | Conflict is hidden or resolved without authority |
| Temporal validity | Answer matches the declared horizon | Minor ambiguity without changed outcome | Future information or wrong horizon changes answer |
| Uncertainty | Calibrated limitation or correct abstention | Limitation is incomplete | Unsupported confidence or harmful abstention |
| Contextual usefulness | Dossier supports the real decision | Some useful context, material reconstruction remains | Output obstructs or misleads the decision |

Record time to first usable answer, attempts, corrections, reviewer time, and
near misses. Preserve the raw judgment before resolving scorer disagreement.

## Severe errors

Freeze the applicable list and consequences before the run. At minimum consider:

- future-reveal or oracle leakage;
- fabricated, misattributed, or unverifiable evidence;
- incorrect entity merge that changes the answer;
- hidden contradiction or invalid temporal state;
- unsupported causal claim;
- disclosure outside the approved data boundary;
- confident answer where abstention was required.

State which errors invalidate one task, one arm, or the entire run.

## Honest baseline

Compare against both the ordinary current workflow and, where useful, a minimal
files-plus-search workflow. Each arm receives comparable source horizon, time,
tools, and assistance.

Record separately:

- setup and learning time;
- capture, annotation, correction, and maintenance labor;
- search and answer time;
- review and verification time;
- context switches and parallel notes;
- baseline wins, ties, correct abstentions, and failures;
- information or structure supplied to only one arm.

Treat GraphTruth-only manual work as capture tax or grant the baseline an
equivalent budget. Do not subtract labor because it may become automated later.

## Human leakage and bias

- Role overlaps:
- Prior familiarity per task:
- Which exposure counted as primary:
- Scorer blinding, if any:
- Task or corpus selection bias:
- Order and learning effects:
- Disagreement resolution:

When the same person curates, operates, answers, and scores, label the comparison
exploratory. It can expose failures and workflow cost, but it cannot establish
superiority.

## Result

- Primary endpoint result with denominator:
- Severe errors:
- Capture tax:
- Baseline wins and ties:
- Missing, timed-out, aborted, or invalid tasks:
- Expected:
- Observed:
- Learned:
- Decision: `keep` / `shrink` / `stop`
- Scope permitted for the next run:

The first run is evidence about feasibility on one corpus, not proof of product
value, generality, or normative semantics.
