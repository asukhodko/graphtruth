# Failure diary template

> **Use:** Copy into the private run root before execution. Append events as they
> occur; never rewrite the diary into a cleaner story.
>
> **Authority:** Non-normative Zone 3 experiment evidence.

The diary preserves friction that a polished final dossier tends to erase. It
records system failures, human burden, near misses, baseline wins, workarounds,
abandoned capture, and unexpected success. It is not a source-content log.

Keep entries metadata-only: no source text, filenames, paths, prompts, answers,
credentials, personal identifiers, or oracle material. Reference private opaque
identities instead.

## Entry template

Append one section per event. Do not edit or delete earlier entries; append a
correction that references the prior entry.

### Event reference

- Observed time:
- Observer role:
- Run state and opaque step:
- Arm: GraphTruth / current workflow / files-plus-search / controller
- Event class: failure / friction / near miss / baseline win / surprise /
  deviation / privacy / recovery
- Observation:
- Expected behavior:
- User or decision impact:
- Detection method:
- Workaround or intervention:
- Operator and review time:
- Capture tax added:
- Information exposed or asymmetry introduced:
- Privacy classification, without sensitive detail:
- Validity impact:
- Follow-up reference:
- Immediate decision: continue / pause / abort / invalidate
- Decision actor:

## Events that must be recorded

- retry, timeout, crash, interrupted write, failed resume, or stale projection;
- manual correction, annotation, deduplication, reconciliation, or re-entry;
- unsupported confident answer, false merge, missed contradiction, or hidden
  counterevidence;
- review fatigue, context switch, deferred capture, abandoned capture, or a
  parallel note used to compensate for the system;
- any baseline result that is faster, safer, clearer, or more accurate;
- a budget approaching or reaching its limit;
- any departure from the frozen run card, even if it appears harmless;
- any suspected privacy, future-reveal, sandbox, or logging boundary failure.

Privacy and reveal-boundary events trigger the
[incident runbook](INCIDENT-RUNBOOK.md); the diary alone is not containment.

## End-of-run summary

Summarize without deleting or consolidating original entries:

- Event counts by class and denominator:
- Repeated friction:
- Total capture tax:
- Total workaround and review time:
- Baseline wins and near misses:
- Aborted or invalid portions:
- Failures converted to synthetic regressions:
- Expected:
- Observed:
- Learned:
- Decision: `keep` / `shrink` / `stop`
- Smallest justified next change:

Do not turn counts of output, claims, nodes, prompts, or generated text into
success metrics. The decision should follow impact, correctness, reversibility,
privacy, and total human cost.
