# Frozen M10 episode selection

Selection identity:
`incremental-capture-second-public-correction-v1-selection-v1`.

- selection contract SHA-256:
  `2033f9c3bb575472f9a8c63e9a73aae84f6195574caf48bf16d147609feffc22`;
- selection result SHA-256:
  `b5c4d70279eccfaad7d45a9722d0f55f89a6d41aab95f090abbdf2f671340113`;
- repository:
  `asukhodko/dify-markdown-chunker`;
- H1:
  `4540fff19eb6ebe6a4a632d8d2bfc90fa6cb4c63`;
- H2:
  `3257ee6763ea8b89c8e61d542d05b4f9ddc10b9f`;
- selected paths:
  `CHANGELOG.md`, `adapter.py`, `requirements.txt`,
  `tests/test_overlap_embedding.py`;
- closed selected byte budget:
  76,659 bytes across both horizons;
- license:
  MIT, root blob `42c5b9a351431f9b2627af71a913231344a03776`;
- source-read state at this anchor:
  `not-started`;
- replacement policy:
  none.

The first two commits in the frozen ordering were mechanically rejected:
`fa92049616da12d682347fa7558073346772159a` changed only one formatting file;
`b04f8700e0137b9be3132cb9e7719dfeaa2f0f9e` changed twenty files. The selected
commit is the first candidate satisfying the frozen metadata-only rules.

If source reveal invalidates the episode, this identity stops. It does not
silently select a replacement.
