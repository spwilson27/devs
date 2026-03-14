# Task: Implement presubmit E2E Test for Bootstrap Milestone (Sub-Epic: 29_MIT-009)

## Covered Requirements
- [AC-RISK-009-01]

## Dependencies
- depends_on: [01_verify_workflow_definitions.md]
- shared_components: [devs-cli (Consumer), devs-server (Consumer), devs-grpc (Consumer), devs-scheduler (Consumer)]

## 1. Initial Test Written
- [ ] Create an E2E test module in `tests/e2e/presubmit_milestone_test.rs`:
    ```rust
    use assert_cmd::Command;
    use std::process::Output;
    use serde_json::Value;

    #[test]
    #[ignore] // Requires running server, expensive
    fn test_presubmit_check_completes_successfully() {
        // Arrange: Start server in background
        let mut server = Command::cargo_bin("devs-server")
            .unwrap()
            .arg("--test-mode")
            .spawn()
            .expect("Failed to start server");
        
        // Wait for server to be ready (poll discovery file or health endpoint)
        wait_for_server_ready(Duration::from_secs(30));
        
        // Act: Submit presubmit-check workflow
        let submit_output = Command::cargo_bin("devs")
            .unwrap()
            .args(&["submit", "presubmit-check", "--name", "bootstrap-final"])
            .output()
            .expect("Failed to submit workflow");
        
        assert!(submit_output.status.success(), "Submit failed: {:?}", submit_output.stderr);
        
        // Extract run ID from output
        let run_id = extract_run_id(&submit_output.stdout);
        
        // Poll status until terminal state
        let final_status = poll_run_status(&run_id, Duration::from_secs(600));
        
        // Assert: Run completed successfully
        assert_eq!(final_status, "Completed", "Expected Completed status, got {:?}", final_status);
        
        // Verify all stages are Completed
        let stages = get_run_stages(&run_id);
        for stage in stages {
            assert_eq!(stage.status, "Completed", "Stage {} failed: {:?}", stage.name, stage);
        }
        
        // Cleanup: Kill server
        server.kill().ok();
    }
    ```
- [ ] Create helper functions:
    - `wait_for_server_ready(timeout)`: Polls server health until ready.
    - `poll_run_status(run_id, timeout)`: Polls `devs status` until terminal state.
    - `extract_run_id(output)`: Parses run ID from submit output.
    - `get_run_stages(run_id)`: Fetches full stage list via `devs status --format json`.

## 2. Task Implementation
- [ ] Ensure the `devs-cli` has the following commands implemented:
    - `devs submit <workflow> [--name <run-name>]` - Submits a workflow run.
    - `devs status <run-id> [--format json]` - Shows run status with optional JSON output.
    - `devs list` - Lists all runs (for debugging).
- [ ] Ensure the `devs-server` has:
    - gRPC `WorkflowService.SubmitRun` RPC implemented.
    - gRPC `WorkflowService.GetRun` RPC implemented.
    - Server discovery file writing at startup (`~/.config/devs/server.addr`).
    - Test mode flag (`--test-mode`) that uses isolated discovery file path.
- [ ] Implement the scheduler's workflow execution path:
    - DAG validation on submit.
    - Stage dispatch to agent pools.
    - Completion signal processing.
    - State persistence via checkpoint.
- [ ] Ensure the `presubmit-check.toml` workflow (from Task 01) is valid and loadable.

## 3. Code Review
- [ ] Verify the test actually exercises the full stack:
    - CLI → gRPC → Scheduler → Executor → Checkpoint → gRPC → CLI.
- [ ] Confirm proper error handling:
    - Server not running → clear error message.
    - Workflow not found → `INVALID_ARGUMENT` error.
    - Stage failure → test fails with stage output in error message.
- [ ] Check timeout values are reasonable:
    - Server startup: 30s.
    - Full presubmit: 600s (10 minutes, within 900s presubmit budget).
- [ ] Ensure test isolation:
    - Uses `DEVS_DISCOVERY_FILE` env var for isolated server address.
    - Cleans up server process on test failure.
    - Doesn't interfere with other parallel tests.

## 4. Run Automated Tests to Verify
- [ ] Run the specific test: `cargo test --test presubmit_milestone_test -- --ignored --nocapture`.
- [ ] Verify the test passes end-to-end on a clean checkout.
- [ ] Run `./do test` and ensure the test is included in traceability output.

## 5. Update Documentation
- [ ] Document the E2E test structure in `tests/README.md`.
- [ ] Add troubleshooting guide: "If presubmit_milestone_test fails, check..."
- [ ] Update `docs/architecture/e2e-testing.md` with CLI E2E patterns.

## 6. Automated Verification
- [ ] Run `./do test` and verify `target/traceability.json` shows `AC-RISK-009-01` as covered.
- [ ] Verify the test contributes to QG-003 (CLI E2E ≥50% coverage).
- [ ] Run `cargo llvm-cov --test presubmit_milestone_test` to measure coverage contribution.
