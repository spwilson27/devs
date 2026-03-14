# Task: Template Variable Resolution for Stage Outputs (Sub-Epic: 03_Data Flow & Stage Communication)

## Covered Requirements
- [1_PRD-REQ-012]

## Dependencies
- depends_on: ["none"]
- shared_components: [devs-core (consumer — uses TemplateResolver), devs-scheduler (consumer — integrates resolution into dispatch)]

## 1. Initial Test Written
- [ ] Create `devs-scheduler/tests/template_resolution_tests.rs`.
- [ ] **Test 1: Single upstream stage output resolution.** Define a two-stage workflow: Stage A completes with structured output `{ "result": "hello" }`. Stage B prompt is `"Got: {{stage.A.result}}"`. Assert the resolved prompt passed to the executor is `"Got: hello"`.
- [ ] **Test 2: Multiple upstream stages.** Stage C depends on A and B. Prompt is `"A={{stage.A.x}}, B={{stage.B.y}}"`. A outputs `{"x":"1"}`, B outputs `{"y":"2"}`. Assert resolved prompt is `"A=1, B=2"`.
- [ ] **Test 3: Workflow input parameter resolution.** Workflow submitted with `inputs: {"branch": "main"}`. Stage prompt is `"Deploy {{input.branch}}"`. Assert resolved to `"Deploy main"`.
- [ ] **Test 4: Mixed inputs and stage outputs.** Prompt is `"{{input.repo}}/{{stage.build.sha}}"`. Assert both namespaces resolve correctly when data is available.
- [ ] **Test 5: Nested field access.** Stage output is `{"meta": {"version": "3"}}`. Template `{{stage.A.meta.version}}` resolves to `"3"`.
- [ ] **Test 6: Exit code reference.** `{{stage.A.exit_code}}` resolves to `"0"` for a stage that completed with exit code 0.
- [ ] **Test 7: Missing variable returns error.** Template references `{{stage.nonexistent.field}}`. Assert the resolver returns an `Err` (not a silent empty string).
- [ ] **Test 8: Environment variable template resolution.** Per-stage env vars containing `{{stage.A.field}}` are resolved before being injected into the agent process.
- [ ] Annotate all tests with `// Covers: 1_PRD-REQ-012`.

## 2. Task Implementation
- [ ] In `devs-scheduler/src/dispatch.rs` (or equivalent stage dispatch module), add a `resolve_stage_templates` function that:
  1. Collects a `TemplateContext` from: (a) `WorkflowRun.inputs` under the `input.*` namespace, (b) all `StageRun` outputs where `state == Completed` under the `stage.<name>.*` namespace, (c) `StageRun.exit_code` under `stage.<name>.exit_code`.
  2. Calls `devs_core::TemplateResolver::resolve(template, &context)` on the stage's prompt string.
  3. Calls `resolve` on each per-stage environment variable value.
  4. Returns the fully-resolved `AgentInvocation` struct (prompt + env vars).
- [ ] Ensure resolution is single-pass (no recursive expansion) to prevent injection attacks.
- [ ] On resolution failure (missing variable, type error), return a structured `TemplateResolutionError` that causes the stage to transition to `Failed` with a descriptive message.
- [ ] Wire `resolve_stage_templates` into the scheduler's stage dispatch path, invoked after a stage becomes `Eligible` and before executor `run_agent` is called.

## 3. Code Review
- [ ] Verify single-pass resolution — no template output is re-parsed for further `{{...}}` tokens.
- [ ] Verify the `TemplateContext` only includes stages in the transitive `depends_on` closure (defence in depth, even though the DAG guarantees ordering).
- [ ] Confirm no `unwrap()` or `expect()` on user-provided template data.
- [ ] Confirm error messages include the unresolved variable name and the stage that referenced it.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler --test template_resolution_tests`.
- [ ] All 8 tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `resolve_stage_templates` explaining the namespace layout (`input.*`, `stage.<name>.*`, `stage.<name>.exit_code`).

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero regressions.
- [ ] Run `grep -r 'Covers: 1_PRD-REQ-012' devs-scheduler/tests/template_resolution_tests.rs` and confirm at least 8 matches.
