# Task: Workflow-Level Timeout Enforcement (Sub-Epic: 05_Error Handling & Timeouts)

## Covered Requirements
- [1_PRD-REQ-028]

## Dependencies
- depends_on: [02_per_stage_timeout_enforcement.md]
- shared_components: [devs-scheduler (owner: Phase 2), devs-core (consumer)]

## 1. Initial Test Written
- [ ] In `crates/devs-scheduler/src/timeout.rs`, write a unit test for `WorkflowTimeoutGuard` that accepts a `Duration` (workflow-level timeout) and a `RunId`, and after the duration elapses, triggers cancellation of all active stages in the run
- [ ] Write a test: create a workflow with `timeout_secs = 2` (short for testing) containing 3 stages in sequence. Mock the first stage to take 10s. Assert: after 2s the workflow-level timeout fires, the first stage is cancelled via the same escalation sequence as per-stage timeout, and the run transitions to `Failed` with a reason indicating workflow timeout
- [ ] Write a test: workflow with 2 parallel stages (no dependencies), `workflow_timeout = 2s`. Both stages are slow. Assert both active stages receive cancellation, and the run transitions to `Failed`
- [ ] Write a test: workflow completes normally before the workflow timeout. Assert the timeout guard is cancelled cleanly with no side effects
- [ ] Write a test: a stage has `stage_timeout = 1s` and `workflow_timeout = 5s`. Assert the stage timeout fires first (at 1s), the stage is marked `TimedOut`, and the workflow continues to the next stage (workflow timeout has not elapsed yet)
- [ ] Write a test: a stage has `stage_timeout = 10s` and `workflow_timeout = 2s`. Assert the workflow timeout fires first (at 2s), overriding the stage timeout, and the stage + run are cancelled
- [ ] Write a validation test: if `stage.timeout_secs > workflow.timeout_secs`, the workflow definition validation rejects it at submit time with an appropriate error

## 2. Task Implementation
- [ ] Add `WorkflowTimeoutGuard` to `crates/devs-scheduler/src/timeout.rs`. It spawns a `tokio::time::sleep(workflow_timeout)` task at run start. When it fires, it iterates all `StageRun` entries for the run, cancels any in `Running` state using the per-stage `TimeoutEnforcer` escalation sequence, and transitions the `WorkflowRun` to `Failed` with `reason: "workflow timeout exceeded"`
- [ ] In the scheduler's `submit_run` flow, if the workflow definition has `timeout_secs` set, spawn a `WorkflowTimeoutGuard` task. Store the `JoinHandle` so it can be cancelled if the run completes normally
- [ ] When a run completes (all stages done) or is manually cancelled, abort the `WorkflowTimeoutGuard` task via `handle.abort()`
- [ ] Add `timeout_secs: Option<u64>` to the workflow-level configuration struct if not present
- [ ] In workflow validation (the 7-step submit validation), add a check: if any `stage.timeout_secs > workflow.timeout_secs`, return `invalid_argument` error with message `"stage '{name}' timeout ({stage_timeout}s) exceeds workflow timeout ({workflow_timeout}s)"`
- [ ] Ensure the workflow timeout interacts correctly with per-stage timeouts: whichever fires first takes effect. The per-stage timeout marks the individual stage as `TimedOut`; the workflow timeout marks remaining stages as `Cancelled` and the run as `Failed`

## 3. Code Review
- [ ] Verify the `WorkflowTimeoutGuard` task is always cleaned up (aborted) when the run ends, to prevent leaked tasks
- [ ] Verify the workflow timeout cancellation does not deadlock with per-stage timeout logic (both may try to transition the same stage simultaneously — use compare-and-swap or check current state before transitioning)
- [ ] Verify the validation check for `stage_timeout > workflow_timeout` is in the submit validation path

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler -- timeout` and confirm all tests pass
- [ ] Run `cargo test -p devs-scheduler -- submit` and confirm validation tests pass

## 5. Update Documentation
- [ ] Add doc comments to `WorkflowTimeoutGuard` explaining its lifecycle (spawned at run start, aborted on run completion)
- [ ] Add `// Covers: 1_PRD-REQ-028` annotations to all workflow timeout test functions

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero failures
- [ ] Run `./do lint` and confirm zero warnings
- [ ] Grep for `// Covers: 1_PRD-REQ-028` across the codebase and confirm at least 6 total annotations (from both task 02 and 03)
