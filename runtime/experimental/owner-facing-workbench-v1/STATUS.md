# Owner-facing workbench v1 status

The exact Zone 3 contract has one frozen, synthetically qualified release
candidate. The owner's H1/H2 walkthrough and `keep / shrink / stop` decision
have not run.

## Frozen identities

- Contract SHA-256:
  `1e6428fe7912481893b833ede69711fed2b85f5dd6cf179bc9faffb346254fbe`.
- Owner episode SHA-256:
  `2156bbc089825dd36d38f86f85707d821d1f8f1dcb777149506356126fb48f59`.
- Release candidate:
  `owner-facing-workbench-v1-rc1-sha256-994797211ae516ea2bd7d965991fabe48bbb26f25922fcbbfaaa52e368d44b5a`.
- Release-candidate manifest SHA-256:
  `e804a63cff85414f530cfa1964bd3544d7d49e43f5a34bad46024e1e1f299a1e`.
- Manifest size and component count: 2,406 bytes and 7 components.

The manifest binds the implementation-private [format](FORMAT.md), command
entry point, core, qualification tests, qualification runner, release-verifier
tests, and release verifier. Any byte change to a bound component creates a
different candidate identity.

## Qualification

Run from the repository root with Node.js 24.4.1:

```console
node runtime/experimental/owner-facing-workbench-v1/qualify.mjs
```

The frozen denominator is 35 tests: 35 passed, 0 failed, 0 cancelled,
0 skipped, and 0 todo. It covers every command and refusal in the contract,
source and path safety, atomic publication, canonical tamper detection,
as-of isolation, limits, exact rebuild, all small inventory permutations,
mixed-case byte ordering, and the exact M10 regression fixture.

Implementation, qualification, and candidate freeze used one of the allowed
three Europe/Moscow repository-active dates: 2026-08-01.

## Decision boundary

Implementation, synthetic qualification, and candidate freeze are complete.
The next separately authorized action is one personal owner walkthrough of the
fixed public H1/H2 episode using this exact candidate. It permits no assistant-
entered primary answers, retry to improve the outcome, baseline, oracle,
comparative scoring, model call, private corpus, or experiment run.

This candidate remains non-normative. It creates no GraphTruth protocol format,
compatibility promise, admitted product utility, or permission to extract a
candidate format. Those claims depend on the owner's walkthrough and separate
disposition.
