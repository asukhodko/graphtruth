# Core Tooling

This directory is for protocol-oriented validators, canonicalizers, migrations, deterministic transformers, renderers, and conformance utilities.

Core tooling will implement rules traceable to an applicable versioned specification and must not depend on the default application. Until that specification exists, experimental tooling follows accepted RFCs but is not conforming merely because it runs. Tooling may implement the protocol-defined semantics for applying a supplied policy, but selection and configuration of a local policy belong to the default implementation.

Probabilistic extraction and ranking belong in replaceable implementation components unless exposed only as clearly attributed proposals.

Tooling may report or transform knowledge; it must not silently decide what is true.
