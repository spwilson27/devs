# Task: Implement Traceability Scanner for Universal File Scanning (Sub-Epic: 37_Risk 013 Verification)

## Covered Requirements
- [RISK-013-BR-004]

## Dependencies
- depends_on: [01_enforce_traceability_gates.md]
- shared_components: [./do Entrypoint Script, Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] Create a unit test in `.tools/tests/test_traceability_scanner.py` class `TestTraceabilityScanner` with the following test methods:
  - `test_scanner_finds_covers_annotation_in_test_file`: Place a `// Covers: TEST-SCAN-001` annotation in a mock test file, verify scanner finds it
  - `test_scanner_finds_covers_annotation_in_production_file`: Place a `// Covers: TEST-SCAN-002` annotation in a mock production `.rs` file (not in tests/), verify scanner finds it
  - `test_scanner_ignores_target_directory`: Place a `// Covers: TEST-SCAN-003` in `target/foo.rs`, verify scanner does NOT find it
  - `test_scanner_ignores_git_directory`: Place a `// Covers: TEST-SCAN-004` in `.git/foo.rs`, verify scanner does NOT find it
  - `test_scanner_ignores_gen_directory`: Place a `// Covers: TEST-SCAN-005` in `devs-proto/src/gen/foo.rs`, verify scanner does NOT find it
  - `test_scanner_handles_multiple_ids_single_line`: Place `// Covers: TEST-SCAN-006, TEST-SCAN-007` on one line, verify both IDs are captured
  - `test_scanner_handles_multiple_ids_different_files`: Place same ID `// Covers: TEST-SCAN-008` in two different files, verify ID is counted once as covered
- [ ] Create a unit test `test_scanner_excludes_non_rust_files`: Place `// Covers: TEST-SCAN-009` in a `.py` file, verify scanner does NOT find it (only `.rs` files are scanned per RISK-013-BR-004)
- [ ] Mock a workspace with 100 requirement IDs in spec files, add annotations for 95 of them across various `.rs` files, verify scanner reports exactly 95% coverage

## 2. Task Implementation
- [ ] Implement `TraceabilityScanner` class in `.tools/verify_requirements.py` with the following methods:
  - `__init__(self, workspace_root: Path)`: Initialize with workspace root path
  - `scan_file(self, filepath: Path) -> Set[str]`: Scan a single `.rs` file, return set of requirement IDs found in `// Covers:` annotations
  - `scan_workspace(self) -> Set[str]`: Recursively scan all `.rs` files excluding `target/`, `.git/`, `devs-proto/src/gen/`, return union of all found IDs
  - `should_scan_file(self, filepath: Path) -> bool`: Return True if file is a `.rs` file not in excluded directories
- [ ] Implement annotation parsing: use regex `r'//\s+Covers:\s+(.+)'` to capture annotation line, then split on `, ` (comma-space) to extract individual IDs
- [ ] Implement requirement extraction: scan all markdown files in `docs/plan/requirements/`, `docs/plan/specs/`, and `requirements.md` for pattern `\[([A-Z0-9_-]+)\]` in header blocks like `### **[REQ-ID]**`
- [ ] Implement coverage calculation: `traceability_pct = (len(covered_ids) / len(total_ids)) * 100` if total_ids > 0, else 100.0
- [ ] Implement stale annotation detection: `stale_annotations = found_annotation_ids - valid_requirement_ids`
- [ ] Integrate scanner into `verify_requirements.py` main flow: after scanning, print uncovered IDs and stale annotations, then exit(1) if either is non-empty

## 3. Code Review
- [ ] Verify regex pattern correctly handles edge cases: `// Covers: ID` (no trailing space), `// Covers: ID1, ID2, ID3` (multiple IDs), `//  Covers: ID` (double space after //)
- [ ] Confirm scanner performance: scanning 10,000 `.rs` files should complete in under 5 seconds
- [ ] Check that error messages are actionable: "Uncovered: RISK-013-BR-005 (found in docs/plan/requirements/8_risks_mitigation.md:1463)" and "Stale: NON-EXISTENT-ID (found in src/foo.rs:42)"
- [ ] Verify case sensitivity: requirement IDs are case-sensitive, `RISK-013` ≠ `risk-013`

## 4. Run Automated Tests to Verify
- [ ] Run `pytest .tools/tests/test_traceability_scanner.py -v` and ensure all 9 test methods pass
- [ ] Run `python .tools/verify_requirements.py` on the workspace and verify it produces a traceability report
- [ ] Run `./do test` and verify the traceability gate is enforced

## 5. Update Documentation
- [ ] Add docstrings to `TraceabilityScanner` class and all public methods explaining the scanning behavior
- [ ] Update `.tools/README.md` (if exists) or add a comment block at top of `verify_requirements.py` explaining the traceability scanning algorithm
- [ ] Document the file exclusion patterns in a constant `EXCLUDED_PATH_PATTERNS = ["target/", ".git/", "devs-proto/src/gen/"]`

## 6. Automated Verification
- [ ] Create a test script `.tools/tests/verify_scanner.sh` that:
  - Creates a temp `.rs` file with `// Covers: SCANNER-TEST-001`
  - Runs the scanner, verifies the ID is found
  - Removes the temp file
  - Creates a temp file in `target/` with `// Covers: SCANNER-TEST-002`
  - Runs the scanner, verifies the ID is NOT found
  - Cleans up
- [ ] Run the verification script and confirm all checks pass
