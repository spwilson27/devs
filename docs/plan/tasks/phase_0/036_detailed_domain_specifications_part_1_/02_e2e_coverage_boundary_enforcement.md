# Task: E2E Coverage Boundary Enforcement (Sub-Epic: 036_Detailed Domain Specifications (Part 1))

## Covered Requirements
- [1_PRD-KPI-BR-003]

## Dependencies
- depends_on: [none]
- shared_components: ["./do Entrypoint Script"]

## 1. Initial Test Written
- [ ] Create a mock E2E test file in a `tests/e2e/` directory that contains an import of a non-public (internal) crate type.
- [ ] Run `./do coverage` and assert that it detects the boundary violation.
- [ ] Verify that the script exits with a non-zero code and an error message identifying the test file and the prohibited import.

## 2. Task Implementation
- [ ] Modify the `./do` script's `coverage` subcommand, specifically the E2E coverage measurement logic.
- [ ] Implement a scanner (likely using `grep` or similar) that checks all test files in `tests/e2e/` for direct imports from internal crates (e.g., `use devs_core::internal::*`).
- [ ] Define the whitelist of "public surface" modules that are allowed to be imported in E2E tests.
- [ ] If a boundary violation is detected, abort the coverage calculation and exit with the required error.

## 3. Code Review
- [ ] Ensure the violation check is robust and doesn't produce false positives for valid imports of the public test surface.
- [ ] Verify that the error message clearly states the file and the offending import [1_PRD-KPI-BR-003].

## 4. Run Automated Tests to Verify
- [ ] Run the test created in step 1 and ensure it passes (the violation is correctly reported).
- [ ] Run `./do coverage` on the existing codebase to ensure it still passes (assuming no current boundary violations).

## 5. Update Documentation
- [ ] Update `.agent/MEMORY.md` to document the enforcement of E2E coverage boundaries in the `./do` script.

## 6. Automated Verification
- [ ] Run a specific check command in the shell that searches for `use devs_` (or other internal crates) in `tests/e2e/` and verify that the results are restricted to the allowed public interfaces.
