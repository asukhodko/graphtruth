# Negative fixtures

The sandbox policy declares the boundary failures that a real runner must
exercise. Only the harmless future-filename canary is stored as a file. Unsafe,
platform-specific, or binary cases such as symlinks, invalid UTF-8, attempted
egress, credential reads, and crash timing are generated in an isolated test
directory and must never run against the repository checkout.

The presence of a case in the policy is a preflight obligation, not evidence
that the current document-only laboratory already enforces the boundary.
