# Author-call result-schema exploratory learning

Status: provisional; owner acceptance required before publication.

## Outcome

The retained public-synthetic qualification trace was read once by the accepted
v2 reader. The trace and final message passed strict JSON, closed-root-shape,
and `payloadJson` string checks. The first failed predicate was
`payload-json-byte-mismatch`.

The observed payload had the required length of 32,768 bytes, with a zero-byte
length delta, but did not match the fixed expected payload byte for byte. No
message digest, quotation, unexpected value, or private locator is included.

## Bounded measurements

- final message: 34,724 bytes;
- root keys: 1;
- missing root keys: 0;
- unexpected root keys: 0;
- observed payload: 32,768 bytes;
- expected-versus-observed length delta: 0 bytes.

## Disposition

The recommended next route is `reduced-echo-contract`. The evidence supports
keeping the qualified transport and closed response shape while removing the
requirement that a model reproduce a large fixed byte string exactly.
`prompt-schema-adjustment` and `alternate-execution` remain alternatives.

This is exploratory evidence only. It does not qualify the author call, accept
an evaluation contract, validate GraphTruth, authorize corpus processing, or
permit an experimental run.

Terminal deletion states are `identity-mismatch` for stdout and
`not-attempted` for stderr and the work root. No retained stdout or stderr was
opened or hashed, and no deletion target was unlinked or removed. Retry,
repair, and successor selection remain unauthorized.
