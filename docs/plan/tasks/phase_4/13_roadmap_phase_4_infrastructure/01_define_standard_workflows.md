# Task: Define Standard Workflow Definitions (Sub-Epic: 13_Roadmap Phase 4 Infrastructure)

## Covered Requirements
- [AC-ROAD-P4-001]

## Dependencies
- depends_on: [none]
- shared_components: [devs-config]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-config` that reads the contents of `.devs/workflows/` and ensures all six mandatory TOML files exist and are syntactically valid according to the `WorkflowDefinition` schema.
- [ ] Ensure the test fails if any of: `tdd-red.toml`, `tdd-green.toml`, `presubmit-check.toml`, `build-only.toml`, `unit-test-crate.toml`, `e2e-all.toml` are missing or invalid.

## 2. Task Implementation
- [ ] Create the `.devs/workflows/` directory.
- [ ] Implement `tdd-red.toml`: A workflow for the Red phase of TDD (test creation, expected failure).
- [ ] Implement `tdd-green.toml`: A workflow for the Green phase of TDD (implementation to pass tests).
- [ ] Implement `build-only.toml`: A basic build workflow using `./do build`.
- [ ] Implement `unit-test-crate.toml`: A workflow that runs unit tests for a specific crate.
- [ ] Implement `e2e-all.toml`: A workflow that runs all end-to-end tests.
- [ ] Implement `presubmit-check.toml`: A composite workflow that depends on `build-only`, `unit-test-crate` (for all crates), and `e2e-all`.
- [ ] All workflows must include appropriate `pool = "standard"` and stage dependencies (`depends_on`).

## 3. Code Review
- [ ] Verify that all workflows follow the standard DAG structure.
- [ ] Ensure `presubmit-check.toml` correctly aggregates all necessary checks to satisfy the "presubmit" definition.
- [ ] Validate that prompts and completion signals (`exit_code`) are correctly configured.

## 4. Run Automated Tests to Verify
- [ ] Run the `devs-config` tests created in step 1.

## 5. Update Documentation
- [ ] Document the purpose and structure of the standard workflows in a new `.devs/workflows/README.md`.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-config` and ensure 100% pass for workflow validation.
