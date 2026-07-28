# Experimental record-bundle runtime v1

This directory implements only the public-synthetic
[`record-and-bundle-golden-journey-v1`](../../../examples/experiments/record-and-bundle-golden-journey-v1/).
Its JSON shapes and policy reducers are Zone 3 experimental evidence, not
GraphTruth protocol definitions.

## Components

- `core.mjs` builds and verifies the closed directory bundle, validates the
  chained records, reduces the two fixed policy views, and rebuilds disposable
  projections.
- `cli.mjs` exposes journey-specific `build`, `verify`, and `rebuild`
  operations.
- `evidence.mjs` supplies the closed 18-cell denominator, 16 mutation cases,
  clean-build comparison, detached-reader run, and hardcoding variation used
  by tests and the reference evidence.
- `core.test.mjs` checks the frozen contract identity and the complete
  evidence path.

The writer consumes the exact predeclared events from the frozen contract. It
does not infer assertions, assessments, or acceptance decisions.

## Bundle rules

The writer creates a fresh staging directory, verifies it, then publishes it
with a directory rename. It refuses an existing output root. This is an atomic
publication technique for the experiment; it does not claim operating-system
or power-loss durability.

`manifest.json` lists every other regular file by safe relative path, role,
media type, size, and SHA-256. Its own SHA-256 is an external argument. Records
use strict canonical JSON, assigned opaque identifiers, contiguous recorded
sequence numbers, and an exact previous-record byte hash.

The bundle includes no expected answers, oracle, current projection, local
path, Git state, or runtime state.

## Limits

- Node.js 24 or later; built-in modules only.
- At most 32 records, 64 bundle files, and 1 MiB.
- No product network access.
- No database, server, general policy language, ontology, or migration layer.
- The supported semantics are exactly those named by the frozen journey.
