# Task: Implement Heuristic Failure Analyzer (Sub-Epic: 06_Test Suite Integrity & Flakiness)

## Covered Requirements
- [8_RISKS-REQ-116], [3_MCP-TAS-091]

## 1. Initial Test Written
- [ ] Create `tests/test_heuristic_analyzer.py`. Write a test `test_identical_errors` providing two identical traceback strings; assert the analyzer returns `DETERMINISTIC_FAILURE`.
- [ ] Write `test_different_errors` providing two distinct traceback strings; assert the analyzer returns `FLAKY_FAILURE`.
- [ ] Write `test_timestamp_memory_address_stripping` providing two tracebacks that are identical except for memory addresses (e.g., `0x7f8b9c...`) and timestamps; assert the analyzer strips these and correctly identifies them as `DETERMINISTIC_FAILURE`.

## 2. Task Implementation
- [ ] Create `devs/analysis/heuristic_analyzer.py`. Implement the `HeuristicFailureAnalyzer` class with an `analyze_failures(run1_output: str, run2_output: str)` method.
- [ ] Implement robust regex-based sanitization to strip timestamps, memory addresses, and file paths that vary by temporary directory names from the outputs.
- [ ] Implement a string similarity algorithm (e.g., Levenshtein distance or a simple sanitized exact match) to compare the two outputs.
- [ ] If the sanitized outputs differ significantly, return an enum value `FailureType.FLAKY_FAILURE`. Otherwise, return `FailureType.DETERMINISTIC_FAILURE`.

## 3. Code Review
- [ ] Review the regular expressions for stripping non-deterministic strings to ensure they don't over-strip critical error context.
- [ ] Verify the similarity threshold is tuned to avoid false positives for flaky tests.
- [ ] Check for modularity: the sanitization logic should be separated from the comparison logic.

## 4. Run Automated Tests to Verify
- [ ] Execute `pytest tests/test_heuristic_analyzer.py` to ensure the analyzer handles all test cases correctly.
- [ ] Run the project linter on the new files.

## 5. Update Documentation
- [ ] Update `specs/8_risks_mitigation.md` referencing the implemented heuristic algorithm for flaky test detection.
- [ ] Document the sanitization regex patterns in the agent memory so agents understand how errors are compared.

## 6. Automated Verification
- [ ] Provide a fixture file with known flaky outputs and run a test script that asserts the `HeuristicFailureAnalyzer` correctly identifies 100% of the flaky cases in the fixture.