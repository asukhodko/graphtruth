# Summary

<!-- Describe the observable outcome of this change, not only the files changed. -->

## Motivation and evidence

<!--
Link the issue. State the real episode, risk, or invariant that motivated the
change and the evidence currently available. A proposed feature by itself is
not sufficient motivation.
-->

- Related issue:
- Expected outcome:

## Scope

### Affected zones

- [ ] Zone 1 — protocol and normative specification
- [ ] Zone 2 — core tooling and reference transformations
- [ ] Zone 3 — replaceable default runtime
- [ ] Repository process or documentation only

### Included

<!-- What is deliberately included in this PR? -->

### Not included

<!-- What remains outside this PR? -->

## Merge gates

Every answer is required. `N/A` is acceptable only with an explanation.

### 1. Motivation

What real episode, risk, or invariant requires this change?

### 2. Zone boundaries

Which zones are affected, and are normative semantics kept separate from
reference tooling and replaceable runtime behavior?

### 3. Normative rules and fixtures

Does this change require normative rules, positive and negative fixtures, or
manual conformance criteria for a review-only rule? List them, or explain why
it does not.

### 4. Canonical representation and migration

Does this change alter canonical files, their meaning, compatibility, or
versioning? If so, describe the migration and backward-reading strategy.

### 5. Authority, models, and privacy

How does the change affect authority decisions, LLM-generated candidates,
trust boundaries, or private data? Describe the safeguards.

### 6. Disposable-state recovery

Can every affected derived store or index be deleted and rebuilt from the
canonical corpus? Describe the rebuild verification, or explain why this is
not applicable.

## Verification

<!-- Include commands, fixtures, and observed results. -->

- [ ] Relevant automated checks pass locally.
- [ ] Positive and negative behavior was verified where applicable.
- [ ] Documentation and examples match the implemented behavior.
- [ ] The originating real-world or dogfood episode was re-run, or a follow-up
      issue records why that verification is still pending.

## Privacy and contribution confirmation

GraphTruth is currently pre-alpha and has no license. Until a contribution
policy and license are adopted, pull requests are limited to the project owner
and explicitly authorized collaborators. Do not contribute external code,
datasets, corpus excerpts, fixtures, or other third-party material unless it is
an explicitly reviewed, minimal vendored dependency whose license permits the
intended use and redistribution.

- [ ] I am the project owner or an explicitly authorized collaborator.
- [ ] This PR incorporates no code, data, or prose copied from an external
      project or submitted by an external contributor, except generated
      lockfile metadata or controlled vendoring declared below.
- [ ] For every vendored component, or `N/A`, the PR records the permitted
      license, exact upstream source and revision, closed imported-file
      inventory, integrity digests, and required license and notice files.
- [ ] This PR contains no secrets, credentials, personal data, confidential
      material, or private GraphTruth corpus content.
- [ ] Any committed example or fixture is synthetic and safe to publish.

### Controlled vendoring, if applicable

- Upstream source and exact revision:
- Imported-file inventory and digest record:
- License and notice files:
- Why the minimal vendored subset is necessary:

## Learning record

<!--
After dogfooding, record: what was expected, what happened, and what was
learned. A failed experiment is a valid outcome. The linked issue should remain
open until this evidence is captured.
-->

- Expected:
- Observed:
- Learned:
