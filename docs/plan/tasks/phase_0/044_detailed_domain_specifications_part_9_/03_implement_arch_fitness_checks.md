# Task: Implement Architectural Fitness Checks for Non-Goals (Sub-Epic: 044_Detailed Domain Specifications (Part 9))

## Covered Requirements
- [1_PRD-REQ-074], [1_PRD-REQ-075], [1_PRD-REQ-078]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a "negative" test script in `.tools/test_non_goal_rejection.py` (or similar) that attempts to introduce a forbidden dependency or code pattern (e.g., adding `notify` crate to a `Cargo.toml`).
- [ ] The test MUST verify that the verification script (to be implemented) correctly identifies and rejects these changes with a non-zero exit code.
- [ ] Test with patterns for:
  - Inbound HTTP listeners other than gRPC (e.g., `axum`, `actix-web`, `rocket`).
  - OS-level file-watching APIs (e.g., `notify` crate, `inotify` crate).

## 2. Task Implementation
- [ ] Implement a custom verification script (e.g., `.tools/check_non_goals.py`) that performs the following checks:
  - Scans all `Cargo.toml` files in the workspace for disallowed crates (`notify`, `inotify`, `kqueue`, `axum`, `actix-web`, `rocket`, etc.).
  - Scans source code for any direct use of OS-specific file-watching syscalls if crates are bypassed.
  - Checks for any code implementing an inbound HTTP server (other than the `tonic`-based gRPC server in `devs-server`).
- [ ] Integrate this script into the `./do lint` and `./do presubmit` commands.
- [ ] Ensure that a violation of these checks fails the entire presubmit/CI pipeline.

## 3. Code Review
- [ ] Verify that the list of forbidden crates is accurate and does not include necessary dependencies (e.g., `tonic` is required for gRPC).
- [ ] Ensure the script provides clear instructions to the developer on WHY the code was rejected, citing the relevant [1_PRD-REQ] requirements.

## 4. Run Automated Tests to Verify
- [ ] Run the `./do lint` command and verify that it passes for the current codebase.
- [ ] Manually introduce a violation (e.g., add `notify = "6.1.1"` to `devs-core/Cargo.toml`) and verify that `./do lint` fails.

## 5. Update Documentation
- [ ] Update `README.md` or a dedicated architecture document to list the "Non-Goal" constraints enforced by CI.

## 6. Automated Verification
- [ ] Verify that the script correctly maps violations back to requirement IDs (e.g., `[1_PRD-REQ-074]`, `[1_PRD-REQ-075]`) in its error output.
- [ ] Run `./do test` and `./do lint` and verify success.
