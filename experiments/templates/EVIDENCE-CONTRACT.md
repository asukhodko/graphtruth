# Private evidence-contract freeze

> **Use:** Follow this guide locally to close GraphTruth gate G1. Do not copy
> private values into this repository, an issue, a pull request, CI, Obsidian,
> or an assistant conversation.
>
> **Authority:** Non-normative Zone 3 experiment control. This guide does not
> define a GraphTruth protocol format or admit a runtime to private data.

## Gate boundary

G1 freezes the evidence against which the first private experiment will later
be run:

- one eligible decision or incident episode;
- the exact source bytes, knowledge boundary, and reveal order;
- the complete task denominator and withheld oracle;
- baseline, first-exposure, evaluation, budget, and decision rules;
- data-handling and incident rules;
- a publication-safe synthetic twin;
- owner and independent review;
- a closed, non-circular integrity seal with an external private anchor.

G1 does not implement or admit the private runner. It does not freeze executable
code, configuration, dependencies, environment, sandbox enforcement, or fresh
rehearsal evidence. It does not execute a baseline, GraphTruth, a scored task,
or a private reveal.

Those controls belong to M2. M2 binds the frozen evidence contract to one exact
runtime identity, repeats the runtime-boundary rehearsal, completes the full
synthetic dress rehearsal, obtains owner confirmation, and seals the final run
card. Private bytes must not be exposed to that runtime before M2 closes its
admission gate.

## Time box

Issue #6 has one five-focused-day budget and a hard stop on 2026-07-26. Three
days were already accounted for before G1. This freeze targets one additional
focused day. Starting the fifth and final day requires a separate owner
decision to continue, shrink the contract, or stop; renaming or splitting the
work never resets either limit.

## Existing material and its limit

Use the existing forms as private working records:

- [Corpus selection](CORPUS-SELECTION.md) for the sampling frame, rights,
  lineage, chronology, and knowledge boundary;
- [Review rubric](REVIEW-RUBRIC.md) for tasks, oracle, severe errors, scoring,
  and baseline fairness;
- [Data handling](DATA-HANDLING.md) for authority, access, retention, backup,
  restoration, and deletion;
- [Incident runbook](INCIDENT-RUNBOOK.md) for stop, containment, and recovery;
- [Run card](RUN-CARD.md) as a later M2 integration record, not as proof that
  G1 admitted a runtime;
- [Failure diary](FAILURE-DIARY.md) after execution begins.

The public synthetic [pack lock](../../examples/experiments/preflight/pack-lock.json)
demonstrates a closed inventory that excludes its own bytes. The exported
`validatePack` implementation in
[`tooling/preflight.mjs`](../../tooling/preflight.mjs) demonstrates strict JSON,
safe-path, closed-inventory, cross-reference, and content-free diagnostic
checks. Both are references only. `validatePack` accepts the public synthetic
contract and deliberately rejects private classification; do not point it, CI,
or `./tooling/preflight` at a private root.

## Prepare the private boundary after selection

Read this section before closing Codex, but execute it only after the preliminary
episode decision in step 1 below. Perform every command from a local Terminal
after quitting Codex completely. Also close unapproved editors, model clients,
indexers, and backup or synchronization agents. Do not ask an assistant to run
the commands, inspect the mount, select sources, calculate digests, or review
command output.

Choose the image directory, image name, volume name, and mount path locally
after Codex is closed. Do not reuse the examples from this guide as the real
values or disclose the chosen values later. Keep the image outside every
repository, Git worktree, iCloud, Dropbox, OneDrive, and other synchronized
directory. In a local shell with history disabled, set `IMAGE_DIR`, `IMAGE`,
`VOL`, and `MOUNT`, then create an encrypted APFS image with a passphrase
prompt:

```sh
unset HISTFILE
umask 077
mkdir -m 700 "$IMAGE_DIR"
touch "$IMAGE_DIR/.metadata_never_index"
sudo tmutil addexclusion -p "$IMAGE_DIR"
tmutil isexcluded "$IMAGE_DIR"
hdiutil create -size 1g -type SPARSEBUNDLE -fs APFS \
  -encryption AES-256 -volname "$VOL" -uid "$(id -u)" "$IMAGE"
```

Enter the passphrase only at the interactive `hdiutil` prompt. Do not put it in
an argument, environment variable, script, clipboard manager, shell history, or
assistant conversation, and do not save it to Keychain.

Before writing private material, mount the image without opening Finder, block
Spotlight indexing, exclude both the image and mounted volume from Time Machine,
and set owner-only permissions:

```sh
if pgrep -ifl 'Codex|ChatGPT'; then
  echo "Close Codex, ChatGPT, and every helper process before mounting" >&2
  exit 1
fi
mkdir -m 700 "$MOUNT"
hdiutil attach -nobrowse -owners on -mountpoint "$MOUNT" "$IMAGE"
touch "$MOUNT/.metadata_never_index"
sudo mdutil -i off -d "$MOUNT"
mdutil -s "$MOUNT"
sudo tmutil addexclusion -p "$MOUNT"
tmutil isexcluded "$MOUNT"
chmod 700 "$MOUNT"
umask 077
```

Confirm locally that the backing image is outside cloud synchronization, the
expected image is mounted at `MOUNT`, and Spotlight and Time Machine report it
excluded. Repeat both exclusion checks after every mount and before copying
private bytes. Do not paste their output anywhere. At G1, either declare that
no backup exists yet or use a separately encrypted, normally detached medium
covered by the data-handling plan. A copy inside the same image or physical
device is not a backup. Restore testing stays pending until M2; Time Machine
and cloud storage remain out of scope.

`chmod 700` blocks other local accounts, but Codex and ChatGPT use the owner's
UID and can cross that permission boundary. The technical separation from
those processes is the encrypted volume: it stays detached whenever any Codex,
ChatGPT, or helper process is running. Confirm process absence locally before
every attach.

Create physically or access-separated locations for the immutable snapshot,
manifest and reveal order, tasks, oracle, future reveal bundles, mutable work,
logs, reports, and controlled backups. Give the oracle and future material no
SUT or baseline access. Use only opaque local identifiers and neutral filenames.

Detach the volume whenever private work stops:

```sh
sync
hdiutil detach "$MOUNT"
rmdir "$MOUNT"
```

Mount it again only from local Terminal while Codex and every other unapproved
processor remain fully closed.

## Closed freeze sequence

Complete the steps in order. A failed step stops the freeze; it must not be
waived by filling a later form.

1. **Select the episode.** Before authoring tasks, choose one real decision or
   incident lineage under frozen inclusion, exclusion, replacement, and rights
   rules. Record the original candidate population, source roles, lineage,
   chronology, participant familiarity, workflow decision, allowed claims, and
   forbidden claims. Reject the episode if selection requires outcome-aware
   cherry-picking or unauthorized processing.

2. **Prepare the encrypted private root.** With Codex fully closed, execute the
   commands in the preceding section. Place the selection record in the mounted
   owner-only root, create the separated locations, and verify cloud, Spotlight,
   Time Machine, access, backup, and mount controls before copying source bytes.

3. **Freeze the manifest.** Copy the exact immutable source bytes into the
   protected snapshot. For each item record one opaque ID, SHA-256 of raw bytes,
   byte length, media type, version and provenance, lineage, sensitivity and
   handling authority, event time separately from publication or availability
   time, and deterministic reveal order. Close the inventory over three to five
   sources. Record missing, inaccessible, excluded, unsupported, withdrawn, and
   duplicate states explicitly. Withhold future names, counts, paths, hashes,
   and metadata from the SUT.

4. **Freeze the task denominator.** Only after the manifest is immutable,
   declare the exact complete set `T`, with `T >= 8`; an open-ended minimum is
   invalid. Cover at least three source roles where the episode permits it.
   Include an early-answerable task, required abstention before sufficient
   evidence, correction after counterevidence, and a task that remains
   unresolved at the terminal closed-corpus horizon. Record the real trigger,
   allowed interpretation, evaluation horizon, earliest answerable reveal,
   required answer elements and evidence, allowed uncertainty, abstention rule,
   time limit, severe errors, and missing, timeout, abort, and invalid handling
   for every task.

5. **Freeze the oracle.** Cover every task in `T` exactly once. Bind each
   judgment to permitted evidence, counterevidence, or the declared absence
   basis. Keep answers, evaluator-only rules, later evidence, and oracle
   structure outside SUT, baseline, and first-exposure visibility.

6. **Freeze baseline and exposure.** Register Markdown plus literal `rg` as the
   minimal baseline. Freeze its command and permitted flags, source horizon,
   time, query budget, tools, assistance, answer format, and review procedure.
   Give all arms the same available bytes and horizon. Record GraphTruth-only
   preparation, import, annotation, correction, rebuilding, checking, and
   abandoned work as capture tax. Register the ordinary current workflow as a
   second baseline or exclude it explicitly and narrow the claim. Record role
   overlap, prior familiarity, first presentation, arm order, and scorer
   blinding before exposure.

7. **Freeze evaluation, budgets, and decision.** Declare one primary measure,
   the exact denominator `T`, scoring rules, ties, omissions, timeouts, aborts,
   invalid results, and severe-error consequences. Freeze wall-clock, operator,
   review, storage, memory, external-processing, and intervention budgets with
   their measurement and exhaustion behavior. Set `keep`, `shrink`, and `stop`
   thresholds before seeing output. A severe privacy, provenance, future-leak,
   unsupported-confidence, or missed-abstention error cannot be averaged away.

8. **Approve data handling.** Complete the data-handling plan for every data
   class: authority and purpose, actors and access, external processing,
   metadata allowed in logs, retention, encrypted backup, restore, whole-run
   purge, and incident response. Mark runtime-dependent sandbox, restore, and
   deletion exercises as pending M2; G1 must not claim they passed.

9. **Review the pre-published synthetic twin.** Use a twin created and publicly
   anchored before private episode access. An authorized reviewer compares only
   the abstract task and failure classes and rejects any private wording,
   values, names, identities, hashes, metrics, or rare and re-identifying
   structure. Do not revise the public twin to resemble the selected episode.
   If the existing twin cannot safely represent the required classes, reject
   the episode rather than deriving a replacement from private material.

10. **Obtain two reviews.** The owner and a separate reviewer inspect the same
   closed inventory and independently confirm selection, manifest, exact task
   denominator, oracle isolation, baseline fairness, first exposure, evaluation,
   budgets, decision rules, data handling, incident response, and disclosure
   review. Record both confirmations inside the material to be sealed. Review
   identity and notes remain private.

11. **Create the non-circular seal.** Build a closed inventory of every
    immutable contract artifact and source. Sort neutral relative paths
    deterministically and record raw-byte SHA-256 and byte length. Exclude the
    lock file itself; never place its digest inside itself. Hash the completed
    lock's exact bytes and record that digest, lock length, digest algorithm,
    freeze time, and both confirmations in an append-only protected anchor
    outside the mutable private root. Do not print or publish the lock, anchor,
    paths, IDs, counts, or digests. Any later change to sources, order, tasks,
    oracle, baseline, threshold, exposure, or handling creates a new contract
    identity and a new seal; never repair the old one in place.

    After both hashes are recorded, make the sealed input tree owner-readable
    and non-writable and apply the local immutable flag (`uchg`) to protect
    against accidental edits. Permissions and flags are safeguards; the closed
    inventory and external anchor remain the evidence of exact bytes.

12. **Publish only the safe receipt.** Start from
    [`PUBLIC-G1-RECEIPT.json`](PUBLIC-G1-RECEIPT.json). It is a human-reviewed
    publication template, not a schema or machine proof. Publish it only after
    every private check and both reviews pass. It must contain coarse boolean
    attestations only: no private path, source or person name, opaque private ID,
    exact count, task text, answer, metric, timestamp more precise than an
    approved date, digest, excerpt, failure detail, or correlation handle.

## Stop and invalidate

Stop immediately, mark the attempted contract invalid, contain the affected
material, and follow the incident runbook when:

- any private byte or protected metadata reaches Git, GitHub, CI, Obsidian,
  cloud synchronization, Time Machine, Spotlight, an assistant, an unapproved
  editor or model, or another unauthorized actor;
- rights, purpose, retention, deletion, or external-processing authority is
  missing or contradicted;
- future material, oracle, answers, hidden task structure, or first-exposure
  information is disclosed early;
- task selection, denominator, scoring, thresholds, or replacement rules are
  changed after relevant output is known;
- the baseline cannot receive a fair horizon, budget, and review procedure;
- the exact inventory cannot be closed or two reviews cannot agree;
- a publication-safe synthetic twin cannot pass disclosure review;
- the focused-time budget or calendar hard stop is reached;
- any required field remains unknown, provisional, or contradictory;
- anyone attempts to run private data before the M2 admission gate closes.

An invalid or rejected attempt remains in the private selection and incident
history. Do not rename, delete, or restart it to recover a favorable outcome or
a fresh budget.
