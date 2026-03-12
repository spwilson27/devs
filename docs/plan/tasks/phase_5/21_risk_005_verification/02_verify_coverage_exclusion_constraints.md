# Task: Verify Coverage Exclusion Constraints (Sub-Epic: 21_Risk 005 Verification)

## Covered Requirements
- [RISK-006], [RISK-006-BR-001]

## Dependencies
- depends_on: [01_verify_ci_performance_thresholds.md]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a Python test `tests/test_coverage_exclusions.py` that scans for `// llvm-cov:ignore` in the workspace and asserts that each occurrence is adjacent to an allowed pattern (e.g., `#[cfg(windows)]`, `#[cfg(unix)]`, `unreachable!()`, `panic!()`).
- [ ] The test MUST also verify that `target/coverage/excluded_lines.txt` matches the annotations in the source files.

## 2. Task Implementation
- [ ] Add a `check_coverage_exclusions` step to `.tools/workflow.py` or `.tools/verify_requirements.py`:
    - Recursively scans `.rs` files for `// llvm-cov:ignore`.
    - Validates each annotation against `[RISK-006-BR-001]`:
        - Permitted for: Platform-conditional branches (`#[cfg(...)]`), unreachable/panic error paths, and generated code (`devs-proto/src/gen/`).
        - Prohibited for: Business logic (any other location).
    - Checks that the line is listed in `target/coverage/excluded_lines.txt`.
- [ ] Update `./do lint` to invoke this check.
- [ ] Ensure that `target/coverage/report.json` sets `overall_passed: false` if any invalid exclusion is found.

## 3. Code Review
- [ ] Verify that the lint script correctly identifies business logic exclusions.
- [ ] Confirm that `excluded_lines.txt` is updated whenever an annotation is added or removed.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_coverage_exclusions.py`.
- [ ] Run `./do lint` and ensure it fails if an illegal `// llvm-cov:ignore` is added.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/8_risks_mitigation.md` to reflect the final exclusion policy in `[RISK-006-BR-001]`.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` and confirm `[RISK-006]` and `[RISK-006-BR-001]` are verified.
