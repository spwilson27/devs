# Task: Architecture Acceptance - Logic & Interfaces (Sub-Epic: 088_Detailed Domain Specifications (Part 53))

## Covered Requirements
- [2_TAS-REQ-600]

## Dependencies
- depends_on: [03_architecture_acceptance_server.md]
- shared_components: [devs-server, devs-scheduler, devs-proto, devs-mcp]

## 1. Initial Test Written
- [ ] Create an integration test suite `tests/acceptance/architecture_logic.rs` to verify the following sub-requirements from [2_TAS-REQ-600]:
    - **[2_TAS-REQ-423]**: Duplicate `SubmitRun` calls with the same run name return `ALREADY_EXISTS`.
    - **[2_TAS-REQ-425]**: `#![deny(missing_docs)]` is active in all library crates.
    - **[2_TAS-REQ-426]**: `devs-core` does not depend on `tokio`, `git2`, `reqwest`, or `tonic`.
    - **[2_TAS-REQ-427]**: Missing project `repo_path` logs an error and does not block startup.
    - **[2_TAS-REQ-428]**: Server restart transitions `Running` stages to `Eligible` and back to `Running`.
    - **[2_TAS-REQ-429]**: gRPC reflection list shows all 6 services.
    - **[2_TAS-REQ-430]**: MCP state change (e.g. `cancel_run`) is reflected in subsequent gRPC calls immediately.
    - **[2_TAS-REQ-431]**: `devs-mcp-bridge` handles server disconnection correctly.

## 2. Task Implementation
- [ ] Implement the `DuplicateRunName` check in the `RunService`.
- [ ] Implement the stage crash-recovery logic in the `DagScheduler`.
- [ ] Configure the gRPC server to enable reflection and register the 6 services.
- [ ] Implement the `SchedulerState` synchronization between gRPC and MCP.
- [ ] Set up the audit scripts to check crate dependencies and missing doc annotations.

## 3. Code Review
- [ ] Ensure that `devs-core` remains purely for business logic and does not leak I/O or runtime dependencies.
- [ ] Check that the MCP-gRPC state synchronization is done in-process using shared state handles.
- [ ] Verify that the `DuplicateRunName` check is atomic and does not suffer from race conditions.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test architecture_logic` to verify logic and interfaces.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to note the verification of logic and interfaces acceptance criteria.

## 6. Automated Verification
- [ ] Verify that `./do test` passes and `target/traceability.json` shows [2_TAS-REQ-600] as covered.
