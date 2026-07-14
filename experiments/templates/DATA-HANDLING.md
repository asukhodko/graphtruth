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
- Required notices, agreements, or consent:

Authorization to read a document does not automatically authorize copying it,
publishing derived text, sending it to a model, retaining prompts, or using it
for a new purpose.

## Data inventory

For each class, record sensitivity, purpose, allowed actors, allowed processing,
retention, and disposal procedure. At G1, source and contract classes exist;
runtime-derived classes remain `Pending M2` and must not be claimed as created:

- source snapshot;
- manifest and reveal order;
- task pack and oracle;
- canonical experiment records;
- indexes and caches;
- prompts and model responses;
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
- Encryption at rest:
- Encryption in transit, if any:
- Backup boundary and access:
- Host and removable-media restrictions:
- Independent-review access path and copy prohibition:

`.gitignore` is not a security boundary. Private run material must never enter
Git history, repository attachments, issues, pull requests, CI, public artifact
stores, or an editor or assistant service that is not explicitly approved.

## Sandbox and disclosure boundary

At G1 these fields freeze the intended policy. Runtime enforcement and test
evidence remain `Pending M2`:

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

## Approval

Required to approve the G1 handling plan:

- [ ] Rights and purpose are explicit for every data class.
- [ ] Least-privilege access was verified.
- [ ] External processing is denied or specifically authorized.
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
