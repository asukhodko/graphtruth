# MurmurMark source snapshots

This experiment retains eight exact public source blobs from
[`asukhodko/murmurmark`](https://github.com/asukhodko/murmurmark):
the same four paths before and after one corrective commit.

- License: MIT
- Copyright: 2026 MurmurMark contributors
- Introducing commit:
  `e256363a2cf98c1ea1a2ef3eb30628039b46e246`
- Corrective commit:
  `9b7ef91363f698113042b20f3e540d21cf30bb6e`
- Exact paths, Git blob SHA-1 values, byte sizes, and SHA-256 values:
  [`SOURCE-MANIFEST.json`](SOURCE-MANIFEST.json)
- License text: [`upstream/license/LICENSE`](upstream/license/LICENSE)

The retained files are unmodified Git blob bytes. Their Git blob SHA-1 values
were independently reproduced with `git hash-object` after copying. The
manifest closes the inventory: no other MurmurMark file or private state is an
input to this experiment.

The copies are necessary because the experiment tests whether an independent
GraphTruth bundle can retain exact evidence, rebuild its projections, and
remain inspectable without relying on a mutable upstream checkout. Their
presence does not make MurmurMark code part of the GraphTruth implementation or
give GraphTruth authority over MurmurMark behavior.
