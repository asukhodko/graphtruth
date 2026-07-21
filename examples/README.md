# Examples and Conformance Fixtures

This directory will contain small, reviewable corpora demonstrating valid and invalid protocol behavior, migrations, and complete workflows.

Examples should cover provenance, revisions, temporal context, uncertainty, contradiction, questions, and declared rebuild behavior—not only happy paths. Conformance fixtures must declare the relevant protocol version and expected result. Before a versioned specification exists, examples are illustrative rather than evidence of conformance.

Use synthetic or explicitly redistributable material only. Never copy private dogfood data or secrets here.

## Synthetic experiment preflight

The repository's first executable synthetic example is the
[experiment preflight pack](experiments/preflight/). It is a non-normative Zone
3 laboratory pack for rehearsing the corpus-replay experiment boundary before
real or private data is admitted. It deliberately tests experimental manifests,
digests, reveal-order declarations, withheld-material policy, task closure, and
rejected invalid packs. The later
[isolated runtime-boundary rehearsal](../runtime/rehearsal/observed.md) exercised
the declared process-failure, exact-redelivery, rebuild, and
controlled-deletion paths. The full synthetic dress rehearsal, deliberate
budget exhaustion, real private utility, operating-system or power-loss
durability remain untested. Issue #6 stopped before the changed private lane was
admitted; any future private successor requires a new identity and authority.
None of these shapes is a canonical example or conformance fixture yet.

The separate [G1 evidence-contract twin](experiments/evidence-contract-twin-v1/)
freezes four fictional sources and eight tasks across early answer, required
abstention, correction with counterevidence, and terminal closed-corpus
abstention. It was created without private episode access and binds no runtime,
rehearsal result, or usefulness claim. Run `./tooling/preflight --twin` to check
its sealed public inventory; the repository quality gate also checks its G1
shape.

If repeated experiments demonstrate stable portable semantics, a separately
reviewed minimal example may later be promoted into this directory under an
applicable specification version. Copying the laboratory files here does not
perform that promotion.
