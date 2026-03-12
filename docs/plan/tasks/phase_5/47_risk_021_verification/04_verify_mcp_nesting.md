# Task: Verify Fan-out Sub-run Nesting in MCP Responses (Sub-Epic: 47_Risk 021 Verification)

## Covered Requirements
- [AC-RISK-021-05]

## Dependencies
- depends_on: [01_verify_cancellation.md]
- shared_components: [devs-grpc, devs-proto, devs-core]

## 1. Initial Test Written
- [ ] Create an E2E test `tests/risk_021_mcp_nesting_test.rs`.
- [ ] The test should:
    - Start a `devs-server`.
    - Submit a workflow run with a fan-out stage.
    - Wait for the run to complete.
    - Use a gRPC/MCP client to call `get_run`.
    - Inspect the `WorkflowRun` message.
    - Assert that `WorkflowRun.stage_runs` contains only the parent stage(s).
    - Assert that each parent `StageRun` contains its sub-agents in the `fan_out_sub_runs` field.
    - Verify that no sub-agents appear in the top-level `stage_runs` array.

## 2. Task Implementation
- [ ] Ensure `WorkflowRun::to_proto` (in `devs-proto` or `devs-core`) correctly nests sub-runs under the parent `StageRun`.
- [ ] Implement the `fan_out_sub_runs` field in the `StageRun` proto definition if not already present.
- [ ] Ensure that `get_run` and `list_runs` return the correctly structured data.

## 3. Code Review
- [ ] Check for data duplication in the proto response.
- [ ] Verify that the gRPC and MCP implementations share the same nesting logic.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test risk_021_mcp_nesting_test`.
- [ ] Ensure the test passes consistently.

## 5. Update Documentation
- [ ] Update `docs/plan/tasks/phase_5/47_risk_021_verification/04_verify_mcp_nesting.md` with details of the proto structure.

## 6. Automated Verification
- [ ] Run `./do coverage` and ensure `risk_021_mcp_nesting_test.rs` covers the serialization logic for fan-out stages.
- [ ] Verify traceability using `./tools/verify_requirements.py`.
