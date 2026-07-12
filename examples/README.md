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
rejected invalid packs. Runtime failure handling and rebuild behavior remain
obligations for the later isolated dress rehearsal; none of these shapes is a
canonical example or conformance fixture yet.

If repeated experiments demonstrate stable portable semantics, a separately
reviewed minimal example may later be promoted into this directory under an
applicable specification version. Copying the laboratory files here does not
perform that promotion.
