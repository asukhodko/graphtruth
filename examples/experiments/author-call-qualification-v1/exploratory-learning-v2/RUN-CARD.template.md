# Exploratory-learning processing card v2

> Template only. Do not commit a filled copy. It authorizes no read.

## Immutable public bindings

- Boundary identity:
  `author-call-result-schema-exploratory-learning-v2`
- Boundary SHA-256: owner supplies the exact accepted value.
- Execution-pack manifest SHA-256: owner supplies the exact accepted value.
- Reader SHA-256: owner supplies the value bound by that manifest.
- Safe-result schema SHA-256: owner supplies the value bound by that manifest.
- Owner-only control-card SHA-256: owner supplies the exact current value.

## Separate owner authorization

Before any protected read, create:

1. one publication-safe Issue #24 authorization comment naming the public
   bindings, control-card SHA-256, processor, budgets, deletion procedure, and
   accepted OpenAI transcript and retention risk, but no private locator;
2. one owner-only authorization record beside the control card, mode `0600`,
   naming the public comment URL, exact diagnostic root, stdout path, expected
   zero-byte stderr sibling, and fresh work root.

The local command is the only other place an exact locator may appear. Do not
copy a filled card into Git, a synchronized directory, or another model
context.

## Pre-read checklist

- [ ] Boundary, pack, reader, schema, parsers, and lineage hashes match.
- [ ] Boundary and pack have separate exact owner acceptances.
- [ ] Processing authorization is later and separate.
- [ ] Reader tests, independent pack verifier, OpsKarta, and repository checks
      pass.
- [ ] Owner-only authorization and control-card modes and hashes match.
- [ ] Exact diagnostic root, stdout, stderr, and fresh work-root metadata pass.
- [ ] The work root is empty, owner-only, outside Git and synchronization roots.
- [ ] Issue-date, boundary-date, and hard-stop budgets remain open.

## Terminal handling

- [ ] Treat `READ-SLOT-COMMITTED` as terminal even if extraction fails.
- [ ] Deliver only the single extracted `agent_message`, once.
- [ ] Validate a provisional safe result locally.
- [ ] Let the owner inspect and accept exact result bytes before the first push.
- [ ] Delete only after that durable push and accepted no-open identity checks.
- [ ] Change only deletion flags in the terminal result.
- [ ] Validate, owner-review, push, verify, and merge final exact bytes.
- [ ] Remove private locators from the local card after terminal handling.
- [ ] Continue GraphTruth in a fresh task from merged publication-safe state.
