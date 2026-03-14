# Task: Risk Matrix Schema Validation & Lint Infrastructure (Sub-Epic: 09_Risks and Roadmap Integration)

## Covered Requirements
- [8_RISKS-REQ-001], [8_RISKS-REQ-002], [8_RISKS-REQ-003], [8_RISKS-REQ-004], [8_RISKS-REQ-005], [8_RISKS-REQ-006], [8_RISKS-REQ-007], [8_RISKS-REQ-008], [8_RISKS-REQ-009], [8_RISKS-REQ-010], [8_RISKS-REQ-011], [8_RISKS-REQ-012], [8_RISKS-REQ-013], [8_RISKS-REQ-014], [8_RISKS-REQ-015], [8_RISKS-REQ-016], [8_RISKS-REQ-017], [8_RISKS-REQ-018], [8_RISKS-REQ-019], [8_RISKS-REQ-020], [8_RISKS-REQ-021], [8_RISKS-REQ-022], [8_RISKS-REQ-023], [8_RISKS-REQ-024], [8_RISKS-REQ-025], [8_RISKS-REQ-026], [8_RISKS-REQ-027], [8_RISKS-REQ-028], [8_RISKS-REQ-029], [8_RISKS-REQ-030], [8_RISKS-REQ-031], [8_RISKS-REQ-032], [8_RISKS-REQ-033], [8_RISKS-REQ-034], [8_RISKS-REQ-035], [8_RISKS-REQ-036], [8_RISKS-REQ-037], [8_RISKS-REQ-038], [8_RISKS-REQ-039], [8_RISKS-REQ-040], [8_RISKS-REQ-041], [8_RISKS-REQ-042], [8_RISKS-REQ-043], [8_RISKS-REQ-044], [8_RISKS-REQ-045], [8_RISKS-REQ-046], [8_RISKS-REQ-047], [8_RISKS-REQ-048], [8_RISKS-REQ-049], [8_RISKS-REQ-050], [8_RISKS-REQ-051], [8_RISKS-REQ-052], [8_RISKS-REQ-053], [8_RISKS-REQ-054], [8_RISKS-REQ-055], [8_RISKS-REQ-056], [8_RISKS-REQ-057], [8_RISKS-REQ-058], [8_RISKS-REQ-059], [8_RISKS-REQ-060], [8_RISKS-REQ-061], [8_RISKS-REQ-062], [8_RISKS-REQ-063], [8_RISKS-REQ-064], [8_RISKS-REQ-065], [8_RISKS-REQ-066], [8_RISKS-REQ-067], [8_RISKS-REQ-068], [8_RISKS-REQ-069], [8_RISKS-REQ-070], [8_RISKS-REQ-071], [8_RISKS-REQ-072], [8_RISKS-REQ-073], [8_RISKS-REQ-074], [8_RISKS-REQ-075], [8_RISKS-REQ-076], [8_RISKS-REQ-077], [8_RISKS-REQ-078], [8_RISKS-REQ-079], [8_RISKS-REQ-080], [8_RISKS-REQ-081], [8_RISKS-REQ-082], [8_RISKS-REQ-083], [8_RISKS-REQ-084], [8_RISKS-REQ-085], [8_RISKS-REQ-086], [8_RISKS-REQ-087], [8_RISKS-REQ-088], [8_RISKS-REQ-089], [8_RISKS-REQ-090]

## Dependencies
- depends_on: []
- shared_components: [./do Entrypoint Script & CI Pipeline (consumer), Traceability & Coverage Infrastructure (consumer)]

## 1. Initial Test Written
- [ ] Create `tests/risk_matrix_validation_test.rs` (or equivalent test module within the traceability tooling crate). Write a test `test_risk_matrix_parsing` that loads `docs/plan/specs/8_risks_mitigation.md`, parses all `[RISK-NNN]` entries from the §1 matrix table, and asserts that the parsed count matches the expected 25 risks (RISK-001 through RISK-025). This validates [8_RISKS-REQ-001].
- [ ] Write `test_risk_id_uniqueness` that asserts all `RISK-NNN` IDs extracted from the matrix table are unique across the entire document. Covers [8_RISKS-REQ-085].
- [ ] Write `test_risk_mitigation_pairing` that for every `[RISK-NNN]` in the matrix, asserts a corresponding `[MIT-NNN]` section exists in §2, §3, or §4. Covers [8_RISKS-REQ-026], [8_RISKS-REQ-082].
- [ ] Write `test_fallback_reference_validity` that for every `FB-NNN` referenced in the matrix, asserts a matching fallback definition exists in §5. Covers [8_RISKS-REQ-086].
- [ ] Write `test_severity_score_computation` that for each risk, parses the Impact and Probability columns, computes `impact_val × probability_val` (HIGH=3, MEDIUM=2, LOW=1), and asserts the result matches the `Severity Score` column. Covers [8_RISKS-REQ-038], [8_RISKS-REQ-039], [8_RISKS-REQ-040], [8_RISKS-REQ-044], [8_RISKS-REQ-084].
- [ ] Write `test_risk_category_valid` that asserts every risk's category is exactly one of `Technical`, `Operational`, or `Market`. Covers [8_RISKS-REQ-034], [8_RISKS-REQ-035], [8_RISKS-REQ-087].
- [ ] Write `test_risk_category_counts` that counts risks per category and validates the totals match the documented baseline table (14 Technical, 7 Operational, 4 Market). Covers [8_RISKS-REQ-090].
- [ ] Write `test_high_severity_covering_tests` that for every risk with `severity_score >= 6` and status not `Accepted` or `Retired`, scans `**/*.rs` files for `// Covers: RISK-NNN` annotations and asserts at least one test covers it. Covers [8_RISKS-REQ-027], [8_RISKS-REQ-037], [8_RISKS-REQ-080], [8_RISKS-REQ-083].
- [ ] Write `test_risk_record_json_schema` that validates the risk record JSON schema from §1.1 against a set of valid and invalid test fixtures. Covers [8_RISKS-REQ-023], [8_RISKS-REQ-025], [8_RISKS-REQ-088].
- [ ] Write `test_fallback_activation_record_schema` that validates the FAR JSON schema from §1.1 against test fixtures. Covers [8_RISKS-REQ-024].
- [ ] Write `test_risk_lifecycle_transitions` that verifies the state machine: Open→Mitigated (when covering tests pass), Mitigated→Open (when test fails), Mitigated→Retired, Accepted→Mitigated, Accepted→Retired. Invalid transitions must return errors. Covers [8_RISKS-REQ-031].
- [ ] Write `test_risk_matrix_violations_in_traceability` that verifies `./do test` generates a `risk_matrix_violations` array in `target/traceability.json`. When a score≥6 risk lacks a covering test, the violation appears. Covers [8_RISKS-REQ-079], [8_RISKS-REQ-081].
- [ ] Write `test_risk_interdependency_documented` that for each interdependency pair listed in §1.7, verifies both risk IDs exist in the matrix. Covers [8_RISKS-REQ-066] through [8_RISKS-REQ-076].
- [ ] Write `test_monitoring_mechanism_exists` that for each score≥6 risk in §1.6, verifies the monitoring mechanism field is non-empty and references a valid test or CI job. Covers [8_RISKS-REQ-048] through [8_RISKS-REQ-062].
- [ ] Write `test_score_to_action_mapping` that validates score 9=Critical, 6=High, 4=Medium, 2-3=Low, 1=Negligible mappings are reflected in the action column. Covers [8_RISKS-REQ-041].

## 2. Task Implementation
- [ ] Implement a `RiskMatrixParser` module that parses `docs/plan/specs/8_risks_mitigation.md` and extracts structured `RiskRecord` structs from the markdown table. Fields: `risk_id`, `summary`, `category`, `impact`, `probability`, `severity_score`, `mitigation_id`, `fallback_id`. Use regex patterns `RISK-[0-9]{3}`, `MIT-[0-9]{3}`, `FB-[0-9]{3}`.
- [ ] Implement a `RiskValidator` that runs all business rule checks: BR-001 (mitigation pairing), BR-002 (covering test for score≥6), BR-003 (new risks documented), BR-004 (retirement conditions), BR-005 (FAR ADR required), BR-006 (failed test reverts to Open), BR-007 (no manual deletion), BR-008 (single category), BR-009 (market score≤4 monthly review), BR-010 (technical/operational score≥6 test required), BR-011 (score recalculation timestamp), BR-012 (impact set by lead), BR-013 (probability not downgraded by mitigation).
- [ ] Integrate `RiskValidator` into `./do test` so that `target/traceability.json` includes a `risk_matrix_violations` array. When violations exist, `./do test` exits non-zero. Covers [8_RISKS-REQ-079].
- [ ] Integrate `RiskValidator` into `./do lint` for structural checks: unique IDs, valid categories, severity arithmetic, MIT/RISK pairing, FB reference validity.
- [ ] Implement `RiskInterdependencyChecker` that parses §1.7 entries and validates that both risk IDs in each pair exist. Business rules BR-017 (compound activation assessment) and BR-018 (new interdependencies must be documented). Covers [8_RISKS-REQ-077], [8_RISKS-REQ-078].
- [ ] Implement monitoring mechanism validation in `./do lint` ensuring every score≥6 risk has a non-empty monitoring entry. Covers [8_RISKS-REQ-063]. Ensure `presubmit_timings.jsonl` is committed to CI artifacts with 7-day expiry [8_RISKS-REQ-064]. Monitoring that fires in CI must cause exit non-zero [8_RISKS-REQ-065].
- [ ] Implement score recalculation: `./do lint` recomputes severity scores from impact×probability columns and fails if any mismatch. Covers [8_RISKS-REQ-042], [8_RISKS-REQ-043].

## 3. Code Review
- [ ] Verify the `RiskMatrixParser` correctly handles all 25 risks in the matrix table, including the gap in numbering (RISK-001 through RISK-016, then RISK-021 through RISK-025).
- [ ] Verify regex patterns for RISK-NNN, MIT-NNN, FB-NNN match the documented patterns in [8_RISKS-REQ-025].
- [ ] Verify `./do test` integration produces valid `risk_matrix_violations` array entries with the correct structure.
- [ ] Verify no false positives: Market risks with score≤4 do NOT require covering tests [8_RISKS-REQ-036].

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -- risk_matrix` to verify all risk matrix validation tests pass.
- [ ] Run `./do test` and verify `target/traceability.json` contains a `risk_matrix_violations` array.
- [ ] Run `./do lint` and verify risk matrix structural checks pass.

## 5. Update Documentation
- [ ] Update `./do` script help text to mention risk matrix validation in the `test` and `lint` subcommands.
- [ ] Add `// Covers: 8_RISKS-REQ-NNN` annotations to all new tests.

## 6. Automated Verification
- [ ] Run `./do presubmit` end-to-end and verify it completes within 15 minutes. Verify `target/traceability.json` contains `risk_matrix_violations` with zero violations (all risks properly covered).
- [ ] Grep all test files for `// Covers: 8_RISKS-REQ-` and verify the count matches the number of requirements in this task (90 requirement IDs).
