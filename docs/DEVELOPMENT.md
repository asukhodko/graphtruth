# Development process

GraphTruth is developed through evidence from complete, real workflows. Design
principles constrain experiments, but implementation experience is allowed to
correct the emerging protocol.

> Invariants precede implementation; the normative protocol is earned through
> working experience.

This process applies to the entire monorepository. Zone boundaries are enforced
through dependencies, review, and tests; they are not a reason to split the
repository prematurely.

## Evidence-driven loop

1. Start from a real workflow or, once an executable slice exists, use
   GraphTruth in a real dogfood episode.
2. Record the observation, evidence, expected behavior, and impact in an issue.
3. Route the change as a fix, reversible experiment, or RFC.
4. Implement the smallest change that can test the hypothesis end to end.
5. Open a draft pull request early and keep evidence and decisions with it.
6. Run automated checks and perform a deliberate self-review.
7. Squash-merge a coherent, reversible change.
8. Revisit the original workflow and record **expected / observed / learned**.

A failed experiment is useful when it produces durable evidence and a clear
decision. A polished feature without dogfood evidence is not complete learning.

## Route changes deliberately

| Change | Route |
| --- | --- |
| Clear defect or violation of an existing invariant | Observation or bug issue, then a focused PR |
| Reversible uncertainty in tooling or runtime behavior | Time-boxed experiment issue, then keep, revise, or remove the result |
| New durable semantics, canonical meaning, compatibility, or governance | Concrete examples, then a Draft RFC before implementation becomes authoritative |
| Trust, privacy, security, versioning, migration, profile, extension, foundational dependency, or repository split | RFC |

An experiment may produce candidate records or implementation evidence, but it
must not silently establish Zone 1 semantics. Attractive ideas without evidence
remain experiments or backlog items.

## Branches and pull requests

- Make changes through short-lived branches and pull requests; do not commit
  directly to `main`.
- Open a draft PR as soon as its scope and first evidence are understandable.
- Keep one coherent hypothesis or change per PR. Do not use `develop`, GitFlow,
  or long-lived release branches during incubation.
- Keep commits useful while working, then use **Squash and merge** so `main`
  retains one intentional change set per PR.
- Resolve every review thread, update affected documentation, and delete the
  merged branch.
- Keep all three zones in this monorepository until observed engineering or
  governance constraints satisfy the extraction criteria in
  [the monorepo strategy](MONOREPO.md).

### Six merge gates

Every PR answers these questions. `N/A` is acceptable only with a reason.

1. Which real episode, observed failure, risk, or invariant motivates this?
2. Which architectural zones are affected, and are their authority boundaries
   preserved?
3. Does durable behavior change; if so, where are its normative rule and its
   positive and negative fixtures or explicit manual conformance criteria?
4. Does canonical representation or meaning change; if so, what are the
   compatibility, migration, and rollback paths?
5. How are authority, model-generated output, privacy, security, and disclosure
   affected?
6. Can supported disposable stores be deleted and rebuilt from the retained
   canonical corpus and declared artifacts without changing canonical meaning?

## Merge-ready is not learning-complete

A PR is **merge-ready** when its scope is coherent, the six gates are answered,
required checks pass, relevant tests and documentation are present, failures
are explicit, and the change is safe to integrate.

The motivating issue is **learning-complete** only after the change has been
used in the original real workflow and the issue records:

- what was expected;
- what was observed, including failures and surprises;
- what was learned and which follow-up, rollback, or protocol change follows.

Until then, keep the issue open and mark it `needs-dogfood`. Merge may precede
learning completion when integration is necessary to run the experiment, but
merge must never be reported as proof that the hypothesis was correct.

## Definition of done by zone

These requirements apply when a change touches the corresponding zone.

### Zone 1 — protocol and specification

- The change is motivated by concrete examples and states its invariant in
  precise normative language.
- Compatibility, versioning, extensions, unknown-field behavior, and migration
  consequences are explicit where relevant.
- Requirements are classified as machine-testable or review-only. Every
  machine-testable rule has positive and negative fixtures; a review-only rule
  states its manual conformance criteria and why automation is not sufficient.
- The specification, schemas, glossary, and accepted RFC agree; unresolved
  semantics remain explicit rather than being inferred from runtime behavior.
- Conformance can be tested independently of the default runtime.

### Zone 2 — core tooling

- Validators and transforms implement declared protocol behavior without
  inventing new semantics.
- Deterministic behavior is covered by fixtures and produces stable, actionable
  diagnostics.
- Invalid and incomplete inputs fail explicitly and safely. Unsupported protocol
  versions and unknown semantically required extensions also fail explicitly.
- Unknown optional material is preserved without reinterpretation, together
  with provenance, as required by the protocol's forward-compatibility rules.
- Local checks and CI exercise the same entry point.

### Zone 3 — default runtime

- A real end-to-end workflow demonstrates the behavior and its failure path.
- Heuristic or model output remains an attributable candidate; no confidence
  score grants acceptance or canonical authority.
- Every derived index, cache, or view the feature claims to support has a tested
  rebuild path from declared retained inputs. An unrebuildable projection is
  unsupported and must not be presented as a GraphTruth durability guarantee.
- Correction, interruption, retry, and removal do not silently corrupt or erase
  canonical history.
- Privacy boundaries, external processing, and fallback behavior are visible to
  the user.

## RFC promotion

Start a Draft RFC only after concrete examples expose a durable decision. A
Draft invites exploration and carries no authority. Accept it only when the
decision, alternatives, consequences, compatibility impact, and acceptance
criteria are reviewable and implementation is timely.

Acceptance records a decision; it does not make behavior implemented or
conforming. Promote the result into `spec/`, schemas, fixtures, tooling, and
runtime as applicable, and track implementation status separately. Keep
accepted-but-unimplemented decision debt exceptional, visible, and explicitly
prioritized. Substantive changes to an accepted decision require a superseding
RFC rather than rewriting history.

## Work in progress

Keep at most **one major hypothesis or feature in progress**. A small urgent fix
or review may coexist, but must not become a second hidden initiative. Finish,
invalidate, or deliberately pause the current learning loop before starting the
next. Use one milestone for the current roadmap stage; add a project board only
when issue volume makes it necessary.

The [operational work map](planning/README.md) decomposes that single major
path and its decision gates. It coordinates work but does not replace issues,
review, or the evidence required to mark a learning loop complete.

## Private dogfood boundary

- Keep the personal canonical corpus, credentials, raw logs, and backups outside
  the public repository.
- Commit only synthetic fixtures. When a failure originates in the private
  corpus, construct the smallest synthetic equivalent; anonymization alone is
  not a sufficient publication boundary.
- Do not place private source material in issues, PRs, CI logs, or any model or
  external service not explicitly authorized for that data class and purpose.
- Remote processing is opt-in for a named provider and purpose. Make the
  boundary visible and record the provider and relevant configuration in
  provenance where applicable.
- Never make public tests depend on access to the private corpus. A private
  dogfood failure should yield a safe minimal synthetic fixture whenever
  possible.

## Invariants and useful measures

Correctness and reversibility outrank output volume. For each supported vertical
slice, preserve these invariants:

- displayed claims trace to exact evidence, transformations, and policy;
- provenance, temporal order, association, and causation are never implicitly
  promoted into one another;
- corrections preserve attributable history;
- machine-generated proposals cannot accept themselves;
- invalid or unknown states remain visible;
- supported disposable projections rebuild from the declared retained inputs;
- backup, restore, and interrupted-write recovery do not change canonical
  meaning.

Track measures that can change a decision, initially:

- completed dogfood loops and the distinct workflows they represent;
- traceability and validation failures;
- false entity merges, false conflicts, and unsupported confident answers;
- time and success rate for correction, rebuild, backup, and restore;
- dossier usefulness: recovered context, exposed contradiction, or actionable
  question that ordinary search missed.

Record the measurement method and denominator. Do not optimize counts of nodes,
claims, embeddings, prompts, commits, or generated text as success metrics.

## Process and toolchain maintenance

Review this process at each roadmap-stage boundary and whenever repeated friction
shows that a rule is not improving a decision. Change process rules through the
same evidence, PR, and learning loop; Git history is their version record.

While development is active, review the repository toolchain at least quarterly
and before a pinned runtime or action reaches end of support. Update action SHAs,
the Node.js baseline, and locked dependencies in a focused PR. Regenerate and
review the lockfile, keep dependency lifecycle scripts disabled unless a separate
security review justifies them, and never auto-merge dependency updates without
the normal quality gate and self-review.

## One-time GitHub checklist after this process is merged

Until repository administration is automated, apply and verify these settings
manually:

- [x] Allow only **Squash merging** and enable automatic deletion of merged
      branches.
- [x] Allow pull-request branches to be updated with `main`.
- [x] Create a `main-integrity` ruleset requiring pull requests, linear history,
      and resolution of review conversations; block force pushes and deletion of
      `main`.
- [x] Require zero approvals while the project has one maintainer, but retain a
      deliberate self-review. Restrict administrator bypass to emergency
      recovery.
- [x] Add `quality-gate` and `darwin-gate`, pinned to GitHub Actions as their
      source, as required checks after both workflows have landed on `main` and
      completed successfully.
- [x] Verify GitHub secret scanning and push protection are enabled when the
      repository plan and platform support them; local pattern checks remain
      defense in depth, not proof that public history is safe.
- [x] Create the `Stage 0 — Foundation` milestone and the minimal labels:
      `kind/observation`, `kind/bug`, `kind/experiment`, `kind/design`,
      `zone/protocol`, `zone/tooling`, `zone/runtime`, `zone/repository`,
      `needs-rfc`, `needs-dogfood`, `privacy`, `breaking`, and `blocked`.
- [x] Delete the merged process branch and confirm the repository has no stale
      long-lived development branches.
