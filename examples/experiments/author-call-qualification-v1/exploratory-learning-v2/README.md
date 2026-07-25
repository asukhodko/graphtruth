# Exploratory-learning execution pack v2

This directory contains the publication-safe, inactive execution pack for
`author-call-result-schema-exploratory-learning-v2`.

Version 2 replaces only the stopped processing boundary and reader identity
after the owner recovered one locator through a metadata-only search. It keeps
the learning subject, qualification evidence, strict parsers, safe-result
schema, semantic validator, artificial fixtures, budgets, and one-pass
classification contract from v1.

The pack contains no retained output, locator, model response, terminal
diagnostic candidate, Python corpus material, projection, task, oracle,
baseline, or evaluation state. Its preparation performed no protected read,
hash, model call, GraphTruth run, repair, retry, resume, or deletion.

The canonical pack identity is the SHA-256 of
`EXECUTION-PACK-MANIFEST.json`. The manifest binds:

- the exact v2 boundary;
- the stopped v1 boundary, manifest, and audit as lineage;
- every new v2 component;
- byte-identical copies of the accepted public v1 safe schema, validator, and
  artificial fixtures;
- the accepted qualification and parser anchors.

`PACK-AUDIT-RESULT.json` is a non-circular deterministic receipt over the
manifest and independent verifier. It is not an input to its own audit.

The reader has no locator discovery or control-card reader. A future,
separately authorized invocation must receive the exact stdout path from the
owner-only card and a fresh empty work root. Running it on retained output is
outside preparation and acceptance.

Any content change creates a new pack identity. Do not repair, amend, or
silently replace an accepted pack.
