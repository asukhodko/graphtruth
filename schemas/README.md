# Schemas

This directory will contain machine-readable schemas for GraphTruth canonical files and extension profiles.

Schemas will implement structural constraints defined in `spec/`; they do not create protocol semantics on their own. Until a versioned specification exists, any draft schema is experimental and non-normative. Every released schema must identify its protocol version, have positive and negative fixtures, and remain usable without the default implementation.

Generated schemas or language bindings should be reproducible and clearly separated from their maintained sources.
