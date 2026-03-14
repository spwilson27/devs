# Task: Implement Traceability Reporter and ./do test Integration (Sub-Epic: 007_Traceability and Reporting Schema)

## Covered Requirements
- [2_TAS-REQ-079]
- [2_TAS-REQ-080]

## Dependencies
- depends_on: ["01_implement_traceability_scanner.md"]
- shared_components: [./do Entrypoint Script & CI Pipeline (consumer), Traceability & Coverage Infrastructure (owner — traceability report schema)]

## 1. Initial Test Written
- [ ] Create `tests/test_traceability_reporter.py` with the following test cases:
  - **test_generates_valid_schema**: Given scanner output with 2 found IDs and a PRD containing 3 IDs, assert `target/traceability.json` matches the exact schema from [2_TAS-REQ-079]:
    ```json
    {
      "requirements": [
        {"id": "1_PRD-REQ-001", "covering_tests": ["crate::module::test_name"], "covered": true},
        {"id": "1_PRD-REQ-002", "covering_tests": [], "covered": false},
        {"id": "1_PRD-REQ-003", "covering_tests": ["crate::other::test"], "covered": true}
      ],
      "traceability_pct": 66.67,
      "overall_passed": false
    }
    ```
  - **test_traceability_pct_calculation**: 5 PRD requirements, 5 covered → `traceability_pct: 100.0`, `overall_passed: true`. 5 PRD requirements, 0 covered → `traceability_pct: 0.0`, `overall_passed: false`.
  - **test_uncovered_requirement_fails**: If any `1_PRD-REQ-*` ID from `docs/plan/specs/1_prd.md` has zero covering tests, the reporter must return exit code 1.
  - **test_stale_annotation_fails**: If scanner finds `// Covers: 1_PRD-REQ-999` but `1_PRD-REQ-999` does not exist in the PRD spec, the reporter must return exit code 1 and include it in a `stale_annotations` array in the JSON output.
  - **test_prd_id_extraction**: Mock a minimal `docs/plan/specs/1_prd.md` containing `**[1_PRD-REQ-001]**` and `**[1_PRD-REQ-002]**`. Assert the reporter extracts exactly those two IDs.
  - **test_output_directory_created**: If `target/` does not exist, the reporter creates it before writing.
  - **test_multiple_tests_per_requirement**: Two different test functions both annotate `1_PRD-REQ-001`. Assert `covering_tests` contains both.

## 2. Task Implementation
- [ ] Create `.tools/traceability_reporter.py` with:
  - `extract_prd_ids(prd_path: str) -> list[str]`: Scan the PRD spec file for all `**[1_PRD-REQ-NNN]**` patterns using regex `\*\*\[([0-9]+_PRD-REQ-[0-9]+)\]\*\*`. Return sorted list of unique IDs.
  - `generate_report(scanner_results: list[dict], prd_ids: list[str]) -> dict`: Build the `target/traceability.json` structure. For each PRD ID, collect all scanner results matching that ID into `covering_tests`. Set `covered: true` if list is non-empty. Calculate `traceability_pct` as `(covered_count / total_count) * 100` rounded to 2 decimal places. Set `overall_passed` to `True` only if all requirements are covered AND no stale annotations exist. Include `stale_annotations: [...]` listing any annotation IDs not in the PRD ID list.
  - `main()`: Parse `--root-dir` argument (default `.`). Call scanner, call `extract_prd_ids`, call `generate_report`. Write JSON to `target/traceability.json` with 2-space indent. Exit 1 if `overall_passed` is false.
- [ ] Integrate into `./do` script: In the `cmd_test()` function, after `cargo test` completes successfully, invoke `python3 .tools/traceability_reporter.py --root-dir .`. If the reporter exits non-zero, `./do test` must also exit non-zero.
- [ ] Include `phase_gates` array in the JSON output: `"phase_gates": [{"phase": "phase_0", "traceability_met": <bool>}]` — this is consumed by PTC validation.

## 3. Code Review
- [ ] Verify `traceability_pct` uses `round(value, 2)` to avoid floating point display issues.
- [ ] Verify stale annotation detection matches the [2_TAS-REQ-080] requirement: "Stale annotations (ID not present in the PRD) cause `./do test` to exit non-zero."
- [ ] Ensure the reporter does NOT fail if there are zero PRD requirements (edge case for early development — return 100% and pass).
- [ ] JSON output must be deterministic (requirements sorted by ID).

## 4. Run Automated Tests to Verify
- [ ] Run `python3 -m pytest tests/test_traceability_reporter.py -v` and confirm all 7 tests pass.
- [ ] Run `./do test` in the repo and verify `target/traceability.json` is created.

## 5. Update Documentation
- [ ] Add inline docstrings to all public functions in `traceability_reporter.py`.
- [ ] Document the `target/traceability.json` schema in a comment at the top of the reporter file referencing [2_TAS-REQ-079].

## 6. Automated Verification
- [ ] Run `python3 -c "import json; d=json.load(open('target/traceability.json')); assert 'requirements' in d; assert 'traceability_pct' in d; assert 'overall_passed' in d; print('Schema valid')"`.
- [ ] Verify `./do test` exits non-zero when a dummy stale annotation is temporarily added to a test file.
