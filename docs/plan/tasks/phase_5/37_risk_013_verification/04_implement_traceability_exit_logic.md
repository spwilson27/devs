# Task: Implement Traceability Percentage Gate Exit Logic (Sub-Epic: 37_Risk 013 Verification)

## Covered Requirements
- [RISK-013-BR-001]

## Dependencies
- depends_on: ["01_enforce_traceability_gates.md", "03_implement_traceability_scanner.md"]
- shared_components: [./do Entrypoint Script, Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] Create a unit test in `.tools/tests/test_traceability_gates.py` class `TestTraceabilityExitLogic` with the following test methods:
  - `test_exits_nonzero_when_traceability_below_100`: Mock 100 requirements, 99 covered (99.0%), verify `sys.exit(1)` is called
  - `test_exits_nonzero_when_traceability_99_9`: Mock 1000 requirements, 999 covered (99.9%), verify `sys.exit(1)` is called
  - `test_exits_zero_when_traceability_100`: Mock 100 requirements, all 100 covered, verify `sys.exit(0)` is called
  - `test_exits_zero_when_no_requirements`: Mock 0 requirements (empty spec), verify `sys.exit(0)` is called (no requirements = nothing to cover = pass)
  - `test_error_message_lists_uncovered_ids`: Mock 5 uncovered IDs, verify stderr contains all 5 IDs in sorted order
  - `test_error_message_shows_requirement_location`: Mock uncovered ID `RISK-TEST-001` found at `docs/plan/requirements/test.md:42`, verify error message includes file path and line number
- [ ] Create an integration test `test_full_workflow_traceability_gate`:
  - Temporarily remove a `// Covers:` annotation from a real test file in the workspace
  - Run `./do test`, capture exit code
  - Verify exit code is non-zero
  - Restore the annotation
  - Run `./do test` again, verify exit code is 0

## 2. Task Implementation
- [ ] In `.tools/verify_requirements.py`, implement the final gate logic after scanning:
  ```python
  def main():
      scanner = TraceabilityScanner(workspace_root)
      total_ids = scanner.extract_all_requirement_ids()
      covered_ids = scanner.scan_workspace()
      
      uncovered_ids = total_ids - covered_ids
      traceability_pct = (len(covered_ids) / len(total_ids) * 100) if total_ids else 100.0
      
      if uncovered_ids:
          print(f"ERROR: Traceability check failed: {len(uncovered_ids)} uncovered requirement(s)", file=sys.stderr)
          print(f"Traceability: {traceability_pct:.1f}% (must be 100.0%)", file=sys.stderr)
          print("Uncovered requirements:", file=sys.stderr)
          for req_id in sorted(uncovered_ids):
              location = scanner.get_requirement_location(req_id)
              print(f"  - {req_id} (found in {location})", file=sys.stderr)
          sys.exit(1)
      
      sys.exit(0)
  ```
- [ ] Implement `get_requirement_location(self, req_id: str) -> str` method in `TraceabilityScanner` that returns `filepath:line_number` for a requirement ID
- [ ] Ensure the exit code propagation works through `./do test`:
  - Update `./do` script's `cmd_test()` function to check the exit code of `verify_requirements.py`
  - If `verify_requirements.py` exits non-zero, `./do test` must also exit non-zero
- [ ] Add a configuration constant `REQUIRED_TRACEABILITY_PCT = 100.0` at the top of `verify_requirements.py` to make the threshold explicit and configurable

## 3. Code Review
- [ ] Verify floating-point comparison is correct: use `traceability_pct < REQUIRED_TRACEABILITY_PCT - 0.01` to handle floating-point precision issues (99.999999% should still fail)
- [ ] Check that error messages are sorted alphabetically for deterministic output
- [ ] Confirm that the exit code is properly propagated: `python verify_requirements.py` exit 1 → `./do test` exit 1 → CI pipeline fails
- [ ] Verify that the test for "no requirements" edge case doesn't mask real failures (empty spec should be rare)

## 4. Run Automated Tests to Verify
- [ ] Run `pytest .tools/tests/test_traceability_gates.py::TestTraceabilityExitLogic -v` and ensure all 6 test methods pass
- [ ] Manually test with a real uncovered requirement:
  - Add `[MANUAL-TEST-001]` to `docs/plan/requirements/test-manual.md` (don't add a covering test)
  - Run `./do test`, verify it fails with "Uncovered: MANUAL-TEST-001"
  - Remove the requirement or add a covering test
  - Run `./do test` again, verify it passes
- [ ] Run `./do presubmit` to ensure the gate integrates correctly with the full presubmit pipeline

## 5. Update Documentation
- [ ] Update the docstring for `main()` in `verify_requirements.py` to document the exit code behavior: "Exits 0 if traceability is 100%, exits 1 otherwise"
- [ ] Add a section to `docs/plan/specs/8_risks_mitigation.md` under RISK-013-BR-001 noting that the implementation is complete and verified
- [ ] Update `.agent/MEMORY.md` to note that traceability must be 100% — even one uncovered requirement causes `./do test` to fail

## 6. Automated Verification
- [ ] Create a verification script `.tools/tests/verify_traceability_gate.sh`:
  ```bash
  #!/usr/bin/env bash
  set -e
  
  # Test 1: 100% coverage should pass
  echo "Test 1: Verifying 100% coverage passes..."
  ./do test || { echo "FAIL: Expected exit 0 with 100% coverage"; exit 1; }
  
  # Test 2: Temporarily break traceability
  echo "Test 2: Verifying <100% coverage fails..."
  echo "### **[TEMP-REQ-001]** Temporary Test Requirement" >> docs/plan/requirements/temp-req.md
  if ./do test 2>/dev/null; then
      echo "FAIL: Expected exit 1 with uncovered requirement"
      rm docs/plan/requirements/temp-req.md
      exit 1
  fi
  rm docs/plan/requirements/temp-req.md
  
  echo "All traceability gate tests passed!"
  ```
- [ ] Make the script executable: `chmod +x .tools/tests/verify_traceability_gate.sh`
- [ ] Run the script and verify all tests pass
