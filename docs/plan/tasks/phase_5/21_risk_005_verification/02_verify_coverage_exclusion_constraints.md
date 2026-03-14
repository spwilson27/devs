# Task: Verify Coverage Exclusion Constraints (Sub-Epic: 21_Risk 005 Verification)

## Covered Requirements
- [RISK-006], [RISK-006-BR-001]

## Dependencies
- depends_on: [01_verify_ci_performance_thresholds.md]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a Python test file `tests/test_coverage_exclusions.py` with the following test functions:
  - [ ] `test_llvm_cov_ignore_annotations_are_valid()`:
    - **Test Setup**: Scan all `.rs` files in the workspace for `// llvm-cov:ignore` annotations.
    - **Test Execution**: For each annotation found, examine the surrounding code (5 lines before and after) to classify the exclusion reason.
    - **Assertion**: Verify each annotation matches one of the permitted patterns from [RISK-006-BR-001]:
      - **Platform-conditional**: Adjacent to `#[cfg(windows)]`, `#[cfg(unix)]`, `#[cfg(target_os = "...")]`.
      - **Unreachable code**: Adjacent to `unreachable!()`, `panic!()` in infallible paths (e.g., `match` arms marked as impossible).
      - **Generated code**: File path starts with `devs-proto/src/gen/`.
      - **Business logic exclusions are PROHIBITED**: Any other location must fail the test.
    - **Covers**: [RISK-006-BR-001], [8_RISKS-REQ-145]
  - [ ] `test_excluded_lines_txt_matches_annotations()`:
    - **Test Setup**: Parse `target/coverage/excluded_lines.txt` (format: `path:line` per line).
    - **Test Execution**: Scan all `.rs` files for `// llvm-cov:ignore` annotations and extract file:line pairs.
    - **Assertion**: Verify a 1:1 correspondence:
      - Every annotation has a corresponding entry in `excluded_lines.txt`.
      - Every entry in `excluded_lines.txt` corresponds to an actual annotation in source.
    - **Covers**: [RISK-006-BR-004], [8_RISKS-REQ-148] (note: also covered in sub-epic 22_Risk_006_Verification)
  - [ ] `test_no_business_logic_exclusions()`:
    - **Test Setup**: Identify "business logic" files (all `.rs` files NOT in `devs-proto/src/gen/` and NOT primarily `#[cfg(...)]` platform wrappers).
    - **Test Execution**: Search for `// llvm-cov:ignore` in business logic files.
    - **Assertion**: Zero matches found. If any exist, the test fails with a detailed error message listing file:line locations.
    - **Covers**: [RISK-006-BR-001], [RISK-006], [8_RISKS-REQ-143], [8_RISKS-REQ-145]

## 2. Task Implementation
- [ ] **Implement coverage exclusion scanner** in `.tools/check_coverage_exclusions.py`:
  ```python
  #!/usr/bin/env python3
  """
  Scans workspace for // llvm-cov:ignore annotations and validates against RISK-006-BR-001.
  Exits non-zero if any invalid exclusion is found.
  """
  import os, re, sys
  from pathlib import Path

  PERMITTED_PATTERNS = [
      r'#\[cfg\((windows|unix|target_os)',  # Platform-conditional
      r'unreachable!\(\)',                   # Unreachable code
      r'panic!\(\)',                         # Panic in infallible path
  ]

  def is_permitted_exclusion(file_path: str, line_num: int, context: str) -> bool:
      # Generated code exception
      if file_path.startswith('devs-proto/src/gen/'):
          return True
      # Check surrounding context for permitted patterns
      for pattern in PERMITTED_PATTERNS:
          if re.search(pattern, context):
              return True
      return False

  def scan_workspace():
      violations = []
      for root, dirs, files in os.walk('.'):
          dirs[:] = [d for d in dirs if d not in ['target', '.git']]
          for file in files:
              if not file.endswith('.rs'):
                  continue
              file_path = os.path.join(root, file)
              with open(file_path, 'r', encoding='utf-8') as f:
                  lines = f.readlines()
              for i, line in enumerate(lines):
                  if '// llvm-cov:ignore' in line:
                      context_start = max(0, i - 5)
                      context_end = min(len(lines), i + 6)
                      context = ''.join(lines[context_start:context_end])
                      if not is_permitted_exclusion(file_path, i + 1, context):
                          violations.append(f"{file_path}:{i + 1}")
      return violations

  if __name__ == '__main__':
      violations = scan_workspace()
      if violations:
          print("ERROR: Invalid // llvm-cov:ignore annotations found:")
          for v in violations:
              print(f"  {v}")
          print("\nPermitted exclusions per RISK-006-BR-001:")
          print("  - Platform-conditional branches (#[cfg(windows)], #[cfg(unix)], etc.)")
          print("  - Unreachable error paths (unreachable!(), panic!() in infallible paths)")
          print("  - Generated code in devs-proto/src/gen/")
          print("  - Business logic exclusions are PROHIBITED")
          sys.exit(1)
      print("OK: All // llvm-cov:ignore annotations are valid per RISK-006-BR-001")
      sys.exit(0)
  ```
- [ ] **Integrate into `./do lint`**:
  - Add a step in the `./do` script's lint phase:
    ```bash
    lint_coverage_exclusions() {
        echo "Checking coverage exclusion annotations..."
        python3 .tools/check_coverage_exclusions.py
    }
    ```
  - Ensure this step runs BEFORE `cargo clippy` to fail fast on invalid exclusions.
- [ ] **Update `./do coverage` to generate `excluded_lines.txt`**:
  - After running `cargo llvm-cov`, extract the excluded lines:
    ```bash
    # In ./do coverage, after cargo llvm-cov completes:
    grep -rn '// llvm-cov:ignore' crates/ --include='*.rs' | \
        sed 's/:.*\/\/ llvm-cov:ignore/:0/' | \
        sort -u > target/coverage/excluded_lines.txt
    ```
  - This ensures the file is always regenerated with current annotations.

## 3. Code Review
- [ ] **Verify scanner accuracy**:
  - Manually add a test `// llvm-cov:ignore` annotation in a business logic file (e.g., `devs-core/src/lib.rs` outside any `#[cfg]` block).
  - Run `python3 .tools/check_coverage_exclusions.py` and confirm it detects the violation.
  - Remove the test annotation and re-run to confirm it passes.
- [ ] **Verify platform-conditional detection**:
  - Add a `// llvm-cov:ignore` annotation adjacent to a `#[cfg(windows)]` block.
  - Confirm the scanner accepts it as valid.
- [ ] **Verify generated code exception**:
  - Add a `// llvm-cov:ignore` annotation in `devs-proto/src/gen/devs.v1.rs` (or any file under `devs-proto/src/gen/`).
  - Confirm the scanner accepts it without checking context.
- [ ] **Verify `./do lint` integration**:
  - Run `./do lint` with a valid annotation → should pass.
  - Add an invalid annotation → `./do lint` should fail at the coverage exclusion step.

## 4. Run Automated Tests to Verify
- [ ] Run the test suite:
  ```bash
  cd /home/mrwilson/software/devs
  python3 -m pytest tests/test_coverage_exclusions.py -v
  ```
- [ ] Run the exclusion scanner directly:
  ```bash
  python3 .tools/check_coverage_exclusions.py
  ```
- [ ] Run full lint:
  ```bash
  ./do lint
  # Verify it completes successfully (exit 0) if all exclusions are valid
  ```
- [ ] Verify `excluded_lines.txt` is generated:
  ```bash
  ./do coverage
  cat target/coverage/excluded_lines.txt
  # Should list file:line pairs matching all // llvm-cov:ignore annotations
  ```

## 5. Update Documentation
- [ ] **Update `docs/plan/specs/8_risks_mitigation.md`**:
  - Under `[RISK-006-BR-001]`, add a note documenting the implementation:
    ```markdown
    **Implementation**: Validated by `.tools/check_coverage_exclusions.py` which scans
    all `.rs` files and asserts each `// llvm-cov:ignore` annotation is adjacent to
    a permitted pattern (platform-conditional, unreachable/panic, or in generated code).
    Violations cause `./do lint` to fail.
    ```
  - Under `[RISK-006]`, add a reference to the exclusion validation as part of the mitigation strategy.
- [ ] **Update `docs/adapter-compatibility.md`** (if it exists):
  - If any adapter-specific code requires exclusions, document them here with justification.

## 6. Automated Verification
- [ ] **Run requirement verification script**:
  ```bash
  cd /home/mrwilson/software/devs
  python3 .tools/verify_requirements.py --requirements RISK-006 RISK-006-BR-001
  ```
  - Confirm both requirements show as "verified" in the output.
- [ ] **Check traceability report**:
  ```bash
  cat target/traceability.json | python3 -m json.tool | grep -A2 -B2 "RISK-006"
  ```
  - Verify `RISK-006` and `RISK-006-BR-001` appear in the covered requirements list.
- [ ] **Verify coverage report**:
  ```bash
  ./do coverage
  cat target/coverage/report.json | python3 -m json.tool | grep -A5 '"overall_passed"'
  ```
  - Confirm `overall_passed: true` when all exclusions are valid and gates pass.
