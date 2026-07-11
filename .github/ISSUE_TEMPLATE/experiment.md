---
name: Experiment
about: Test a reversible, time-boxed hypothesis
title: "[Experiment] "
labels: "kind/experiment, needs-dogfood"
assignees: ""
---

<!--
An experiment may produce implementation evidence, but it must not silently
establish Zone 1 semantics. Keep it small, reversible, and time-boxed.
-->

## Hypothesis

<!-- State one falsifiable claim. -->

## Motivating evidence

<!-- Link the observation or dogfood episode and separate facts from assumptions. -->

## Smallest reversible experiment

<!-- Describe the minimum end-to-end change that can test the hypothesis. -->

## Time box

- Start:
- Stop or review by:

## Success criteria

<!-- State observable evidence that would support keeping or revising the result. -->

## Stop criteria

<!-- State when to stop early, including privacy, authority, or integrity risks. -->

## Rollback or removal plan

<!-- Explain how experimental code, data, and derived state will be removed. -->

## Affected zones

- [ ] Zone 1 — protocol or normative specification
- [ ] Zone 2 — core tooling
- [ ] Zone 3 — default runtime

Explain how zone authority boundaries remain intact:

## Outcome and decision

<!-- Complete after the time box: expected / observed / learned. -->

- Expected:
- Observed:
- Learned:
- Decision: keep / revise / remove

## Privacy confirmation

- [ ] The experiment and every committed fixture use only synthetic data.
- [ ] This issue contains no private corpus content, personal data, secrets,
      confidential logs, or external code or data.
