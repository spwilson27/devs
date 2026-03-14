# Task: Traceability Report Generator (Sub-Epic: 01_Core Quality Gates)

## Covered Requirements
- [3_MCP_DESIGN-REQ-055]

## Dependencies
- depends_on: []
- shared_components: [Traceability & Verification Infrastructure, ./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a Python test `tests/test_traceability_report.py` that:
  1. Creates a temporary directory with mock spec files containing requirement IDs like `**[2_TAS-REQ-001]**`.
  2. Creates mock Rust test files with `// Covers: [2_TAS-REQ-001]` annotations.
  3. Invokes the traceability generator script.
  4. Asserts that `target/traceability.json` is produced with the correct schema.
  5. Verifies that `overall_passed` is `true` only when all requirements have `covered: true`.
  6. Verifies that `traceability_pct` is calculated correctly as `(covered_count / total_count) × 100.0`.
  7. Annotates with `// Covers: [3_MCP_DESIGN-REQ-055]`.
- [ ] Run the test to confirm it fails (red) before the generator is implemented:
  ```
  pytest tests/test_traceability_report.py -v 2>&1 | tee /tmp/traceability_test_baseline.txt
  ```

## 2. Task Implementation
- [ ] **Implement or update the traceability generator** at `.tools/verify_requirements.py`:
  - **Requirement Discovery**:
    - Scans all Markdown files under `docs/plan/specs/` for the pattern `**[<ID>]**` where ID matches `[0-9]+_[A-Z]+-[A-Z]+-[0-9]+[a-z]?`.
    - Collects all requirement IDs into a set.
  - **Annotation Discovery**:
    - Scans all Rust source files under `crates/` and `tests/` for `// Covers: <ID>` comments and `#[doc = "Covers: <ID>"]` attributes.
    - Maps each requirement ID to a list of test function names that annotate it.
  - **Test Execution Verification**:
    - Reads `target/test_results.json` (produced by `cargo test --message-format=json`) to verify which tests passed.
    - A requirement is `covered` only if at least one test annotating it **passed** in the last `./do test` run.
  - **Report Generation**:
    - Produces `target/traceability.json` with the exact schema:
      ```json
      {
        "schema_version": 1,
        "generated_at": "2026-03-10T14:23:05.123Z",
        "overall_passed": false,
        "traceability_pct": 98.5,
        "requirements": [
          {
            "id": "2_TAS-REQ-001",
            "covered": true,
            "test_count": 3,
            "test_names": [
              "devs_grpc::tests::test_startup_sequence",
              "devs_server::tests::test_grpc_bind",
              "tests::e2e::test_server_startup"
            ]
          }
        ]
      }
      ```
    - `schema_version`: Always `1`.
    - `generated_at`: RFC 3339 UTC timestamp with millisecond precision.
    - `overall_passed`: `true` iff every requirement has `covered: true` AND `traceability_pct == 100.0`.
    - `traceability_pct`: `(covered_count / total_count) × 100.0` rounded to 1 decimal place.
    - `requirements`: Array sorted lexicographically by `id`, with fields: `id`, `covered`, `test_count`, `test_names`.
  - **Exit Behavior**:
    - If `overall_passed` is `false`, exit with code `1` and print to stderr:
      ```
      TRACEABILITY FAILED: uncovered requirements: 2_TAS-REQ-002, 2_TAS-REQ-007
      ```
  - Annotate with `# [3_MCP_DESIGN-REQ-055]`.

- [ ] **Update `./do test`** to invoke the traceability generator:
  - After running `cargo test --workspace`, invoke `.tools/verify_requirements.py`.
  - Ensure the report is written to `target/traceability.json`.
  - Exit non-zero if `overall_passed` is `false`.
  - Annotate with `# [3_MCP_DESIGN-REQ-055]`.

- [ ] **Implement stale annotation detection**:
  - If a `// Covers: <ID>` annotation references a requirement ID not found in `docs/plan/specs/`, mark it as "stale" in the report.
  - Add a `stale_annotations` array to the report:
    ```json
    "stale_annotations": [
      {"id": "2_TAS-REQ-OLD", "location": "crates/devs-cli/src/lib.rs:42"}
    ]
    ```

## 3. Code Review
- [ ] Confirm that `target/traceability.json` is treated as the canonical checklist for the agent.
- [ ] Ensure that "stale" annotations (pointing to deleted code or missing requirements) are correctly identified and reported.
- [ ] Verify that `traceability_pct` calculation handles edge cases:
  - Zero requirements defined → `100.0`.
  - All requirements covered → `100.0`.
  - Partial coverage → rounded to 1 decimal place.
- [ ] Confirm all public functions have doc comments.
- [ ] Verify `// Covers: [3_MCP_DESIGN-REQ-055]` annotations are present in test files.

## 4. Run Automated Tests to Verify
- [ ] Run the Python test:
  ```
  pytest tests/test_traceability_report.py -v
  ```
  The test must pass (green) — meaning the generator produces the correct schema.
- [ ] Run `./do test` and inspect `target/traceability.json`:
  ```
  ./do test 2>&1 | tee /tmp/test_run.txt
  cat target/traceability.json | python3 -m json.tool
  ```
- [ ] Verify that the report contains all requirements from the spec files:
  ```
  python3 -c "import json; d=json.load(open('target/traceability.json')); print(f'Total requirements: {len(d[\"requirements\"])}'); print(f'Traceability: {d[\"traceability_pct\"]}%')"
  ```
- [ ] Verify that uncovered requirements cause non-zero exit:
  ```
  # Temporarily remove a // Covers annotation, run ./do test, confirm it exits 1
  # Then restore the annotation.
  ```

## 5. Update Documentation
- [ ] Add a section to `GEMINI.md` titled "Traceability as Memory" explaining:
  - `target/traceability.json` is the authoritative record of which requirements have passing test coverage.
  - A development agent MUST treat this file as the canonical task completion checklist.
  - Any requirement with `"covered": false` in this file is incomplete regardless of subjective assessment.
  - The agent MUST fail any task completion assertion if `traceability_pct < 100.0`.
  - The agent MUST regenerate the file (via `./do test`) if the `generated_at` timestamp is more than 1 hour old.
- [ ] Update `docs/architecture/testing.md` to document the traceability generation process.
- [ ] In `docs/plan/phases/phase_5.md`, update the entry for `[3_MCP_DESIGN-REQ-055]`:
  ```
  - [3_MCP_DESIGN-REQ-055]: Covered by `.tools/verify_requirements.py` and `tests/test_traceability_report.py`
  ```

## 6. Automated Verification
- [ ] Confirm the requirement is covered in the traceability report:
  ```
  ./do presubmit 2>&1 | tee /tmp/presubmit_traceability.txt
  grep "3_MCP_DESIGN-REQ-055" /tmp/presubmit_traceability.txt
  ```
  The ID must appear as `COVERED`.
- [ ] Validate `target/traceability.json` schema:
  ```
  python3 -c "
  import json
  d = json.load(open('target/traceability.json'))
  assert d['schema_version'] == 1
  assert 'generated_at' in d
  assert 'overall_passed' in d
  assert 'traceability_pct' in d
  assert 'requirements' in d
  for r in d['requirements']:
      assert all(k in r for k in ['id', 'covered', 'test_count', 'test_names'])
  print('OK: Schema validated')
  "
  ```
- [ ] Verify that `overall_passed` is `false` if even one requirement is not covered:
  ```
  python3 -c "
  import json
  d = json.load(open('target/traceability.json'))
  uncovered = [r for r in d['requirements'] if not r['covered']]
  if uncovered:
      print(f'Uncovered requirements: {[r[\"id\"] for r in uncovered]}')
      assert d['overall_passed'] == False
      assert d['traceability_pct'] < 100.0
  else:
      print('All requirements covered')
      assert d['overall_passed'] == True
      assert d['traceability_pct'] == 100.0
  print('OK: Logic verified')
  "
  ```
- [ ] Verify that the requirement IDs match those in the spec files:
  ```
  python3 .tools/verify_requirements.py --verify-spec-ids
  ```
