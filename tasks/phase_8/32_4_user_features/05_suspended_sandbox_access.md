# Task: Suspended Sandbox Access UI/CLI (Sub-Epic: 32_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-062]

## 1. Initial Test Written
- [ ] Integration tests for CLI commands: `devs sandbox list`, `devs sandbox inspect <id>`, `devs sandbox download <id>`, and `devs sandbox restore <id> --target <path>`.
- [ ] Tests should assert that `inspect` returns metadata, that `download` returns a valid snapshot archive with expected checksum, and that `restore --target` reconstructs the sandbox in the target path (read-only by default).
- [ ] Access control tests: verify that only authorized users/process contexts can access snapshots (mock auth layer).

## 2. Task Implementation
- [ ] Implement CLI subcommands under devs CLI (or API endpoints) backed by SuspendedSandboxManager:
  - `devs sandbox list [--task <id>]` -> tabular output with snapshot_id, created_at, head_sha, size
  - `devs sandbox inspect <snapshot_id> [--json]` -> prints metadata
  - `devs sandbox download <snapshot_id> --out <path>` -> writes tar.gz
  - `devs sandbox restore <snapshot_id> --target <path> [--read-only]` -> restores files
- [ ] Implement optional `--mount` behavior that creates a read-only copy or mounts via OS mechanisms (document fallback strategy if mount not available).
- [ ] Wire CLI commands to the project's auth/permission layer and ensure logging of access events without leaking file contents.

## 3. Code Review
- [ ] Verify CLI UX is consistent with existing commands and supports machine-readable JSON output.
- [ ] Confirm permission checks are enforced server-side for API endpoints.
- [ ] Ensure downloads are streamed and checksummed.

## 4. Run Automated Tests to Verify
- [ ] Run CLI integration tests for list/inspect/download/restore flows and the access control tests.

## 5. Update Documentation
- [ ] Update docs/sandbox/suspended-snapshots.md with CLI usage examples and security notes about snapshot access.

## 6. Automated Verification
- [ ] CI job that runs the sandbox CLI tests and validates checksums for downloads and success of restore operations.
