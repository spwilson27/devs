# Task: Add comprehensive unit tests for RTI edge cases (Sub-Epic: 04_RTI_And_Coverage)

## Covered Requirements
- [1_PRD-REQ-MET-003], [9_ROADMAP-TAS-505]

## 1. Initial Test Written
- [ ] Create tests/unit/test_rti_edgecases.py with the following test cases (write tests first):
  - Zero requirements: assert chosen convention (suggest RTI == 1.0) and document rationale in test.
  - Duplicate requirement IDs: ensure duplicates are deduplicated before computing RTI.
  - Duplicate links: ensure duplicates do not inflate coverage counts.
  - Tasks linked to multiple requirements: ensure each requirement is counted independently.
  - Rounding behavior: for 2/3 covered, assert RTI calculation rounding to 3 decimal places (0.667).

## 2. Task Implementation
- [ ] Implement/adjust compute_rti logic in src/analysis/rti_calculator.py to satisfy tests.
  - Add helpers for deduplication and normalization of IDs.
  - Ensure numeric stability and explicit rounding using Decimal or round(..., 3).

## 3. Code Review
- [ ] Verify tests cover all listed edge cases and that the implementation is resistant to malformed input (None/empty strings).
  - Ensure tests are deterministic and do not rely on global state.

## 4. Run Automated Tests to Verify
- [ ] Run: python -m pytest tests/unit/test_rti_edgecases.py -q

## 5. Update Documentation
- [ ] Add a subsection in docs/metrics/rti_algorithm.md called "Edge Cases & Conventions" listing the decisions made (zero-requirement policy, deduping rules, rounding policy).

## 6. Automated Verification
- [ ] Add tests to the CI pipeline that run the edge case test file individually and fail fast if any edge-case assertion fails.
