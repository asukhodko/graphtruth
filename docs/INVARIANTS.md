# Invariant map

This map connects GraphTruth's current design invariants to repository evidence
and the next missing proof. It is a non-normative status document, not a protocol
specification or a claim that the personal system is complete. Zone 3 evidence
shows only what the named experiment exercised.

Status terms are deliberately narrow:

- **Documented** — the invariant is stated, but has no portable executable proof.
- **Partly exercised** — a bounded implementation or fixture tests part of it.
- **Exercised for S0-S1** — the recorded runtime-boundary rehearsal tested the
  named behavior on its declared Darwin setup.

## Current map

| Invariant | Current mechanism and evidence | Current gap or next proof |
| --- | --- | --- |
| Epistemic authority stays explicit: assertion history, assessment, and acceptance are separate. | **Partly exercised.** [Principles](PRINCIPLES.md) and [RFC 0000](../rfcs/0000-project-foundation.md) define the separation; the S0-S1 worker retains provisional candidates without issuing acceptance decisions. | No versioned record schema, reducer, negative conformance fixture, or end-to-end `AcceptanceDecision` workflow exists. |
| Exact evidence and provenance survive extraction. | **Exercised for S0-S1.** The [runtime-boundary rehearsal](../runtime/rehearsal/observed.md) retained exact source bytes, content digests, and byte-and-line anchors in a verified hash chain. | Locator and provenance semantics remain experimental; redaction, unavailable evidence, binary sources, and migration are not specified or proven. |
| History is revised by addition and remains reconstructible at earlier horizons. | **Partly exercised.** The runtime exposes current and recorded-as-of dossiers from an anchored append-only chain and rejects canonical tampering. | General assertion revision, withdrawal, identity merge/split, valid-time semantics, late entry, and policy-time reconstruction remain unimplemented. |
| Canonical meaning does not live only in a projection. | **Exercised for S0-S1.** Projection deletion and clean rebuild preserved the recorded semantic digest; controller-only anchors protected the selected canonical history. | The vault format is a Zone 3 experiment, not a protocol format. The current digest includes the run-specific head, so it proves same-identity rebuilds but cannot compare semantics across runtime revisions. An identity-independent comparison digest, cross-version migration, independent rebuild, backup/restore, and broad end-of-life recovery remain open. |
| Future material, oracle data, credentials, network, and outside paths stay outside the worker boundary. | **Exercised for S0-S1.** The recorded Darwin Seatbelt run passed the declared boundary probe for two independent synthetic packs. | The mechanism is Darwin-only, assumes trusted stable code and input roots, excludes malicious same-UID races, and has not admitted the changed evaluated GraphTruth/SUT runtime. |
| Retry, interruption, and rebuild do not silently duplicate or rewrite meaning. | **Exercised for S0-S1.** The report covers exact redelivery, both declared process-crash points, clean rerun equivalence, and projection rebuild. | Operating-system and power-loss durability, concurrent readers, an atomic projection-generation switch, and longer replay histories are untested. |
| Controlled temporary state and child processes can be deleted without deleting retained evidence. | **Exercised for S0-S1.** Whole-run deletion, temporary-bundle cleanup, and child-process joining passed; the [owner confirmation](../runtime/rehearsal/owner-signoff.json) is bound to the exact report. | The confirmation excludes snapshots, backups, swap, physical-media erasure, uncontrolled copies, and malicious concurrent processes; no private-data deletion drill exists. |
| Experiment claims remain inside frozen information, scoring, and resource boundaries. | **Partly exercised.** The [synthetic preflight contract](../examples/experiments/preflight/README.md) is closed and mutation-tested; the [G1 evidence-contract twin](../examples/experiments/evidence-contract-twin-v1/README.md) freezes and checks a fictional eight-task denominator, Markdown plus `rg` baseline, budgets, and decision gate without binding a runtime; and the runtime-boundary rehearsal checks isolation and recovery. | The private episode, closed twin comparison, G1 seal, and full synthetic dress rehearsal are pending. Deliberate exhaustion of every admitted budget, baseline execution, scoring, and a `keep / shrink / stop` record have not run. |
| Unknown required semantics fail visibly and optional material survives compatible evolution. | **Documented.** [Architecture](ARCHITECTURE.md), [principles](PRINCIPLES.md), and RFC 0000 require preserve-or-refuse behavior and explicit versions. | No normative [specification](../spec/README.md), maintained [schemas](../schemas/README.md), unknown-extension fixtures, migrations, or independent reader exist. |

## Maintenance rule

Update a row only with linkable evidence. A passing Zone 3 test may narrow a gap,
but it does not make runtime behavior normative. Promotion into portable protocol
behavior requires the applicable RFC or specification text, machine-checkable
fixtures where possible, and independent conformance evidence where the roadmap
requires it.
