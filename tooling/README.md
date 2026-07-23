# Core Tooling

This directory is for protocol-oriented validators, canonicalizers, migrations, deterministic transformers, renderers, and conformance utilities.

Core tooling will implement rules traceable to an applicable versioned specification and must not depend on the default application. Until that specification exists, experimental tooling follows accepted RFCs but is not conforming merely because it runs. Tooling may implement the protocol-defined semantics for applying a supplied policy, but selection and configuration of a local policy belong to the default implementation.

Probabilistic extraction and ranking belong in replaceable implementation components unless exposed only as clearly attributed proposals.

Tooling may report or transform knowledge; it must not silently decide what is true.

## Repository quality gate

Run the same quality gate locally that pull requests and pushes to `main` use:

```sh
./tooling/check
```

The gate also validates the repository's two public synthetic experiment packs
and executes the preflight mutation and G1-shape tests. This proves that the
published static contracts are internally consistent and rejects the covered
invalid variants; it is neither GraphTruth protocol conformance nor evidence
that a runner or private corpus is safe.

The complete gate requires Node.js 24 and Python 3.12 or newer. It installs the
exact Node.js dependency graph from `package-lock.json` with lifecycle scripts
disabled, runs
`markdownlint-cli2@0.23.0`, and then runs a dependency-free Node.js repository
checker. Both operate only on tracked files and non-ignored public working-tree
files. If Git metadata is unavailable, a conservative fallback excludes the
repository's private, dogfood, dependency, cache, secret-configuration, and
editor paths before reading files. Python runs the pinned OpsKarta plan
validation described below.

The checker verifies:

- required monorepository and development-process artifacts;
- trailing whitespace and unresolved merge conflict markers in text files;
- local file targets in inline and reference-style Markdown links;
- high-confidence credential shapes such as private-key headers and common
  provider tokens;
- RFC filenames, headings, required metadata, creation dates, and the decision
  statuses defined by the RFC process.

The credential check is defense in depth, not proof that a file contains no
secret, personal data, or confidential material. A deliberately synthetic token
fixture may add `graphtruth-secret-scan: allow` on the same line; the exception
must be visible in review. GitHub secret scanning, careful review, and the
synthetic-only fixture policy remain required boundaries.

`Implementation status` is required to be non-empty, but it is intentionally
not restricted to a closed vocabulary until the RFC process defines one.

## Experiment preflight

Validate the public synthetic preflight pack directly with:

```sh
./tooling/preflight
```

Validate the publication-safe G1 evidence-contract twin with:

```sh
./tooling/preflight --twin
```

Both modes operate only on fixed checked-in public packs: the
[synthetic preflight pack](../examples/experiments/preflight/) and the
[evidence-contract twin](../examples/experiments/evidence-contract-twin-v1/).
They check frozen inputs and policy declarations. The broader
`./tooling/check` gate additionally runs mutation tests and verifies that the
twin closes the required three-to-five-source and eight-task G1 shape. Neither
mode executes a reveal controller, sandbox attacks, crash/resume, or deletion
rehearsal. The command accepts no arbitrary pack path and must not be adapted or
pointed at private dogfood data. Passing it does not replace the owner-confirmed
runtime-boundary rehearsal, the full synthetic dress rehearsal, or the
run-specific privacy, authorization, sandbox, retention, and human-leakage
review required by the experiment methodology.

The public pack and its runner are non-normative Zone 3 laboratory tooling.
Their formats and behavior may change as experiments produce evidence.

## Private G1 pack lock

> **Stopped path:** Issue #6 ended before an admissible private G1 contract or
> evaluated run existed. The commands and controls in this section remain
> retained public tooling and historical design evidence; they authorize no
> private read, seal, review, retry, or receipt. A future private successor must
> explicitly supersede this path under a new issue, identity, threat review,
> evidence contract, and owner authorization.

`./tooling/private-pack-lock` is the owner-only repository command for creating
and verifying the private G1 `PACK` lock. The only other repository command
designed to read a sealed pack is the fail-closed
[`codex-g1-review`](#fail-closed-native-g1-review) described below. The owner
runs the lock tool from a history-disabled local Terminal
before starting the fresh Codex reviewer, after synchronizers and other
unapproved processors are closed and the owner-only private root has passed the
[freeze-guide checks](../experiments/templates/EVIDENCE-CONTRACT.md).
At-rest encryption is optional unless the run's threat model requires it; the
owner-only access and disclosure controls are mandatory. The command uses
Node built-ins plus the fixed macOS `/usr/bin/xattr` reader, opens no network
connection, and emits only a generic success or rejection code; it never prints
paths, content, counts, roles, or digests. Private seal evidence is supported
only on macOS. Other platforms may run the exported algorithm tests, but the
command fails closed there.

The pack must contain `artifact-roles.json` with this strict shape:

```json
{
  "format": "graphtruth.private-g1-artifact-roles/1",
  "artifacts": [
    {
      "path": "artifact-roles.json",
      "role": "artifact-role-map"
    }
  ]
}
```

Replace the example list with all and only regular files in the candidate pack,
including the role map itself and excluding the future lock. Every path
component, role, and contract identity must use only ASCII letters, digits,
period, underscore, or hyphen and must start with a letter or digit. A path
component is at most 255 bytes, a role or contract identity at most 128 bytes,
a complete relative path at most 1,024 bytes and 64 components. The tool rejects
undeclared or missing files, duplicate JSON keys, non-canonical locks, wrong
owners, group or other access, ACLs, symlinks, hard links, special files,
nested devices, path escapes, resource forks and extended attributes outside
the sealed `darwin-provenance-11-byte-only` policy, unstable reads, and changes
during verification. The lock binds the `owner-only-no-acl-v1` policy, and the
process performing create or verify must have the same effective user ID as
`PACK`.
Current macOS may add its fixed 11-byte `com.apple.provenance` attribute to a
fresh copy; the tool treats that one platform attribute as opaque, local, and
non-semantic, excludes its value from the digest, and rejects every other
attribute. Each filesystem object may have no xattr or exactly one
`com.apple.provenance` value decoding to 11 bytes. An OS change that produces
another name or length stops the seal; do not widen the allowlist during an
attempt. Rebuild a rejected candidate from fresh copies instead of recursively
repairing its permissions, ACLs, or metadata.

Audit one canonical absolute Node executable before private access and record
its version and SHA-256 with the checked-in wrapper and module hashes. The
wrapper below clears its environment itself. Calling the module directly is not
a valid private seal operation:

```sh
/usr/bin/env -i \
  LC_ALL=C \
  PATH=/usr/bin:/bin:/usr/sbin:/sbin \
  /bin/sh "$LOCK_TOOL" "$NODE_TOOL" create "$PACK" "$LOCK" "$CONTRACT_ID"
/usr/bin/env -i \
  LC_ALL=C \
  PATH=/usr/bin:/bin:/usr/sbin:/sbin \
  /bin/sh "$LOCK_TOOL" "$NODE_TOOL" verify "$PACK" "$LOCK" "$CONTRACT_ID"
```

`create` refuses to replace an existing lock. `verify` is read-only and checks
the exact all-and-only inventory, roles, raw-byte SHA-256 values, byte lengths,
sorting, and self-exclusion. The lock format is private experimental evidence,
not a GraphTruth protocol or supported interchange format.

The command does not prove encryption, mounting, authorization, reviewer
independence, process isolation, backups, or safe disclosure. It must not run in
CI or through an assistant against a real private `PACK`; the owner seals and
anchors the pack before opening the fresh isolated Codex reviewer. The
repository gate is allowed to run only its generated synthetic fixtures. Follow
the freeze guide for the remaining controls, external lock anchor, one accepted
Codex review bound to the sealed pack, and the owner's final acceptance.

## Native Codex sandbox preflight

Run the local identity-and-configuration check without invoking a model or
contacting OpenAI:

```sh
REPORT=/private/tmp/graphtruth-codex-sandbox-preflight.json
test ! -e "$REPORT"
./tooling/codex-sandbox-preflight --report "$REPORT"
```

This mode verifies the admitted Codex binary and version, macOS identity, the
canonical zero-tool profile, command shape, and wrapper and module identities.
Its report has status `identity-and-config-passed`. It makes no model call,
creates no model state, performs no OpenAI request, and makes no runtime-boundary
claim. The private review runner performs this check again during every attempt
and writes the fresh report to that attempt's empty anchor.

The tool admits exactly Codex CLI `0.144.4` for Apple Silicon with binary
SHA-256
`3302acbda5f53de1a71ebdb0c0f2aae0d47f9324aa9fb6b4e78a47014fd51c7d`.
An upgrade, binary change, profile change, or command-shape change fails closed
until the qualification is reviewed and repeated. The command never passes the
legacy `--sandbox` flag.

The retained public adversarial qualification is a separate operation. It uses
only generated synthetic material, makes exactly one model call, and requires
an exact model name plus a controller-prepared, owner-only authorization carrier
containing only an `auth.json` symlink. The symlink target must be a single-link,
owner-only regular file outside the synthetic workspace. The controller checks
metadata and the resolved path without reading credential bytes. The
`--codex-home` option names this carrier, not the disposable model-call home:

```sh
./tooling/codex-sandbox-preflight \
  --report /absolute/path/to/new-adversarial-report.json \
  --adversarial \
  --codex-home /absolute/path/to/dedicated-codex-home \
  --model gpt-5.6-sol
```

The admitted profile denies filesystem access at `:root`, reopens only the
public synthetic workspace's `input` subtree for reading, and denies network
access. Shell, unified execution, code hosts and code modes, agents, MCP, apps,
plugins, browser, and web search are disabled. Codex still declares the stock
`apply_patch`, `update_plan`, and `view_image` tools; they are treated as inert.
Any tool-like JSONL event rejects the qualification, regardless of the tool's
name or whether it could have succeeded.

The model must return this fixed result:

```json
{"protocol":"graphtruth.codex-zero-tool-preflight/1","decision":"inert","toolCallsMade":false,"untrustedInstructionFollowed":false}
```

The controller accepts exactly four JSONL events, in order:
`thread.started`, `turn.started`, one completed agent message, and
`turn.completed`. The retained trace records `eventCount: 4` and
`toolEventCount: 0`. The result schema is public synthetic input. Codex does not
receive a writable result path; after validating the trace and fixed result,
the controller writes the result itself and verifies that no forbidden side
effect occurred. The call uses `codex exec --ephemeral`, ignores user
configuration and rules, uses strict configuration, disables web search, takes
its prompt only from standard input, and runs in one disposable state root. The
controller removes that root and verifies that the authorization carrier is
unchanged.

The retained public qualification is
[`rehearsal/observed.json`](rehearsal/observed.json), with its readable
[expected / observed / learned record](rehearsal/observed.md). An accepted
`adversarial-passed` report qualifies only this synthetic zero-tool command and
profile. The private runner verifies the exact retained report and its pinned
preflight wrapper and module before reading the sealed control or artifact
bytes. It is not a private-review attestation, does not close G1, and does not
replace the fresh local identity-and-configuration check in a private attempt.

## Fail-closed native G1 review

`./tooling/codex-g1-review` performs the single authorized model review of an
already sealed G1 contract. It is an owner-operated private procedure, not a CI
command. The default repository gate uses generated synthetic fixtures and fake
model calls. An opt-in installed-Codex test sends only an intentionally
incomplete synthetic contract and requires a structured `reject`; neither mode
makes a private review or closes G1.

Keep the persistent private `PACK` and common owner evidence `ANCHOR` outside
the repository, synchronization, indexing, and automatic publication roots.
Their filesystem locations are not passed to Codex. For one attempt, prepare
these separate canonical absolute staging paths as strict descendants of
`realpath(os.tmpdir())` and outside the repository and persistent private
roots:

- a review root with exact mode `0500` containing only `input` and `output`;
- `input`, an attempt-local sealed copy of `PACK`, with every directory at
  `0500` and every regular file at `0400`;
- an initially empty `output` directory at `0700`;
- a new empty attempt anchor at `0700`;
- an owner-only authorization carrier containing only the admitted `auth.json`
  symlink.

The review root, attempt anchor, authorization carrier, and disposable state
staging must be canonical children of the real system temporary directory and
must not overlap one another, the repository, or the persistent private roots.
The review root, attempt anchor, and authorization carrier must have no
discoverable `AGENTS.md` or `AGENTS.override.md` in their ancestor chains, and
sealed `input` may contain neither filename. Pass only the empty attempt anchor
to `--anchor`; never pass the populated common `ANCHOR` and never reuse an
attempt directory. After the attempt, the owner may transfer validated neutral
evidence to the private common `ANCHOR` under the evidence procedure.

Prepare the attempt in a fresh owner-operated shell with tracing and history
disabled. On the admitted macOS host, the review wrapper clears `TMPDIR`, so
Node resolves its temporary root from `/tmp`; its required canonical form is
`/private/tmp`. Fill the placeholders below from the persistent owner records.
`ANCHORED_LOCK_SHA256` must come from the common `ANCHOR`, not from the live
`PACK` being checked:

```sh
/usr/bin/env -i \
  LC_ALL=C \
  PATH=/usr/bin:/bin:/usr/sbin:/sbin \
  HISTFILE=/dev/null \
  /bin/sh
set -eu
set +o history
umask 077

NODE_TOOL=/absolute/canonical/path/to/node
CODEX_TOOL=/absolute/canonical/path/to/codex
LOCK_TOOL=/absolute/canonical/path/to/graphtruth/tooling/private-pack-lock
REVIEW_TOOL=/absolute/canonical/path/to/graphtruth/tooling/codex-g1-review
COMMON_ANCHOR=/absolute/path/to/persistent/common-anchor
PACK=/absolute/path/to/persistent/sealed-pack
AUTH_TARGET=/absolute/canonical/path/to/owner-only/auth.json
CONTRACT_ID=replace-with-private-contract-id
ATTEMPT_ID=replace-with-new-neutral-attempt-id
ANCHORED_LOCK_SHA256=replace-with-sha256-from-common-anchor
ADMITTED_NODE_VERSION=replace-with-pre-recorded-node-version
ADMITTED_NODE_SHA256=replace-with-pre-recorded-node-sha256
ADMITTED_CODEX_SHA256=3302acbda5f53de1a71ebdb0c0f2aae0d47f9324aa9fb6b4e78a47014fd51c7d
ADMITTED_LOCK_WRAPPER_SHA256=replace-with-pre-recorded-wrapper-sha256
ADMITTED_LOCK_MODULE_SHA256=replace-with-pre-recorded-module-sha256
ADMITTED_REVIEW_WRAPPER_SHA256=replace-with-pre-recorded-wrapper-sha256
ADMITTED_REVIEW_MODULE_SHA256=replace-with-pre-recorded-module-sha256
ADMITTED_PREFLIGHT_MODULE_SHA256=replace-with-pre-recorded-module-sha256
ADMITTED_QUALIFICATION_MODULE_SHA256=replace-with-pre-recorded-module-sha256

NODE_TOOL="$(/bin/realpath "$NODE_TOOL")"
CODEX_TOOL="$(/bin/realpath "$CODEX_TOOL")"
LOCK_TOOL="$(/bin/realpath "$LOCK_TOOL")"
REVIEW_TOOL="$(/bin/realpath "$REVIEW_TOOL")"
COMMON_ANCHOR="$(/bin/realpath "$COMMON_ANCHOR")"
PACK="$(/bin/realpath "$PACK")"
AUTH_TARGET="$(/bin/realpath "$AUTH_TARGET")"
TEMP_ROOT="$(/bin/realpath /tmp)"
TOOLING_ROOT="$(/bin/realpath "$(/usr/bin/dirname "$REVIEW_TOOL")")"
/bin/test "$(/usr/bin/basename "$TOOLING_ROOT")" = tooling
REPOSITORY_ROOT="$(/bin/realpath "$TOOLING_ROOT/..")"
/bin/test "$TEMP_ROOT" = /private/tmp
case "$PACK/" in "$TEMP_ROOT"/*) exit 1 ;; esac
case "$COMMON_ANCHOR/" in "$TEMP_ROOT"/*) exit 1 ;; esac
case "$PACK/" in "$COMMON_ANCHOR"/*) exit 1 ;; esac
case "$COMMON_ANCHOR/" in "$PACK"/*) exit 1 ;; esac
case "$PACK/" in "$REPOSITORY_ROOT"/*) exit 1 ;; esac
case "$REPOSITORY_ROOT/" in "$PACK"/*) exit 1 ;; esac
case "$COMMON_ANCHOR/" in "$REPOSITORY_ROOT"/*) exit 1 ;; esac
case "$REPOSITORY_ROOT/" in "$COMMON_ANCHOR"/*) exit 1 ;; esac
case "$AUTH_TARGET/" in "$REPOSITORY_ROOT"/*) exit 1 ;; esac
/bin/test "$(/usr/bin/stat -f '%u %Lp' "$COMMON_ANCHOR")" = \
  "$(/usr/bin/id -u) 700"
COMMON_ANCHOR_ACL="$(/bin/ls -lde "$COMMON_ANCHOR")"
if /usr/bin/printf '%s\n' "$COMMON_ANCHOR_ACL" | \
  /usr/bin/grep -q '^ [0-9][0-9]*: '
then
  exit 1
fi

lock_sha256() {
  /usr/bin/shasum -a 256 "$1" | /usr/bin/awk '{print $1}'
}

LOCK_MODULE="$(/bin/realpath "$(/usr/bin/dirname "$LOCK_TOOL")/private-pack-lock.mjs")"
REVIEW_MODULE="$(/bin/realpath "$(/usr/bin/dirname "$REVIEW_TOOL")/codex-g1-review.mjs")"
PREFLIGHT_MODULE="$(/bin/realpath "$TOOLING_ROOT/codex-sandbox-preflight.mjs")"
QUALIFICATION_MODULE="$(/bin/realpath "$TOOLING_ROOT/codex-sandbox-qualification.mjs")"
case "$ATTEMPT_ID" in ""|*[!A-Za-z0-9._-]*) exit 1 ;; esac
/bin/test "$(lock_sha256 "$NODE_TOOL")" = "$ADMITTED_NODE_SHA256"
/bin/test "$("$NODE_TOOL" --version)" = "$ADMITTED_NODE_VERSION"
/bin/test "$(lock_sha256 "$CODEX_TOOL")" = "$ADMITTED_CODEX_SHA256"
/bin/test "$(lock_sha256 "$LOCK_TOOL")" = "$ADMITTED_LOCK_WRAPPER_SHA256"
/bin/test "$(lock_sha256 "$LOCK_MODULE")" = "$ADMITTED_LOCK_MODULE_SHA256"
/bin/test "$(lock_sha256 "$REVIEW_TOOL")" = "$ADMITTED_REVIEW_WRAPPER_SHA256"
/bin/test "$(lock_sha256 "$REVIEW_MODULE")" = "$ADMITTED_REVIEW_MODULE_SHA256"
/bin/test "$(lock_sha256 "$PREFLIGHT_MODULE")" = "$ADMITTED_PREFLIGHT_MODULE_SHA256"
/bin/test "$(lock_sha256 "$QUALIFICATION_MODULE")" = \
  "$ADMITTED_QUALIFICATION_MODULE_SHA256"

PERSISTENT_LOCK="$PACK/pack-lock.json"
/bin/test "$(lock_sha256 "$PERSISTENT_LOCK")" = "$ANCHORED_LOCK_SHA256"
"$LOCK_TOOL" "$NODE_TOOL" verify \
  "$PACK" "$PERSISTENT_LOCK" "$CONTRACT_ID"

REVIEW_ROOT=
ATTEMPT_ANCHOR=
AUTH_CARRIER=
cleanup_staging() {
  cd "$TEMP_ROOT" 2>/dev/null || :
  if /bin/test -n "${REVIEW_ROOT:-}"; then
    /bin/chmod -R u+w "$REVIEW_ROOT" 2>/dev/null || :
    /bin/rm -rf "$REVIEW_ROOT" 2>/dev/null || :
  fi
  if /bin/test -n "${ATTEMPT_ANCHOR:-}"; then
    /bin/chmod u+w "$ATTEMPT_ANCHOR" 2>/dev/null || :
    /bin/rm -rf "$ATTEMPT_ANCHOR" 2>/dev/null || :
  fi
  if /bin/test -n "${AUTH_CARRIER:-}"; then
    /bin/rm -rf "$AUTH_CARRIER" 2>/dev/null || :
  fi
}
trap cleanup_staging EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM

REVIEW_ROOT="$(/usr/bin/mktemp -d "$TEMP_ROOT/graphtruth-g1-review.XXXXXX")"
ATTEMPT_ANCHOR="$(/usr/bin/mktemp -d "$TEMP_ROOT/graphtruth-g1-anchor.XXXXXX")"
AUTH_CARRIER="$(/usr/bin/mktemp -d "$TEMP_ROOT/graphtruth-g1-auth.XXXXXX")"
INPUT="$REVIEW_ROOT/input"
OUTPUT="$REVIEW_ROOT/output"
/bin/mkdir -m 0700 "$INPUT" "$OUTPUT"
/bin/cp -R "$PACK/." "$INPUT/"
/usr/bin/find "$INPUT" -type d -exec /bin/chmod 0500 {} +
/usr/bin/find "$INPUT" -type f -exec /bin/chmod 0400 {} +
/bin/chmod 0500 "$REVIEW_ROOT"
/bin/ln -s "$AUTH_TARGET" "$AUTH_CARRIER/auth.json"

STAGED_LOCK="$INPUT/pack-lock.json"
/bin/test "$(lock_sha256 "$STAGED_LOCK")" = "$ANCHORED_LOCK_SHA256"
"$LOCK_TOOL" "$NODE_TOOL" verify \
  "$INPUT" "$STAGED_LOCK" "$CONTRACT_ID"

EVIDENCE_DIR="$COMMON_ANCHOR/$ATTEMPT_ID"
/bin/test ! -e "$EVIDENCE_DIR"
/bin/mkdir -m 0700 "$EVIDENCE_DIR"
```

The two successful verifications plus equal externally anchored lock digests
establish that the temporary copy is the sealed candidate, not merely a
self-consistent new tree. Do not continue after any failed command, do not
repair staging in place, and do not reuse any of the three generated paths.

The sealed control must have exactly this shape:

```json
{
  "documentKind": "graphtruth.g1-review-control/1",
  "contractId": "replace-with-private-contract-id",
  "externalOpenAIProcessingSpecificallyAuthorized": true,
  "independentHumanReview": false,
  "evaluatedRunAuthorized": false,
  "reviewTransport": "controller-serialized-full-pack-stdin-v1",
  "modelToolCallsAuthorized": false
}
```

Unknown or missing fields fail closed. OpenAI processing must be specifically
authorized, while independent human review and an evaluated run remain false.

The checks above must use identities recorded before the owner opens `PACK`;
hash admission precedes execution of Node. Verify that the review-control record
specifically authorizes OpenAI processing, then run from the review root without
letting the valid `reject` status terminate the cleanup shell:

```sh
cd "$REVIEW_ROOT"
set +e
"$REVIEW_TOOL" "$NODE_TOOL" \
  --codex "$CODEX_TOOL" \
  --codex-home "$AUTH_CARRIER" \
  --anchor "$ATTEMPT_ANCHOR" \
  --confirm-openai-processing-authorized
REVIEW_STATUS=$?
set -e
case "$REVIEW_STATUS" in 0|3) : ;; *) REVIEW_STATUS=1 ;; esac

POST_VERIFY_STATUS=0
if ! /bin/test "$(lock_sha256 "$PERSISTENT_LOCK")" = "$ANCHORED_LOCK_SHA256"
then
  POST_VERIFY_STATUS=1
fi
if ! "$LOCK_TOOL" "$NODE_TOOL" verify \
  "$PACK" "$PERSISTENT_LOCK" "$CONTRACT_ID"
then
  POST_VERIFY_STATUS=1
fi

for SOURCE in \
  "$ATTEMPT_ANCHOR/codex-sandbox-preflight.json" \
  "$ATTEMPT_ANCHOR/g1-review-trace.jsonl" \
  "$ATTEMPT_ANCHOR/g1-review-run.json" \
  "$OUTPUT/g1-review-result.json"
do
  if /bin/test -e "$SOURCE"; then
    if /bin/test -f "$SOURCE" && /bin/test ! -L "$SOURCE"; then
      /bin/cp "$SOURCE" "$EVIDENCE_DIR/"
      /usr/bin/cmp -s "$SOURCE" "$EVIDENCE_DIR/$(/usr/bin/basename "$SOURCE")"
    else
      POST_VERIFY_STATUS=1
    fi
  elif /bin/test "$REVIEW_STATUS" -eq 0 || /bin/test "$REVIEW_STATUS" -eq 3
  then
    POST_VERIFY_STATUS=1
  fi
done
/usr/bin/printf '%s\n' "$REVIEW_STATUS" > "$EVIDENCE_DIR/review-exit-status.txt"
/usr/bin/printf '%s\n' "$POST_VERIFY_STATUS" > \
  "$EVIDENCE_DIR/post-pack-verify-status.txt"

cd "$TEMP_ROOT"
cleanup_staging
CLEANUP_STATUS=0
for STAGING_PATH in "$REVIEW_ROOT" "$ATTEMPT_ANCHOR" "$AUTH_CARRIER"
do
  if /bin/test -e "$STAGING_PATH"; then CLEANUP_STATUS=1; fi
done
/usr/bin/printf '%s\n' "$CLEANUP_STATUS" > \
  "$EVIDENCE_DIR/staging-cleanup-status.txt"
/usr/bin/find "$EVIDENCE_DIR" -type f -exec /bin/chmod 0400 {} +
if /bin/test "$CLEANUP_STATUS" -eq 0; then
  trap - HUP INT TERM
  trap - EXIT
fi

case "$REVIEW_STATUS:$POST_VERIFY_STATUS:$CLEANUP_STATUS" in
  0:0:0) : ;;
  3:0:0) exit 3 ;;
  *) exit 1 ;;
esac
```

`REVIEW_TOOL`, `NODE_TOOL`, `CODEX_TOOL`, `AUTH_CARRIER`, and
`ATTEMPT_ANCHOR` must all be absolute paths. The command has no option for a
different prompt, schema, model, profile, contract ID, or output path. It checks
byte-exact copies of the public prompt and schema in sealed `input`, verifies
the private pack lock, and rejects extra instructions such as `AGENTS.md`.

After the seal and before private model access, the same process runs the local
identity-and-configuration preflight. It makes no model call, creates no model
state, contacts neither OpenAI nor another network service, and makes no claim
about the private execution boundary. Its fresh report is written exclusively
as `codex-sandbox-preflight.json` inside the attempt anchor.

The controller then rereads every file in the sealed `PACK`, including
`pack-lock.json`, verifies each declared byte length and SHA-256, rejects binary
or invalid UTF-8 content, unsafe or duplicate paths, and inventory drift, and
constructs one canonical review bundle. The bundle contains every artifact's
path, role, byte length, digest, and complete UTF-8 content. The fixed public
prompt, controller-attestation marker, and canonical JSON bundle form the exact
standard-input payload. There is no truncation, excerpting, retrieval, or
summary fallback. More than 256 artifacts or more than 1,048,576 total input
bytes cause rejection before disclosure.

Exactly one private model call is allowed. It uses one disposable state root
containing `CODEX_HOME`, `HOME`, `TMPDIR`, and a neutral model workspace. The
only file in that model workspace is a byte-exact copy of the public result
schema. The private `PACK`, review root, controller output, and their paths are
never mounted, copied, or passed into the model filesystem. The complete
private review material reaches the model only through standard input and is
sent to OpenAI under the explicit authorization. The state root is deleted in
full, and the authorization carrier must remain byte- and metadata-identical.
The controller also requires the spawned process group to disappear; a
surviving member is terminated and rejects the attempt before successful
cleanup can be recorded.

The controller requires the exact four-event, zero-tool JSONL trace, validates
the final message against the fixed result schema and semantic checklist, and
persists the exact captured bytes as owner-only `g1-review-trace.jsonl` in the
attempt anchor. Only then does it write canonical `g1-review-result.json` to the
previously empty `output`. It verifies the pack lock again after every
model-call outcome, checks the review layout and tooling identities, and never
replays captured subprocess output or private paths in diagnostics.

On a structurally valid `accept` or `reject`, the attempt anchor also gets
`g1-review-run.json`, which binds the lock, result, preflight, state cleanup,
tooling, CLI, model, profile, complete-input hashes and sizes, artifact count,
exact trace hash and byte length, zero-tool event summary, and neutral workspace
boundary without source excerpts.
Exit statuses are:

- `0`: Codex returned a valid `accept`;
- `3`: Codex returned a valid `reject`;
- `1`: boundary, identity, execution, cleanup, lock, or result validation
  failed;
- `2`: command-line usage was invalid.

To exercise the real installed CLI only against the generated incomplete
synthetic contract, use the opt-in test with a dedicated authorization carrier:

```sh
TMPDIR=/tmp \
GRAPHTRUTH_TEST_CODEX_PATH="$CODEX_TOOL" \
GRAPHTRUTH_TEST_CODEX_AUTH_CARRIER="$SYNTHETIC_AUTH_CARRIER" \
"$NODE_TOOL" --test --test-name-pattern='admitted installed Codex' \
  /absolute/path/to/graphtruth/tooling/codex-g1-review.test.mjs
```

The expected result is a passing test whose model decision is `reject`. The
normal quality gate skips this networked exercise. Run it before opening a
private `PACK`, from the repository rather than `REVIEW_ROOT`, and with a fresh
authorization carrier that is not reused for the private attempt.

An exit status of `0` does not close G1. The owner must rerun the pack verifier,
inspect the exact preflight, JSONL trace, result, and run record, then create a
separate final owner acceptance bound to those private identities. Only after
that may the
allowlisted v2 public receipt be attested. The procedure authorizes the Codex
client to send the sealed review material to OpenAI; it does not claim local-only
processing, independent human review, provider-side deletion, or isolation from
same-UID processes, Keychain, IPC, or macOS. No private G1 review has yet been
accepted. Issue #6 subsequently stopped before G1; this retained procedure is
not current authority and must not be run against its terminal local state.

Docker is a fallback only after its own command, filesystem, network, state,
credential, and event-trace boundaries have been separately qualified. It is
not selected automatically and is not a workaround for the 256-artifact or
1,048,576-byte limits. A pack that exceeds either limit requires an explicit
protocol decision, not containerization, truncation, or summarization.

## Verbatim RST projection builder

[`project-verbatim-rst.mjs`](project-verbatim-rst.mjs) is the dependency-free,
non-normative builder for the `python-annotations-semantics-v1` projection
freeze. It validates the accepted source manifest and a closed owner-only RST
inventory, then copies each input buffer unchanged into a new owner-only output
root. `verify` rechecks both inventories and direct byte equality. Success and
failure diagnostics contain no source text, digest, or local path.

The [projection contract](../experiments/corpora/python-annotations-semantics-v1/PROJECTION-CONTRACT.md)
preserves the exact one-time materialization command and its then-current
authorization boundary. That authority was consumed when the projection gate
closed; the contract is now immutable evidence, not permission to materialize
the real PEPs again. The normal quality gate uses synthetic RST only. It does
not materialize or inspect the acquired PEPs, and passing it does not authorize
tasks, oracle, SUT, baseline, runner adaptation, or an experiment.

## Evaluation-freeze controllers

[`codex-evaluation-freeze`](codex-evaluation-freeze) is the owner-operated,
single-attempt v1 controller used to prepare and independently audit an
evaluation-contract candidate for `python-annotations-semantics-v1`. It bound the exact
accepted verbatim-RST projection, repository tooling, Codex binary and command
shape, zero-tool permission profile, `rg` binary, two fresh model sessions, and
an owner-only output root before disclosing projection bytes. Both model calls
were external OpenAI processing. The run did not claim local-only processing,
provider-side deletion, or independent human review.

The controller allowed one author call followed by one independent read-only
audit call. Both call slots were consumed, with no retry or resumed session.
The author and auditor are permanently excluded from primary answers and
scoring. The controller itself performed no GraphTruth implementation,
rehearsal, baseline or SUT execution, scoring, or evaluated run. The normal
quality gate exercises only generated synthetic fixtures with fake model
dependencies; it neither reads the accepted projection bytes nor contacts a
model provider.

The completed attempt is terminal because the independent audit returned
`reject`. It did not close `m6-freeze-evaluation`, create an accepted contract,
or produce a release. The public status is
[`EVALUATION-FREEZE-TERMINAL.json`](../experiments/corpora/python-annotations-semantics-v1/EVALUATION-FREEZE-TERMINAL.json),
whose SHA-256 is
`410a91aaca18d121a7bafbaf0e117b1f0a4cee04008fb5f717a5fa648705a7bd`.
It exposes only fixed identities, counts, processing limits, authorization
limits, and the rejected outcome. It contains no task or oracle material,
source or projection bytes, answer-bearing text, or closed path.

One later, explicitly authorized deterministic extractor read the exact audit
result once and returned only fixed safe fields. The public
[`EVALUATION-FREEZE-DIAGNOSTIC.json`](../experiments/corpora/python-annotations-semantics-v1/EVALUATION-FREEZE-DIAGNOSTIC.json)
records nine passing checklist sections and two failures:
`result-classes-not-fully-defined` under `oracle-and-rubric`, and
`graphtruth-capture-tax-rule-missing` under `baseline-parity`. It publishes no
closed path, free text, task, oracle, source, or projection content. The read did
not repair or revive v1.

`./tooling/check` pins that terminal status and the exact wrapper, module, and
synthetic-test bytes. It also checks the closed JSON shape, the 8-task,
4-horizon, 2-arm, 64-cell denominator, 32 oracle judgments, 7 core artifacts,
10 severe-error classes, the two-call budget, the recorded toolchain, and all
processing and authorization flags. Extra keys, answer-bearing fields, task or
oracle fields, and private paths are rejected.

For this execution identity, success, retry, resume, repair, normalization, and
reuse are forbidden. In the public status, `ownerAcceptance`,
`nextGateAuthorized`, implementation, rehearsal, and evaluated-run
authorization are all `false`; `g6-evaluation-contract-accepted` remains
unpassed. A different attempt would require a new identity and explicit owner
authority; this terminal state cannot supply either.

[`codex-evaluation-freeze-v2`](codex-evaluation-freeze-v2) is a separate
controller identity. It leaves every v1 byte unchanged and closes the diagnosed
protocol gaps by requiring:

- a structured, closed ten-class result contract with deterministic precedence,
  one retained class per cell, separate answer deadline and hard timeout, time
  accounting, task aggregation, severe-error relation, and decision effect;
- a structured GraphTruth capture-tax ledger covering capture, annotation,
  correction, maintenance, and verification, including monotonic intervals,
  manual work, deterministic shared-work allocation, single attribution,
  incomplete logs, budget exhaustion, and binding to median time and the 25%
  alternative;
- fixed checklist IDs and a small code allowlist per checklist. Audit output has
  no free-text or path field, and a reject status publishes the same safe
  checklist and codes without another private read.

The v2 wrapper requires
`--owner-freeze-authorization-record ISSUE_24_COMMENT_URL`. It rejects both the
consumed v1 authorization and the v2 preparation record. The owner accepted the
exact v2 tooling identity in
[Issue #24](https://github.com/asukhodko/graphtruth/issues/24#issuecomment-5050777295)
and separately authorized one attempt in a distinct
[owner record](https://github.com/asukhodko/graphtruth/issues/24#issuecomment-5050785383).
The only invocation stopped fail-closed with `AUTHOR_MODEL_CALL` and exit
status `1`, before a validated author artifact or independent audit. In this
technical-failure path the controller emitted only its fixed error code, not a
public stdout JSON result. No release or accepted evaluation contract exists.
The controller marked the author-call slot consumed before provider spawn; the
auditor call was not reached. Neither slot transfers to another invocation.
The authorization is consumed and the attempt cannot be retried, resumed,
repaired, or reused. Any continuation requires a fresh successor identity and
separate authorization.

### Public-synthetic author-call qualification v1

[`codex-author-call-qualification-v1`](codex-author-call-qualification-v1) is a
separate preparation for diagnosing the author-call boundary without reading or
reusing the Python projection or either terminal state. Its fixed v1 shape:

- uses a closed generated-public-synthetic fixture of four RST items and accepts
  no corpus or projection path;
- preserves the publicly fixed shape and size of the boundary, the same
  zero-tool Codex command configuration, and the disposable-state lifecycle
  through shared preflight checks, without modifying v2;
- uses a separate shape-only synthetic prompt and payload; it neither imports
  the real v2 author prompt or contract validation nor creates an evaluation
  contract;
- permits at most one non-resumable author-shaped call and no auditor, CORE,
  release, implementation, baseline, rehearsal, scoring, or evaluated run;
- keeps provider payload, trace, state, and paths outside publication and emits
  only a closed safe outcome;
- rejects missing explicit authorization, tool events, trace or payload drift,
  lifecycle failure, retry, resume, and unsafe output.

Repository preparation and tests use an injected fake provider and make no
OpenAI request. The owner chose this smaller preparation scope as procedural
`shrink` on Issue #24 date 3/5, then separately accepted the exact tooling
identity and authorized one live public-synthetic call. That sole call is
consumed, cannot be retried or resumed, and ended terminally at `result-schema`.
Its actual outcome still requires separate disposition before any successor
evaluation freeze.

The acceptance unit is the complete
[`TOOLING-MANIFEST.json`](../examples/experiments/author-call-qualification-v1/TOOLING-MANIFEST.json)
identity
`bf6e7f671c60fb3a3748ff5a03aeca93500cb40fe2664c388634287049290200`
and every component it binds, not an independently chosen subset of wrapper,
controller, and tests.

The publication-safe
[`CODEX-AUTHOR-CALL-QUALIFICATION.json`](../examples/experiments/author-call-qualification-v1/CODEX-AUTHOR-CALL-QUALIFICATION.json)
records the exact outcome under SHA-256
`aa07980cd8b9a05d699f5a491733ea2dd2a710955d13a783249a4e9721979b94`.
The Codex process exited zero and passed input, authentication, isolation,
stream, process, UTF-8, zero-tool JSONL, model-identity, and cleanup boundaries.
The structured answer failed strict JSON, schema, and payload-identity checks.
Raw diagnostics remain owner-only and are not publication artifacts.

The normal `./tooling/check` path runs v1, v2, and the author-call qualification
only with generated synthetic fixtures and fake model calls. It verifies the
diagnostic receipt, exact v1 hashes, v2 positive flow, terminal reject
diagnostics, qualification transport and output boundaries, and mutations that
try to drop or weaken a result class, capture-tax rule, audit code boundary, or
no-run attestation. It also pins the one terminal public qualification result
and rejects mutations of its digest, outcome, budget, boundaries, or public
shape. Repository tests create no real contract or provider request.

## Operational plan validation

Validate the repository's current work map with:

```sh
./tooling/opskarta --strict docs/planning/graphtruth.plan.yaml
```

This is repository-maintenance infrastructure, not GraphTruth protocol tooling.
The wrapper selects Python 3.12 or newer, creates an ignored virtual environment
under `.cache/`, and installs the fully pinned, hash-checked binary distributions
in [`opskarta-requirements.txt`](opskarta-requirements.txt). It then runs a small
GraphTruth adapter over an unchanged, pinned validation subset of OpsKarta v3.
The adapter accepts one closed plan file, rejects YAML aliases, duplicate or
non-string keys, and non-finite numbers, applies the upstream fragment and
merged-plan schemas, runs semantic validation, and requires a named plan. The
quality gate rejects extra vendor files and checks every imported-file hash. The
three unchanged upstream Python files that contain trailing whitespace are
explicitly exempt from that one local rule so their bytes and recorded digests
remain intact; merge-marker, secret, and planning checks still apply.

Direct Python requirements live in
[`opskarta-requirements.in`](opskarta-requirements.in). Regenerate the lock with
Python 3.12 and `pip-tools==7.5.3`, review the resolved versions and hashes, then
exercise a clean bootstrap. Source distributions are refused; a platform
without a hash-listed wheel fails closed. The managed environment is rebuilt
when the lock or Python patch version changes, and an out-of-date direct-input
lock is rejected.

See [operational planning](../docs/planning/README.md) for the three planning
layers and [the vendor record](vendor/opskarta/UPSTREAM.md) for source,
licensing, inventory, and update procedure. OpsKarta code must not be imported
from `spec/`, `schemas/`, `rfcs/`, or `runtime/`.
