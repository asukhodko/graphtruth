# Synthetic experiment incident response

Stop the run immediately when the system under test observes future material,
an oracle, a credential, source content in a metadata-only log, or any network
or telemetry path. Preserve only non-sensitive metadata needed to reproduce the
boundary failure, mark the run invalid, and do not resume under the same run ID.

For this public synthetic pack, remove the isolated run workspace, verify that
no process or mount remains, and append the incident category and disposition
to the failure diary. A private run additionally follows its own data owner's
notification, retention, backup, and whole-run deletion procedure.
