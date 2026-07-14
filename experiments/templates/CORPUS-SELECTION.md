# Corpus selection template

> **Use:** Complete this record before inspecting system output or choosing
> tasks for an evaluated run. Keep a real record in the private run root unless
> every recorded value is approved for publication.
>
> **Authority:** Non-normative Zone 3 experiment metadata. This template does
> not select a technology, define a GraphTruth protocol corpus, or establish a
> benchmark.

For G1, complete every applicable selection field and mark later controls
explicitly `Pending M2` or `Deferred successor`; do not leave them blank and do
not treat them as G1 evidence. The
[G1 evidence-contract record](G1-EVIDENCE-CONTRACT.md) defines that boundary.

## Decision and use case

- Selection identity:
- Related experiment or run:
- Decision this corpus can inform:
- Real user workflow or decision being represented:
- Why this workflow matters to GraphTruth:
- Intended comparison arms:
- Explicit non-claims:
- Selection owner and review roles:

State the use case before evaluating candidate corpora. A convenient or familiar
documentation set is not representative merely because it is large, stable, or
public.

## Sampling frame and immutable version

- Upstream corpus or documentation set:
- Candidate population and selection unit:
- Exact product or documentation version, tag, commit, or release:
- Snapshot or acquisition time in UTC:
- Acquisition method and upstream location reference:
- Confirmation that every selected source is immutable Markdown:
- Complete candidate-inventory digest and digest algorithm:
- Upstream mutability or archival limitations:
- Snapshot owner, freeze actor, and freeze time:

Do not identify the evaluated corpus as `latest`, `current`, or another moving
target. Preserve or reference one immutable snapshot whose bytes and inventory
can be rechecked throughout the run.

## Eligibility and selection without cherry-picking

Freeze these rules before reading GraphTruth or baseline results:

- Inclusion criteria:
- Exclusion criteria:
- Required document roles, source families, and failure shapes:
- Selection method: exhaustive / deterministic rule / stratified sample /
  random sample:
- Randomization method and seed, if applicable:
- Candidate count before selection:
- Selected count and counts excluded by each frozen rule:
- Treatment of missing, inaccessible, unsupported, duplicate, and withdrawn
  items:
- Selection log location and digest:
- Permitted replacement rule for an unusable item:

Select from the declared sampling frame, not from documents known to make either
arm look good. Record every exclusion and replacement. Changing eligibility,
sampling, or replacement rules after viewing output creates a new selection
identity and normally a new run.

## Rights and data handling

For every source class, record:

- license, terms version, and authoritative terms reference;
- right to download, store, transform, index, and process;
- right to redistribute original bytes, excerpts, and synthetic derivatives;
- required attribution, notice, share-alike, or deletion behavior;
- permission for local models, remote processors, and generated reports;
- jurisdiction, retention, and provider restrictions;
- actor who verified the rights and verification time.

Public readability does not imply permission to redistribute, send content to a
model, retain prompts, or publish derived material. If rights differ by file,
record the applicable class on every manifest item.

## Source families, lineage, and independence

- Definition of one source family:
- Family-assignment method and reviewer:
- Known parent, copy, quotation, translation, summary, and template relations:
- Treatment of unavailable or uncertain ancestors:
- Exact-duplicate and near-duplicate policy:
- Independence assumptions and known violations:
- Rule preventing related descendants from crossing evaluation splits:
- Unit used for support counts and uncertainty estimates:

Copied or derived documents do not become independent evidence. Preserve both
the item-level inventory and ancestry-adjusted view; unresolved lineage remains
explicit rather than being silently counted as corroboration.

## Reveal chronology

- Chronology type: historically evidenced / declared synthetic:
- Ordering evidence and authority:
- Event/valid-time source, authority, and semantics:
- File timestamp recorded separately from event time, with provenance:
- Publication/availability-time source and authority:
- Independent historical arrival/reveal schedule and authority:
- Treatment of ties, uncertain dates, late publication, and retroactive edits:
- Rule for known existence with unavailable content:
- Metadata visible at each reveal:
- Future filenames, paths, counts, and metadata withheld from the SUT:
- Reveal-schedule digest:
- Order-robustness suite: `Deferred successor` for the first G1 contract;
  otherwise exhaustive / seeded sample / adversarial:
- Distinct item count and expected permutation denominator: `Deferred
  successor` for G1, or exact value:
- Permutation generator and enumeration identity: `Deferred successor` for G1,
  or exact identity:
- Permutation or seed-list digest: `Deferred successor` for G1, or digest:
- Sealed run-card reference for execution and evaluation denominators: `Pending
  M2` for G1, or reference:
- Rule confirming that permutations never rewrite event time or version order:
  `Deferred successor` for G1, or rule:

Filesystem order and modification time are not chronology unless their authority
is established. When historical order cannot be recovered, label the sequence
synthetic and limit claims accordingly.

The first G1 contract records order robustness as `Deferred successor` and does
not freeze or claim a permutation suite. For a later three-to-five-item
order-robustness claim, all `n!` permutations are required. Seeded or adversarial
sampling is reserved for larger corpora or a separately labeled partial
diagnostic. Insufficient factorial budget requires a smaller corpus, `shrink`,
or `reject`; it does not justify omitting orders while retaining the exhaustive
claim.

## Coverage and knowledge boundary

- Coverage statement:
- Explicit exclusions and known missing source classes:
- Knowledge represented as already known before the first reveal:
- Initial ledger or baseline horizon:
- Left-censored: yes / no, with reason:
- Terminal corpus and evaluation horizon:
- Knowledge available to real participants but absent from the corpus:
- Conclusions that cannot be drawn from this boundary:

Every answer, contradiction, dark zone, and absence claim is relative to this
boundary. A missing answer is not permanently unanswerable unless the terminal
horizon and declared coverage justify that judgment.

## Task, oracle, and human-information boundary

- Corpus curator:
- Task author:
- Oracle author:
- SUT operator:
- Baseline operator:
- Scorer:
- Role overlaps and resulting claim limitation:
- Rule used to derive tasks from real workflow triggers:
- Time at which tasks, oracle, evidence requirements, and scoring were frozen:
- Per-task familiarity record location and digest:
- First-exposure allocation, ordering, and counterbalancing rule:
- Oracle and future-source isolation mechanism:

Record each participant's prior familiarity before presenting a task. If the
same person selects sources, authors answers, operates an arm, or scores output,
use only first exposure for the primary comparison and label the result
exploratory.

For public documentation, record likely human familiarity and model-pretraining
exposure. Such a corpus can test source grounding, evidence recovery, temporal
discipline, and workflow cost; it cannot by itself prove unaided recall, novel
knowledge acquisition, or absence of memorization.

## Size and resource budget

- Maximum items, bytes, source families, and reveal steps:
- Minimum representation by required document role or stratum:
- Snapshot and preparation time budget:
- Operator, baseline, and review time budgets:
- Compute, storage, and external-processing budgets:
- Parser and media-type limits:
- Non-Markdown handling: `reject` for the first G1 contract:
- Pilot size and frozen condition for expansion: `Deferred successor`; the G1
  source count remains closed at three to five:
- Behavior when any budget is exhausted:

Corpus selection, licensing review, lineage work, task preparation, and oracle
creation count as experiment cost. Do not expand the corpus merely because setup
work has already been spent.

## Freeze and integrity seal

At G1, record immutable identities and digests for:

- upstream snapshot and complete candidate inventory;
- frozen inclusion, exclusion, sampling, and replacement rules;
- selected-item manifest and source-family map;
- reveal schedule and knowledge-boundary declaration;
- rights and processing-policy record;
- task pack, withheld oracle, and review rubric;
- this completed selection record and the enclosing freeze seal.

Record these exact controls as `Pending M2`; they are not G1 inputs and must
not be inserted into the G1 seal as if a runtime had been admitted:

- runner code revision;
- configuration and dependency identity;
- environment and sandbox identity;
- fresh rehearsal evidence and final run card.

- Digest algorithm and byte-canonicalization rule:
- Candidate pack identity before lock creation:
- Candidate finalization actor and time:
- Pre-seal selection reviewer and review time:

These fields record review of the selection and candidate contents. They are
not the final owner and independent confirmations, which occur only after the
completed lock makes the pack immutable and are stored outside the pack.

The G1 pack lock excludes its own bytes and is anchored outside the sealed pack.
Any change to G1-sealed bytes, selection rules, chronology, tasks, thresholds,
or handling creates a new evidence-contract identity. M2 later creates a
separate final run identity that also binds code, configuration, environment,
sandbox policy, and rehearsal evidence. Never update either seal in place to
preserve a favorable result.

## Selection decision

- Decision: `keep` / `reject`
- Frozen acceptance conditions:
- Frozen rejection conditions:
- Observed evidence for the decision:
- Rights or boundary blockers:
- Bias, familiarity, lineage, and coverage limitations:
- Claim scope permitted if kept:
- Maximum next-run scope:
- Decision actor and time:

`Keep` means only that the frozen corpus is suitable for the declared bounded
experiment. It does not establish representativeness, product value, algorithm
superiority, protocol semantics, or suitability for a different run. A rejected
corpus remains in the selection log so that it cannot be silently reconsidered
after seeing favorable evidence.
