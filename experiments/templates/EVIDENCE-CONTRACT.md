# Private evidence-contract freeze guide

> **Status:** Stopped Issue #6 design. It authorizes no private read, seal,
> review, retry, receipt, or successor. A future private dogfood attempt must
> explicitly supersede it under a new issue and identity.
>
> **Historical use:** This guide was prepared to close GraphTruth gate G1. Keep
> private values out of this repository, issues, pull requests, CI, Obsidian,
> logs, and every processor not explicitly authorized in the completed
> data-handling plan.
>
> **Authority:** Non-normative Zone 3 experiment control. This guide freezes
> evidence and evaluation; it neither defines GraphTruth protocol semantics nor
> admits a runtime to private data.

## What G1 proves

G1 closes the evidence contract against which the first private experiment may
later run. It freezes:

- one eligible, authorized real-work episode;
- three to five immutable Markdown sources and their reveal chronology;
- a closed task denominator `T >= 8` and withheld oracle;
- baseline exposure, scoring, budgets, severe errors, and the decision gate;
- data handling, retention, deletion, and incident policy;
- a publication-safe synthetic twin fixed before private episode access;
- an exact all-and-only inventory and a non-circular private seal;
- an owner review, one fresh private Codex call, and the owner's final
  acceptance of the sealed contract.

The Codex review is approved external model processing by OpenAI. It is not an
independent human review and must never be described as one.

G1 does not implement or admit the evaluated GraphTruth/SUT runtime. It freezes
no executable GraphTruth identity, performs no baseline or GraphTruth task,
scores no result, and reveals no private byte to a system under test.
M2 separately binds the exact deterministic, no-LLM runtime, configuration,
environment, sandbox, rehearsals, and final run card before private admission.

## Threat and trust boundary

The G1 review uses an exact zero-tool `codex exec` command. Shell and unified
execution, code, agents, MCP, apps, plugins, browser, and web capabilities are
disabled. The stock `update_plan`, `apply_patch`, and `view_image` entries remain
visible but are not authorized. Any tool event rejects the attempt. Model-tool
filesystem access is default-deny except for the public-schema input, and
model-tool networking is denied. Those permissions do not sandbox the Codex
client or controller process itself. Their host filesystem access, same-UID
processes, Keychain, local IPC, macOS, the pinned Codex CLI and model, platform
and system instructions, and OpenAI's processing boundary remain trusted. This
is not a container, virtual machine, or defence against a compromised host.

The data-handling plan must identify every sensitive data class and location
that must stay outside the model workspace, including sibling projects, future
bundles, oracle-only material, credentials, synchronization, and backups. The
native route does not prove isolation from arbitrary same-UID paths. It instead
keeps the private attempt copy out of the model filesystem and passes its
content only through the authorized standard-input envelope. Use a separately
qualified stronger boundary if that trust model is insufficient.

Encryption at rest is optional unless the data authority, applicable policy,
backup design, or the declared threat model requires it. Owner-only filesystem
permissions remain mandatory. If encryption is required, record and verify the
chosen mechanism without weakening any other control below.

Before private review, the owner must explicitly authorize sending every
affected data class to OpenAI and record applicable account, retention,
training-use, jurisdiction, and deletion assumptions. If that authorization is
missing or uncertain, G1 stops. A local sandbox cannot turn remote model
processing into local-only processing.

## Work budget and immediate stop rules

The canonical Issue #6 ledger is maintained in the
[roadmap](../../docs/ROADMAP.md). Issue #6 stopped at 4/5 repo-active dates:
2026-07-12, 2026-07-13, 2026-07-14, and 2026-07-21. Its remaining nominal day
and 2026-07-26 calendar window are closed and cannot be reused. Any future
private successor requires a newly frozen budget and stop gate.

Stop and reject the current candidate immediately if any of these occurs:

- a future source byte, filename, item count, oracle fact, hidden task label, or
  first-exposure answer becomes visible before its frozen horizon;
- an honest baseline cannot receive the same source horizon, tools, assistance,
  time, query budget, answer format, and first-exposure conditions as the SUT;
- rights or explicit OpenAI-processing authorization are absent or uncertain;
- the fixed public twin is privately derived, the all-and-only inventory or lock
  drifts, a model tool event occurs, or required cleanup cannot be verified;
- a baseline or GraphTruth task is evaluated during G1;
- the repo-active-date decision point or calendar hard stop is reached without
  the required owner decision.

Do not reinterpret such a violation as a poor score or repair the sealed
candidate in place. Preserve the permitted incident evidence, decide whether a
smaller fair contract remains possible, and either rebuild under a new contract
identity or stop.

## Required private layout

Use neutral local names outside the repository checkout, Git worktrees, cloud
synchronization, editor indexing, and automatic publication paths:

- `PACK`: immutable G1 source and contract material covered by the lock;
- `WORK`: mutable review output and later M2 state, excluded from the G1 lock;
- `ANCHOR`: lock anchor, preflight evidence, review identity, and owner final
  acceptance, outside the lock inventory.

The persistent common `ANCHOR` contains the external lock record, preserved
attempt evidence, and the final owner record. Do not pass it directly to the
review command. For each attempt, create fresh review, attempt-anchor,
authorization, and state staging as strict canonical descendants of
`realpath(os.tmpdir())`. Copy the sealed `PACK` byte for byte into the review
root's read-only `input`, verify that copy against the externally anchored lock
identity, and keep the persistent original outside staging. Every staging path
is new and never reused. Both copies remain controller-only. The ephemeral
model workspace contains only the byte-exact public result schema; the
controller sends the complete private envelope through standard input and
writes validated results outside the model workspace. After the attempt,
preserve only the required evidence under the persistent common `ANCHOR`, then
remove and verify removal of all staging.

The persistent private locations and all staging must be owned by the experiment
owner, have no group or other access, no ACL that widens access, and no symlink
or nested mount that can escape the intended root. `PACK` becomes read-only
before review. An encrypted volume may contain the persistent areas, but it is
not required unless authority, policy, backup design, or the threat model
requires it.

The completed `PACK` contains:

- the immutable source snapshot, manifest, lineage, and source-state ledger;
- the knowledge boundary, reveal order, and isolated future-material record;
- the exact task pack and withheld oracle;
- the completed [G1 evidence-contract record](G1-EVIDENCE-CONTRACT.md);
- the completed [corpus-selection record](CORPUS-SELECTION.md);
- the completed [review rubric](REVIEW-RUBRIC.md);
- the completed [data-handling plan](DATA-HANDLING.md);
- the completed [incident runbook](INCIDENT-RUNBOOK.md);
- the completed private review-control record plus byte-exact copies of the
  fixed public Codex review prompt and structured output schema;
- a byte-for-byte snapshot of every regular Git blob below
  `examples/experiments/evidence-contract-twin-v1/` at commit
  `234bf9edc7a67cb3f1847e6d60cfe05ddbd13a01`, including its
  `pack-lock.json` manifest;
- the owner's completed pre-seal comparison with that snapshot;
- `artifact-roles.json` covering all and only immutable G1 files;
- any additional immutable G1 input named in that role map.

Outside the fixed public-twin snapshot subtree, do not include mutable logs,
review output, the external anchor, public receipt, M2 code, configuration,
environment, rehearsal evidence, run card, reveal bundles, or later reports.
The snapshot still includes every blob from the fixed Git tree even when a blob
has one of those names. The lock itself is a direct child of `PACK` and is
excluded from its own inventory.

`artifact-roles.json` uses format
`graphtruth.private-g1-artifact-roles/1`. Every entry contains only `path` and
`role`; its inventory includes the role map itself and excludes the future lock.
Follow the exact path, role, ownership, link, metadata, and canonicalization
rules documented for
[`private-pack-lock`](../../tooling/README.md#private-g1-pack-lock).

## Non-derivation and exposure rules

The publication-safe synthetic twin must already exist before the owner opens
the selected private episode. It may share only predeclared task and failure
classes. Do not copy, paraphrase, translate, hash, count, or encode private
content into the twin. A discovered private detail cannot be repaired by
silently changing the twin, task denominator, oracle, thresholds, or selection
rules.

The only admitted twin identity is the complete tree at Git commit
`234bf9edc7a67cb3f1847e6d60cfe05ddbd13a01` under
`examples/experiments/evidence-contract-twin-v1/`. Before private comparison,
copy every regular blob from that tree into a dedicated subtree of `PACK`
without newline, encoding, metadata, or content conversion. Record a closed
snapshot manifest containing the full commit, source path, every relative path,
raw byte length, and SHA-256, including `pack-lock.json`. Verify the embedded
lock and all initial mutable-file hashes, then include the snapshot, manifest,
and role-map entries in the private all-and-only lock. An incomplete tree,
checkout-relative copy, regenerated twin, or byte mismatch is a rejection.

The owner compares that fixed snapshot with the private episode before sealing
and records `safe` or `reject` inside `PACK`. After the seal, the controller
includes that same snapshot, private episode, and owner comparison in the
complete standard-input envelope for Codex to check. Codex never reads `PACK`,
a live checkout, or a twin reconstructed from private material.

No evaluated task may run during G1. The fresh Codex process is a contract
reviewer only. It must not act as GraphTruth, a baseline, an evaluator of run
outputs, or a source of observed metrics. Its instructions must reject requests
to execute a reveal, answer the frozen tasks, or produce an experiment result.

If a sealed candidate is rejected, keep the rejection record privately. A
material correction creates a fresh candidate, contract identity, lock,
preflight, and Codex review. Never edit a sealed candidate in place or choose
among attempts using an evaluated result.

## Native Codex review boundary

The review uses
[`tooling/codex-g1-review`](../../tooling/codex-g1-review), which runs one fresh,
non-resumable private `codex exec` invocation after a local post-seal
identity-and-config preflight. That preflight makes no OpenAI call and does not
claim to re-exercise the model boundary. Do not reuse a chat,
session, memory, instruction file, tool configuration, state root, attempt
directory, or result from another task. The command must:

- require review, attempt-anchor, authorization, and state staging to be strict
  canonical descendants of `realpath(os.tmpdir())`, separate from the
  persistent private `PACK` and common `ANCHOR`;
- keep the sealed attempt-local `PACK` copy controller-only and create an
  ephemeral model workspace containing only the byte-exact public result
  schema;
- deny model-tool filesystem access at `:root`, reopen only the neutral
  workspace's public-schema `input` for reading, deny model-tool network access,
  and record the broader trusted Codex-client and system scope;
- verify the attempt copy's sealed pack lock twice: before constructing the
  private review envelope and after the model call;
- require the complete sealed inventory, decode every artifact as strict UTF-8,
  reject more than 256 artifacts, and include every artifact without truncation
  or summary;
- construct one standard-input envelope consisting of the byte-exact fixed
  public prompt and a canonical JSON bundle, rejecting a total above 1 MiB
  (1,048,576 bytes);
- treat the fixed prompt as the sole task-specific instruction from `PACK`;
  platform and system instructions and the pinned CLI and model are trusted;
- disable shell and unified execution, code, agents, MCP, apps, plugins,
  browser, web, and all other tool-capable features; keep any residual stock
  `update_plan`, `apply_patch`, and `view_image` entries inert through the
  filesystem and network denial;
- accept only the exact declared JSONL event trace and reject every tool event,
  unexpected event, extra output, interactive approval, resumable session, or
  instruction-source drift;
- persist the exact accepted trace bytes in the private attempt anchor and bind
  their SHA-256 and byte length in the run record;
- validate the owner-only authentication carrier, use one disposable state root
  containing separate `CODEX_HOME`, `HOME`, and `TMPDIR` directories for the
  one private model call, require the spawned process group to disappear, then
  remove the complete root and verify its absence;
- pass private bytes only through standard input, never through arguments,
  process titles, environment variables, shell history, or diagnostics;
- validate the structured decision against the fixed schema and controller
  semantics, then write the result itself;
- pin the Codex CLI binary, version, model, command shape, permission profile,
  prompt, output schema, and controller identities.

The Codex client itself may contact OpenAI only as required for the explicitly
authorized review. It does not authorize a model-invoked command, remote-link
fetch, or any other tool event.

The retained public
[`tooling/codex-sandbox-preflight`](../../tooling/codex-sandbox-preflight)
qualification exercises the exact zero-tool model command and allowed JSONL
trace on synthetic input. Before reading the sealed control or artifacts, the
private controller requires that exact checked-in report and its pinned
preflight wrapper and module identities. It cannot be reused as run-specific
evidence. After seal, `tooling/codex-g1-review` writes a fresh
identity-and-config report to the attempt staging directory before private
model access. That report checks the pinned
CLI, permission profile, command shape, controller, platform, and user without
contacting OpenAI. The review controller separately checks the templates,
canonical staging boundaries, authorization carrier, clean environment, and
sealed attempt copy. The full-deny profile cannot run even an inline shell
probe, so this report is not a synthetic or boundary rehearsal. The retained
public model qualification remains the evidence for filesystem, network, and
zero-tool behavior. Any missing check or identity or configuration drift
rejects the attempt; never weaken a rule during an attempt.

If the threat model requires isolation from the Codex client, same-UID
processes, Keychain, local IPC, or the host filesystem, this native profile is
insufficient.
Stop or use a separately qualified stronger operating-system boundary. Docker
is a possible fallback only after such qualification; it is not selected
automatically and does not fix a pack that exceeds the 1 MiB review envelope.

The retained model qualification and run-specific identity-and-config report
are G1 review controls only. They do not satisfy M2's separate deterministic
runtime sandbox or full synthetic dress rehearsal.

## Freeze procedure

1. **Choose one eligible episode.** Record the original candidate population,
   frozen inclusion and replacement rules, real decision, three-to-five-source
   bound, and why the experiment may change work. Reject a convenient but
   ineligible episode rather than expanding the claim.
2. **Confirm rights and external processing.** Complete the data-handling plan
   before Codex receives any private byte. The owner must specifically
   authorize OpenAI processing for every affected data class and accept the
   recorded provider-retention boundary. General access to a document is not
   enough.
3. **Prepare the private root.** Create `PACK`, `WORK`, and `ANCHOR` with the
   declared owner-only policy outside checkout, synchronization, indexing, and
   unintended backups. Apply encryption if the recorded threat or authority
   requires it.
4. **Freeze sources and chronology.** Preserve exact source bytes, provenance,
   versions, lineage, availability, reveal order, future isolation, and the
   terminal knowledge boundary. Do not infer event time from file order.
5. **Close tasks and oracle.** Freeze `T >= 8`, including early-answerable,
   pre-evidence abstention, correction-after-counterevidence, and
   terminal-unresolved cases. Give each task one horizon-bound oracle judgment
   and fixed missing, timeout, abstention, severe-error, and invalidation rules.
6. **Freeze fair baselines and decisions.** Bind source visibility, first
   exposure, tools, assistance, time, query budget, answer format, review,
   capture tax, scoring, and `keep` / `shrink` / `stop` thresholds before any
   evaluated output exists.
7. **Complete the owner non-derivation comparison.** Copy and verify the exact
   public-twin Git tree and closed snapshot manifest described above. The owner
   compares those fixed bytes with the private candidate and records `safe` or
   `reject` before the seal. Any private derivation, missing blob, or byte
   mismatch rejects the twin and candidate.
8. **Complete the G1 records.** Fill every G1 field in the required templates.
   Keep exact runtime code, dependencies, environment, runtime sandbox,
   rehearsal, restore, purge evidence, run card, and private admission marked
   `Pending M2`.
9. **Owner pre-seal review.** The owner checks eligibility, rights, closed
   denominator, oracle withholding, fair exposure, frozen budgets, claim
   limits, incident rules, all-and-only role map, and absence of evaluated
   output. Set the candidate to `final-for-seal`, never `frozen`.
10. **Freeze the review control.** Copy the fixed public review prompt and
    schema byte for byte, complete the machine-readable review-control record,
    and bind the admitted CLI, model, permission profile, public qualification,
    and explicit OpenAI-processing authorization inside `PACK`. The actual
    run-specific identity-and-config report, review trace, result, cleanup
    evidence, and run record are created only after seal. Record their
    requirements here, never future outcomes.
11. **Create the non-circular seal.** Run the pinned owner-only lock wrapper in
    its documented empty environment. Verify the resulting lock immediately.
    Record contract identity, algorithm, lock digest, byte length, tool
    identity, and freeze time in `ANCHOR`, outside `PACK`. Make `PACK` read-only
    and do not mutate it after this point. Keep this persistent `PACK` and common
    `ANCHOR` outside the repository and synchronization roots.
12. **Run the fail-closed isolated review.** Create fresh review,
    attempt-anchor, and authorization staging as strict canonical descendants
    of `realpath(os.tmpdir())`. Copy the sealed pack byte for byte into
    `review/input`, make that tree read-only, create empty `review/output`, and
    verify the copy against the external lock anchor. Then invoke
    `tooling/codex-g1-review` with the explicit authorization confirmation. The
    command creates only its disposable state and neutral model workspace, runs
    and archives a local identity-and-config preflight with no OpenAI call, and
    verifies the attempt copy's pack lock. It reads every artifact as strict
    UTF-8 and builds the complete fixed-prompt plus canonical JSON envelope,
    rejecting more than 256 artifacts or more than 1 MiB instead of truncating
    or summarizing. The model workspace contains only the byte-exact public
    result schema. One fresh disposable state root supports one private Codex
    call. Require the exact allowed JSONL trace, no tool event, and a structured
    `accept` or `reject`. Codex checks the sealed public-twin snapshot and
    owner's pre-seal non-derivation result. The controller verifies the
    unchanged lock a second time after the call, validates and writes the
    result, and binds the preflight, trace, cleanup, controller, contract, and
    lock in the attempt record.
13. **Verify immutability again.** After every outcome of the private model
    call, the review command completes its second lock verification before
    accepting the result. The owner reruns the owner-only verifier against the
    persistent sealed pack after the process exits. A changed or unverifiable
    pack rejects the attempt. A technically interrupted attempt may contain
    only the artifacts completed before the failure and has no successful
    review-run record. Preserve the available evidence and an owner incident
    record under the common `ANCHOR`; remove all staging and never reuse it.
14. **Owner final acceptance.** The owner inspects the exact sealed pack, the
    identity-and-config report, allowed JSONL trace, validated Codex result,
    cleanup evidence, and run record. Only an `accept` result permits the owner
    to record final `accept`; the owner may still reject. Bind the final decision
    to the lock identity and a digest of the review result in `ANCHOR`. This
    later owner record, not the sealed requirements or Codex alone, closes G1.
15. **Publish only the v2 receipt.** Create the fixed allowlisted receipt from
    [the public template](PUBLIC-G1-RECEIPT.json), validate it, and copy only
    that reviewed file to
    `experiments/receipts/g1-evidence-contract-v2.json`. It must contain no
    private path, name, identifier, exact count, digest, task, oracle, excerpt,
    failure detail, model output, or correlation handle.

## Review output and owner decision

The isolated Codex review must check, without running the experiment:

- internal consistency and completeness of every sealed G1 record;
- rights and explicit OpenAI-processing authorization;
- closed source and task bounds, chronology, oracle isolation, and fair
  first-exposure plan;
- frozen budgets, scoring, severe errors, decision thresholds, and claim limits;
- consistency of data handling and incident response;
- completeness and byte identity of the sealed public-twin snapshot, followed
  by a separate model check of the owner's pre-seal non-derivation result;
- exact `Pending M2` boundaries and absence of runtime-admission claims;
- consistency between the role map, seal identity, and reviewed artifact set.

Codex may return `accept` only when every required check passes. Any uncertainty
about rights, missing artifact, contradiction, unclosed choice, private
derivation, overclaim, runtime execution, or boundary failure returns `reject`.
The owner cannot turn a Codex `reject` into acceptance; the attempt must be
rebuilt and reviewed afresh or stopped.

The owner's final record states:

- exact private contract and lock identity;
- exact post-seal identity-and-config preflight identity;
- exact allowed JSONL trace identity and confirmation that it contained no tool
  event;
- exact fresh Codex review-result identity;
- exact private review-run record identity and confirmation that the complete
  disposable state root containing `CODEX_HOME`, `HOME`, and `TMPDIR` was
  deleted;
- confirmation that the fresh isolated Codex result is `accept`;
- confirmation that OpenAI processing was specifically authorized;
- confirmation that no evaluated run occurred;
- confirmation that no contract-private material was published;
- `accept` or `reject`, actor, and time.

There is deliberately no independent-human-review claim.

## Public receipt boundary

The v2 receipt attests only to the coarse G1 controls encoded in its fixed
schema. The owner must verify every `true` statement, require
`runSpecificPostSealIdentityAndConfigPreflightPassed: true` only for the fresh
attempt after seal and only for its local identity-and-config preflight, require
`freshIsolatedCodexReviewAccepted: true` and
`privateReviewCompletedWithoutToolCalls: true`, and preserve
`independentHumanReview: false`. `trustBasis` is exactly
`owner-and-fresh-isolated-codex-review`.

The receipt acknowledges authorized OpenAI processing while asserting that no
contract-private material was published. It does not claim that OpenAI never
received the material, that provider-side copies were immediately deleted, or
that a human independently reviewed it. It does not admit a GraphTruth runtime,
report a result, or establish usefulness.

If the repository gate rejects the candidate receipt, remove the uncommitted
public copy, correct the private candidate under owner control, review it again,
and publish a new file only after every statement is true. Never repair an
attested receipt in place.

## Stop and invalidation conditions

Stop or mark the attempt invalid if:

- source rights, purpose, retention, deletion, or OpenAI-processing authority
  is absent or ambiguous;
- private material reaches Git, GitHub, CI, Obsidian, synchronization, an
  unauthorized processor, or a public artifact;
- the post-seal identity-and-config preflight fails, is incomplete, contacts
  OpenAI, or does not match the private review identity;
- review, anchor, authorization, or state staging is not a strict canonical
  descendant of `realpath(os.tmpdir())`, or overlaps a persistent private root;
- the pack is not entirely strict UTF-8, exceeds 256 artifacts, or cannot fit
  complete in the 1 MiB fixed-prompt plus canonical-JSON envelope;
- the Codex trace contains any tool event or any event outside the exact
  allowlist, inherits unapproved state, persists a resumable session, or leaves
  the disposable state root or any `CODEX_HOME`, `HOME`, or `TMPDIR` content
  behind;
- the Codex review rejects or fails to bind its result to the sealed pack;
- the owner cannot verify the seal, review output, or final receipt;
- the public-twin snapshot is incomplete, differs from the fixed Git commit or
  manifest, or the twin was created or changed from private material;
- the source bound, task denominator, oracle, baseline, budget, scoring, or
  decision rule remains open or changes after relevant output is known;
- the exact inventory cannot be closed or the non-circular anchor cannot be
  verified;
- any baseline, GraphTruth lane, scored task, or private reveal runs before M2
  closes its separate admission gate.

A rejected attempt remains in the private selection and incident history. It
cannot disappear from the denominator or be relabelled as a rehearsal after an
unfavourable observation.
