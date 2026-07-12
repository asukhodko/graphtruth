# Replay preflight v0

This is a fully synthetic, public, frozen input pack for exercising the
experimental replay preflight contract. It is not GraphTruth protocol data and
does not establish a stable file format.

The four sources form a small future-reveal history: an incomplete plan, a
decision, a stale copied note, and an authoritative correction. The task and
oracle packs cover the initial answerable decision, required abstention before
the correction arrives, the corrected answer with preserved counterevidence,
and a permanently unanswerable closed-corpus control.

Validate it from the repository root:

```sh
./tooling/preflight
```

The validator checks integrity and experimental safety declarations only. It
does not execute the sandbox attacks or ingest the sources into GraphTruth.

`pack-lock.json` closes the checked-in file inventory and hashes every frozen
artifact, including the run card. The lock excludes itself to avoid a circular
digest; the Git commit containing it is the public external anchor. A real run
would need an independently recorded lock digest outside its mutable run pack.
