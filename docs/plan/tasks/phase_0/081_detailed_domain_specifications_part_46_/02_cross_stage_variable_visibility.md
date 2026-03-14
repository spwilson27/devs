# Task: Cross-Stage Template Variable Visibility Enforcement (Sub-Epic: 081_Detailed Domain Specifications (Part 46))

## Covered Requirements
- [2_TAS-REQ-481]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-core"]

## 1. Initial Test Written
- [ ] In the `TemplateResolver` module (or a new `tests::variable_visibility` module in `devs-core`), write the following tests:
- [ ] `test_variable_ref_to_direct_dependency_resolves` — Stage B depends on Stage A. A template `{{stage.A.output}}` in Stage B resolves successfully.
- [ ] `test_variable_ref_to_transitive_dependency_resolves` — Stage C depends on B, B depends on A. A template `{{stage.A.output}}` in Stage C resolves successfully (transitive closure).
- [ ] `test_variable_ref_outside_depends_on_closure_fails` — Stage B does NOT depend on Stage A. A template `{{stage.A.output}}` in Stage B causes the stage to transition to `Failed` with an appropriate error message (e.g., `InvalidVariableReference`).
- [ ] `test_variable_ref_failure_at_execution_not_validation` — Ensure the failure happens when the stage begins execution (i.e., after submission succeeds), NOT during workflow validation at submit time. Submit a workflow containing the invalid reference and assert submission succeeds. Then when the stage is dispatched, assert it transitions to `Failed`.
- [ ] `test_self_reference_fails` — A template `{{stage.X.output}}` used in Stage X itself fails with `InvalidVariableReference`.

## 2. Task Implementation
- [ ] Implement a function `compute_transitive_depends_on(stage_name: &str, dag: &WorkflowDag) -> HashSet<String>` that returns the full set of ancestor stages reachable via `depends_on` edges.
- [ ] In the template resolution path (called at stage execution start, NOT at submission), before resolving `{{stage.<name>.<field>}}`, check that `<name>` is in the transitive `depends_on` closure of the current stage.
- [ ] If the check fails, transition the stage to `Failed` with error kind `InvalidVariableReference` and a message like `"Stage 'X' references '{{stage.Y.output}}' but 'Y' is not in its dependency closure"`.
- [ ] Do NOT add this check to the workflow validation path at submit time — the requirement explicitly states failure at execution start.

## 3. Code Review
- [ ] Confirm the transitive closure computation handles diamond dependencies correctly (A→B, A→C, B→D, C→D — D can reference A, B, and C).
- [ ] Confirm the check fires at execution start, not at validation/submission.
- [ ] Confirm self-references are caught.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test variable_visibility` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments on `compute_transitive_depends_on` and the visibility check explaining the design rationale (execution-time failure vs validation-time).

## 6. Automated Verification
- [ ] Run `cargo test variable_visibility -- --nocapture` and verify zero failures.
