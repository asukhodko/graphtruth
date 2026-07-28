# Public dogfood v1 runtime

This Zone 3 runtime supports the single public dogfood identity
`murmurmark-echo-lab-correction-v1`. It is an experiment-specific adapter, not
a protocol, default format, or replacement for the retained M8
record-and-bundle journey.

The runtime turns the frozen public source manifest and the checked-in capture
declarations into:

- eight byte-exact source snapshots;
- a canonical 27-record hash chain;
- recorded-as-of H1 and H2 views;
- a generated evidence dossier;
- an explicit open question where the closed source set cannot support an
  incident narrative;
- three disposable projections that rebuild exactly from the verified bundle.

It deliberately has no acceptance-decision record. Assertions, limitations,
questions, Git metadata, source availability, and unknown event time remain
separate.

From the repository root:

```sh
node runtime/experimental/public-dogfood-v1/cli.mjs \
  build \
  examples/experiments/murmurmark-echo-lab-correction-v1 \
  /tmp/murmurmark-dogfood-bundle

node runtime/experimental/public-dogfood-v1/cli.mjs \
  verify \
  /tmp/murmurmark-dogfood-bundle \
  MANIFEST_SHA256

node runtime/experimental/public-dogfood-v1/cli.mjs \
  project \
  /tmp/murmurmark-dogfood-bundle \
  MANIFEST_SHA256 \
  /tmp/murmurmark-dogfood-projections
```

All output directories must be absent before the command starts. Build and
projection publication use a sibling staging directory and one final rename.
Verification rejects extra files, symlinks, hash or chain drift, dangling or
future references, rewritten revision history, malformed questions, and
unknown record kinds.
