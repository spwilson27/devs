# Task: Implement Halt-for-Remediation Branch Logic (Sub-Epic: 44_Risk 016 Verification)

## Covered Requirements
- [RISK-016-BR-004]

## Dependencies
- depends_on: ["02_create_code_review_workflow_toml.md"]
- shared_components: [devs-scheduler, devs-core]

## 1. Initial Test Written
- [ ] Write an E2E test in `tests/e2e/code_review_halt_test.rs` that:
  1. Submits a `code-review` workflow run via MCP with mock inputs
  2. Injects a structured output with `critical_findings: 1` and `high_findings: 0`
  3. Asserts the workflow transitions to `halt-for-remediation` state (not `Completed`)
  4. Verifies the run cannot be merged until findings are resolved
- [ ] Write a second E2E test that:
  1. Submits a `code-review` workflow run with `critical_findings: 0`
  2. Asserts the workflow transitions to `Completed` state
- [ ] Add `// Covers: RISK-016-BR-004` annotation to both tests.
- [ ] Tests should initially fail because the branch logic is not yet implemented.

## 2. Task Implementation
- [ ] Implement the `review_router` handler in `crates/devs-scheduler/src/handlers/review_router.rs`:
  ```rust
  pub fn review_router(ctx: &BranchContext) -> Result<NextStage> {
      let output = ctx.structured_output()
          .ok_or(BranchError::MissingStructuredOutput)?;
      
      let critical_findings: i64 = output
          .get("critical_findings")
          .and_then(|v| v.as_i64())
          .unwrap_or(0);
      
      if critical_findings > 0 {
          Ok(NextStage::HaltForRemediation {
              reason: format!("{} critical findings must be resolved", critical_findings),
          })
      } else {
          Ok(NextStage::Completed)
      }
  }
  ```
- [ ] Add `NextStage::HaltForRemediation` variant to the `StageRunState` enum in `crates/devs-core/src/stage/state.rs`.
- [ ] Implement state transition logic: `HaltForRemediation` → `Pending` (after remediation commit) → `Running` → `Completed`.
- [ ] Update the scheduler's state machine to handle the new transition.

## 3. Code Review
- [ ] Verify the branch handler properly handles missing or malformed structured output.
- [ ] Ensure the state transition is atomic and properly logged.
- [ ] Confirm error messages are actionable for the developer.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test code_review_halt_test` and ensure both E2E tests pass.
- [ ] Run `cargo test --package devs-scheduler review_router` for unit test coverage.
- [ ] Run `cargo llvm-cov --package devs-scheduler` and verify ≥90% coverage on the new handler.

## 5. Update Documentation
- [ ] Document the `HaltForRemediation` state in `crates/devs-core/src/stage/state.rs` with a doc comment.
- [ ] Add a section to `docs/plan/specs/2_scheduler_design.md` describing the halt-for-remediation workflow.
- [ ] Update the state machine diagram to include the new transition.

## 6. Automated Verification
- [ ] Run `./tools/verify_requirements.py` and confirm `RISK-016-BR-004` is marked as covered.
- [ ] Run `./do test` and verify the traceability report includes `RISK-016-BR-004`.
