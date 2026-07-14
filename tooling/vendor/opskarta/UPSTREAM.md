# Vendored OpsKarta subset

This directory contains the smallest unchanged OpsKarta v3 subset required to
validate GraphTruth's operational project plan.

- Upstream repository: <https://github.com/asukhodko/opskarta.git>
- Upstream commit: `fbd0c436c10d8685768547b7568e86b5c79969b9`
- Upstream `specs/v3` tree: `20b6b798f70f470ed16972526d6678282b38ec66`
- OpsKarta format: v3, alpha
- Imported on: 2026-07-14
- Local modifications to imported files: none
- License: Apache License 2.0

## Imported files

- the compact Russian v3 specification;
- the fragment and merged-plan JSON Schemas;
- the v3 models, loader, and semantic validator;
- the upstream license and notice.

Renderers, the upstream CLI, Markdown command execution, examples, migrations,
specification builder, and upstream tests are intentionally not vendored. The
GraphTruth adapter performs strict YAML parsing, fragment and merged-plan schema
validation, and the upstream semantic validation. It does not expose OpsKarta
as a runtime or protocol dependency.

`UPSTREAM.sha256` records every unchanged imported file. The repository quality
gate rejects extra files, checks every digest, and only then validates the
GraphTruth plan.

## Update procedure

1. Select and record an exact upstream commit; never vendor a moving branch.
2. Review the v3 migration guide, specification, schema, and validator changes.
3. Run the complete upstream v3 suite in a clean Python 3.12 environment.
4. Copy only the listed paths, without local edits, and retain `LICENSE` and
   `NOTICE`.
5. Recompute `UPSTREAM.sha256` and review every imported diff.
6. Run `./tooling/check`; migrate the GraphTruth plan separately if the format
   changed.

For this import, the complete upstream v3 suite passed with 608 tests, 3
skipped tests, and 10 passing subtests.
