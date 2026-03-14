# Task: Core User Features Part 1 — Workflow, Scheduling, and Execution (Sub-Epic: 01_core_grpc_server_and_infrastructure)

## Covered Requirements
- [4_USER_FEATURES-FEAT-001], [4_USER_FEATURES-FEAT-002], [4_USER_FEATURES-FEAT-003], [4_USER_FEATURES-FEAT-004], [4_USER_FEATURES-FEAT-005], [4_USER_FEATURES-FEAT-006], [4_USER_FEATURES-FEAT-007], [4_USER_FEATURES-FEAT-008], [4_USER_FEATURES-FEAT-009], [4_USER_FEATURES-FEAT-010], [4_USER_FEATURES-FEAT-011], [4_USER_FEATURES-FEAT-012], [4_USER_FEATURES-FEAT-013], [4_USER_FEATURES-FEAT-014], [4_USER_FEATURES-FEAT-015], [4_USER_FEATURES-FEAT-016], [4_USER_FEATURES-FEAT-017], [4_USER_FEATURES-FEAT-018], [4_USER_FEATURES-FEAT-019], [4_USER_FEATURES-FEAT-020], [4_USER_FEATURES-FEAT-021], [4_USER_FEATURES-FEAT-022], [4_USER_FEATURES-FEAT-023], [4_USER_FEATURES-FEAT-024], [4_USER_FEATURES-FEAT-025], [4_USER_FEATURES-FEAT-026], [4_USER_FEATURES-FEAT-027], [4_USER_FEATURES-FEAT-028], [4_USER_FEATURES-FEAT-029], [4_USER_FEATURES-FEAT-030], [4_USER_FEATURES-FEAT-031], [4_USER_FEATURES-FEAT-032], [4_USER_FEATURES-FEAT-033], [4_USER_FEATURES-FEAT-034], [4_USER_FEATURES-FEAT-035], [4_USER_FEATURES-FEAT-036], [4_USER_FEATURES-FEAT-037], [4_USER_FEATURES-FEAT-038], [4_USER_FEATURES-FEAT-039], [4_USER_FEATURES-FEAT-040], [4_USER_FEATURES-FEAT-041], [4_USER_FEATURES-FEAT-042], [4_USER_FEATURES-FEAT-043], [4_USER_FEATURES-FEAT-044], [4_USER_FEATURES-FEAT-045], [4_USER_FEATURES-FEAT-046], [4_USER_FEATURES-FEAT-047], [4_USER_FEATURES-FEAT-048], [4_USER_FEATURES-FEAT-049], [4_USER_FEATURES-FEAT-050], [4_USER_FEATURES-FEAT-051], [4_USER_FEATURES-FEAT-052], [4_USER_FEATURES-FEAT-053], [4_USER_FEATURES-FEAT-054], [4_USER_FEATURES-FEAT-055], [4_USER_FEATURES-FEAT-056], [4_USER_FEATURES-FEAT-057]

## Dependencies
- depends_on: ["04_devs_server_crate_and_startup_sequence.md"]
- shared_components: ["devs-scheduler (consumer)", "devs-pool (consumer)", "devs-executor (consumer)", "devs-adapters (consumer)", "devs-config (consumer)", "devs-checkpoint (consumer)"]

## 1. Initial Test Written
- [ ] Create `tests/user_features_core1_test.rs` with integration tests verifying each FEAT requirement: headless gRPC server (FEAT-001), remote client connections (FEAT-002), Rust builder API (FEAT-003), declarative TOML/YAML (FEAT-004), workflow input parameters (FEAT-005), named agent pools (FEAT-006), agent CLI support (FEAT-007).
- [ ] Write tests for stage features: per-stage completion signals (FEAT-008), bidirectional interaction (FEAT-009), PTY mode (FEAT-010), execution environments (FEAT-011), artifact collection (FEAT-012).
- [ ] Write tests for scheduling features: dependency-driven DAG scheduling (FEAT-013), fan-out parallel execution (FEAT-014), fan-out merge (FEAT-015), per-stage retry (FEAT-016), workflow timeout (FEAT-017).
- [ ] Write tests for persistence features: git-backed checkpoints (FEAT-018), checkpoint branch config (FEAT-019), workflow snapshotting (FEAT-020), run name deduplication (FEAT-021).
- [ ] Write tests for multi-project features: multi-project support (FEAT-022), project priority scheduling (FEAT-023), webhooks (FEAT-024), server discovery (FEAT-025).
- [ ] Write tests for remaining FEAT-026 through FEAT-057 per their definitions.

## 2. Task Implementation
- [ ] Implement integration tests verifying all 57 core user features are functional end-to-end.
- [ ] Verify each feature works through at least one external interface (CLI, TUI, or MCP).
- [ ] Ensure features interact correctly (e.g., fan-out with retry, multi-project with pools).

## 3. Code Review
- [ ] Verify each feature test exercises the feature through an external interface.
- [ ] Confirm no feature tests are trivially passing (stub implementations).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -- user_features_core1` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `// Covers: 4_USER_FEATURES-FEAT-XXX` annotations to all test functions.

## 6. Automated Verification
- [ ] Run `./do test` and `./do lint` with zero failures.
