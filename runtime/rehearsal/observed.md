# Synthetic runtime rehearsal

- Status: `passed`
- Observed at: `2026-07-14T03:22:48.399Z`
- Git head: `44fd2dd974d8a902ce2087df4dac0941fdbdd24c`
- Git worktree: `clean` (`4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945`)
- Runtime: `v24.4.1` on `darwin/arm64`
- Kernel release: `25.5.0`
- Isolation: `darwin-seatbelt-deny-default-v0`
- Generated seed: `first-recorded-rehearsal-v0`
- Reproduction: `./runtime/replay rehearse --seed first-recorded-rehearsal-v0`

## Expected

- validate the exact captured pack bytes and reveal sources in declared chronological order
- deny future, oracle, manifest, credential, network, and outside-workdir access
- publish an exact-evidence hash chain anchored outside the worker boundary
- resume both declared crash points without semantic duplication
- delete and rebuild the disposable projection without semantic change
- delete the complete run and reproduce the same state from a clean rerun
- run a freshly generated sealed pack without checked-fixture assumptions

## Observed

| Pack | Runtime identity | Commits | Candidates | Semantic digest |
| --- | --- | ---: | ---: | --- |
| checked | `runtime-6112252e9c9aa6db52b6` | 4 | 8 | `96412cbca1cf2aaea3029cd5f322a2bc24228882630d320fcdbf8379b688e4ae` |
| generated | `runtime-c2db3b80334ce4bd6c91` | 4 | 8 | `6e01ff535b7e5faf9df1e02eeaade71777aae8a376bbcd64b69f1e0be3109ee0` |

### checked

- PASS — `sandbox-boundary`
- PASS — `deterministic-order-and-first-reveal`
- PASS — `future-boundary-step-1`
- PASS — `exact-redelivery`
- PASS — `future-boundary-step-2`
- PASS — `crash-before-publication`
- PASS — `future-boundary-step-3`
- PASS — `crash-after-publication`
- PASS — `future-boundary-step-4`
- PASS — `projection-delete-rebuild`
- PASS — `controller-only-history-anchors`
- PASS — `temporary-bundle-cleanup`
- PASS — `child-processes-joined`
- PASS — `whole-run-deletion`
- PASS — `clean-rerun-equivalence`

### generated

- PASS — `sandbox-boundary`
- PASS — `deterministic-order-and-first-reveal`
- PASS — `future-boundary-step-1`
- PASS — `exact-redelivery`
- PASS — `future-boundary-step-2`
- PASS — `crash-before-publication`
- PASS — `future-boundary-step-3`
- PASS — `crash-after-publication`
- PASS — `future-boundary-step-4`
- PASS — `projection-delete-rebuild`
- PASS — `controller-only-history-anchors`
- PASS — `temporary-bundle-cleanup`
- PASS — `child-processes-joined`
- PASS — `whole-run-deletion`
- PASS — `clean-rerun-equivalence`

## Learned

- The checked-in static pack can drive a real isolated reveal loop from a validated byte snapshot.
- Anchored passages are sufficient provisional deterministic candidates for the first runtime boundary test.
- Controller-only head anchors make self-consistent rewriting of earlier worker commits detectable.
- The exercised crash boundary is process termination, not operating-system or power-loss durability.
- Projection rebuild has no concurrent reader or atomic generation switch in this first skeleton.
- Trusted stable local code and input roots are a precondition; a malicious concurrent same-UID race is outside this rehearsal.
- Runtime formats remain Zone 3 laboratory artifacts and carry no protocol authority.

## Deviations

None.

## Owner sign-off

- Isolation and deletion: `pending`
- Owner confirmation is required before any private corpus is admitted.
