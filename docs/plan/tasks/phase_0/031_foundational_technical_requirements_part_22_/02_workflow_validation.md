# Task: Workflow Validation Engine in `devs-config` (Sub-Epic: 031_Foundational Technical Requirements (Part 22))

## Covered Requirements
- [2_TAS-REQ-030A]

## Dependencies
- depends_on: [none]
- shared_components: [devs-config, devs-core]

## 1. Initial Test Written
- [ ] Create unit tests in `devs-config/src/validation.rs` that verify the following:
    - [ ] All 13 checks defined in TAS §4.6 / REQ-030A run in order.
    - [ ] Errors from multiple checks are collected into a `Vec<ConfigError>` (or equivalent) before returning.
    - [ ] Test for:
        - [ ] Schema validation errors.
        - [ ] Duplicate stage names.
        - [ ] Unknown dependency references in `depends_on`.
        - [ ] Cycle detection (Kahn's algorithm) with the correct cycle path returned.
        - [ ] Unknown pool names.
        - [ ] Named handler references that are not registered.
        - [ ] Input default type coercion mismatches.
        - [ ] `prompt` and `prompt_file` co-existence.
        - [ ] `fan_out` and `branch` co-existence.
        - [ ] Fan-out count/list limits (1–64).
        - [ ] `stage.timeout_secs` exceeding `workflow.timeout_secs`.
        - [ ] Zero stages in a workflow.

## 2. Task Implementation
- [ ] Implement the `WorkflowValidator` in `devs-config`.
- [ ] Sequentially implement the 13 validation passes as defined in [2_TAS-REQ-030A]:
    - [ ] 1. Schema, 2. Uniqueness, 3. Dependencies, 4. Cycles (Kahn's), 5. Pools, 6. Handlers, 7. Input types, 8. Prompt exclusivity, 9. Fan-out/branch exclusivity, 10. Fan-out completion (exit_code/structured_output only), 11. Timeout hierarchy, 12. Empty workflow.
- [ ] Use a results collector to ensure the validator doesn't short-circuit on the first error.

## 3. Code Review
- [ ] Verify that the order matches the TAS specification exactly.
- [ ] Ensure that Kahn's algorithm is used for cycle detection and provides the full path of the cycle in the error.
- [ ] Check that each check uses the correct error message format as specified in REQ-030A description (e.g. `"duplicate stage name: <name>"`).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config --lib validation` and ensure all tests pass.

## 5. Update Documentation
- [ ] Ensure `ConfigError` variants are documented to reflect the possible validation failures.

## 6. Automated Verification
- [ ] Run `./do test` and verify that the new tests pass.
- [ ] Verify traceability for [2_TAS-REQ-030A] using `.tools/verify_requirements.py`.
