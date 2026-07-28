# MurmurMark echo-lab correction dossier

Identity: `murmurmark-echo-lab-correction-v1`.

Bundle manifest SHA-256: `c86a4e275e3f51c40589dbbf52b72671b26c606e72323565af55f1c7b072be82`.

Authority: no acceptance decision is present. Statements below are
provisional assertions, limitations, and open questions derived from the
retained public source snapshots.

## H1

Recorded as of: `2026-07-28T08:52:15Z`. Source commit:
`e256363a2cf98c1ea1a2ef3eb30628039b46e246`. Commit subject:
`feat: add controlled echo supervision lab`. The subject names the change; it is
not an incident report. Git author and committer time are retained
metadata; publication, execution, and incident time are not inferred.

### Pre-fix bounds

- **revision.prepare-bounds.01:** At H1, stimulus output has an intended duration and post-generation validation, while elapsed subprocess time and concurrent prepare exclusion remain unestablished by the selected public files.
  Scope: murmurmark echo-lab prepare at introducing commit e256363 within the selected files
  Evidence: `H1:scripts/controlled-echo-supervision-lab.py:145-167`
  (span SHA-256 `862e577e43660eeef2bc3278f776e3835a89ade81e01d122edd6c4faffc06d4c`).
  Evidence: `H1:scripts/controlled_echo_supervision.py:374-403`
  (span SHA-256 `60210b7e0f2581779e2d68eb74516f7e12f5a3d0c8aa92e671efa8178365fc59`).
- **revision.output-validation.01:** The retained validator requires exact frames, mono audio, the requested sample rate, finite samples, and a peak no greater than the configured maximum.
  Scope: selected validate_stimulus_audio implementation at H1
  Evidence: `H1:scripts/controlled_echo_supervision.py:374-403`
  (span SHA-256 `60210b7e0f2581779e2d68eb74516f7e12f5a3d0c8aa92e671efa8178365fc59`).
- **Limit — selected-source-does-not-establish-process-or-concurrency-bound:** The complete retained launcher file shows no explicit timeout on the selected ffmpeg invocation and no owner-process prepare lock, but this scoped absence is not an incident report.
  Evidence: `H1:scripts/controlled-echo-supervision-lab.py:145-167`
  (span SHA-256 `862e577e43660eeef2bc3278f776e3835a89ade81e01d122edd6c4faffc06d4c`).
  Closed-file basis: `record.source.h1.launcher`.

## H2

Recorded as of: `2026-07-28T08:52:32Z`. Source commit:
`9b7ef91363f698113042b20f3e540d21cf30bb6e`. Commit subject:
`fix: prevent runaway echo lab stimulus generation`. The subject names the change; it is
not an incident report. Git author and committer time are retained
metadata; publication, execution, and incident time are not inferred.

### Post-fix safeguards

- **revision.prepare-bounds.02:** At H2, the selected implementation adds exact-frame in-process materialization, same-root prepare exclusion, a 120 second say timeout, atomic destination replacement, and source-level checker coverage; this still does not establish general operational safety.
  Scope: murmurmark echo-lab prepare at corrective commit 9b7ef91 within the selected files
  Evidence: `H2:scripts/controlled-echo-supervision-lab.py:140-151`
  (span SHA-256 `fe5d084e9b46899113aa646c17f350f34ea8f8fa2a79a79179578b323e340185`).
  Evidence: `H2:scripts/controlled-echo-supervision-lab.py:154-178`
  (span SHA-256 `ac8724cd061799feb590b553722b1560078afa0268983392567becb2a9dc77b8`).
  Evidence: `H2:scripts/controlled-echo-supervision-lab.py:240-253`
  (span SHA-256 `c71179a7da4bf9a8a826b0c255072d0be23bfeac884c6ee6309360e943f0edf7`).
  Evidence: `H2:scripts/controlled_echo_supervision.py:367-410`
  (span SHA-256 `ba778258c00a70b304475801c298953c151ef7a9bf6ccafa350ec3b976d32246`).
  Evidence: `H2:scripts/check-controlled-echo-supervision-v1.py:379-400`
  (span SHA-256 `2f9e8d679aaf81ed812a01faf03d4a6cf8ed4cc546037fcddb3e6751eaa4071c`).
- **revision.materialization-exact.01:** The H2 helper computes a positive expected frame count, resamples if needed, tiles and truncates to that count, rejects clipping, and replaces the destination through a temporary file.
  Scope: selected materialize_looped_stimulus implementation at H2
  Evidence: `H2:scripts/controlled_echo_supervision.py:367-410`
  (span SHA-256 `ba778258c00a70b304475801c298953c151ef7a9bf6ccafa350ec3b976d32246`).
- **revision.prepare-lock.01:** The H2 launcher takes a non-blocking exclusive flock on the lab-root prepare lock and refuses a concurrent prepare that cannot acquire it.
  Scope: selected prepare implementation at H2
  Evidence: `H2:scripts/controlled-echo-supervision-lab.py:154-178`
  (span SHA-256 `ac8724cd061799feb590b553722b1560078afa0268983392567becb2a9dc77b8`).
- **revision.say-timeout.01:** The H2 launcher gives the selected say subprocess a 120 second timeout.
  Scope: selected local TTS invocation at H2
  Evidence: `H2:scripts/controlled-echo-supervision-lab.py:240-253`
  (span SHA-256 `c71179a7da4bf9a8a826b0c255072d0be23bfeac884c6ee6309360e943f0edf7`).
- **revision.checker-source.01:** The H2 checker source materializes 2.5 seconds at 48 kHz and requires the validated result to contain 120000 frames.
  Scope: selected checker source at H2; execution is not asserted
  Evidence: `H2:scripts/check-controlled-echo-supervision-v1.py:379-400`
  (span SHA-256 `2f9e8d679aaf81ed812a01faf03d4a6cf8ed4cc546037fcddb3e6751eaa4071c`).
- **Limit — test-source-is-not-test-execution:** The retained checker text supports what the test requires, not that the test ran or passed.
  Evidence: `H2:scripts/check-controlled-echo-supervision-v1.py:379-400`
  (span SHA-256 `2f9e8d679aaf81ed812a01faf03d4a6cf8ed4cc546037fcddb3e6751eaa4071c`).
  Closed-file basis: `record.source.h2.checker`.
- **Limit — selected-correction-does-not-establish-general-safety:** The runbook's approximately 7 minute 40 second automatic stop describes capture, not preparation. The selected H2 files strengthen local bounds but do not establish actual execution, power-loss safety, cross-host exclusion, complete resource limits, or a known incident cause.
  Evidence: `H1:docs/runbooks/controlled-echo-supervision-lab.md:6-7`
  (span SHA-256 `a844b89ea7e91a8c8b3e637fa73d3876552aac730bd79ceada9806a55c2f80eb`).
  Evidence: `H2:scripts/controlled_echo_supervision.py:367-410`
  (span SHA-256 `ba778258c00a70b304475801c298953c151ef7a9bf6ccafa350ec3b976d32246`).
  Evidence: `H2:scripts/controlled-echo-supervision-lab.py:154-178`
  (span SHA-256 `ac8724cd061799feb590b553722b1560078afa0268983392567becb2a9dc77b8`).
  Evidence: `H2:scripts/controlled-echo-supervision-lab.py:240-253`
  (span SHA-256 `c71179a7da4bf9a8a826b0c255072d0be23bfeac884c6ee6309360e943f0edf7`).
  Evidence: `H2:scripts/check-controlled-echo-supervision-v1.py:379-400`
  (span SHA-256 `2f9e8d679aaf81ed812a01faf03d4a6cf8ed4cc546037fcddb3e6751eaa4071c`).
  Closed-file basis: `record.source.h1.runbook`, `record.source.h1.launcher`, `record.source.h1.helper`, `record.source.h1.checker`, `record.source.h2.runbook`, `record.source.h2.launcher`, `record.source.h2.helper`, `record.source.h2.checker`.

### Residual unknowns

- **revision.prepare-bounds.02:** At H2, the selected implementation adds exact-frame in-process materialization, same-root prepare exclusion, a 120 second say timeout, atomic destination replacement, and source-level checker coverage; this still does not establish general operational safety.
  Scope: murmurmark echo-lab prepare at corrective commit 9b7ef91 within the selected files
  Evidence: `H2:scripts/controlled-echo-supervision-lab.py:140-151`
  (span SHA-256 `fe5d084e9b46899113aa646c17f350f34ea8f8fa2a79a79179578b323e340185`).
  Evidence: `H2:scripts/controlled-echo-supervision-lab.py:154-178`
  (span SHA-256 `ac8724cd061799feb590b553722b1560078afa0268983392567becb2a9dc77b8`).
  Evidence: `H2:scripts/controlled-echo-supervision-lab.py:240-253`
  (span SHA-256 `c71179a7da4bf9a8a826b0c255072d0be23bfeac884c6ee6309360e943f0edf7`).
  Evidence: `H2:scripts/controlled_echo_supervision.py:367-410`
  (span SHA-256 `ba778258c00a70b304475801c298953c151ef7a9bf6ccafa350ec3b976d32246`).
  Evidence: `H2:scripts/check-controlled-echo-supervision-v1.py:379-400`
  (span SHA-256 `2f9e8d679aaf81ed812a01faf03d4a6cf8ed4cc546037fcddb3e6751eaa4071c`).
- **Limit — selected-correction-does-not-establish-general-safety:** The runbook's approximately 7 minute 40 second automatic stop describes capture, not preparation. The selected H2 files strengthen local bounds but do not establish actual execution, power-loss safety, cross-host exclusion, complete resource limits, or a known incident cause.
  Evidence: `H1:docs/runbooks/controlled-echo-supervision-lab.md:6-7`
  (span SHA-256 `a844b89ea7e91a8c8b3e637fa73d3876552aac730bd79ceada9806a55c2f80eb`).
  Evidence: `H2:scripts/controlled_echo_supervision.py:367-410`
  (span SHA-256 `ba778258c00a70b304475801c298953c151ef7a9bf6ccafa350ec3b976d32246`).
  Evidence: `H2:scripts/controlled-echo-supervision-lab.py:154-178`
  (span SHA-256 `ac8724cd061799feb590b553722b1560078afa0268983392567becb2a9dc77b8`).
  Evidence: `H2:scripts/controlled-echo-supervision-lab.py:240-253`
  (span SHA-256 `c71179a7da4bf9a8a826b0c255072d0be23bfeac884c6ee6309360e943f0edf7`).
  Evidence: `H2:scripts/check-controlled-echo-supervision-v1.py:379-400`
  (span SHA-256 `2f9e8d679aaf81ed812a01faf03d4a6cf8ed4cc546037fcddb3e6751eaa4071c`).
  Closed-file basis: `record.source.h1.runbook`, `record.source.h1.launcher`, `record.source.h1.helper`, `record.source.h1.checker`, `record.source.h2.runbook`, `record.source.h2.launcher`, `record.source.h2.helper`, `record.source.h2.checker`.
- **Open question — question.incident-report:** Was there an observed runaway stimulus-generation incident, and if so what were its root cause, impact, and frequency?
  Reason: closed-selected-corpus-has-no-separate-incident-report. Missing: a separate attributable public incident or runtime-observation report.
- **Source boundary:** `H1:docs/runbooks/controlled-echo-supervision-lab.md`
  (file SHA-256 `2a610812dd3a867cbd8c1c62eacf1512145be3fa377de84ba428583a830ebd55`).
- **Source boundary:** `H2:scripts/controlled-echo-supervision-lab.py`
  (file SHA-256 `9371403ce97a484c30d3d14296840334158e09bbc5c0134865f53a838de6a31b`).

## Boundary

The selected files support a qualified account of local safeguards. They do
not establish an observed incident, its cause or impact, actual test
execution, production safety, power-loss behavior, cross-host exclusion,
or complete resource bounds.

