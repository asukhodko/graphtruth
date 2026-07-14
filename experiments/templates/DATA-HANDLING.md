# Data-handling plan template

> **Use:** Copy into the private run root. Record references, not source content,
> personal data, secrets, answers, paths, or digests in the public template.
>
> **Authority:** Non-normative Zone 3 experiment control.

## Authority and purpose

- G1 evidence-contract identity:
- Later M2 run identity: `Pending M2`
- Data owner or controlling authority:
- Evidence of the right to store and process each source class:
- Approved experiment purpose:
- Prohibited uses:
- Approved actors and roles:
- Approved processors, models, and jurisdictions:
- OpenAI-processing authorization actor, scope, and time:
- OpenAI account, service, retention, training-use, and deletion boundary:
- Required notices, agreements, or consent:

Authorization to read a document does not automatically authorize copying it,
publishing derived text, sending it to a model, retaining prompts, or using it
for a new purpose.

## Data inventory

For each class, record sensitivity, purpose, allowed actors, allowed processing,
retention, and disposal procedure. At G1, source, contract, retained public
qualification, attempt identity-and-config preflight, Codex review-input,
review-prompt, model-response, and owner-decision classes exist. Runtime-derived
classes remain `Pending M2` and must not be claimed as created:

- source snapshot;
- manifest and reveal order;
- task pack and oracle;
- canonical experiment records;
- fixed public-twin byte snapshot and its closed manifest;
- retained public synthetic zero-tool qualification report;
- generated post-seal identity-and-config report;
- isolated Codex review prompt and response;
- owner final-accept record;
- indexes and caches;
- model prompts and responses from a separately gated successor, if ever
  authorized; these are not part of deterministic, no-LLM M2;
- logs and metrics;
- reports and backups.

Classify filenames, directory names, timestamps, source ancestry, counts, and
existence as data. They can disclose answers even without source bytes.

## Physical storage boundary

- Private root location class:
- Sealed G1 pack boundary:
- Mutable M2 work boundary:
- External lock-anchor boundary and protection:
- Confirmation that it is outside checkout and Git worktrees:
- Confirmation that it is outside cloud synchronization:
- Access-control mechanism:
- Encryption at rest: required mechanism / justified `not required`:
- Encryption in transit, if any:
- Backup boundary and access:
- Host and removable-media restrictions:
- Fresh isolated Codex standard-input path and controller-owned output:

`.gitignore` is not a security boundary. Private run material must never enter
Git history, repository attachments, issues, pull requests, CI, public artifact
stores, or an editor or assistant service that is not explicitly approved. The
fresh G1 Codex reviewer is an approved external processor only for the exact
classes and purpose recorded above; that exception does not authorize another
assistant, session, tool, or later runtime.

## G1 isolated Codex review boundary

These controls belong to the G1 review boundary. Preconditions are exercised
before private access; result validation, state cleanup, and the final
unchanged-pack check occur after the model call. They are not `Pending M2` and
do not admit a GraphTruth runtime:

- Pinned Codex CLI binary, version, model, and command identity:
- Native permission-profile identity:
- Persistent controller-only sealed-pack logical label and location class;
  physical path retained only in the common `ANCHOR` and never inside `PACK`:
- Attempt-local byte-exact sealed-pack copy, external lock-anchor comparison,
  read-only modes, and verified removal:
- Complete strict-UTF-8 inventory; at most 256 artifacts; fixed-prompt plus
  canonical-JSON standard-input envelope at most 1 MiB (1,048,576 bytes); no
  truncation or summary:
- Ephemeral model workspace containing only the byte-exact public result schema:
- Trusted Codex-client and controller host-filesystem access and its accepted
  consequences:
- Deny-root model-tool profile, sole public-schema read exception, and rule that
  no private path enters model arguments or workspace:
- Shell environment inheritance and credential isolation:
- Fresh review, attempt-anchor, authorization, and state staging as strict
  canonical descendants of `realpath(os.tmpdir())`, separate from persistent
  `PACK` and common `ANCHOR`:
- Owner-only authentication carrier; one disposable state root with separate
  `CODEX_HOME`, `HOME`, and `TMPDIR` directories; required full-root cleanup;
  discoverable-instruction exclusion; exact fixed review-prompt identity:
- Trusted same-UID process, Keychain, and local IPC scope and consequences:
- Disabled shell and unified execution, code, agents, MCP, apps, plugins,
  browser, web, and other tool-capable features; inert stock `update_plan`,
  `apply_patch`, and `view_image`; reject-any-tool-event rule:
- Exact allowed JSONL event trace:
- Ephemeral-session, disabled user-config, fixed public prompt as the sole
  task-specific `PACK` instruction, and trusted platform/system instruction
  policy:
- Structured review-output schema:
- Retained public `tooling/codex-sandbox-preflight` zero-tool model
  qualification identity:
- Planned post-seal identity-and-config preflight with no OpenAI call; statement
  that it does not re-establish the model boundary:
- Exactly two sealed-lock verifications: before private-envelope construction
  and after the model call:
- Controller validation and write rule for the structured result:
- Rule rejecting any identity or configuration drift before private review:
- Separately qualified Docker fallback condition, or `not selected`; statement
  that Docker is not automatic and does not solve the 1 MiB envelope limit:

This sealed plan records requirements, not future results. After seal, the
controller writes the actual identity-and-config report, JSONL trace, validated
result, review-run record, and cleanup confirmations. The owner preserves and
cites them in the final acceptance or incident record; this file remains
unchanged.

The Codex client may communicate with OpenAI only for the specifically
authorized single review call. No model-invoked tool is permitted; any tool
event rejects the attempt. The completed plan must not claim that the data
stayed on the host or that provider-side copies were deleted outside the
provider's documented controls.

## M2 runtime sandbox and disclosure boundary

At G1 these fields freeze the intended later policy. Runtime enforcement and
test evidence remain `Pending M2`:

- Controller isolation:
- Evaluator and oracle isolation:
- SUT filesystem view:
- Baseline filesystem view:
- Future-bundle isolation:
- Network and telemetry policy:
- Tool-execution policy:
- Credential policy:
- `HOME`, temporary directory, environment, and process-visibility policy:
- Symlink, path traversal, archive extraction, and remote-link controls:
- Resource limits and timeout behavior:
- LLM and embedding calls in M2: `Forbidden; any model-assisted successor
  requires a separate gate`

Inputs are untrusted. Source content must not acquire authority to execute tools,
read other files, follow remote content, change policy, or disclose data.

## Logging and reporting

Default to metadata-only logs. Permit only opaque run and step references,
state transitions, durations, byte counts, exit classes, policy decisions, and
approved aggregate measures. Exclude source text, snippets, filenames, paths,
prompts, responses, oracle answers, environment values, credentials, and
personal identifiers.

- Log schema and allowed fields:
- Redaction test: `Pending M2`, with intended test rule:
- Log readers:
- Report disclosure review:
- Debug escalation procedure:

Turning on verbose logging is a policy change and normally requires a new run
identity. Never paste a private failure into a public issue; construct the
smallest synthetic reproduction.

## Lifecycle

- Retention start and end conditions:
- Backup frequency and expiry:
- Restore test: `Pending M2`, with intended procedure:
- Deletion method by data class:
- Whole-run purge command or procedure:
- Verification of snapshot, projection, logs, prompts, reports, and backup
  deletion:
- Legal hold or deletion exceptions:
- Responsible actor:

A run is not deletable if undisclosed copies survive in caches, model-provider
retention, logs, backups, editor history, temporary storage, or reports. M2 must
test deletion closure with synthetic material before any runtime receives real
data. G1 freezes that requirement but does not claim the test passed.

For the G1 Codex review, record separately which provider-side copies the owner
can delete, which expire only under provider policy, and which cannot be
independently verified. Do not turn an unverifiable provider deletion into a
successful local purge claim.

## Approval

Required to approve the G1 handling plan:

- [ ] Rights and purpose are explicit for every data class.
- [ ] The default-deny model-tool boundary was verified, and the trusted host
      access of the Codex client and controller was explicitly accepted.
- [ ] OpenAI processing is specifically authorized for every private class the
      fresh Codex review can expose.
- [ ] The exact review controller and profile have a retained public synthetic
      zero-tool model qualification; the fail-closed command must still pass a
      fresh run-specific identity-and-config preflight after seal and before
      private access.
- [ ] Independent human review is not claimed.
- [ ] The metadata-only logging allowlist and debug escalation are frozen.
- [ ] Backup, restore, whole-run purge, and deletion procedures are frozen.
- [ ] The [incident runbook](INCIDENT-RUNBOOK.md) matches this boundary.
- Approval actor and time:

Runtime-dependent evidence remains explicitly pending at G1:

- [ ] `Pending M2`: metadata-only logging was tested against the exact runtime.
- [ ] `Pending M2`: restore and whole-run purge were exercised synthetically.
- [ ] `Pending M2`: sandbox, egress, filesystem, and process isolation passed
      for the exact runtime identity.

Do not check a `Pending M2` box during G1. The completed G1 plan seals the
intended behavior and the fact that these exercises have not yet passed.
