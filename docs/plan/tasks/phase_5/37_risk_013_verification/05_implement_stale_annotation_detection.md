# Task: Implement Stale Annotation Detection and Exit Logic (Sub-Epic: 37_Risk 013 Verification)

## Covered Requirements
- [RISK-013-BR-002]

## Dependencies
- depends_on: [01_enforce_traceability_gates.md, 03_implement_traceability_scanner.md]
- shared_components: [./do Entrypoint Script, Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] Create a unit test in `.tools/tests/test_stale_annotations.py` class `TestStaleAnnotationDetection` with the following test methods:
  - `test_detects_single_stale_annotation`: Add `// Covers: NONEXISTENT-REQ-001` to a mock `.rs` file, verify it's reported as stale
  - `test_detects_multiple_stale_annotations`: Add 5 different stale IDs, verify all 5 are reported
  - `test_does_not_report_valid_annotation`: Add `// Covers: RISK-013-BR-002` (a real requirement), verify it's NOT reported as stale
  - `test_handles_mixed_valid_and_stale`: Add 3 valid IDs and 2 stale IDs in same file, verify only 2 stale are reported
  - `test_stale_annotation_causes_exit_nonzero`: Mock a workspace with one stale annotation, verify `sys.exit(1)` is called
  - `test_stale_annotation_error_message_format`: Verify error message includes: the stale ID, the file path, and the line number where it was found
  - `test_case_sensitive_id_matching`: Add `// Covers: risk-013-br-002` (lowercase), verify it's reported as stale (IDs are case-sensitive)
- [ ] Create an integration test `test_stale_annotation_from_renamed_requirement`:
  - Simulate a requirement rename: old ID `[OLD-REQ-001]` renamed to `[NEW-REQ-001]` in spec
  - Add `// Covers: OLD-REQ-001` annotation (now stale after rename)
  - Verify the annotation is detected as stale with message suggesting the new ID

## 2. Task Implementation
- [ ] In `.tools/verify_requirements.py`, add stale annotation detection to the `TraceabilityScanner` class:
  ```python
  def find_stale_annotations(self, found_ids: Set[str], valid_ids: Set[str]) -> Set[Tuple[str, str, int]]:
      """Return set of (stale_id, filepath, line_number) tuples."""
      stale = set()
      for filepath in self.scan_all_rust_files():
          for line_num, line in enumerate(filepath.read_text().splitlines(), 1):
              if match := re.search(r'//\s+Covers:\s+(.+)', line):
                  for id_str in match.group(1).split(', '):
                      req_id = id_str.strip()
                      if req_id and req_id not in valid_ids:
                          stale.add((req_id, str(filepath), line_num))
      return stale
  ```
- [ ] Integrate stale detection into main flow:
  ```python
  stale = scanner.find_stale_annotations(found_ids, total_ids)
  if stale:
      print(f"ERROR: Stale annotations detected: {len(stale)} annotation(s) reference non-existent requirements", file=sys.stderr)
      print("Stale annotations:", file=sys.stderr)
      for stale_id, filepath, line_num in sorted(stale):
          print(f"  - {stale_id} at {filepath}:{line_num}", file=sys.stderr)
      print("Action: Remove the annotation or update it to reference a valid requirement ID", file=sys.stderr)
      sys.exit(1)
  ```
- [ ] Build a cache of valid requirement IDs for O(1) lookup: `valid_ids_set = set(total_ids)`
- [ ] Ensure stale check runs AFTER traceability check (uncovered IDs are more important to fix first)
- [ ] Add a suggestion feature: if a stale ID is similar to a valid ID (e.g., typo), suggest the correct ID using fuzzy matching (optional enhancement)

## 3. Code Review
- [ ] Verify line numbers are 1-indexed (human-readable), not 0-indexed
- [ ] Check that file paths are relative to workspace root for readability
- [ ] Confirm sorting is deterministic: sort by (stale_id, filepath, line_num) for consistent output
- [ ] Verify that the stale check doesn't false-positive on comments like `// This covers the requirement (see RISK-013)` — only `// Covers:` with exact ID format should be scanned
- [ ] Check that IDs with special characters (hyphens, underscores) are handled correctly

## 4. Run Automated Tests to Verify
- [ ] Run `pytest .tools/tests/test_stale_annotations.py -v` and ensure all 7 test methods pass
- [ ] Manually test with a real stale annotation:
  - Add `// Covers: FAKE-REQUIREMENT-123` to a test file
  - Run `./do test`, verify it fails with "Stale annotations detected: 1"
  - Verify the error message includes the file path and line number
  - Remove the stale annotation
  - Run `./do test` again, verify it passes
- [ ] Test with a renamed requirement:
  - Find an existing requirement ID in a spec file
  - Rename it (e.g., `RISK-013-BR-002` → `RISK-013-BR-002-OLD`)
  - Run `./do test`, verify the old ID is now detected as stale
  - Revert the rename

## 5. Update Documentation
- [ ] Update the docstring for `find_stale_annotations()` to document the return format and detection logic
- [ ] Add a section to `docs/plan/specs/8_risks_mitigation.md` under RISK-013-BR-002 noting that stale annotations cause immediate failure
- [ ] Update the error message documentation in `.tools/README.md` (if exists) to include stale annotation error format

## 6. Automated Verification
- [ ] Create a verification script `.tools/tests/verify_stale_detection.sh`:
  ```bash
  #!/usr/bin/env bash
  set -e
  
  # Create a temp file with stale annotation
  TEMP_FILE=$(mktemp --suffix=.rs)
  echo "// Covers: THIS-ID-DOES-NOT-EXIST" > "$TEMP_FILE"
  
  # Copy to workspace (in a test directory)
  mkdir -p .tools/tests/stale_test_workspace/src
  cp "$TEMP_FILE" .tools/tests/stale_test_workspace/src/test.rs
  
  # Run verification (should fail)
  echo "Testing stale annotation detection..."
  if python .tools/verify_requirements.py 2>&1 | grep -q "Stale annotations detected"; then
      echo "PASS: Stale annotation detected"
  else
      echo "FAIL: Stale annotation not detected"
      rm -rf .tools/tests/stale_test_workspace
      rm "$TEMP_FILE"
      exit 1
  fi
  
  # Cleanup
  rm -rf .tools/tests/stale_test_workspace
  rm "$TEMP_FILE"
  
  echo "Stale annotation detection verified!"
  ```
- [ ] Make the script executable: `chmod +x .tools/tests/verify_stale_detection.sh`
- [ ] Run the script and verify all checks pass
