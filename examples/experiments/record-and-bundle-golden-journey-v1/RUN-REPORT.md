# Record-and-bundle golden journey: observed evidence

Status: **pass**

Recommendation: **keep**

Tested implementation commit:
`5fb58a4ad1951a4d37ec69157dadb0065878f6c8`.

Contract SHA-256:
`5365c408abf4a21d6be0523b7e1bd7dea39382241e316384c8b06c042603bf96`.

Bundle manifest SHA-256:
`fd51f34038fac5ae40888d10007f7a27789e047515295a98e2bc661e5d49f243`.

Semantic SHA-256:
`7d849996a20e243e2df930d594eb86ec64a71551819dc8de96c81b43459d01b7`.

## Expected

- All 18 fixed horizon × policy × materialization cells pass.
- Both readers reject or correctly classify all 16 frozen mutation classes.
- Two clean bundles and projection rebuilds are byte-identical.
- Detached Python reading needs only `reader.py`, `bundle`, and the public
  manifest hash.
- The frozen `2 → 7` hardcoding variation passes without fitted values or
  identifiers.
- No unresolved severe failure remains.

## Observed

- 18/18 denominator cells passed.
- 16/16 frozen mutation classes passed in both readers.
- Two clean builds produced the same 19 files and exact manifest hash.
- Node writer, Node rebuild, and detached Python reader produced the same
  semantic bytes and digest.
- All projections were deleted and rebuilt exactly from the bundle.
- The detached root contained only `bundle/` and `reader.py`; its 2,395-byte
  output contained all six logical views.
- The mechanically remapped `2 → 7` variation passed in both implementations.
- No severe failure remains.

## Denominator

| Horizon | Policy | Node writer | Node rebuild | Python detached |
| --- | --- | --- | --- | --- |
| H1 | `document-authority-v0` | pass | pass | pass |
| H1 | `observed-state-v0` | pass | pass | pass |
| H2 | `document-authority-v0` | pass | pass | pass |
| H2 | `observed-state-v0` | pass | pass | pass |
| H3 | `document-authority-v0` | pass | pass | pass |
| H3 | `observed-state-v0` | pass | pass | pass |

## Mutation matrix

| Mutation | Expected | Node | Python | Result |
| --- | --- | --- | --- | --- |
| `M01-source-byte-changed` | `SOURCE_HASH_MISMATCH` | same | same | pass |
| `M02-evidence-bounds-invalid` | `EVIDENCE_BOUNDS_INVALID` | same | same | pass |
| `M03-evidence-hash-invalid` | `EVIDENCE_HASH_MISMATCH` | same | same | pass |
| `M04-declared-file-missing` | `BUNDLE_FILE_MISSING` | same | same | pass |
| `M05-undeclared-file-added` | `BUNDLE_FILE_UNDECLARED` | same | same | pass |
| `M06-unsafe-entry` | `BUNDLE_ENTRY_UNSAFE` | same | same | pass |
| `M07-invalid-utf8` | `UTF8_INVALID` | same | same | pass |
| `M08-duplicate-json-key` | `JSON_DUPLICATE_KEY` | same | same | pass |
| `M09-record-id-conflict` | `RECORD_ID_CONFLICT` | same | same | pass |
| `M10-dangling-reference` | `REFERENCE_DANGLING` | same | same | pass |
| `M11-revision-chain-invalid` | `REVISION_CHAIN_INVALID` | same | same | pass |
| `M12-historical-record-overwritten` | `MANIFEST_HASH_MISMATCH` | same | same | pass |
| `M13-recorded-order-invalid` | `RECORDED_ORDER_INVALID` | same | same | pass |
| `M14-assessment-cannot-decide` | `EXPECTED_ABSTENTION` | same | same | pass |
| `M15-decision-invalid` | `DECISION_INVALID` | same | same | pass |
| `M16-boundary-leak-or-unknown-version` | combined frozen result | same | same | pass |

## Capture tax

- Three committed synthetic source files.
- Fourteen predeclared canonical records.
- Zero manual interventions after starting the exact reference command.
- The exact reference run completed in 1,587 ms.
- Development effort is not counted as runtime capture tax.

Active repository or Issue dates are 2026-07-25 and 2026-07-28: 2/4
Europe/Moscow.

## Intermediate failures retained

- `DEV-001`: the first smoke build rejected the frozen uppercase horizon IDs.
  The experimental identifier validator was corrected; the contract did not
  change.
- `DEV-002`: the first reference run on `a931f25…` passed all 18 primary cells,
  but its mutation runner resolved a relative Python-reader path inside the
  temporary working directory. All Python mutation invocations therefore
  failed before reading a bundle. Paths are now resolved before detachment, and
  the regression test uses a relative journey path. The contract did not
  change.

## Learned

- The minimal append-only record set can preserve an accepted claim, a
  non-decisive challenge, an explicit revocation, and a retroactive correction
  for this exact journey.
- Two fixed policies can diverge at H2 and converge at H3 without a general
  policy language.
- The closed directory bundle contains enough canonical state for Node rebuild
  and a Python standard-library reader to derive byte-identical semantic
  output.
- Derived JSON and Markdown projections are disposable and add no canonical
  information.
- Utility, generality, compatibility, scale, and normative format decisions
  remain open.

## Claim boundary

This is Zone 3 evidence for the exact public synthetic identity. It is not a
protocol, compatibility promise, product-utility result, blind review, or
evidence of generality.

The final PR head will be anchored in
[Issue #42](https://github.com/asukhodko/graphtruth/issues/42) after all
documentation and project-plan synchronization. The owner must then choose
`keep`, `shrink`, or `stop` before the PR becomes ready or is merged.
