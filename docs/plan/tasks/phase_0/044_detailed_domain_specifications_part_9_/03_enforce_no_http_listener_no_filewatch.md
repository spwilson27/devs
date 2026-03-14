# Task: Enforce No Inbound HTTP Listener and No File-Watch APIs (Sub-Epic: 044_Detailed Domain Specifications (Part 9))

## Covered Requirements
- [1_PRD-REQ-074], [1_PRD-REQ-075]

## Dependencies
- depends_on: []
- shared_components: [./do Entrypoint Script & CI Pipeline (Consumer)]

## 1. Initial Test Written
- [ ] Create a test script `.tools/check_non_goal_deps.sh` (POSIX sh) or a Rust integration test in a workspace-level `tests/` directory named `test_forbidden_dependencies`.
- [ ] The test MUST scan all `Cargo.toml` files in the workspace for the following forbidden crate dependencies:
  - HTTP server frameworks: `axum`, `actix-web`, `rocket`, `warp`, `hyper` (as a direct dep with `server` feature — `hyper` as transitive via `tonic` is allowed)
  - File-watch crates: `notify`, `inotify`, `kqueue`, `hotwatch`, `watchexec`
- [ ] The test MUST also scan `*.rs` source files for direct syscall usage patterns: `inotify_init`, `kqueue()`, `ReadDirectoryChangesW`, `FSEvents` (string-matching is sufficient).
- [ ] For each violation found, the test outputs: `VIOLATION [1_PRD-REQ-074]: found forbidden crate 'axum' in crates/devs-server/Cargo.toml` (or the applicable REQ ID).
- [ ] The test exits non-zero if any violation is found.
- [ ] Write a companion test that temporarily creates a `Cargo.toml` with `notify = "6"` in a temp dir, runs the checker against it, and asserts non-zero exit — proving the checker works.
- [ ] Annotate tests with `// Covers: 1_PRD-REQ-074` and `// Covers: 1_PRD-REQ-075` respectively.

## 2. Task Implementation
- [ ] Implement the forbidden-dependency checker as a shell script or Rust binary in `.tools/`.
- [ ] The checker accepts a workspace root path as argument and scans all `Cargo.toml` and `*.rs` files.
- [ ] Forbidden crate list is defined as a constant array at the top of the script for easy maintenance.
- [ ] Map each forbidden crate to its requirement ID:
  - `axum`, `actix-web`, `rocket`, `warp` → `1_PRD-REQ-074` (no HTTP listener)
  - `notify`, `inotify`, `kqueue`, `hotwatch`, `watchexec` → `1_PRD-REQ-075` (no file-watch)
- [ ] `tonic` and `tonic-build` are explicitly allowlisted (required for gRPC).
- [ ] Integrate the checker into `./do lint` so it runs as part of presubmit.

## 3. Code Review
- [ ] Verify the allowlist does not accidentally permit HTTP server crates.
- [ ] Verify `hyper` is only flagged if it appears as a direct dependency with server features, not as a transitive dep of `tonic`.
- [ ] Verify error messages cite the specific requirement ID for each violation.

## 4. Run Automated Tests to Verify
- [ ] Run the checker against the current workspace — must exit 0 (no violations).
- [ ] Run the self-test with a synthetic violation — must exit non-zero.

## 5. Update Documentation
- [ ] Add a comment block at the top of the checker script listing the non-goal constraints it enforces and their requirement IDs.

## 6. Automated Verification
- [ ] Run `./do lint` and `./do test` — both must exit 0.
- [ ] Verify `// Covers: 1_PRD-REQ-074` and `// Covers: 1_PRD-REQ-075` annotations exist in test code.
