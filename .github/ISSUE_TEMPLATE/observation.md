---
name: Observation or problem
about: Record evidence from real use before proposing a solution
title: "[Observation] "
labels: "kind/observation, needs-dogfood"
assignees: ""
---

<!--
GraphTruth is pre-alpha and currently has no license. Ideas and observations
are welcome, but do not paste or attach external code, datasets, patches,
corpus excerpts, private logs, or other third-party or confidential material.
Use synthetic descriptions; do not publish a merely redacted private case.
-->

## What were you trying to do?

<!-- Describe the real task and relevant context. -->

## What did you observe?

<!-- Describe what happened without jumping to a proposed implementation. -->

## Why is this a problem?

<!-- Explain the cost, risk, lost capability, or violated invariant. -->

## Evidence

<!--
Provide reproducible, synthetic evidence when possible. Link only public
material that is safe and lawful to share. Do not include corpus contents,
credentials, personal data, or confidential logs.
-->

## Expected outcome

<!-- What observable result would demonstrate that the problem is addressed? -->

## Reproduction or dogfood journey

<!-- List the smallest safe sequence that exposes the observation. -->

1.
2.
3.

## Fixture feasibility

- [ ] A fully synthetic public fixture can represent this case.
- [ ] A synthetic fixture can be constructed by abstracting the private case.
- [ ] No safe public fixture is currently possible.

Explain the choice:

## Possible zone impact

<!-- This is a hypothesis, not a binding design decision. -->

- [ ] Zone 1 — protocol or normative semantics
- [ ] Zone 2 — core tooling
- [ ] Zone 3 — default runtime
- [ ] Unknown

## Privacy and contribution confirmation

- [ ] I have not included secrets, personal data, confidential information, or
      private GraphTruth corpus content.
- [ ] I have not pasted or attached external code, data, fixtures, patches, or
      other third-party contribution material.
- [ ] Any example included here is synthetic and contains no identifying data.

## Additional hypotheses

<!-- Optional. Keep proposed causes and solutions separate from observations. -->
