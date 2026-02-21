# Task: Persist Suspended Sandbox Snapshots (Sub-Epic: 32_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-043], [4_USER_FEATURES-REQ-062]

## 1. Initial Test Written
- [ ] Unit tests for SuspendedSandboxManager that assert snapshot() writes the expected artifact bundle structure and metadata JSON.
- [ ] Integration test to snapshot a running sandbox with files changed and assert that restore() reconstructs filesystem layout and metadata accurately.
- [ ] Tests must validate atomic write semantics: snapshot writes to a temp file and renames on success.

## 2. Task Implementation
- [ ] Implement devs/core/suspended_sandbox.py with a SuspendedSandboxManager exposing:
  - snapshot(task_id, repo_path) -> snapshot_id
  - list_snapshots(task_id=None) -> [metadata]
  - restore(snapshot_id, target_path, read_only=True) -> metadata
  - delete(snapshot_id)
- [ ] Snapshot bundle format: tar.gz (filesystem delta), metadata.json (task_id, created_at, head_sha, failing_test_ids, size_bytes, checksum), logs/ (agent logs), tests/output.txt.
- [ ] Index metadata to a SQLite table suspended_sandboxes(snapshot_id TEXT PRIMARY KEY, task_id TEXT, path TEXT, head_sha TEXT, created_at TEXT, checksum TEXT, size INTEGER).
- [ ] Ensure snapshots are stored outside the working tree (e.g., .devs/snapshots/) and support retention/cleanup policies.

## 3. Code Review
- [ ] Confirm atomic snapshot writes and defensive error handling for partial IO failures.
- [ ] Ensure snapshots do not include secrets (scrub env files) and respect project-level zero-plaintext config.
- [ ] Validate indexing into SQLite is ACID (use transactions).

## 4. Run Automated Tests to Verify
- [ ] Run unit tests for snapshot and restore flows.
- [ ] Run integration tests that snapshot a simulated failing turn and then restore into an ephemeral directory and run the saved failing test to confirm parity.

## 5. Update Documentation
- [ ] Add docs/sandbox/suspended-snapshots.md describing the bundle format, retention policy, CLI and API to list/inspect snapshots, and security considerations.

## 6. Automated Verification
- [ ] Provide a script scripts/verify_snapshot_restore.py that:
  - Runs a small sample failing test inside a temp repo, snapshots it, restores the snapshot to another temp dir, and runs the failing test to ensure it still fails with the same failure signature.
