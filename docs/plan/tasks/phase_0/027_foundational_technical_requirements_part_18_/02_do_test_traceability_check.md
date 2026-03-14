# Task: Implement `./do test` Traceability Check (Sub-Epic: 027_Foundational Technical Requirements (Part 18))

## Covered Requirements
- [2_TAS-REQ-014F]

## Dependencies
- depends_on: []
- shared_components: [./do Entrypoint Script & CI Pipeline (consumer), Traceability & Coverage Infrastructure (owner of traceability scanner)]

## 1. Initial Test Written
- [ ] Create `tests/do_script/test_traceability.sh` with the following test cases:
  - **Test 1 — JSON schema**: Set up a temp workspace with one Rust file containing `// Covers: 2_TAS-REQ-001` and a mock spec file containing `[2_TAS-REQ-001]`. Run the traceability scanner. Assert `target/traceability.json` exists and contains all required keys: `total_requirements` (int), `covered_requirements` (int), `uncovered_requirements` (int), `traceability_pct` (float), `overall_passed` (bool), `uncovered_ids` (array).
  - **Test 2 — 100% coverage passes**: With all spec IDs covered by at least one `// Covers:` annotation, assert `traceability_pct` equals `100.0`, `overall_passed` is `true`, and exit code is 0.
  - **Test 3 — uncovered requirement fails**: Add a requirement ID `[2_TAS-REQ-002]` to the spec file but do NOT add a corresponding `// Covers:` annotation. Assert `traceability_pct < 100.0`, `overall_passed` is `false`, `uncovered_ids` contains `"2_TAS-REQ-002"`, and the process exits non-zero.
  - **Test 4 — stale reference fails**: Add `// Covers: 2_TAS-REQ-999` in a Rust file but do NOT add `[2_TAS-REQ-999]` to any spec file. Assert the process exits non-zero due to the stale reference.
  - **Test 5 — multiple spec files**: Place requirement IDs in both `docs/plan/specs/1_prd.md` and `docs/plan/specs/2_tas.md`. Assert the scanner finds IDs from both files.
- [ ] Use `jq` (or equivalent) to parse and assert JSON field values.

## 2. Task Implementation
- [ ] Create a traceability scanner script (e.g., `.tools/traceability_scan.sh` or `.tools/traceability_scan.py`) that:
  1. **Scans source files**: Recursively searches all `src/` and `tests/` directories in all workspace crates for comments matching `// Covers: (1_PRD-REQ-\d+|2_TAS-REQ-\d+[A-Z]?)`. Collects a set of `covered_ids`.
  2. **Scans spec files**: Reads `docs/plan/specs/1_prd.md` and `docs/plan/specs/2_tas.md` for all matches of `\[(1_PRD-REQ-\d+[A-Z]?)\]` and `\[(2_TAS-REQ-\d+[A-Z]?)\]`. Collects a set of `all_requirement_ids`.
  3. **Detects stale references**: Computes `stale_ids = covered_ids - all_requirement_ids`. If non-empty, prints each stale ID to stderr and marks the run as failed.
  4. **Computes coverage**: `uncovered_ids = all_requirement_ids - covered_ids`. `traceability_pct = (covered / total) * 100.0`.
  5. **Writes JSON**: Outputs `target/traceability.json` with the exact schema from [2_TAS-REQ-014F]:
     ```json
     {
       "total_requirements": <int>,
       "covered_requirements": <int>,
       "uncovered_requirements": <int>,
       "traceability_pct": <float>,
       "overall_passed": <bool>,
       "uncovered_ids": [<string>, ...]
     }
     ```
  6. **Exit code**: Exits 0 if `traceability_pct == 100.0` and no stale references; exits 1 otherwise.
- [ ] Integrate the scanner into `./do test` so it runs after `cargo test` completes. The `./do test` exit code must reflect both test results and traceability results (exit non-zero if either fails).
- [ ] Ensure `target/` directory is created if it does not exist before writing `traceability.json`.

## 3. Code Review
- [ ] Verify regex patterns handle suffixed requirement IDs (e.g., `2_TAS-REQ-014E`, `1_PRD-REQ-001`).
- [ ] Verify the scanner handles edge cases: empty spec files, files with no annotations, crates with no `tests/` directory.
- [ ] Confirm the JSON output uses the exact field names and types from the specification (no extra fields, no missing fields).
- [ ] Verify the scanner does not count duplicate `// Covers:` annotations for the same ID as additional coverage.

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/do_script/test_traceability.sh` and confirm all 5 tests pass.
- [ ] Run `./do test` on the workspace and inspect `target/traceability.json` for correctness.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-014F` to the test file and/or scanner source.

## 6. Automated Verification
- [ ] Run `sh tests/do_script/test_traceability.sh && echo "VERIFIED"` — `VERIFIED` must appear.
- [ ] Run `cat target/traceability.json | jq .` to confirm valid JSON output after a full `./do test` run.
