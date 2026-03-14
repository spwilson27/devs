# Task: Integrate and Verify Complete Traceability System (Sub-Epic: 37_Risk 013 Verification)

## Covered Requirements
- [RISK-013], [RISK-013-BR-001], [RISK-013-BR-002], [RISK-013-BR-003], [RISK-013-BR-004]

## Dependencies
- depends_on: [01_enforce_traceability_gates.md, 02_commit_atomic_traceability_verification.md, 03_implement_traceability_scanner.md, 04_implement_traceability_exit_logic.md, 05_implement_stale_annotation_detection.md, 06_implement_commit_atomic_check.md]
- shared_components: [./do Entrypoint Script, Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] Create an end-to-end integration test in `.tools/tests/test_traceability_e2e.py` class `TestTraceabilityE2E` with the following test methods:
  - `test_full_traceability_workflow_all_gates_pass`: Set up a clean workspace with 100% traceability, run `./do test`, verify exit 0 and `traceability.json` shows `traceability_pct: 100.0` and `stale_annotations: []`
  - `test_full_traceability_workflow_uncovered_fails`: Remove one `// Covers:` annotation, run `./do test`, verify exit 1 and error message lists the uncovered ID
  - `test_full_traceability_workflow_stale_fails`: Add one stale annotation, run `./do test`, verify exit 1 and error message lists the stale ID
  - `test_full_traceability_workflow_commit_atomic_fails`: Add a new requirement without annotation, run commit-atomic check, verify failure
  - `test_traceability_json_schema`: Verify `target/traceability.json` has correct schema: `generated_at` (ISO 8601), `traceability_pct` (float), `stale_annotations` (array), `uncovered_ids` (array), `total_ids` (int), `covered_ids` (int)
  - `test_traceability_json_freshness`: Verify `generated_at` timestamp is within 60 seconds of test execution time (covers AC-RISK-013-04)
- [ ] Create a performance test `test_traceability_scanner_performance`:
  - Generate 10,000 mock `.rs` files with random `// Covers:` annotations
  - Time the scanner execution
  - Verify completion in under 5 seconds (performance budget)

## 2. Task Implementation
- [ ] Ensure `target/traceability.json` is generated with the complete schema:
  ```json
  {
    "generated_at": "2026-03-14T10:30:00Z",
    "traceability_pct": 100.0,
    "stale_annotations": [],
    "uncovered_ids": [],
    "total_ids": 1234,
    "covered_ids": 1234,
    "phase_gates": [
      {"phase": "phase_5", "gate": "RISK-013", "passed": true}
    ]
  }
  ```
- [ ] Integrate all traceability checks into `./do test` flow:
  - Run `verify_requirements.py` (covers RISK-013-BR-001, RISK-013-BR-002, RISK-013-BR-004)
  - Run commit-atomic check (covers RISK-013-BR-003)
  - Generate `target/traceability.json`
  - Exit non-zero if any check fails
- [ ] Add a summary at the end of `./do test`:
  ```
  Traceability Check: PASSED
  - Total requirements: 1234
  - Covered: 1234 (100.0%)
  - Stale annotations: 0
  - Commit-atomic check: PASSED
  ```
- [ ] Ensure `./do presubmit` runs all traceability checks as part of the 900-second timeout budget

## 3. Code Review
- [ ] Verify that all five requirements (RISK-013, RISK-013-BR-001 through BR-004) are fully implemented and tested
- [ ] Check that error messages are consistent across all checks (same format, same level of detail)
- [ ] Confirm that the traceability system doesn't add more than 30 seconds to `./do test` execution time
- [ ] Verify that `target/traceability.json` is overwritten (not appended) on each run
- [ ] Check that the system handles edge cases: empty workspace, no requirements, no `.rs` files

## 4. Run Automated Tests to Verify
- [ ] Run `pytest .tools/tests/test_traceability_e2e.py -v` and ensure all 6 test methods pass
- [ ] Run `./do test` on the full workspace and verify:
  - Exit code is 0 (assuming 100% traceability)
  - `target/traceability.json` is generated with correct schema
  - Summary output shows traceability status
- [ ] Run `./do presubmit` and verify it completes within 900 seconds including all traceability checks
- [ ] Run `./do coverage` and verify traceability annotations are counted toward requirement coverage

## 5. Update Documentation
- [ ] Update `docs/plan/specs/8_risks_mitigation.md`:
  - Mark [RISK-013] as MITIGATED with note "Commit-atomic check and 100% gate enforced"
  - Mark [RISK-013-BR-001] through [RISK-013-BR-004] as IMPLEMENTED
  - Update the risk matrix to show RISK-013 residual risk as LOW (from MEDIUM)
- [ ] Update `.agent/MEMORY.md` with a section on "Traceability Requirements":
  - All requirements must have `// Covers:` annotations
  - Annotations must be in `.rs` files (test or production)
  - Stale annotations cause immediate failure
  - New requirements must have covering tests in same commit
- [ ] Add a `docs/plan/tasks/phase_5/37_risk_013_verification/README.md` summarizing the sub-epic:
  - List all 6 tasks
  - Show requirement coverage mapping
  - Provide quick reference for developers

## 6. Automated Verification
- [ ] Create a comprehensive verification script `.tools/tests/verify_risk_013_complete.sh`:
  ```bash
  #!/usr/bin/env bash
  set -e
  
  echo "=== RISK-013 Verification Suite ==="
  
  # Test 1: 100% traceability passes
  echo "Test 1: Verifying 100% traceability passes..."
  if ! ./do test >/dev/null 2>&1; then
      echo "FAIL: 100% traceability should pass"
      exit 1
  fi
  echo "PASS"
  
  # Test 2: <100% traceability fails
  echo "Test 2: Verifying <100% traceability fails..."
  echo "### **[TEMP-UNCOVERED-001]** Temp" >> docs/plan/requirements/temp.md
  if ./do test 2>/dev/null; then
      echo "FAIL: <100% traceability should fail"
      rm docs/plan/requirements/temp.md
      exit 1
  fi
  rm docs/plan/requirements/temp.md
  echo "PASS"
  
  # Test 3: Stale annotation fails
  echo "Test 3: Verifying stale annotation fails..."
  TEMP_RS=$(mktemp --suffix=.rs)
  echo "// Covers: NONEXISTENT-12345" > "$TEMP_RS"
  cp "$TEMP_RS" .tools/tests/stale_test.rs
  if ./do test 2>/dev/null; then
      echo "FAIL: Stale annotation should fail"
      rm .tools/tests/stale_test.rs
      rm "$TEMP_RS"
      exit 1
  fi
  rm .tools/tests/stale_test.rs
  rm "$TEMP_RS"
  echo "PASS"
  
  # Test 4: traceability.json generated
  echo "Test 4: Verifying traceability.json generated..."
  ./do test >/dev/null 2>&1
  if [ ! -f target/traceability.json ]; then
      echo "FAIL: traceability.json not generated"
      exit 1
  fi
  # Verify schema
  if ! python -c "import json; d=json.load(open('target/traceability.json')); assert 'traceability_pct' in d"; then
      echo "FAIL: traceability.json missing required fields"
      exit 1
  fi
  echo "PASS"
  
  # Test 5: Commit-atomic check
  echo "Test 5: Verifying commit-atomic check..."
  # (This test requires git setup, skip if not available)
  if command -v git &> /dev/null; then
      if ! python .tools/verify_requirements.py --commit-check >/dev/null 2>&1; then
          echo "FAIL: Commit-atomic check failed unexpectedly"
          exit 1
      fi
      echo "PASS"
  else
      echo "SKIP: Git not available"
  fi
  
  echo "=== All RISK-013 Verification Tests Passed ==="
  ```
- [ ] Make the script executable: `chmod +x .tools/tests/verify_risk_013_complete.sh`
- [ ] Run the script and verify all checks pass
- [ ] Commit the verification script as part of this task

## Final Verification Checklist
- [ ] All 5 requirement IDs (RISK-013, BR-001 through BR-004) are covered by tests
- [ ] `./do test` enforces 100% traceability
- [ ] `./do test` rejects stale annotations
- [ ] Commit-atomic check prevents requirements without tests
- [ ] Scanner finds annotations in all `.rs` files (test and production)
- [ ] `target/traceability.json` is generated with correct schema
- [ ] All verification scripts pass
- [ ] Documentation updated to reflect implementation
