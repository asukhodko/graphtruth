# Experiment incident runbook template

> **Keep:** A completed private copy must be reachable without opening source,
> oracle, or run output.
>
> **Authority:** Non-normative Zone 3 operational guidance.

## Trigger conditions

Treat any of these as an incident:

- future filename, count, content, metadata, manifest, or oracle becomes visible
  to the system under test or a human before its allowed horizon;
- source, prompt, answer, path, credential, or personal data reaches an
  unauthorized log, process, service, repository, issue, or person;
- unexpected network egress, telemetry, tool execution, or remote-content fetch;
- access outside the allowed work root, including symlink or path traversal;
- loss, corruption, or unexplained mutation of frozen input or history;
- failed deletion, surviving backup, or provider retention outside policy;
- resource exhaustion or sandbox escape that weakens isolation.

When uncertain, stop and classify. Continuing cannot repair a compromised run.

## Immediate containment

1. Stop the controller, SUT, evaluator, and external processing without revealing
   additional material.
2. Mark the run `invalid` in metadata and prevent resume or publication.
3. Revoke access, isolate affected storage, disable egress, and rotate exposed
   credentials when applicable.
4. Preserve only the minimum authorized metadata needed to understand the event.
   Do not duplicate private content as diagnostic evidence.
5. Record the event in the private append-only failure diary and deviation log.
6. Contact the named data authority through the approved private channel.

Do not paste details into GitHub, CI, chat, email, or a model unless that channel
is explicitly authorized for the affected data class.

## Assessment

- Incident reference:
- Detection time and detector:
- Affected run state and earliest step:
- Boundary or policy violated:
- Data classes and actors potentially exposed:
- Destination or surviving copies:
- Credential or external-processor involvement:
- Containment completed:
- Required notification and deadline:
- Owner:

Assume exposure includes derived copies, prompts, logs, caches, reports, backups,
temporary files, and provider retention until each is ruled out.

## Eradication and recovery

1. Purge affected run state and all derived copies under the data-handling plan.
2. Verify deletion closure and document any copy that cannot be removed.
3. Reproduce the boundary failure with the smallest fully synthetic fixture.
4. Correct the boundary and repeat the complete synthetic dress rehearsal.
5. Review whether prior runs share the defect and invalidate them when needed.
6. Start real processing only under a new run identity, new freeze, and explicit
   approval from the data authority.

Never resume the compromised run or edit its history to appear valid.

## Closure

- Root cause:
- Copies deleted and verification method:
- Copies retained and authority:
- Credentials rotated:
- Notifications completed:
- Synthetic regression reference:
- Prior runs reviewed:
- Boundary change and reviewer:
- New-run approval:
- Expected / observed / learned:

Publish only a safe synthetic regression and non-sensitive lesson. The private
incident record follows the strictest affected retention policy.
