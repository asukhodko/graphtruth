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

Issue #6 has one five-repository-active-date budget and a hard stop on
2026-07-26. Count one day per distinct Europe/Moscow date with material
GraphTruth repository activity on or after the issue was opened; multiple
events on one date count once, while an inactive date counts zero. Foundation
work on 2026-07-11 predates the issue and is excluded. Repository history
accounts for 2026-07-12, 2026-07-13, and 2026-07-14 as days one through three.
All work on 2026-07-14, including PR #18 and later same-date synchronization
and hardening, remains inside day three. Two active dates remain. Before
project activity starts on day five, the owner must separately choose to
continue, shrink the contract, or stop. If the decision is `continue`, the
complete remaining private freeze must fit the remaining budget; renaming or
splitting the work never resets either limit. Private work on a date with no
repository activity consumes no repo-active date, but the calendar hard stop
still applies.

## Existing material and its limit

Use the existing forms as private working records:

- [G1 evidence contract](G1-EVIDENCE-CONTRACT.md) for the closed artifact set,
  baseline, exposure, evaluation, budgets, decision, and explicit M2 boundary;
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

The separate owner-only
[`tooling/private-pack-lock`](../../tooling/private-pack-lock) command is the
only checked-in tool intended to read a private `PACK`. It constructs and
verifies the exact non-circular G1 inventory without printing private paths,
content, roles, counts, or digests and without network code. The repository gate
may exercise it only against generated public test fixtures. Run the command
against a real private `PACK` only in the approved local shell after every
assistant and unapproved processor is closed; never do that through Codex, CI,
an editor task, or a remote session. It does not replace the encrypted-boundary,
authorization, human-review, retention, or disclosure checks in this guide.

## Required private layout and artifact set

Use three sibling areas inside the encrypted volume:

- `PACK`: the immutable G1 source and contract material covered by the lock;
- `WORK`: empty or mutable state reserved for M2 and excluded from G1 evidence;
- `ANCHOR`: protected lock-anchor and final-review records outside `PACK` and
  its inventory.

Choose neutral local names after assistants are closed. The completed `PACK`
must contain the exact source snapshot, closed manifest and source-state ledger,
knowledge boundary and reveal order, isolated future material, exact task pack,
withheld oracle, completed G1 evidence-contract record, corpus-selection record,
review rubric, data-handling plan, incident runbook, private twin-comparison
decision, and the exact artifact-role map required by the owner-only lock tool.
Add any other immutable G1 input to the same closed inventory. Do not include
mutable M2 work, logs, reports, runtime code, configuration, environment,
rehearsal results, final review records, the pack lock itself, `ANCHOR`, or the
later public receipt. The receipt is derived only after the private seal and is
reviewed separately before leaving the volume.

The fixed filename `artifact-roles.json` is itself a G1 artifact. Use format
`graphtruth.private-g1-artifact-roles/1` and an `artifacts` array whose entries
contain exactly `path` and `role`. It lists itself as `artifact-role-map`, lists
every other regular candidate file exactly once, and does not list the future
lock. Every path component and role starts with an ASCII letter or digit and
then uses only letters, digits, period, underscore, or hyphen. A component is
at most 255 bytes, a role at most 128 bytes, and a complete relative path at
most 1,024 bytes and 64 components. The G1 contract records what each role
means. Record the Git commit and exact hashes of the lock module, wrapper, and
Node executable in the private G1 contract so both reviewers use the same
construction identity.

Every required artifact must be final or the episode is rejected. A path or
field intentionally outside G1 receives its exact stage-specific value, such as
`Pending M2`, `Pending evaluated run`, `Pending incident`, or
`Deferred successor`; it is never left blank. The pack lock is a direct child
of `PACK` and enumerates all and only other regular files below `PACK` by sorted
neutral relative path, role, raw-byte SHA-256, and byte length.
Every regular file must have hard-link count one. The construction fails closed
on an undeclared or missing file, symlink, hard link, special file, nested mount,
or path escape.

## Prepare the private boundary after selection

Read this section before closing Codex, but execute it only after the preliminary
episode decision in step 1 below. Perform every command from a local Terminal
after quitting Codex completely. Also close unapproved editors, model clients,
indexers, and backup or synchronization agents. Do not ask an assistant to run
the commands, inspect the mount, select sources, calculate digests, or review
command output.

Choose the image directory, image name, volume name, mount path, and neutral
`PACK`, `WORK`, and `ANCHOR` names locally after Codex is closed. Do not reuse
guide examples as real values or disclose the chosen values later. The backing
image must be outside every repository, Git worktree, iCloud, Dropbox, OneDrive,
and other synchronized directory. The mount point must be one new direct child
of `/Volumes`, never a path below the checkout, home directory, or a synchronized
folder.

Start a clean local zsh with an empty inherited environment first. The fixed
system `PATH` deliberately excludes Homebrew, package managers, and user
commands:

```sh
exec /usr/bin/env -i \
  PATH=/usr/bin:/bin:/usr/sbin:/sbin \
  TERM=dumb \
  /bin/zsh -f
```

In that new shell, disable history, enable fail-closed behavior, and define the
generic failure handler plus the reusable path validator:

```sh
HOME=~
export HOME
unset HISTFILE
set -euo pipefail
export PATH=/usr/bin:/bin:/usr/sbin:/sbin
export LC_ALL=C
umask 077

fail() {
  print -u2 -- "G1 private-boundary check failed; stop without copying data"
  return 1
}

neutral_token() {
  local value="$1" maximum="$2"
  (( ${#value} >= 1 && ${#value} <= maximum )) || return 1
  print -rn -- "$value" | \
    LC_ALL=C grep -Eq '^[A-Za-z0-9][A-Za-z0-9._-]*$'
}

assert_only_system_provenance() {
  local target="$1" names name provenance_hex=''
  [[ -f "$target" && ! -L "$target" ]] || return 1
  names="$(/usr/bin/xattr -s "$target" 2>/dev/null)" || return 1
  while IFS= read -r name; do
    [[ -z "$name" || "$name" == "com.apple.provenance" ]] || return 1
  done <<< "$names"
  if [[ "$names" == *"com.apple.provenance"* ]]; then
    provenance_hex="$(/usr/bin/xattr -pxs com.apple.provenance "$target" \
      2>/dev/null | /usr/bin/tr -d '[:space:]')" || return 1
    (( ${#provenance_hex} == 22 )) || return 1
    print -rn -- "$provenance_hex" | \
      LC_ALL=C grep -Eq '^[a-fA-F0-9]{22}$' || return 1
  fi
  unset names name provenance_hex
}

assert_no_acl() {
  local target="$1" acl_listing
  [[ ! -L "$target" ]] || return 1
  [[ -f "$target" || -d "$target" ]] || return 1
  acl_listing="$(/bin/ls -lde "$target" 2>/dev/null)" || return 1
  if print -r -- "$acl_listing" | LC_ALL=C grep -Eq '^ [0-9]+: '; then
    return 1
  fi
  unset acl_listing
}

validate_private_paths() {
  local image_parent mount_name private_path local_name

  : "${IMAGE_DIR:?set IMAGE_DIR locally}"
  : "${IMAGE:?set IMAGE locally}"
  : "${VOL:?set VOL locally}"
  : "${MOUNT:?set MOUNT locally}"
  : "${PACK:?set PACK locally}"
  : "${WORK:?set WORK locally}"
  : "${ANCHOR:?set ANCHOR locally}"

  [[ "$IMAGE_DIR" == /* && "$IMAGE" == /* ]] || fail
  [[ "$(dirname "$IMAGE")" == "$IMAGE_DIR" ]] || fail
  [[ "$IMAGE" == *.sparsebundle ]] || fail
  [[ "$(dirname "$MOUNT")" == "/Volumes" ]] || fail
  [[ "$(dirname "$PACK")" == "$MOUNT" ]] || fail
  [[ "$(dirname "$WORK")" == "$MOUNT" ]] || fail
  [[ "$(dirname "$ANCHOR")" == "$MOUNT" ]] || fail
  [[ "$PACK" != "$WORK" && "$PACK" != "$ANCHOR" && \
     "$WORK" != "$ANCHOR" ]] || fail
  [[ "$IMAGE_DIR$IMAGE$VOL$MOUNT$PACK$WORK$ANCHOR" != *$'\n'* ]] || fail
  [[ "$IMAGE_DIR$IMAGE$VOL$MOUNT$PACK$WORK$ANCHOR" != *$'\r'* ]] || fail

  mount_name="${MOUNT#/Volumes/}"
  [[ -n "$mount_name" && "$mount_name" != */* ]] || fail
  for local_name in "$(basename "$IMAGE_DIR")" "$(basename "$IMAGE")" \
      "$mount_name" "$VOL"; do
    neutral_token "$local_name" 128 || fail
  done
  for private_path in "$PACK" "$WORK" "$ANCHOR"; do
    local_name="$(basename "$private_path")"
    neutral_token "$local_name" 128 || fail
  done

  image_parent="$(dirname "$IMAGE_DIR")"
  [[ -d "$image_parent" && ! -L "$image_parent" ]] || fail
  [[ "$(cd "$image_parent" && pwd -P)" == "$image_parent" ]] || fail
  if git -C "$image_parent" rev-parse --is-inside-work-tree \
      >/dev/null 2>&1; then
    fail
  fi

  case "$IMAGE_DIR" in
    "$HOME/Library/Mobile Documents"|"$HOME/Library/Mobile Documents/"*|\
    "$HOME/Library/CloudStorage"|"$HOME/Library/CloudStorage/"*|\
    "$HOME/Dropbox"|"$HOME/Dropbox/"*|"$HOME"/OneDrive*|\
    "$HOME"/Google\ Drive*|"$HOME"/GoogleDrive*) fail ;;
  esac
}

typeset -g PLIST_VALUE=''
typeset -g HDI_INFO=''
typeset -g IMAGE_CANON=''
typeset -g MOUNT_ENTITY_DEVICE=''
typeset -gi IMAGE_MATCH_COUNT=0
typeset -gi IMAGE_INDEX=-1
typeset -gi attach_started=0
typeset -g PUBLIC_RECEIPT_PENDING=''
typeset -gi PUBLIC_RECEIPT_DIR_CREATED=0

plist_get() {
  local plist="$1" key="$2" expected="$3"
  PLIST_VALUE="$(print -rn -- "$plist" | plutil \
    -extract "$key" raw -expect "$expected" -o - - 2>/dev/null)" || return 1
}

load_hdi_info() {
  HDI_INFO="$(hdiutil info -plist 2>/dev/null)" || return 1
  [[ -n "$HDI_INFO" ]]
}

locate_exact_image() {
  local plist="$1" image_path
  local -i image_count image_index

  plist_get "$plist" images array || return 1
  [[ "$PLIST_VALUE" == <-> ]] || return 1
  image_count=$PLIST_VALUE
  IMAGE_MATCH_COUNT=0
  IMAGE_INDEX=-1
  for (( image_index = 0; image_index < image_count; image_index++ )); do
    plist_get "$plist" "images.${image_index}.image-path" string || return 1
    image_path="$PLIST_VALUE"
    if [[ "$image_path" == "$IMAGE_CANON" ]]; then
      (( IMAGE_MATCH_COUNT += 1 ))
      IMAGE_INDEX=$image_index
    fi
  done
}

assert_image_not_attached() {
  load_hdi_info || return 1
  locate_exact_image "$HDI_INFO" || return 1
  (( IMAGE_MATCH_COUNT == 0 ))
}

valid_device_node() {
  local device_pattern='^/dev/disk[0-9]+(s[0-9]+)*$'
  [[ "$1" =~ $device_pattern ]]
}

single_mount_entity() {
  local plist="$1" prefix="$2"
  local entities_key mount_key device_key mount_path found_device=''
  local -i entity_count entity_index mount_count=0

  if [[ -n "$prefix" ]]; then
    entities_key="$prefix.system-entities"
  else
    entities_key='system-entities'
  fi
  plist_get "$plist" "$entities_key" array || return 1
  [[ "$PLIST_VALUE" == <-> ]] || return 1
  entity_count=$PLIST_VALUE
  for (( entity_index = 0; entity_index < entity_count; entity_index++ )); do
    mount_key="$entities_key.${entity_index}.mount-point"
    device_key="$entities_key.${entity_index}.dev-entry"
    if plist_get "$plist" "$mount_key" string; then
      mount_path="$PLIST_VALUE"
      (( mount_count += 1 ))
      [[ "$mount_path" == "$MOUNT" ]] || return 1
      plist_get "$plist" "$device_key" string || return 1
      found_device="$PLIST_VALUE"
      valid_device_node "$found_device" || return 1
    fi
  done
  (( mount_count == 1 )) || return 1
  [[ -n "$found_device" ]] || return 1
  MOUNT_ENTITY_DEVICE="$found_device"
}

verify_exact_attachment() {
  local attach_plist="$1" disk_plist attach_device disk_device disk_mount
  local info_device

  single_mount_entity "$attach_plist" '' || return 1
  attach_device="$MOUNT_ENTITY_DEVICE"
  disk_plist="$(diskutil info -plist "$attach_device" 2>/dev/null)" || return 1
  plist_get "$disk_plist" DeviceNode string || return 1
  disk_device="$PLIST_VALUE"
  plist_get "$disk_plist" MountPoint string || return 1
  disk_mount="$PLIST_VALUE"
  [[ "$disk_device" == "$attach_device" ]] || return 1
  [[ "$disk_mount" == "$MOUNT" ]] || return 1

  load_hdi_info || return 1
  locate_exact_image "$HDI_INFO" || return 1
  (( IMAGE_MATCH_COUNT == 1 )) || return 1
  single_mount_entity "$HDI_INFO" "images.$IMAGE_INDEX" || return 1
  info_device="$MOUNT_ENTITY_DEVICE"
  [[ "$info_device" == "$attach_device" ]] || return 1
  [[ "$info_device" == "$disk_device" ]]
}

detach_exact_image() {
  local entities_key device_key device
  local -i round entity_count entity_index detached_one

  for (( round = 1; round <= 16; round++ )); do
    load_hdi_info || return 1
    locate_exact_image "$HDI_INFO" || return 1
    (( IMAGE_MATCH_COUNT == 0 )) && return 0
    entities_key="images.$IMAGE_INDEX.system-entities"
    plist_get "$HDI_INFO" "$entities_key" array || return 1
    [[ "$PLIST_VALUE" == <-> ]] || return 1
    entity_count=$PLIST_VALUE
    detached_one=0
    for (( entity_index = 0; entity_index < entity_count; entity_index++ )); do
      device_key="$entities_key.${entity_index}.dev-entry"
      if plist_get "$HDI_INFO" "$device_key" string; then
        device="$PLIST_VALUE"
        if valid_device_node "$device" && \
            hdiutil detach "$device" >/dev/null 2>&1; then
          detached_one=1
          break
        fi
      fi
    done
    (( detached_one == 1 )) || return 1
  done
  return 1
}
```

Now set all seven values locally without printing them. Then run the guards and
creation block below. Values must be absolute, neutral, contain no newline, and
remain undisclosed. `IMAGE` must be a new `.sparsebundle` directly below the new
`IMAGE_DIR`; `PACK`, `WORK`, and `ANCHOR` must be distinct direct children of
`MOUNT`.

```sh
validate_private_paths
[[ ! -e "$IMAGE_DIR" && ! -L "$IMAGE_DIR" ]] || fail
[[ ! -e "$MOUNT" && ! -L "$MOUNT" ]] || fail
mkdir -m 700 "$IMAGE_DIR"
chmod -N "$IMAGE_DIR"
[[ "$(stat -f '%u:%Lp' "$IMAGE_DIR")" == "$(id -u):700" ]] || fail
assert_no_acl "$IMAGE_DIR" || fail
touch "$IMAGE_DIR/.metadata_never_index"
sudo tmutil addexclusion -p "$IMAGE_DIR"
tmutil isexcluded "$IMAGE_DIR" | grep -q '^\[Excluded\]' || fail
hdiutil create -size 1g -type SPARSEBUNDLE -fs APFS \
  -encryption AES-256 -volname "$VOL" -uid "$(id -u)" \
  -gid "$(id -g)" -mode 0700 "$IMAGE" >/dev/null
[[ -d "$IMAGE" && ! -L "$IMAGE" ]] || fail
chmod -R go-rwx "$IMAGE"
hdiutil imageinfo "$IMAGE" >/dev/null
hdiutil isencrypted -plist "$IMAGE" | \
  plutil -extract encrypted raw -o - - | grep -qx 'true' || fail
```

Enter the passphrase only at the interactive `hdiutil` prompt. Do not put it in
an argument, environment variable, script, clipboard manager, shell history, or
assistant conversation, and do not save it to Keychain.

Before the first and every later attach, start another clean local zsh with the
same `/usr/bin/env -i` command. Repeat the entire initialization block above,
from `HOME=~` through the final `detach_exact_image` definition; this includes
all globals, `neutral_token`, plist helpers, and attach/detach functions. Set
the same seven values locally and set `BOUNDARY_PHASE` to exactly `pre-seal`,
`pack-sealed`, or `sealed`. Use `pack-sealed` after `PACK` is immutable but
before both final confirmation files make `ANCHOR` immutable. Then call
`validate_private_paths`. Do not rerun the image-creation block for an existing
image. An immutable area is always verification-only; no later attach may
repair its permissions, flags, or extended attributes.

Mount without opening Finder. The cleanup trap remains active for the whole
mounted session and must detach a partially attached image after any failed
assertion or shell exit. Do not remove or weaken it. The block verifies a real
mount before its first private write, disables Spotlight, verifies Time Machine
exclusion, removes inherited ACLs, and checks owner-only permissions. A command
merely printing an unexpected state is a failure; do not acknowledge it and
continue.

```sh
validate_private_paths
: "${BOUNDARY_PHASE:?set pre-seal, pack-sealed, or sealed}"
[[ "$BOUNDARY_PHASE" == "pre-seal" || \
   "$BOUNDARY_PHASE" == "pack-sealed" || \
   "$BOUNDARY_PHASE" == "sealed" ]] || fail
if pgrep -if 'Codex|ChatGPT' >/dev/null 2>&1; then
  fail
fi
[[ -d "$IMAGE_DIR" && ! -L "$IMAGE_DIR" ]] || fail
[[ -d "$IMAGE" && ! -L "$IMAGE" ]] || fail
if git -C "$IMAGE_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  fail
fi
hdiutil isencrypted -plist "$IMAGE" | \
  plutil -extract encrypted raw -o - - | grep -qx 'true' || fail
tmutil isexcluded "$IMAGE_DIR" | grep -q '^\[Excluded\]' || fail

cleanup_private_mount() {
  local -i exit_status=$? detach_failed=0 public_cleanup_failed=0
  local pending_receipt_dir=''
  trap - EXIT
  trap '' HUP INT TERM
  set +e
  cd / >/dev/null 2>&1
  if [[ -n "$PUBLIC_RECEIPT_PENDING" ]]; then
    pending_receipt_dir="$(dirname "$PUBLIC_RECEIPT_PENDING")"
    /bin/rm -f -- "$PUBLIC_RECEIPT_PENDING" >/dev/null 2>&1
    if [[ -e "$PUBLIC_RECEIPT_PENDING" || -L "$PUBLIC_RECEIPT_PENDING" ]]; then
      public_cleanup_failed=1
    elif (( PUBLIC_RECEIPT_DIR_CREATED )); then
      /bin/rmdir "$pending_receipt_dir" >/dev/null 2>&1
      if [[ -e "$pending_receipt_dir" || -L "$pending_receipt_dir" ]]; then
        public_cleanup_failed=1
      fi
    fi
    PUBLIC_RECEIPT_PENDING=''
    PUBLIC_RECEIPT_DIR_CREATED=0
  fi
  sync >/dev/null 2>&1
  if (( attach_started )); then
    detach_exact_image || detach_failed=1
  fi
  rmdir "$MOUNT" >/dev/null 2>&1
  if (( public_cleanup_failed )); then
    print -u2 -- \
      "G1 public receipt cleanup could not be proved; keep processors closed"
    (( exit_status == 0 )) && exit_status=1
  fi
  if (( detach_failed )); then
    print -u2 -- \
      "G1 detach could not be proved; keep processors closed and shut down"
    (( exit_status == 0 )) && exit_status=1
  fi
  exit "$exit_status"
}

image_parent_canon="$(cd "$IMAGE_DIR" 2>/dev/null && pwd -P)" || fail
IMAGE_CANON="$image_parent_canon/$(basename "$IMAGE")"
unset image_parent_canon
[[ "$IMAGE_CANON" == "$IMAGE" ]] || fail
assert_image_not_attached || fail

trap cleanup_private_mount EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM

[[ ! -e "$MOUNT" && ! -L "$MOUNT" ]] || fail
sudo mkdir -m 700 "$MOUNT"
sudo chown "$(id -u):$(id -g)" "$MOUNT"
chmod -N "$MOUNT"
[[ "$(stat -f '%u:%Lp' "$MOUNT")" == "$(id -u):700" ]] || fail
assert_no_acl "$MOUNT" || fail
[[ -z "$(command ls -A "$MOUNT")" ]] || fail

attach_started=1
attach_plist=''
if ! attach_plist="$(hdiutil attach -plist -nobrowse -owners on \
    -mountpoint "$MOUNT" "$IMAGE" 2>/dev/null)"; then
  fail
fi
verify_exact_attachment "$attach_plist" || fail
unset attach_plist
mount | grep -F " on $MOUNT (" >/dev/null || fail
[[ "$(diskutil info -plist "$MOUNT" | \
  plutil -extract MountPoint raw -o - -)" == "$MOUNT" ]] || fail
[[ "$(diskutil info -plist "$MOUNT" | \
  plutil -extract FilesystemType raw -o - -)" == "apfs" ]] || fail
[[ "$(diskutil info -plist "$MOUNT" | \
  plutil -extract VolumeName raw -o - -)" == "$VOL" ]] || fail
[[ "$(diskutil info -plist "$MOUNT" | \
  plutil -extract GlobalPermissionsEnabled raw -o - -)" == "true" ]] || fail
chmod -N "$MOUNT"
chmod 700 "$MOUNT"
[[ "$(stat -f '%u:%Lp' "$MOUNT")" == "$(id -u):700" ]] || fail
assert_no_acl "$MOUNT" || fail
touch "$MOUNT/.metadata_never_index"
sudo mdutil -i off -d "$MOUNT" >/dev/null
md_state="$(mdutil -s "$MOUNT" 2>&1)"
[[ "$md_state" == *"Indexing disabled"* ]] || fail
unset md_state
sudo tmutil addexclusion -p "$MOUNT"
tmutil isexcluded "$MOUNT" | grep -q '^\[Excluded\]' || fail
tmutil isexcluded "$IMAGE_DIR" | grep -q '^\[Excluded\]' || fail

if [[ "$BOUNDARY_PHASE" == "pre-seal" ]]; then
  for private_dir in "$PACK" "$WORK" "$ANCHOR"; do
    if [[ ! -e "$private_dir" ]]; then
      mkdir -m 700 "$private_dir"
    fi
    [[ -d "$private_dir" && ! -L "$private_dir" ]] || fail
    [[ "$(stat -f '%Sf' "$private_dir")" != *uchg* ]] || fail
    chmod -N "$private_dir"
    chmod 700 "$private_dir"
    [[ "$(stat -f '%u:%Lp' "$private_dir")" == "$(id -u):700" ]] || fail
    assert_no_acl "$private_dir" || fail
  done
  unset private_dir
else
  sealed_roots=("$PACK")
  [[ "$BOUNDARY_PHASE" == "pack-sealed" ]] || sealed_roots+=("$ANCHOR")
  for sealed_dir in "${sealed_roots[@]}"; do
    [[ -d "$sealed_dir" && ! -L "$sealed_dir" ]] || fail
    [[ "$(stat -f '%u:%Lp' "$sealed_dir")" == "$(id -u):500" ]] || fail
    [[ "$(stat -f '%Sf' "$sealed_dir")" == *uchg* ]] || fail
    assert_no_acl "$sealed_dir" || fail
  done
  unset sealed_dir sealed_roots
  if [[ "$BOUNDARY_PHASE" == "pack-sealed" ]]; then
    [[ -d "$ANCHOR" && ! -L "$ANCHOR" ]] || fail
    [[ "$(stat -f '%u:%Lp' "$ANCHOR")" == "$(id -u):700" ]] || fail
    [[ "$(stat -f '%Sf' "$ANCHOR")" != *uchg* ]] || fail
    assert_no_acl "$ANCHOR" || fail
  fi
  [[ -d "$WORK" && ! -L "$WORK" ]] || fail
  chmod -N "$WORK"
  chmod 700 "$WORK"
  [[ "$(stat -f '%u:%Lp' "$WORK")" == "$(id -u):700" ]] || fail
  assert_no_acl "$WORK" || fail
fi
```

The common-path guards do not discover every third-party synchronization agent.
Before copying data, the owner must also confirm locally that the chosen backing
directory is not watched by any installed synchronizer and that no unapproved
editor, indexer, backup, model, or helper remains. Repeat the mount, Spotlight,
Time Machine, owner, mode, ACL, and process checks after every attach. Never
paste their output anywhere. A failed or ambiguous check detaches the image and
invalidates that attempt. Keep the cleanup trap active until the explicit
detach sequence succeeds. On a `pack-sealed` or `sealed` attach, also rerun the
owner-only pack verifier before relying on the seal; do not use an earlier phase
to make a failed check pass.

At G1, either declare that no backup exists yet or use a separately encrypted,
normally detached medium covered by the data-handling plan. A copy inside the
same image or physical device is not a backup. Restore testing stays pending
until M2; Time Machine and cloud storage remain out of scope.

`chmod 700` blocks other local accounts, but Codex and ChatGPT use the owner's
UID and can cross that permission boundary. The technical separation from
those processes is the encrypted volume: it stays detached whenever any Codex,
ChatGPT, or helper process is running. Confirm process absence locally before
every attach.

Inside `PACK`, separate the immutable snapshot, manifest and reveal order,
tasks, oracle, and future material. Keep M2 work, logs, and reports under `WORK`,
outside the G1 lock. Keep only the external lock-anchor and final-review records
under `ANCHOR`. Give the oracle and future material no SUT or baseline access.
Use only opaque local identifiers and neutral filenames. Copy Markdown sources
and G1 artifacts into fresh regular destination files with `/bin/cp -X` so
Finder metadata, quarantine, provenance URLs, and resource forks are not
carried into `PACK`. Do not recursively clean or normalize a candidate tree
before the lock tool has rejected links, hard links, special files, nested
devices, path escapes, non-owner access, ACLs, or unsupported metadata. If a
candidate fails one of those checks, abandon it and build a fresh candidate
from verified regular files; do not repair the rejected tree in place. Current
macOS may add only its 11-byte `com.apple.provenance` attribute to a fresh copy.
The lock binds the explicit `darwin-provenance-11-byte-only` policy, accepts
that one non-semantic local attribute without hashing its opaque value, and
rejects every other xattr and every resource fork. An unexpected provenance
length after an OS update stops the attempt; never widen the allowlist during a
freeze.

Detach the volume whenever private work stops:

```sh
mount | grep -F " on $MOUNT (" >/dev/null || fail
load_hdi_info || fail
locate_exact_image "$HDI_INFO" || fail
(( IMAGE_MATCH_COUNT == 1 )) || fail
single_mount_entity "$HDI_INFO" "images.$IMAGE_INDEX" || fail
[[ "$(diskutil info -plist "$MOUNT" | \
  plutil -extract DeviceNode raw -o - -)" == "$MOUNT_ENTITY_DEVICE" ]] || fail
[[ "$(diskutil info -plist "$MOUNT" | \
  plutil -extract MountPoint raw -o - -)" == "$MOUNT" ]] || fail
[[ "$(diskutil info -plist "$MOUNT" | \
  plutil -extract FilesystemType raw -o - -)" == "apfs" ]] || fail
[[ "$(diskutil info -plist "$MOUNT" | \
  plutil -extract VolumeName raw -o - -)" == "$VOL" ]] || fail
cd /
sync
detach_exact_image || fail
assert_image_not_attached || fail
attach_started=0
rmdir "$MOUNT" >/dev/null 2>&1 || fail
trap - EXIT HUP INT TERM
exit 0
```

If the initial exact-image absence check fails, or automatic or explicit
detachment fails, keep Codex, ChatGPT, synchronizers, and every other unapproved
processor closed. In a new clean local Terminal, repeat the initialization
functions, image canonicalization, and the same private `IMAGE` value, run
`detach_exact_image`, and require `assert_image_not_attached` to pass. If that
still fails, eject that exact image in Disk Utility and use the exact-image
`hdiutil info -plist` check above to prove it absent. Do not reopen a processor
or share diagnostic output while attachment state is ambiguous.

Close that shell after detaching. A later attach starts from the clean-shell
initialization and existing-image mount sequence above while Codex and every
other unapproved processor remain fully closed. Never reopen Codex while the
volume is attached.

## Closed freeze sequence

Complete the steps in order. A failed step stops the freeze; it must not be
waived by filling a later form.

1. **Select the episode.** Before authoring tasks, choose one real decision or
   incident lineage under frozen inclusion, exclusion, replacement, and rights
   rules. All three to five selected sources must be immutable Markdown; reject
   a candidate that requires another media type. Record the original candidate
   population, source roles, lineage, chronology, participant familiarity,
   workflow decision, allowed claims, and forbidden claims. Reject the episode
   if selection requires outcome-aware cherry-picking or unauthorized
   processing.

2. **Prepare the encrypted private root.** With Codex fully closed, execute the
   commands in the preceding section. Place the selection record in the mounted
   owner-only root, create the separated locations, and verify cloud, Spotlight,
   Time Machine, access, backup, and mount controls before copying source bytes.

3. **Freeze the manifest.** Copy the exact immutable source bytes into the
   protected snapshot. For each item record one opaque ID, SHA-256 of raw bytes,
   byte length, media type, version and provenance, lineage, sensitivity and
   handling authority, event time separately from the original file timestamp,
   acquisition time, publication or availability time, and deterministic reveal
   order. Close the inventory over three to five immutable Markdown sources.
   Record missing, inaccessible, excluded, unsupported, withdrawn, and duplicate
   states explicitly. Withhold future names, counts, paths, hashes, and metadata
   from the SUT.

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

10. **Finalize the candidate pack.** Set the private G1 record state to
    `final-for-seal`, not `frozen`. The lock tool must prove that every entry is
    owner-only with no ACL and has no metadata except the allowed fixed-length
    macOS provenance attribute. Do not run a recursive cleanup or permission
    repair over the untrusted candidate. Close the artifact-role map over the
    exact candidate contents and stop changing artifact bytes or metadata;
    only the owner-only tool may add the new lock. A rejected candidate is
    rebuilt from fresh copies. The owner and independent reviewer inspect the
    pack only after the lock makes this set immutable, so their own records
    cannot create a review cycle.

11. **Create and anchor the non-circular lock.** Put the lock directly under
    `PACK`. Build its closed inventory over every other immutable regular file
    under `PACK`. Sort neutral relative paths deterministically and record role,
    raw-byte SHA-256, and byte length. Require hard-link count one and reject
    undeclared, missing, symlinked, hard-linked, special, nested-mount, or
    escaping paths, wrong ownership, group or other access, ACLs, and unsupported
    platform metadata. Exclude the lock file itself; never place its digest
    inside itself.
    Immediately make all of `PACK`, including the lock, owner-readable and
    non-writable and apply the local immutable flag (`uchg`). Only then hash the
    completed lock's exact bytes without printing its path or digest. Create a
    new `0400` lock-anchor file directly under the sibling `ANCHOR`. Write the
    opaque local contract identity, digest algorithm, exact lock digest, lock
    byte length, and freeze time to that file by direct redirection, never
    stdout, clipboard, shell history, or an assistant. Make the anchor file
    immutable with `uchg`.

    `ANCHOR` is outside `PACK` and the lock inventory but remains inside the
    same excluded encrypted volume. This makes the lock non-circular; it is not
    an independent backup or protection against loss of the image. Never place
    an anchor in a repository, home-cloud folder, Time Machine, ordinary note,
    password-manager note, chat, issue, or CI artifact.

    Keep the digest and path out of terminal output. Before private access,
    choose and audit one canonical absolute Node executable, record its version
    and SHA-256 together with the exact checked-in wrapper and module hashes,
    and set the expected hashes locally. The wrapper is supported for private
    evidence only on macOS. It starts Node through a second empty environment;
    never call the module directly. Set the privately chosen neutral paths,
    then use this sequence. It requires owner-only access with no ACL, rejects
    every non-allowlisted xattr and resource fork, creates the lock exactly
    once, verifies it before and after immutability, and writes the anchor
    directly. Any rejection invalidates the attempt; do not replace an existing
    lock or anchor.

    ```sh
    : "${LOCK_TOOL:?set exact checked-in LOCK_TOOL locally}"
    : "${NODE_TOOL:?set audited canonical Node executable locally}"
    : "${EXPECTED_NODE_SHA256:?set recorded Node SHA-256 locally}"
    : "${EXPECTED_LOCK_TOOL_SHA256:?set recorded wrapper SHA-256 locally}"
    : "${EXPECTED_LOCK_MODULE_SHA256:?set recorded module SHA-256 locally}"
    : "${EXPECTED_REPOSITORY_REVISION:?set merged GraphTruth revision locally}"
    : "${CONTRACT_ID:?set opaque CONTRACT_ID locally}"
    : "${LOCK:?set LOCK locally}"
    : "${LOCK_ANCHOR:?set LOCK_ANCHOR locally}"
    mount | grep -F " on $MOUNT (" >/dev/null || fail
    [[ "$(diskutil info -plist "$MOUNT" | \
      plutil -extract VolumeName raw -o - -)" == "$VOL" ]] || fail
    [[ -d "$PACK" && ! -L "$PACK" ]] || fail
    [[ -d "$ANCHOR" && ! -L "$ANCHOR" ]] || fail
    [[ "$LOCK_TOOL" == /* && -f "$LOCK_TOOL" && -x "$LOCK_TOOL" && \
       ! -L "$LOCK_TOOL" ]] || fail
    [[ "$(/bin/realpath "$LOCK_TOOL")" == "$LOCK_TOOL" ]] || fail
    LOCK_MODULE="$(dirname "$LOCK_TOOL")/private-pack-lock.mjs"
    [[ -f "$LOCK_MODULE" && ! -L "$LOCK_MODULE" ]] || fail
    [[ "$(/bin/realpath "$LOCK_MODULE")" == "$LOCK_MODULE" ]] || fail
    LOCK_REPOSITORY_ROOT="$(cd "$(dirname "$LOCK_TOOL")/.." && pwd -P)" || fail
    [[ "$(git -C "$LOCK_REPOSITORY_ROOT" rev-parse --show-toplevel)" == \
       "$LOCK_REPOSITORY_ROOT" ]] || fail
    print -rn -- "$EXPECTED_REPOSITORY_REVISION" | \
      LC_ALL=C grep -Eq '^[a-f0-9]{40,64}$' || fail
    [[ "$(git -C "$LOCK_REPOSITORY_ROOT" rev-parse HEAD)" == \
       "$EXPECTED_REPOSITORY_REVISION" ]] || fail
    repository_status="$(git -C "$LOCK_REPOSITORY_ROOT" status --porcelain \
      --untracked-files=all)" || fail
    [[ -z "$repository_status" ]] || fail
    unset repository_status
    [[ "$NODE_TOOL" == /* && -f "$NODE_TOOL" && -x "$NODE_TOOL" && \
       ! -L "$NODE_TOOL" ]] || fail
    [[ "$(/bin/realpath "$NODE_TOOL")" == "$NODE_TOOL" ]] || fail
    neutral_token "$CONTRACT_ID" 128 || fail
    for expected_sha in "$EXPECTED_NODE_SHA256" \
        "$EXPECTED_LOCK_TOOL_SHA256" "$EXPECTED_LOCK_MODULE_SHA256"; do
      print -rn -- "$expected_sha" | \
        LC_ALL=C grep -Eq '^[a-f0-9]{64}$' || fail
    done
    unset expected_sha
    [[ "$(shasum -a 256 "$NODE_TOOL" | awk '{print $1}')" == \
       "$EXPECTED_NODE_SHA256" ]] || fail
    [[ "$(shasum -a 256 "$LOCK_TOOL" | awk '{print $1}')" == \
       "$EXPECTED_LOCK_TOOL_SHA256" ]] || fail
    [[ "$(shasum -a 256 "$LOCK_MODULE" | awk '{print $1}')" == \
       "$EXPECTED_LOCK_MODULE_SHA256" ]] || fail
    node_version="$(/usr/bin/env -i LC_ALL=C \
      PATH=/usr/bin:/bin:/usr/sbin:/sbin \
      "$NODE_TOOL" --version 2>/dev/null)" || fail
    neutral_token "$node_version" 128 || fail
    unset node_version
    run_lock_tool() {
      /usr/bin/env -i \
        LC_ALL=C \
        PATH=/usr/bin:/bin:/usr/sbin:/sbin \
        /bin/sh "$LOCK_TOOL" "$NODE_TOOL" "$@"
    }
    [[ "$(dirname "$LOCK")" == "$PACK" ]] || fail
    [[ "$(dirname "$LOCK_ANCHOR")" == "$ANCHOR" ]] || fail
    for local_name in "$(basename "$LOCK")" "$(basename "$LOCK_ANCHOR")"; do
      neutral_token "$local_name" 255 || fail
    done
    unset local_name
    [[ -f "$PACK/artifact-roles.json" && \
       ! -L "$PACK/artifact-roles.json" ]] || fail
    [[ ! -e "$LOCK" && ! -L "$LOCK" ]] || fail
    [[ ! -e "$LOCK_ANCHOR" && ! -L "$LOCK_ANCHOR" ]] || fail
    run_lock_tool create "$PACK" "$LOCK" "$CONTRACT_ID" >/dev/null
    run_lock_tool verify "$PACK" "$LOCK" "$CONTRACT_ID" >/dev/null
    [[ -f "$LOCK" && ! -L "$LOCK" ]] || fail
    [[ "$(stat -f '%l' "$LOCK")" == "1" ]] || fail
    chmod -R a-w "$PACK"
    chflags -R uchg "$PACK"
    run_lock_tool verify "$PACK" "$LOCK" "$CONTRACT_ID" >/dev/null
    lock_sha256="$(shasum -a 256 "$LOCK" | awk '{print $1}')"
    lock_bytes="$(stat -f '%z' "$LOCK")"
    freeze_time="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
    {
      print -r -- "contract_id=$CONTRACT_ID"
      print -r -- "algorithm=sha256"
      print -r -- "lock_sha256=$lock_sha256"
      print -r -- "lock_bytes=$lock_bytes"
      print -r -- "frozen_at=$freeze_time"
    } > "$LOCK_ANCHOR"
    chmod 400 "$LOCK_ANCHOR"
    chflags uchg "$LOCK_ANCHOR"
    unset lock_sha256 lock_bytes freeze_time
    ```

12. **Review the exact immutable pack and bind both confirmations.** After
    `PACK` and its lock-anchor are immutable, the owner and a separate authorized
    reviewer independently inspect the same read-only artifact set. Each must
    confirm the content decisions, repeat the same canonical Node/wrapper/module
    hash checks and clean-environment `run_lock_tool` definition, and rerun the
    owner-only lock verifier. This proves all-and-only closure, roles, byte
    lengths, hashes, neutral paths, hard-link count one, and absence of links,
    special files, nested mounts, path escapes, non-allowlisted xattrs, and
    resource forks. Each also recalculates the exact lock digest and length and
    compares them with the anchor without printing either value.

    The default review path is local and supervised on the already mounted
    encrypted volume, with every assistant, model, synchronizer, and unapproved
    processor closed. The reviewer does not receive the volume passphrase and
    makes no email, chat, cloud, editor-service, or removable copy. Any other
    access path must be explicitly authorized and encrypted in the data-handling
    plan, added to the copy inventory, and covered by retention and deletion. If
    safe independent review is unavailable, stop or shrink; owner self-review
    is not an independent review.

    Both confirmations must bind the same completed lock bytes and exact
    immutable `PACK`. Any mismatch, write after locking, or inability to verify
    the same content and inventory invalidates the attempt. Permissions and
    flags protect against accidents; the closed inventory and three digest-bound
    anchor records remain the evidence.

    Each final confirmation contains exactly these private fields: opaque local
    contract identity, role, `confirmed` or `reject`, `inventory_verified`,
    `content_review_bound`, digest algorithm, exact lock digest, exact lock byte
    length, and review time. Write it directly to a new file under `ANCHOR`, set
    mode `0400`, apply `uchg`, and do not print it. After both confirmations are
    immutable, run `chmod 500 "$ANCHOR"` and `chflags uchg "$ANCHOR"`. If either
    reviewer returns `reject`, do not create a public attestation.

    After these confirmations, any change to source bytes, manifest, knowledge
    boundary, reveal order, tasks, oracle, baseline, exposure, evaluation,
    resource budgets, decision thresholds, handling, incident policy, or twin
    decision creates a new G1 contract identity. Never reinterpret such a
    change as an M2-only runtime update or repair the frozen contract in place.

13. **Publish only the safe receipt.** Start from
    [`PUBLIC-G1-RECEIPT.json`](PUBLIC-G1-RECEIPT.json). The only allowed first
    instance path is
    `experiments/receipts/g1-evidence-contract-v1.json`. The template and the
    repository quality gate define its exact v1 key allowlist. Create the
    candidate under `WORK`; keep `documentKind`, `gate`, `trustBasis`,
    `publicBounds`, and `claimBoundary` byte-for-byte semantically unchanged,
    set `status` to `attested`, set `attestedOn` to one approved `YYYY-MM-DD`
    date, and set every existing `attestations` value to `true`. Remove no key,
    add no key, and publish no other field.

    Before either human reviews it, make the candidate itself immutable. This
    prevents a reviewed pathname from being replaced or changed before the
    controlled copy:

    ```sh
    : "${RECEIPT_CANDIDATE:?set WORK receipt candidate locally}"
    [[ "$(dirname "$RECEIPT_CANDIDATE")" == "$WORK" ]] || fail
    [[ -f "$RECEIPT_CANDIDATE" && ! -L "$RECEIPT_CANDIDATE" ]] || fail
    [[ "$(stat -f '%l' "$RECEIPT_CANDIDATE")" == "1" ]] || fail
    /usr/bin/xattr -cs "$RECEIPT_CANDIDATE" || fail
    assert_only_system_provenance "$RECEIPT_CANDIDATE" || fail
    chmod -N "$RECEIPT_CANDIDATE"
    chmod 400 "$RECEIPT_CANDIDATE"
    chflags uchg "$RECEIPT_CANDIDATE"
    [[ "$(stat -f '%u:%Lp' "$RECEIPT_CANDIDATE")" == \
       "$(id -u):400" ]] || fail
    [[ "$(stat -f '%Sf' "$RECEIPT_CANDIDATE")" == *uchg* ]] || fail
    assert_no_acl "$RECEIPT_CANDIDATE" || fail
    assert_only_system_provenance "$RECEIPT_CANDIDATE" || fail
    ```

    Publish only after every private check and both final lock-bound
    confirmations pass. Two authorized humans must review both the exact
    candidate bytes and the exact destination path for disclosure before it
    leaves the encrypted volume. It may contain only those coarse attestations:
    no private path, source or person name, opaque private ID, exact count, task
    text, answer, metric, timestamp more precise than the approved date, digest,
    excerpt, failure detail, or correlation handle. Both reviewers must also
    run `assert_no_acl` and `assert_only_system_provenance` on the candidate,
    proving that it has no ACL, resource fork, or xattr beyond the fixed-length
    macOS provenance attribute.

    Only after both reviewers approve may the owner copy that one file with
    `/bin/cp -X` to the fixed repository path while all assistants remain
    closed. Set the public file mode to `0644`, clear destination xattrs, run
    `assert_only_system_provenance` on it, and use `/usr/bin/cmp -s` to prove the
    destination data fork equals the reviewed candidate. Do not overwrite an
    existing receipt.

    If publication occurs in a later mounted session, repeat the clean-shell
    initialization and the canonical Node, repository revision, and executable
    hash checks from step 11 first. After both approvals, use this fail-closed
    copy block with the exact public checkout and reviewed candidate paths set
    locally:

    ```sh
    : "${REPOSITORY_ROOT:?set exact public GraphTruth checkout locally}"
    : "${RECEIPT_CANDIDATE:?set reviewed WORK receipt locally}"
    : "${NODE_TOOL:?set audited canonical Node executable locally}"
    : "${EXPECTED_REPOSITORY_REVISION:?set merged GraphTruth revision locally}"
    [[ "$REPOSITORY_ROOT" == /* && -d "$REPOSITORY_ROOT/.git" && \
       ! -L "$REPOSITORY_ROOT" ]] || fail
    [[ "$(/bin/realpath "$REPOSITORY_ROOT")" == "$REPOSITORY_ROOT" ]] || fail
    [[ "$(git -C "$REPOSITORY_ROOT" rev-parse --show-toplevel)" == \
       "$REPOSITORY_ROOT" ]] || fail
    [[ "$(git -C "$REPOSITORY_ROOT" rev-parse HEAD)" == \
       "$EXPECTED_REPOSITORY_REVISION" ]] || fail
    repository_status="$(git -C "$REPOSITORY_ROOT" status --porcelain \
      --untracked-files=all)" || fail
    [[ -z "$repository_status" ]] || fail
    unset repository_status
    [[ "$(dirname "$RECEIPT_CANDIDATE")" == "$WORK" ]] || fail
    [[ -f "$RECEIPT_CANDIDATE" && ! -L "$RECEIPT_CANDIDATE" ]] || fail
    [[ "$(stat -f '%l' "$RECEIPT_CANDIDATE")" == "1" ]] || fail
    [[ "$(stat -f '%u:%Lp' "$RECEIPT_CANDIDATE")" == \
       "$(id -u):400" ]] || fail
    [[ "$(stat -f '%Sf' "$RECEIPT_CANDIDATE")" == *uchg* ]] || fail
    assert_no_acl "$RECEIPT_CANDIDATE" || fail
    assert_only_system_provenance "$RECEIPT_CANDIDATE" || fail
    public_receipt_dir="$REPOSITORY_ROOT/experiments/receipts"
    public_receipt="$public_receipt_dir/g1-evidence-contract-v1.json"
    public_receipt_check="$REPOSITORY_ROOT/tooling/check.mjs"
    [[ -f "$public_receipt_check" && ! -L "$public_receipt_check" ]] || fail
    PUBLIC_RECEIPT_DIR_CREATED=0
    if [[ -e "$public_receipt_dir" ]]; then
      [[ -d "$public_receipt_dir" && ! -L "$public_receipt_dir" ]] || fail
      [[ ! -e "$public_receipt" && ! -L "$public_receipt" ]] || fail
      PUBLIC_RECEIPT_PENDING="$public_receipt"
    else
      [[ ! -L "$public_receipt_dir" ]] || fail
      mkdir -m 755 "$public_receipt_dir"
      PUBLIC_RECEIPT_DIR_CREATED=1
      PUBLIC_RECEIPT_PENDING="$public_receipt"
    fi
    [[ -d "$public_receipt_dir" && ! -L "$public_receipt_dir" ]] || fail
    [[ ! -e "$public_receipt" && ! -L "$public_receipt" ]] || fail
    /bin/cp -X "$RECEIPT_CANDIDATE" "$public_receipt"
    chmod -N "$public_receipt"
    chmod 644 "$public_receipt"
    /usr/bin/xattr -cs "$public_receipt" || fail
    assert_only_system_provenance "$public_receipt" || fail
    [[ "$(stat -f '%u:%Lp' "$public_receipt")" == \
       "$(id -u):644" ]] || fail
    [[ "$(stat -f '%l' "$public_receipt")" == "1" ]] || fail
    assert_no_acl "$public_receipt" || fail
    /usr/bin/cmp -s "$RECEIPT_CANDIDATE" "$public_receipt" || fail
    if ! /usr/bin/env -i \
        LC_ALL=C \
        PATH=/usr/bin:/bin:/usr/sbin:/sbin \
        "$NODE_TOOL" "$public_receipt_check" >/dev/null 2>&1; then
      fail
    fi
    PUBLIC_RECEIPT_PENDING=''
    PUBLIC_RECEIPT_DIR_CREATED=0
    unset public_receipt public_receipt_check public_receipt_dir
    ```

    If the later full repository gate rejects the receipt itself, close every
    assistant, remove the uncommitted rejected public copy, return to `WORK`,
    create and review a new candidate, and repeat the controlled copy. Never
    overwrite a receipt or repair attested bytes through an assistant. Detach
    the private volume and prove the image is no longer attached before
    reopening Codex; share only that independently reviewed receipt.

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
- the repo-active-date budget or calendar hard stop is reached;
- any required field remains unknown, provisional, or contradictory;
- anyone attempts to run private data before the M2 admission gate closes.

An invalid or rejected attempt remains in the private selection and incident
history. Do not rename, delete, or restart it to recover a favorable outcome or
a fresh budget.
