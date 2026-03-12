# Task: Server Startup Sequence Implementation (Sub-Epic: 053_Detailed Domain Specifications (Part 18))

## Covered Requirements
- [2_TAS-REQ-139]

## Dependencies
- depends_on: [none]
- shared_components: [devs-server, devs-core]

## 1. Initial Test Written
- [ ] Create a unit test in `crates/devs-server/src/startup.rs` that verifies the startup sequence orchestration.
- [ ] The test should use mock implementations for config loading, port binding, and checkpoint recovery.
- [ ] Test Case: Verify that if step 4 (gRPC port binding) fails, the server exits immediately before step 5 (MCP port binding).
- [ ] Test Case: Verify that all steps are called in the exact order (1 through 14).

## 2. Task Implementation
- [ ] Implement the `run_startup_sequence` orchestration in `crates/devs-server`.
- [ ] Logic MUST follow the 14-step order in [2_TAS-REQ-139]:
    1. Parse CLI flags.
    2. Load `devs.toml`, apply env overrides.
    3. Validate config; if invalid, report all errors and exit.
    4. Bind gRPC port; if unavailable, exit.
    5. Bind MCP HTTP port; if unavailable, release gRPC port and exit.
    6. Initialize `AgentPoolManager`.
    7. Initialize `GitCheckpointStore` for each registered project.
    8. `load_all_runs` to recover checkpoints.
    9. Write discovery file atomically.
    10. Start accepting gRPC connections.
    11. Start accepting MCP HTTP connections.
    12. Re-queue recovered runs to scheduler.
    13. Start retention sweep task.
    14. Signal "Server Ready" (e.g. log INFO).
- [ ] Ensure that failures at critical early steps (1-5) result in a non-zero exit code.

## 3. Code Review
- [ ] Verify that the startup sequence order is exactly as specified in REQ-139.
- [ ] Ensure that all shared state (`Arc`-wrapped objects) is correctly instantiated and passed to subsequent steps.
- [ ] Verify that no port is bound if config validation (Step 3) fails.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-server --lib startup` and ensure the startup orchestration tests pass.

## 5. Update Documentation
- [ ] Document the startup sequence in the `devs-server` documentation or internal README.

## 6. Automated Verification
- [ ] Run `./do lint` and ensure no documentation or formatting violations are present.
