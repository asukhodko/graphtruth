# Verbatim RST text projection contract

> **Projection identity:** `python-annotations-semantics-v1-verbatim-rst-v1`
>
> **Kind:** `verbatim-rst-text/1`
>
> **Status:** Technical freeze in progress; owner acceptance of the exact
> projection manifest is required before this gate can close.
>
> **Authority:** Non-normative Zone 3 experiment metadata for
> `m6-freeze-projection` only.

## Bound input

This contract applies only to the four acquired items bound by
[`SOURCE-MANIFEST.json`](SOURCE-MANIFEST.json):

- GraphTruth anchor commit:
  `e32b2b257374f4ec7570fd6df2bd630e8d0e7921`;
- source-manifest SHA-256:
  `c030ca505e7e43799daf1f065291598cd964b520a4d93f68aa52e60ba1cb384b`;
- upstream identity:
  `python/peps@339af2b4776a66eab0f88a2800adffdb0c0650e1`;
- reveal order: PEP 3107, PEP 563, PEP 649, then PEP 749.

No replacement, added source, truncation, or alternate upstream revision is
admitted under this projection identity.

## Exact transformation

For each item, the projection payload is the exact input byte string:

```text
projection_bytes = acquired_original_bytes
```

The builder creates one separately retained `.rst` output for each input. It
does not decode and re-encode the payload while copying it. It nevertheless
checks strict UTF-8 because that media identity is part of the accepted source
manifest.

The transformation performs no:

- Unicode, line-ending, whitespace, BOM, or final-newline normalization;
- RST parsing, rendering, directive execution, include expansion, or link
  resolution;
- marker, front-matter, fence, attribution, or other byte insertion;
- source reordering, merging, splitting, filtering, or summarization;
- network access, subprocess execution, model call, embedding, or indexing.

The output media type remains `text/x-rst; charset=utf-8`. This contract makes
no claim of rendered RST-to-Markdown equivalence. Its declared byte-level loss
set is empty.

## Builder and verification

The dependency-free Node.js builder is
[`tooling/project-verbatim-rst.mjs`](../../../tooling/project-verbatim-rst.mjs).
Its exact SHA-256, Node.js version, build time, and per-item results are recorded
in the projection manifest after local materialization.

The builder consumes the exact public source-manifest bytes plus owner-only
source and output roots. It:

1. rejects a changed manifest, non-contiguous order, unexpected source entry,
   unsafe path, symbolic link, hard link, non-owner file, wrong mode, wrong
   size, wrong SHA-256, wrong Git blob OID, invalid UTF-8, or source mutation;
2. requires the source root and output parent to be canonical owner-only
   directories outside the repository;
3. builds and verifies a closed owner-only staging directory, then atomically
   renames it to the previously absent output root;
4. re-reads both closed inventories and proves direct byte equality, equal
   SHA-256, equal size, and unchanged source identity;
5. removes a newly created partial output if the build fails; and
6. emits only `verbatim-projection-built`, `verbatim-projection-verified`, or a
   path-free failure marker with an allowlisted diagnostic code.

The frozen command shape is:

```sh
node "$REPOSITORY/tooling/project-verbatim-rst.mjs" build \
  --manifest "$REPOSITORY/experiments/corpora/python-annotations-semantics-v1/SOURCE-MANIFEST.json" \
  --manifest-sha256 c030ca505e7e43799daf1f065291598cd964b520a4d93f68aa52e60ba1cb384b \
  --source-root "$ORIGINALS" \
  --output-root "$PROJECTION"

node "$REPOSITORY/tooling/project-verbatim-rst.mjs" verify \
  --manifest "$REPOSITORY/experiments/corpora/python-annotations-semantics-v1/SOURCE-MANIFEST.json" \
  --manifest-sha256 c030ca505e7e43799daf1f065291598cd964b520a4d93f68aa52e60ba1cb384b \
  --source-root "$ORIGINALS" \
  --output-root "$PROJECTION"
```

The values of `ORIGINALS` and `PROJECTION` are local boundary data and are not
published. The checked-in synthetic tests exercise successful byte retention,
two clean byte-identical builds, overwrite refusal, manifest and source drift,
invalid UTF-8, symbolic links, closed inventory, output mutation, cleanup, and
path-free diagnostics without access to the acquired PEPs.

The builder's storage checks are deliberately narrow: canonical paths, file
types, link counts, owner UID, and `0700`/`0600` mode bits. They do not prove
the absence of ACL grants, synchronized folders, backups, or nested mounts.
Before accepting the projection manifest, the owner must separately confirm
that the actual output root remains inside the already accepted local boundary.

## Runtime boundary

The existing experimental S0-S1 runtime is deliberately **not compatible**
with this projection. It requires inline `gt-anchor` markers and labels the
result as Markdown. Adding such markers here would change the common input,
shift source offsets, and mix projection policy with later SUT implementation.

If separately authorized after the evaluation freeze, the runtime needs a new
whole-document candidate adapter. It must keep the payload unchanged, use
source-side metadata for byte span `0..N`, preserve the RST media type, create a
new runtime identity, and pass the required rehearsal. None of that work is
authorized by this contract.

## Stop and replacement rules

Stop this projection identity if any item fails the accepted source identity,
the builder changes any payload byte, the output inventory differs, a clean
verification is not repeatable, permissions are broader than owner-only, or
the process requires parsing, rendering, external content, a model, or a
network.

If a later task requires rendered Markdown semantics, expanded RST directives
or includes, inline anchors, or any other changed payload, use `shrink`, `stop`,
or a separately selected and frozen projection identity. Do not silently
change this one.

## Authorization boundary

This gate may publish transformation code, synthetic tests, this contract, and
publication-safe identities, hashes, sizes, timestamps, and aggregate results.
Original and projected bytes, local paths, source excerpts, author metadata,
and private build state remain outside Git.

Completing technical materialization does not authorize tasks, oracle, model
processing of acquired bytes, SUT, baseline, runner adaptation, or an
experimental run. It also does not authorize `m6-freeze-evaluation`; that needs
a new explicit owner decision after acceptance of the exact projection
manifest.
