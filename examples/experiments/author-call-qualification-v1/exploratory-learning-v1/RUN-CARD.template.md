# Exploratory-learning processing card v1

> Template only. Do not commit a filled copy. It authorizes no read.

## Immutable public bindings

- Learning identity:
  `author-call-result-schema-exploratory-learning-v1`
- Accepted boundary SHA-256:
  `4065f91cd930181eae6eeed520b978fb31361b636944e4bed4b8b7b11b02d58e`
- Execution-pack manifest SHA-256: owner supplies the exact accepted value.
- Reader SHA-256: owner supplies the value bound by that manifest.
- Safe-result schema SHA-256: owner supplies the value bound by that manifest.

## Separate owner authorization

Before any protected read, record one Issue #24 comment that names all public
bindings above, the exact absolute diagnostic root, retained-stdout path and
fresh work root, and explicitly accepts:

- one continuous exposure to the current GraphTruth session;
- OpenAI transcript and retention risk;
- one committed reader run, one pass, no retry and no resume;
- the safe-result and local-deletion procedure from the accepted boundary;
- no other model session, provider, corpus processing or experimental run.

Keep the private locators only in that owner record and the one local command.
Do not copy a filled card into Git, a synchronized directory or another model
context.

## Pre-read checklist

- [ ] Boundary, pack, reader and schema hashes match the accepted identities.
- [ ] The processing-authorization comment is later and separate.
- [ ] Reader tests, pack verifier, OpsKarta and full repository checks pass.
- [ ] Diagnostic root and fresh work root satisfy the accepted owner-only modes.
- [ ] Work root is empty, outside Git and synchronization roots.
- [ ] No date-budget or hard-stop boundary is crossed.

## Terminal handling

- [ ] Treat `READ-SLOT-COMMITTED` as terminal even if extraction fails.
- [ ] Deliver only the single extracted `agent_message`, once.
- [ ] Validate a provisional safe record locally; the owner reviews its exact
  bytes before the first push.
- [ ] Perform deletion only after that durable push and only under the accepted
  no-open identity checks.
- [ ] Change only deletion flags in the terminal record.
- [ ] Validate, owner-review, push, verify and merge the final bytes.
- [ ] Continue later GraphTruth work in a fresh task from public merged state.
