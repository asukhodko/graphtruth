# M10 source and experiment contract frozen

Contract-package identity:
`incremental-capture-second-public-correction-v1-contract-package-v1`.

- package manifest SHA-256:
  `f612a2f664a4e02f49b0e8d1be90868bf278f1606efdc419c34b2956f48fb1d3`;
- source manifest SHA-256:
  `fc374ebf427cb94f500781d1d5c6d4e066e1ae98ee1a09cfcdf7a1ab50f38ba9`;
- experiment contract SHA-256:
  `2926c463a7a19253649b60426dd08fd0e9864549e6da33a7aad84c7d9754efca`;
- oracle SHA-256:
  `ec094b52b653af44837f91cfd818f79f0c338181a48e18ed5e03d00b675d9f85`;
- run card SHA-256:
  `e203e407ddc533768455c9f403d650b458bd724c9b717a8b5051f2eebc9055f2`;
- denominator:
  four tasks × two branches = eight fixed cells;
- baseline:
  one attempt, six fixed `rg` queries;
- GraphTruth:
  one run after implementation freeze;
- external model calls:
  zero.

The revealed episode is valid under the frozen selection boundary. It exposes a
useful correction and a useful adverse fact: the H1 changelog conflicts with
the H1 content-only renderer. The H2 source adds overlap embedding, relaxes the
dependency constraint from `chunkana==0.1.3` to `chunkana>=0.1.5`, and adds
tests, while several broad changelog guarantees remain unproved by this closed
corpus.

No implementation, baseline query, retained answer, GraphTruth run, or scoring
has started. Any contract-component change creates a new identity.
