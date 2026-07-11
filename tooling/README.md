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

The wrapper requires Node.js 24 or newer. It installs the exact dependency graph
from `package-lock.json` with lifecycle scripts disabled, runs
`markdownlint-cli2@0.23.0`, and then runs a dependency-free Node.js repository
checker. Both operate only on tracked files and non-ignored public working-tree
files. If Git metadata is unavailable, a conservative fallback excludes the
repository's private, dogfood, dependency, cache, secret-configuration, and
editor paths before reading files.

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
