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

`./tooling/private-pack-lock` is the one repository command designed to inspect
a private G1 `PACK`. Run it only from a history-disabled local Terminal after
Codex, model clients, synchronizers, and other unapproved processors are closed
and the encrypted owner-only volume has passed the
[freeze-guide checks](../experiments/templates/EVIDENCE-CONTRACT.md). It uses
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
its version and SHA-256 with the checked-in wrapper and module hashes. In the
empty-environment shell from the freeze guide, set that path and run the wrapper
through another empty environment. Calling the module directly is not a valid
private seal operation:

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
CI or through an assistant against a real private `PACK`, or against an attached
private volume while such a processor is open. The repository gate is allowed
to run only its generated synthetic fixtures. Follow the freeze guide for the
remaining controls, external lock-anchor, and two final confirmations.

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
