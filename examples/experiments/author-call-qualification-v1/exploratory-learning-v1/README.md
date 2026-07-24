# Exploratory-learning execution pack v1

This directory contains the public, inactive execution pack for
`author-call-result-schema-exploratory-learning-v1`. It was built and tested
only with artificial data. It does not contain retained output, a private
locator, a model response, Python corpus material or a terminal diagnostic
candidate.

The canonical identity is the SHA-256 of
`EXECUTION-PACK-MANIFEST.json`. The manifest binds every normative component
and the accepted public parser modules. `PACK-AUDIT-RESULT.json` is a
non-circular receipt over that manifest and the independent verifier; it is not
an input to its own audit.

`SAFE-RESULT.example.json` is explicitly artificial. Its synthetic pack,
reader, schema and authorization bindings are fixture values, not accepted
identities or evidence that protected processing occurred.

The reader has no search or discovery mode. A future, separately authorized
run must provide the exact absolute `stdout.bin` and fresh work-root paths and
the separately accepted manifest identity. The production command fixes the
retained byte count and digest; test-only calls can supply artificial input
identities. Running the reader on retained output is outside this pack-
preparation stage.

The semantic validator closes cross-field ordering, count relationships and
the deletion-only transition that JSON Schema cannot fully express. The
verifier does not import or execute the reader. It independently checks the
closed manifest, file hashes and modes, parser exports, source restrictions,
schema closure, fixtures and safe example.

After any content change, issue a new pack identity. Do not silently update a
previously accepted manifest.
