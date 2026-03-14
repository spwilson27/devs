# Task: Execute Self-Hosting Milestone and Document Bootstrap Completion (Sub-Epic: 29_MIT-009)

## Covered Requirements
- [MIT-009]

## Dependencies
- depends_on: ["01_verify_workflow_definitions.md", "02_enforce_no_bootstrap_stubs.md", "03_implement_presubmit_e2e_test.md", "04_verify_presubmit_passes_on_linux.md"]
- shared_components: [devs-server (Owner), devs-cli (Owner), devs-grpc (Owner), devs-scheduler (Owner), devs-checkpoint (Owner), ./do Entrypoint Script (Owner)]

## 1. Initial Test Written
- [ ] Create a comprehensive bootstrap milestone test `tests/e2e/bootstrap_milestone_complete_test.rs`:
    ```rust
    use assert_cmd::Command;
    use serde_json::Value;
    use std::time::Duration;
    use std::thread;

    /// This test verifies the complete Bootstrap Phase milestone:
    /// 1. All 6 standard workflows are valid (AC-RISK-009-02)
    /// 2. No BOOTSTRAP-STUB comments exist (AC-RISK-009-04)
    /// 3. ./do presubmit passes on Linux (AC-RISK-009-03)
    /// 4. devs submit presubmit-check completes successfully (AC-RISK-009-01)
    /// 5. MIT-009 mitigation is verified (self-hosting works)
    #[test]
    #[ignore] // Full bootstrap milestone, very expensive
    fn test_bootstrap_milestone_complete() {
        // Pre-check 1: Verify no BOOTSTRAP-STUB comments
        let lint_output = Command::new("./do")
            .arg("lint")
            .output()
            .expect("Failed to run lint");
        assert!(lint_output.status.success(), 
            "BOOTSTRAP-STUB comments found: {:?}", 
            String::from_utf8_lossy(&lint_output.stderr));

        // Pre-check 2: Verify ./do presubmit passes locally
        let presubmit_output = Command::new("./do")
            .arg("presubmit")
            .output()
            .expect("Failed to run presubmit");
        assert!(presubmit_output.status.success(),
            "./do presubmit failed: {:?}",
            String::from_utf8_lossy(&presubmit_output.stderr));

        // Start server
        let mut server = Command::cargo_bin("devs-server")
            .unwrap()
            .arg("--test-mode")
            .spawn()
            .expect("Failed to start server");
        
        wait_for_server_ready(Duration::from_secs(30));

        // Submit presubmit-check workflow
        let submit_output = Command::cargo_bin("devs")
            .unwrap()
            .args(&["submit", "presubmit-check", "--name", "bootstrap-milestone"])
            .output()
            .expect("Failed to submit");
        
        assert!(submit_output.status.success(), "Submit failed");
        let run_id = extract_run_id(&submit_output.stdout);

        // Poll until complete
        let final_status = poll_run_status(&run_id, Duration::from_secs(900));
        
        // Assert success
        assert_eq!(final_status, "Completed", 
            "presubmit-check did not complete: {:?}", final_status);

        // Verify all stages completed
        let stages = get_run_stages(&run_id);
        assert!(!stages.is_empty(), "No stages found in run");
        for stage in stages {
            assert_eq!(stage.status, "Completed", 
                "Stage {} failed: {:?}", stage.name, stage);
        }

        // Cleanup
        server.kill().ok();

        // If we reach here, Bootstrap Phase is COMPLETE
        println!("Bootstrap Phase milestone VERIFIED");
    }
    ```

## 2. Task Implementation
- [ ] **Prerequisites Check:**
    - [ ] All 6 standard workflow TOML files exist in `.devs/workflows/`.
    - [ ] `./do lint` passes (no BOOTSTRAP-STUB comments).
    - [ ] `./do presubmit` passes on Linux.
    - [ ] All crates from Bootstrap Phase have ≥90% unit test coverage.
- [ ] **Execute Self-Hosting Attempt:**
    1. Commit all code with a clear message: "feat: Bootstrap Phase complete - ready for self-hosting".
    2. Start the `devs-server` in background:
       ```bash
       devs-server --test-mode &
       SERVER_PID=$!
       ```
    3. Wait for server to be ready (check discovery file or health endpoint).
    4. Submit the presubmit-check workflow:
       ```bash
       devs submit presubmit-check --name bootstrap-milestone
       ```
    5. Monitor progress:
       ```bash
       devs status bootstrap-milestone --format json | jq '.stages[] | {name, status}'
       ```
    6. Wait for completion (up to 15 minutes).
    7. Verify final status:
       ```bash
       devs status bootstrap-milestone --format json | \
         jq '.status == "Completed" and (.stages | all(.status == "Completed"))'
       ```
    8. Kill server: `kill $SERVER_PID`
- [ ] **Document the Milestone:**
    - Create `docs/adr/0010-bootstrap-complete.md` with this structure:
      ```markdown
      # ADR 0010: Bootstrap Phase Complete

      ## Status
      Accepted

      ## Context
      RISK-009 (Bootstrapping deadlock) required a mitigation strategy to ensure
      `devs` could develop itself using its own workflow system.

      ## Decision
      Bootstrap Phase is complete as of this ADR. The following conditions are verified:

      ### COND-001: Self-Hosting Verification
      - **Run ID:** `<run-id-from-submit-output>`
      - **Workflow:** presubmit-check
      - **Status:** Completed
      - **All Stages:** Completed (N stages total)
      - **Evidence:** `devs status bootstrap-milestone --format json` output below
      - **Commit SHA:** `<git rev-parse HEAD>`
      - **Timestamp:** `<date -u>`

      ### COND-002: CI Pipeline Verification
      - **Pipeline URL:** `<GitLab CI pipeline URL>`
      - **Status:** Passed
      - **Duration:** <X> minutes
      - **Jobs:** All jobs passed

      ### COND-003: Requirement Coverage
      - **MIT-009:** Covered in test `tests/e2e/bootstrap_milestone_complete_test.rs`
      - **AC-RISK-009-01:** Covered in test `tests/e2e/presubmit_milestone_test.rs`
      - **AC-RISK-009-02:** Covered in test `crates/devs-config/tests/workflow_validation_test.rs`
      - **AC-RISK-009-03:** Covered in script `tests/ci/verify_bootstrap_presubmit.sh`
      - **AC-RISK-009-04:** Covered in script `tests/scripts/test_bootstrap_stub_detection.sh`

      ## Consequences
      - RISK-009 status changed from "Active" to "Mitigated"
      - Bootstrap Phase gates are closed
      - Development can proceed to Phase 1 with self-hosting capability
      - All future development must maintain self-hosting capability
      ```
    - Attach full `devs status` JSON output as an appendix or separate file.
    - Commit the ADR in the same PR as the passing run evidence.

## 3. Code Review
- [ ] Verify the self-hosting run actually used the full system:
    - Check server logs for gRPC calls.
    - Verify checkpoint was committed to `.devs/` directory.
    - Confirm agent pools were utilized (check pool state logs).
- [ ] Ensure the ADR follows the project's ADR template.
- [ ] Confirm all evidence is reproducible:
    - Run ID can be looked up.
    - Commit SHA exists in git history.
    - CI pipeline URL is accessible.
- [ ] Verify no code changes were made between the passing run and ADR commit.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test bootstrap_milestone_complete_test -- --ignored --nocapture`.
- [ ] Verify the test completes successfully (may take 10-15 minutes).
- [ ] Run `./do test` to ensure all other tests still pass.
- [ ] Run `./do presubmit` one final time before committing.

## 5. Update Documentation
- [ ] Update `docs/roadmap.md` to mark Bootstrap Phase as "Complete".
- [ ] Update `docs/risks/risk-registry.md` to change RISK-009 status to "Mitigated".
- [ ] Add the ADR to `docs/adr/README.md` index.
- [ ] Update `.agent/MEMORY.md` with the Bootstrap Phase completion status.
- [ ] Create `docs/bootstrap-evidence.md` with links to all evidence artifacts.

## 6. Automated Verification
- [ ] Run `./do test` and verify `target/traceability.json` shows:
    - `MIT-009` as covered.
    - All `AC-RISK-009-*` requirements as covered.
    - `traceability_pct == 100.0` for this sub-epic.
- [ ] Run `grep -r "BOOTSTRAP-STUB" crates/` and verify output is empty.
- [ ] Run `./do lint` and verify it exits 0.
- [ ] Verify the ADR exists: `test -f docs/adr/0010-bootstrap-complete.md`.
- [ ] Run `git log --oneline -1` and confirm the commit message references Bootstrap completion.
