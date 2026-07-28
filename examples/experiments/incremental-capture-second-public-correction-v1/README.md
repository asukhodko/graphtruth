# Incremental capture on a second public correction

Identity: `incremental-capture-second-public-correction-v1`.

This M10 experiment asks whether the five narrow capabilities admitted by the
M9 `shrink` can be captured incrementally on a materially different public
correction:

1. exact source snapshots and a closed corpus;
2. exact evidence spans;
3. additive assertion history;
4. distinct source and record horizons;
5. an explicit open question.

The experiment also repairs the comparison model used by M9. Cell validity,
branch success, comparative advantage, and product admission are separate
decisions. Baseline failure is not a prerequisite for GraphTruth success.

## Frozen selection boundary

The candidate universe, license boundary, metadata-only eligibility rules,
ordering, and no-replacement rule were frozen before candidate commit history
or source contents were inspected:

- contract:
  [`SELECTION-CONTRACT.json`](SELECTION-CONTRACT.json);
- SHA-256:
  `2033f9c3bb575472f9a8c63e9a73aae84f6195574caf48bf16d147609feffc22`;
- repository base:
  `015e48769002be53531208dee5c9f86a3eb91b69`;
- candidate cutoff:
  `2026-07-28T14:29:15Z`;
- source-read state at the selection anchor:
  `not-started`.

The first eligible commit ordered by descending committer timestamp and then
ascending SHA-1 must be selected. If its later source reveal invalidates the
episode, this identity stops without a replacement candidate.

## Selected episode

The mechanical rule selected the public MIT-licensed
`asukhodko/dify-markdown-chunker` correction:

- H1:
  `4540fff19eb6ebe6a4a632d8d2bfc90fa6cb4c63`;
- H2:
  `3257ee6763ea8b89c8e61d542d05b4f9ddc10b9f`;
- source manifest:
  `fc374ebf427cb94f500781d1d5c6d4e066e1ae98ee1a09cfcdf7a1ab50f38ba9`;
- selected snapshots:
  seven files and 76,659 bytes across two horizons.

See [`UPSTREAM.md`](UPSTREAM.md) for the source and license notice.

The contract package fixed four tasks and eight cells before implementation:
`f612a2f664a4e02f49b0e8d1be90868bf278f1606efdc419c34b2956f48fb1d3`.
The exact Zone 3 implementation was then frozen as
`75fd60a377044bc96a59af5534c828b21c26748d601114cc9246fb94594af004`.

## Terminal result

The baseline completed once and scored 3/4. The sole GraphTruth run failed
closed before H1 acquisition with `SOURCE_INVENTORY_MISMATCH`. The selected
files were equal as a set, but default JavaScript sorting and `localeCompare`
ordered the mixed-case names differently. No source-file byte, snapshot,
evidence span, assertion, question, or projection entered the retained store.

All four GraphTruth cells remain invalid adverse cells; GraphTruth scored 0/4.
The result manifest is
`a8038484cb6a488b61a6f7327b57afd2e7246f9e4e30fa5756c0921febbeeb7d`.
See [`RUN-REPORT.md`](RUN-REPORT.md) and
[`DESIGN-PRESSURE.md`](DESIGN-PRESSURE.md).

The frozen rules made `keep` and `shrink` unavailable: GraphTruth was worse
than baseline and shrink prefix 1 failed. The owner selected
[`stop`](DISPOSITION.md). Retrying, resuming, repairing, or reinterpreting this
result identity is forbidden.

The stop applies only to this M10 identity. The exact result remains useful
diagnostic evidence, but it admits no product capability. The current public
corpus is research and regression input only; confirmation requires a fresh
public correction under a separately authorized identity.
