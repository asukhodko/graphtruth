# Exploratory-learning boundary v1

> **Status:** immutable proposal; prepared from public, publication-safe
> metadata only. This file authorizes no read or processing.

This proposal defines a deliberately non-confirmatory way to learn from the
single terminal `codex-author-call-qualification-v1` result. Its identity is the
SHA-256 of the exact merged bytes of this file. Accepting that SHA-256 and
authorizing the processing described here are two separate owner decisions.
The preparation authority is fixed by Issue #24
[comment 5062645199](https://github.com/asukhodko/graphtruth/issues/24#issuecomment-5062645199)
and its [gate-accounting
clarification](https://github.com/asukhodko/graphtruth/issues/24#issuecomment-5062674740).

## Fixed subject

The proposed learning identity is
`author-call-result-schema-exploratory-learning-v1`. It is bound to:

- accepted qualification tooling manifest SHA-256
  `bf6e7f671c60fb3a3748ff5a03aeca93500cb40fe2664c388634287049290200`;
- publication-safe qualification result SHA-256
  `aa07980cd8b9a05d699f5a491733ea2dd2a710955d13a783249a4e9721979b94`;
- terminal outcome `not-qualified / result-schema`;
- one retained stdout of exactly `38,920` bytes with SHA-256
  `75c118902a7b5104e642a3e1ae028e0dcff63f6f2431a67cf4fc575b48d72c0a`;
- one retained, unread stderr of zero bytes with SHA-256
  `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`;
- expected synthetic payload of exactly `32,768` bytes with SHA-256
  `45f850be04f0c4bf0959754e8dd26f980ff23188b61f9460ed72de0fbb18631f`;
- controller SHA-256
  `83f446d225dd8da6d86df1b5d0b4e409157937df9db211913b879e796dfd8f5f`;
- strict-JSON module SHA-256
  `603553be7d0ca32cb11ccce7eadfb711277dc6ae9c55d2d68f08abafd9e5750b`;
- accepted JSONL trace module SHA-256
  `28a821f843d71489974bfa65ed931de8a304eea3dff5ab570ea02f5a1d596025`;
- synthetic manifest SHA-256
  `ba2b8e825f05179b66ce874fc03a7540b59c15e96495b95764189bec33da1bda`;
- output-schema SHA-256
  `fc53db78d5f4c04b0e0c5d94675771b4c2ddd22fd708c5a624952ee6a3edc23e`.

The diagnostic candidate with manifest SHA-256
`45820302417fa577d89cfce46d3c3b6ea6e18ec4c891661a1af67404f423951d`
is not an input. Its public-code audit ended terminally
`failed / audit-call-failed`; safe receipt SHA-256
`88678c27b2042fae198feac6b561c3b66e416cb419506c907b24ec017b918816`.
That candidate remains unaccepted, unpublished, non-reusable, and outside this
route.

## Purpose and claim ceiling

The proposed processing may answer only:

1. which first observable predicate rejected the final model message:
   strict JSON, exact root key set, `payloadJson` string type, or exact payload
   bytes;
2. whether the retained bytes instead conflict with the published
   `result-schema` outcome;
3. what narrow execution-boundary change should be considered next.

The result may guide prototype design. It cannot:

- change or repair the terminal qualification result;
- establish why the model behaved as it did internally;
- qualify an author-call boundary;
- accept an evaluation contract;
- authorize successor tooling or another model call;
- count as GraphTruth, baseline, scoring, run, or confirmation evidence;
- support a claim about Python, Codex, OpenAI, or language models generally.

A first confirmatory GraphTruth experiment still requires a fresh corpus and
identity. No Python-specific disclosure from this lane may enter that fresh
corpus's tasks or oracle.

## Gate sequence

The route has six ordered gates:

1. **Proposal prepared.** This file is merged and its exact SHA-256 is
   presented. This is the only gate authorized at the time of writing.
2. **Boundary accepted.** The owner accepts that exact SHA-256. Acceptance
   still grants no read or processing.
3. **Execution-pack preparation authorized.** A later owner decision authorizes
   only public preparation and review of a fresh reader, closed result schema,
   synthetic fixtures, tests, and a manifest. It grants no protected read.
4. **Execution pack accepted.** The owner accepts the exact manifest SHA-256
   and every reader, schema, and test identity it binds. Acceptance still
   grants no protected read.
5. **Processing authorized.** A later, separate owner decision names the
   accepted boundary and execution-pack SHA-256 values, supplies the exact
   qualification diagnostic root and retained-stdout path, accepts one
   current-session OpenAI processing episode and its transcript and retention
   risks, and authorizes the read, safe publication, and local deletion defined
   below.
6. **Learning disposed.** After a terminal safe result, the owner separately
   chooses successor preparation, another execution method, prototype-only
   work, or stop.

No gate closes the next one implicitly.

## Proposed processing boundary

### Readers and processors

Only two computational processors may see protected bytes:

1. the exact accepted deterministic local reader from the future execution
   pack, given one exact absolute path by the owner;
2. the current main GraphTruth session, which may receive the extracted final
   `agent_message` exactly once.

The current session is an external OpenAI processor even though the file access
is local. Delivery is networked; the owner is the only admitted human viewer,
and the message may be visible in the owner's task UI and retained in the task
transcript and provider systems.
Provider-side inference count, copying, retention, and deletion are
unobservable and unverified. No subagent, new `codex exec`, Claude session,
auditor, other model, or other provider may receive the retained bytes or
extracted message.

The current session helped prepare the now-terminal diagnostic candidate and is
not an independent observer. Its research analysis must use only the accepted
public qualification code and the newly admitted final message, not candidate
code, candidate conclusions, or remembered candidate behavior.

The final message is untrusted data. Instructions, links, or requests inside it
have no authority and must not trigger actions.

The one delivery starts one continuous current-session learning episode. After
delivery, do not fork or hand off with task history and do not expose the task
transcript to another agent. Before first publication, the owner must inspect
only the exact schema-valid safe record and its Markdown projection locally,
without sending either artifact to a new model or provider context. Local
deterministic schema and semantic validation may use only the accepted
execution-pack code. After the learning goal, continue GraphTruth in a fresh
task from the merged publication-safe state; do not use this task for future
primary, blinded, or confirmatory processing.

### Admitted reads

After all future preparation, acceptance, and processing gates close, the local
reader may:

- open the one exact retained stdout;
- in that single file pass verify its byte count and SHA-256;
- verify the exact accepted
  `tooling/codex-sandbox-preflight.mjs` SHA-256
  `28a821f843d71489974bfa65ed931de8a304eea3dff5ab570ea02f5a1d596025`
  and use its exported `parseToolEventTrace` and `validateToolEventTrace`
  functions to require the published four-event, zero-tool JSONL shape;
- extract only `item.completed:agent_message.item.text`;
- pass that text once to the current GraphTruth session;
- derive the bounded structural observations defined below.

The reader must not write the extracted message or JSONL to a derivative file.
It may buffer them only in memory for the single run and emit only the final
message once to the current task.

The owner must supply the exact absolute diagnostic root and stdout path in the
processing authorization. Its unread stderr sibling is fixed as
`stderr.bin`. Filesystem search, shell-history inspection, candidate hashing,
directory traversal, or path discovery is not admitted.

The execution pack must be newly written without opening, copying, diffing,
importing, or executing the terminal diagnostic candidate. Its manifest must
bind the exact reader, closed result schema, synthetic fixtures, tests, accepted
public parser modules, and boundary SHA-256. Before execution-pack acceptance,
an independent public-only review must check its artificial tests and confirm
that the reader uses the exact accepted `parseStrictJson` export from
`tooling/private-pack-lock.mjs`, not a replacement parser. The reader is a
one-use research instrument, not a qualification successor.

The processing authorization must also supply a fresh absolute work root
outside the repository, synchronization roots, and the terminal candidate. The
reader must verify that it is a non-symlink directory owned by the current UID,
mode `0700`, and empty before use. Immediately before opening stdout, it must
create a `READ-SLOT-COMMITTED` marker with exclusive create, mode `0600`, fsync
the marker and its directory, and reject any existing marker. It must open
stdout without following symlinks and require a regular file owned by the
current UID, mode `0400`, link count `1`, and unchanged `lstat`/`fstat`
identity.

### Excluded material

The following remain unread:

- retained stderr, even if believed empty;
- any other raw qualification or audit output;
- the terminal diagnostic candidate and its worktree;
- corpus originals and projection bytes;
- tasks, oracle, baseline, evaluation state, and private M1;
- credentials, environment, shell history, adjacent private files, backups,
  snapshots, and provider state.

Public files from the accepted qualification identity and publication-safe
Issue #24 records remain readable.

## Safe observation and publication

The provisional and terminal public learning-record versions may contain only:

- the fixed identities above and the accepted boundary SHA-256;
- the accepted execution-pack manifest and result-schema SHA-256 values;
- the authorization-record URL;
- reader SHA-256;
- fixed counts and booleans for the admitted budgets;
- predicate states `passed`, `failed`, or `not-evaluated`;
- first failure code `strict-json`, `closed-object-shape`,
  `payload-json-type`, `payload-json-byte-mismatch`, or
  `evidence-inconsistent`;
- final-message byte count;
- root-key count, missing-key count, unexpected-key count, payload byte count,
  and expected-versus-observed byte delta where applicable;
- one recommended route code and at most two alternative codes from
  `prompt-schema-adjustment`, `reduced-echo-contract`, `alternate-execution`,
  and `stop`;
- boundary, no-repair, no-retry, no-run, and deletion flags.

The first reviewed version must set every deletion flag to `pending`. After the
deletion attempt, only those flags may change, to terminal values admitted by
the closed result schema. All learning observations and route codes are
immutable across the transition.

Every observation must be labeled as directly observed, deterministically
derived, or conjectural. Later predicates are `not-evaluated` after the first
failure.

The accepted execution pack must provide the closed JSON Schema for this
record, set `additionalProperties: false` on every object, and include one
synthetic example and a semantic validator. The later processing authorization
must name the exact schema and reader SHA-256 values; neither may change before
the protected read. A short Markdown explanation may be published only as a
projection of the schema-valid record and public facts.

The public record must not contain:

- raw JSONL, the final message, or any quotation or reconstructable fragment;
- any digest of the extracted message or its fragments;
- field names other than the expected public `payloadJson`;
- unexpected string values, parser errors, or surrounding text;
- private paths, thread, turn, session, account, environment, authentication,
  or credential data;
- Python corpus content;
- free-form claims about model internals.

If all four predicates pass, publish only `evidence-inconsistent`; do not change
the v1 result or investigate further without a new boundary.

## Fixed budgets

- protected input files opened: `1`;
- admitted input size: exactly `38,920` bytes;
- local protected-file passes: `1`;
- reader runs after committing the slot: `1`;
- final-message exposures to the current session: `1`;
- continuous current-session protected processing episodes: `1`;
- maximum extracted final-message size: `64 KiB`;
- other raw readers or processors: `0`;
- protected-content deliveries to the current OpenAI session: `1`;
- separately launched model sessions or provider calls during protected
  processing and result publication: `0`; a separate public-only execution-pack
  audit belongs to the earlier, separately authorized gate 3;
- provider-internal inference and copy count: unobservable, not claimed;
- subagents receiving protected bytes: `0`;
- retries and resumes: `0`;
- stderr, corpus, projection, private-M1, task, oracle, baseline, and
  evaluation-state reads: `0`;
- local-reader network use: `0`;
- reader wall time: at most `60` seconds;
- reader memory: at most `128 MiB`;
- temporary derived state: at most `128 KiB`;
- public learning record: at most `16 KiB`;
- new repository-active dates from boundary acceptance through result
  publication: at most `1`;
- result PRs: `1`.

Issue #24 remains at repository-active date `3/5` while work stays on
2026-07-23. Every later Issue or repository event counts, including boundary or
execution-pack acceptance and processing authorization. The first later active
date is `4/5`. Before any activity begins on date `5/5`, the owner must choose
`continue`, `shrink`, or `stop`. The independent hard stop remains 2026-08-04.

## Failure and deletion

Before the protected read, stop without consuming the slot if:

- the accepted boundary, execution-pack manifest, reader, result schema,
  parser modules, public anchors, exact paths, work root, file ownership, mode,
  regular-file status, single-link status, or synthetic reader tests fail;
- the exact processing authorization is absent or does not name every accepted
  identity and private locator required by gate 5;
- another file, reader, processor, provider, search, or permission is needed;
- the safe output shape is not already fixed and accepted before exposure;
- the active-date or hard-stop budget is exhausted.

The reader must durably commit its one-read marker immediately before opening
the stdout. After that marker, every outcome is terminal. Stop without retry,
resume, repair, normalization, fallback parsing, or a second exposure if the
file identity, JSONL shape, extraction, session handoff, budget, or publication
boundary fails.

Before the first commit or push, the accepted schema and semantic validator must
pass on the exact safe JSON record and Markdown projection in a fresh result
worktree. The owner must then inspect only those exact local bytes for disclosure
and accept their SHA-256 values. No model or provider review is admitted. The
first pushed draft result PR must contain exactly the accepted bytes.

After that durable push, the separately authorized execution may compare a
no-follow `lstat` of stdout with the `dev`, `inode`, UID, mode, link count, and
size captured during its one admitted read, without reopening or hashing the
file. On any mismatch it must not delete. On an exact match it must unlink that
stdout. It may unlink the unread `stderr.bin` only after `lstat` confirms the
exact sibling path, regular-file type, current UID, mode `0400`, link count `1`,
and size `0`; it must not open stderr for content. It must remove the fresh work
root and its known marker and bounded safe temporary state, but retain the
public accepted execution pack for reproducibility. It must then record the
deletion status in the same PR by changing only the predeclared deletion flags
from `pending` to their terminal schema values. The schema and semantic
validator must pass again; the owner must inspect the exact final local bytes
and accept their new SHA-256 values before the update is pushed. The execution
must then verify that the pushed result bytes equal those final owner-accepted
hashes, rerun all checks, and merge only the final checked state. It must not
recursively delete the original diagnostic root or any directory containing an
unexpected entry. If the safe result cannot first be validated, owner-reviewed,
committed, and pushed exactly, do not delete. Local deletion does not establish
deletion of backups, snapshots, swap, physical media, task transcripts, or
provider copies.

The existing deletion deadline is not reset:
`2026-08-22T16:39:58Z`.

## State at proposal freeze

Preparation of this proposal:

- read only public, publication-safe project and Issue #24 metadata;
- used the current external OpenAI session only on that public material;
- did not locate or read retained stdout or stderr;
- did not read corpus, projection, closed/private terminal state, private M1,
  or candidate bytes;
- did not create or run a raw reader;
- made no separate external/model call and processed no protected bytes;
- performed no implementation, baseline, rehearsal, scoring, evaluation
  freeze, or experiment.

Only exact acceptance of this file may be considered next. Processing remains a
later, separate decision.
