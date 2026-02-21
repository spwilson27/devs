# Task: Implement RTI Calculator and Coverage Checks (Sub-Epic: 01_Distiller_Core_Extraction)

## Covered Requirements
- [9_ROADMAP-PHASE-005], [TAS-051]

## 1. Initial Test Written
- [ ] Create tests/distiller/test_rti_calculator.py with tests:
  - test_rti_full_coverage_returns_one()
  - test_rti_partial_coverage_returns_fraction()
  - test_rti_zero_coverage_returns_zero()
  - test_rti_threshold_enforcement_raises_on_below_threshold()
- [ ] Define expected RTI formula in tests: rti = len(extracted_unique_ids & referenced_ids) / len(referenced_ids) if referenced_ids non-empty else 1.0
- [ ] Run: pytest -q tests/distiller/test_rti_calculator.py and confirm failure initially.

## 2. Task Implementation
- [ ] Implement src/distiller/rti.py providing:
  - function compute_rti(extracted_ids: Set[str], referenced_ids: Set[str]) -> float
  - function enforce_coverage(rti: float, threshold: float = 1.0) -> None that raises a CoverageError when rti < threshold
- [ ] Ensure compute_rti is idempotent and uses normalized IDs (expect caller to pass normalized ids).

## 3. Code Review
- [ ] Verify numerical stability and handling of empty referenced_ids (documented to return 1.0 to avoid divide by zero in bootstrapped runs).
- [ ] Confirm unit tests cover boundary values and that exceptions include informative messages.

## 4. Run Automated Tests to Verify
- [ ] Run: pytest -q tests/distiller/test_rti_calculator.py and ensure all tests pass.

## 5. Update Documentation
- [ ] Add an RTI section to docs/distiller.md specifying formula, edge cases, and how this integrates with the Distillation Compiler and Phase gating.

## 6. Automated Verification
- [ ] After implementation, run a combined smoke test: run the compiler on fixtures to produce referenced_ids (simulate by reading a canonical list) and call compute_rti programmatically to assert rti >= 1.0 or the expected fraction.
