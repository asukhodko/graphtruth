---
name: Design question
about: Explore a cross-cutting or hard-to-reverse design decision
title: "[Design] "
labels: "kind/design"
assignees: ""
---

<!--
Use this template to frame a decision, not to bypass the RFC process. If the
answer changes Zone 1 semantics, canonical representation, compatibility,
privacy, authority, or a hard-to-reverse dependency, the outcome requires an
RFC before implementation.

GraphTruth is pre-alpha and currently has no license. Do not paste or attach
external code, datasets, patches, corpus excerpts, private logs, or other
third-party or confidential material. Describe examples synthetically.
-->

## Decision to make

<!-- State one concrete question. -->

## Why now?

<!-- Link the observation, dogfood episode, risk, or invariant that creates it. -->

## Relevant evidence

<!-- Distinguish observed evidence from assumptions and preferences. -->

## Constraints and invariants

<!-- Include durability, file-first, privacy, authority, and rebuildability where relevant. -->

## Options under consideration

### Option A

- Description:
- Benefits:
- Costs and risks:
- Reversibility:

### Option B

- Description:
- Benefits:
- Costs and risks:
- Reversibility:

## Zone impact

- [ ] Zone 1 — protocol or normative specification
- [ ] Zone 2 — core tooling
- [ ] Zone 3 — default runtime
- [ ] Repository process only

Explain the boundaries:

## Compatibility and migration

<!-- Could this change canonical meaning or require old data to be migrated? -->

## Authority, models, and privacy

<!-- Could an LLM or heuristic gain authority? Could private data cross a boundary? -->

## Derived-state recovery

<!-- Can affected indexes and stores still be rebuilt from canonical files? -->

## Smallest reversible experiment

<!-- Prefer an experiment before standardizing a reversible implementation choice. -->

## Decision criteria

<!-- What evidence will distinguish the options? -->

## RFC requirement

- [ ] An RFC is required before implementation.
- [ ] An RFC is probably required; the experiment should clarify the decision.
- [ ] No RFC is required because the change is local and easily reversible.

Explain the choice:

## Privacy and contribution confirmation

- [ ] I have not included secrets, personal data, confidential information, or
      private GraphTruth corpus content.
- [ ] I have not pasted or attached external code, data, fixtures, patches, or
      other third-party contribution material.
- [ ] Any example included here is synthetic and contains no identifying data.
