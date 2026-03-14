# Task: Template Resolution Performance Regression Test (Sub-Epic: 25_Risk 007 Verification)

## Covered Requirements
- [AC-RISK-007-05]

## Dependencies
- depends_on: ["01_template_truncation_and_boolean.md"]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Add a performance test in `devs-core/benches/template_bench.rs` (or as a separate test file) that constructs a 1 MiB template string containing 1,000 `{{...}}` variable expressions.
- [ ] Implement a benchmark using `criterion` (if used in the workspace) or a simple `std::time::Instant` measurement in a standard test function.
- [ ] The test MUST assert that `TemplateResolver::resolve()` completes in less than 100ms for the 1 MiB template with 1,000 substitutions.

## 2. Task Implementation
- [ ] If current implementation doesn't meet the target, optimize `TemplateResolver::resolve()` to use a single-pass scan with efficient buffer allocation (e.g., pre-allocating the `String` capacity if possible).
- [ ] Ensure that large input strings (1 MiB) are handled without excessive memory copying.

## 3. Code Review
- [ ] Verify that the performance test is deterministic and accurately reflects execution time on the CI runner.
- [ ] Confirm that no quadratic behavior exists in the resolution logic (e.g., Repeatedly searching for `{{` from the start after each substitution).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --test template_perf` (or similar command) to verify the performance requirement is met.
- [ ] Run `./do test` and confirm the test is counted toward [AC-RISK-007-05].

## 5. Update Documentation
- [ ] Add a comment in the `TemplateResolver` implementation noting the performance guarantees and the corresponding regression test.

## 6. Automated Verification
- [ ] Run `./do presubmit` and check that the performance test passes within the budget on the local development machine.
