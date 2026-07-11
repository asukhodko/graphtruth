# Default Runtime

This directory will contain the replaceable default GraphTruth runtime and the
first personal dogfood system. Its name describes its operational role; it does
not grant the runtime normative or uniquely correct status.

Its purpose is to test and demonstrate complete workflows: ingestion, canonical
file storage, derived indexing, contextual retrieval, correction, recovery, and
migration. The canonical corpus remains the source of record. Every projection
this runtime claims to support must be rebuildable from retained canonical
records and declared retained artifacts.

Valuable derived outputs may be retained as canonical analysis records with
their provenance, method, version, assumptions, uncertainty, and status. This
supports audit and reuse but does not promise byte-identical regeneration from
an unavailable or nondeterministic model. The default runtime selects and
configures local policies; the protocol defines only the interoperable policy
envelope and application semantics.

Default runtime behavior is not automatically protocol behavior.
Interoperability requirements belong in `spec/`, schemas, and conformance
fixtures.
