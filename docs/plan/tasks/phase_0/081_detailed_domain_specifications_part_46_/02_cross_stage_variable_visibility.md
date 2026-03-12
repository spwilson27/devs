# Task: Cross-Stage Variable Visibility Validation (Sub-Epic: 081_Detailed Domain Specifications (Part 46))

## Covered Requirements
- [2_TAS-REQ-481]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] In `devs-core`, create a test suite `template_visibility_tests.rs`.
- [ ] Write a test that defines a workflow with three stages: `A`, `B`, and `C`.
- [ ] Set `B` to depend on `A`.
- [ ] Set `C` to NOT depend on `B`.
- [ ] In `C`'s prompt, add a template variable reference `{{stage.B.output}}`.
- [ ] Write a test that attempts to resolve templates for `C` at execution start.
- [ ] Assert that the resolution fails with a specific `VisibilityError` because `B` is not in `C`'s transitive `depends_on` closure.
- [ ] Write a test with a valid reference (where `B` is a dependency) and assert it succeeds.

## 2. Task Implementation
- [ ] In `devs-core/src/template.rs`, implement `TemplateResolver`.
- [ ] Ensure the resolver has access to the workflow's dependency graph (transitive closure).
- [ ] Implement visibility check logic:
    - Before resolving `{{stage.NAME.FIELD}}`, verify that `NAME` is in the transitive `depends_on` closure of the current stage.
    - If not, return `Err(VisibilityError)`.
- [ ] Ensure this check is performed at execution start (when templates are resolved), NOT at workflow submission time (per [2_TAS-REQ-481]).
- [ ] Integrate this check into the existing template resolution engine.

## 3. Code Review
- [ ] Verify that the dependency check correctly handles transitive dependencies (e.g., if C depends on B and B depends on A, C can reference A).
- [ ] Confirm that invalid references lead to a `Failed` stage transition.
- [ ] Ensure the error message specifically identifies the out-of-scope stage.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --test template_visibility_tests`.
- [ ] Verify all tests pass, covering both valid and invalid visibility scenarios.

## 5. Update Documentation
- [ ] Add documentation to `TemplateResolver` explaining the transitive dependency requirement for cross-stage variables.

## 6. Automated Verification
- [ ] Run `./do test` and check the traceability report to ensure `2_TAS-REQ-481` is mapped to the passing tests.
