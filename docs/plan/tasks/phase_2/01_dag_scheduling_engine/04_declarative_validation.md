# Task: Workflow Authoring - Declarative Integration & Validation (Sub-Epic: 01_DAG Scheduling Engine)

## Covered Requirements
- [1_PRD-REQ-006]: Dual Workflow Authoring Formats (Declarative Config).
- [2_TAS-REQ-030A]: Workflow Validation Order.
- [ROAD-P2-DEP-001]: Phase 1 Completion (Prerequisite verification).

## Dependencies
- depends_on: [01_dag_topological_sort.md]
- shared_components: [devs-config, devs-core, devs-scheduler]

## 1. Initial Test Written
- [ ] Create unit tests in `devs-config/src/workflow/validator.rs` for the 13 validation checks.
- [ ] Test 1: Duplicate stage names are rejected.
- [ ] Test 2: References to non-existent stages in `depends_on` are rejected.
- [ ] Test 3: Cyclic dependencies are rejected (check #4 from 2_TAS-REQ-030A).
- [ ] Test 4: Pool existence is checked (check #5 from 2_TAS-REQ-030A).
- [ ] Test 5: Verify all 13 checks in the specified sequence.
- [ ] Test 6: Verify Phase 1 dependencies (crates exist and have baseline tests).

## 2. Task Implementation
- [ ] Implement `WorkflowValidator` that processes a `WorkflowDefinition` against all 13 checks from 2_TAS-REQ-030A.
- [ ] Integrate with `devs-config` to apply validation after TOML/YAML parsing.
- [ ] Ensure `ValidationError` accumulates all errors (2_TAS-REQ-032).
- [ ] Implement a `ROAD-P2-DEP-001` verification script that checks Phase 1 crate coverage using `cargo-llvm-cov`.
- [ ] Ensure declarative workflows can use built-in predicates (`exit_code`, `stdout_contains`).

## 3. Code Review
- [ ] Verify validation order matches 2_TAS-REQ-030A exactly.
- [ ] Ensure that `devs-config` correctly maps YAML/TOML fields to `devs-core` types.
- [ ] Check for proper error messages for each validation failure.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config` and ensure all validation tests pass.

## 5. Update Documentation
- [ ] Document all supported built-in predicates for declarative workflows.

## 6. Automated Verification
- [ ] Run `./do test` to verify 100% requirement-to-test traceability for [1_PRD-REQ-006] (Declarative portion) and [2_TAS-REQ-030A].
