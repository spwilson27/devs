# Task: Implement Deterministic Test Runner (Sub-Epic: 02_1_PRD)

## Covered Requirements
- [1_PRD-REQ-NEED-AGENT-03]

## 1. Initial Test Written
- [ ] Create tests at tests/determinism/test_runner_reproducible.py::test_runner_reproducible_output:
  - Arrange: prepare a small test suite that prints deterministic values when seeded (use demo_random.py from Task 04).
  - Act: run the project's TestRunner in 'deterministic' mode twice in the same environment and capture the canonicalized result objects (stdout, stderr, exit codes, file artifacts list).
  - Assert: all canonicalized result objects are identical and their serialized JSON hashes match.

## 2. Task Implementation
- [ ] Implement or extend the TestRunner module (src/test_runner.py or equivalent):
  - Add a `deterministic` boolean flag to TestRunner.run(...). When true:
    - Force single-threaded test execution (disable parallelism).
    - Enforce canonical ordering of test files and test-case execution.
    - Ensure environment seeding (delegate to SandboxRunner with seed param).
    - Normalize outputs by removing volatile timestamps and environment-dependent lines using configurable regexes.
    - Produce a canonical JSON result object for each run with fields: tests[], stdout_hash, stderr_hash, artifacts[].

## 3. Code Review
- [ ] Verify:
  - TestRunner's canonicalization rules are configurable and documented.
  - The runner exposes reproducible artifacts and can be run locally by an engineer to reproduce CI results.
  - Performance impacts are accepted for deterministic mode and are gated behind an explicit flag.

## 4. Run Automated Tests to Verify
- [ ] Run: pytest tests/determinism/test_runner_reproducible.py -q
  - Expected: deterministic runs produce identical canonical results.

## 5. Update Documentation
- [ ] Update docs/prd/deterministic_test_runner.md describing the deterministic flag, canonicalization rules, and examples of running the TestRunner in deterministic mode.

## 6. Automated Verification
- [ ] Add CI step scripts/determinism/verify_test_runner.sh which runs the TestRunner twice and compares serialized result JSON files byte-for-byte, failing the CI job if differences are detected.
