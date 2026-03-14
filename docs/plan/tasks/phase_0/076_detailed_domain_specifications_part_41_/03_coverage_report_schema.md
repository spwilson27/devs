# Task: Implement Coverage Report JSON Schema with Five Quality Gates (Sub-Epic: 076_Detailed Domain Specifications (Part 41))

## Covered Requirements
- [2_TAS-REQ-457]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script & CI Pipeline, Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] **Test case 1 — schema validation**: Create a test that runs the coverage reporter against mock coverage data (or a minimal workspace with some tests). Parse the resulting `target/coverage/report.json` and assert:
  - The JSON is valid.
  - It contains a top-level `gates` array with exactly 5 entries.
  - Each entry has fields: `gate_id` (string), `name` (string), `threshold_pct` (number), `actual_pct` (number), `passed` (boolean), `delta_pct` (number).
  - The `gate_id` values are exactly `QG-001`, `QG-002`, `QG-003`, `QG-004`, `QG-005` (in any order).
- [ ] **Test case 2 — threshold values**: Assert the threshold values match the project spec:
  - QG-001: 90.0 (unit test coverage)
  - QG-002: 80.0 (E2E aggregate coverage)
  - QG-003: 50.0 (CLI E2E coverage)
  - QG-004: 50.0 (TUI E2E coverage)
  - QG-005: 50.0 (MCP E2E coverage)
- [ ] **Test case 3 — `overall_passed` field**: Assert the JSON contains an `overall_passed` boolean that is the logical AND of all five `passed` fields.

## 2. Task Implementation
- [ ] Create a coverage reporter (shell script, or Rust binary in the workspace) invoked by `./do coverage` that:
  1. Runs `cargo llvm-cov` (or `cargo tarpaulin`, consistent with project tooling) to collect coverage data.
  2. Parses coverage output to extract per-crate and per-test-category line coverage percentages.
  3. Computes coverage for each of the five gates:
     - **QG-001**: Unit test line coverage across all crates (threshold: 90.0%).
     - **QG-002**: E2E test aggregate line coverage (threshold: 80.0%).
     - **QG-003**: CLI E2E test line coverage (threshold: 50.0%).
     - **QG-004**: TUI E2E test line coverage (threshold: 50.0%).
     - **QG-005**: MCP E2E test line coverage (threshold: 50.0%).
  4. Writes `target/coverage/report.json`:
     ```json
     {
       "overall_passed": true,
       "gates": [
         {
           "gate_id": "QG-001",
           "name": "Unit test line coverage",
           "threshold_pct": 90.0,
           "actual_pct": 92.3,
           "passed": true,
           "delta_pct": 2.3
         }
       ]
     }
     ```
  5. `delta_pct` = `actual_pct - threshold_pct`.
- [ ] Ensure `mkdir -p target/coverage` before writing the file.
- [ ] Integrate into `./do coverage` so the report is always generated.

## 3. Code Review
- [ ] Verify the gate IDs and thresholds are defined as constants, not scattered magic numbers.
- [ ] Confirm the JSON output is deterministic (gates always in QG-001..QG-005 order).
- [ ] Verify `delta_pct` can be negative (when below threshold) and is not clamped.

## 4. Run Automated Tests to Verify
- [ ] Run the schema validation tests and confirm all pass.
- [ ] Run `./do coverage` and confirm `target/coverage/report.json` exists.

## 5. Update Documentation
- [ ] Add a comment in `./do` near the coverage invocation documenting the `target/coverage/report.json` schema.

## 6. Automated Verification
- [ ] Run `./do coverage` then validate: `jq '.gates | length' target/coverage/report.json` outputs `5`.
- [ ] Validate each gate has all required fields: `jq '.gates[] | keys' target/coverage/report.json` shows `actual_pct`, `delta_pct`, `gate_id`, `name`, `passed`, `threshold_pct` for each entry.
