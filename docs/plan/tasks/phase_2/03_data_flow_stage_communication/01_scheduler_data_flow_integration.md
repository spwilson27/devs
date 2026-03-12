# Task: Scheduler: Template Resolution & Context Injection (Sub-Epic: 03_Data Flow & Stage Communication)

## Covered Requirements
- [1_PRD-REQ-012]: Inter-Stage Data Flow Mechanisms (Template variables, Context file, Shared directory).

## Dependencies
- depends_on: [docs/plan/tasks/phase_2/01_dag_scheduling_engine/02_dag_scheduler_core.md]
- shared_components: [devs-core, devs-scheduler, devs-executor]

## 1. Initial Test Written
- [ ] Create an integration test in `devs-scheduler/tests/data_flow_tests.rs`.
- [ ] **Test 1: Template Resolution.**
  - Define a workflow with Stage A (outputs `{ "foo": "bar" }`) and Stage B (depends on A).
  - Stage B prompt: `"Result is {{stage.A.foo}}"`.
  - Verify that when Stage B is dispatched, the prompt passed to `StageExecutor` is `"Result is bar"`.
- [ ] **Test 2: Context File Injection.**
  - Verify that the `Context` object passed to `StageExecutor::setup_env` contains the outputs of all previously completed stages in the run.
- [ ] **Test 3: Multi-Stage Data Flow.**
  - Stage C depends on A and B. Prompt uses variables from both.
  - Verify correct resolution of `{{stage.A.x}}` and `{{stage.B.y}}`.
- [ ] **Test 4: Input Parameter Resolution.**
  - Verify that workflow-level inputs (e.g., `{{input.branch_name}}`) are correctly resolved in stage prompts.

## 2. Task Implementation
- [ ] **Integrate `TemplateResolver` (devs-core) into the Scheduler.**
  - In `devs-scheduler/src/scheduler.rs`, before calling `executor.run_stage()`, collect all available data:
    - `WorkflowRun.inputs`
    - All `StageRun.output` fields for stages that are `Completed`.
- [ ] **Implement Prompt & Env Resolution.**
  - Use `TemplateResolver::resolve` to interpolate variables in the `StageDefinition` prompt and environment variables.
  - Ensure resolution handles the 7 priority levels defined in `[2_TAS-REQ-073]` (Phase 1).
- [ ] **Prepare Context for Executor.**
  - Construct a `StageContext` object (or equivalent) containing the full set of completed stage outputs.
  - Pass this context to `StageExecutor::setup_env` or `StageExecutor::run_stage`.
  - This ensures the executor can write `.devs_context.json` as required by `[2_TAS-REQ-089]`.
- [ ] **Handle Missing Variables.**
  - If a template references a missing stage or field, ensure it follows the behavior in `[2_TAS-REQ-075]` (e.g., leave as literal or fail depending on config).

## 3. Code Review
- [ ] **Security:** Verify that template resolution is "single-pass" to prevent recursive injection attacks.
- [ ] **Performance:** Ensure resolution doesn't block the scheduler loop (it should be pure CPU work, but if many stages fan out, it might be significant).
- [ ] **Consistency:** Ensure that the data passed to the executor matches the data stored in the `WorkflowRun` checkpoint.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler --test data_flow_tests`.
- [ ] Verify that all 4 integration test scenarios pass.

## 5. Update Documentation
- [ ] Update `docs/architecture/data-flow.md` (or create it) to describe how the scheduler manages the transition of data between stages.

## 6. Automated Verification
- [ ] Run `./do test` to ensure no regressions in the core scheduler logic.
- [ ] Verify that the `1_PRD-REQ-012` tag is correctly mapped in the test suite.
