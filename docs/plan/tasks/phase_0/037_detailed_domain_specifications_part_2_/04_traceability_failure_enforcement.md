# Task: Traceability Scanner Exit-Code Enforcement (Sub-Epic: 037_Detailed Domain Specifications (Part 2))

## Covered Requirements
- [1_PRD-KPI-BR-011]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script & CI Pipeline, Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] Write a test `test_traceability_scanner_runs_after_tests` that asserts `./do test` invokes the traceability scanner as a post-test step (not before or during the test suite). Verify by checking the `./do` script structure or by mocking the execution sequence.
- [ ] Write a test `test_scanner_detects_uncovered_prd_requirement` that creates a temporary workspace with a mock PRD file containing two `1_PRD-REQ-*` tags and test files covering only one of them. Run the traceability scanner and assert: (1) `passed` is `false` in the output JSON, (2) the `uncovered_requirements` array contains exactly the uncovered tag, (3) the scanner prints the uncovered requirement ID to stderr/stdout.
- [ ] Write a test `test_scanner_exits_nonzero_on_uncovered_requirement` that runs the scanner against the same mock workspace and asserts the process exit code is non-zero (specifically exit code 1).
- [ ] Write a test `test_scanner_passes_when_all_requirements_covered` that creates a workspace where every `1_PRD-REQ-*` tag has at least one `// Covers:` annotation, runs the scanner, and asserts: `passed: true`, `uncovered_requirements: []`, exit code 0.
- [ ] Write a test `test_traceability_json_schema_conformance` that validates the output at `target/traceability.json` against the expected schema: `timestamp` (ISO-8601 string), `commit` (git SHA string), `requirements` (array of objects with `req_id`, `covered`, `covering_tests`), `total_requirements` (int), `covered_requirements` (int), `uncovered_requirements` (array of strings), `traceability_pct` (float), `passed` (bool).
- [ ] Write a test `test_do_test_exits_nonzero_when_scanner_fails` that wraps the full `./do test` flow with a mock workspace containing an uncovered requirement, and asserts `./do test` exits non-zero even if all Rust tests pass — because the traceability scanner found an uncovered requirement.

## 2. Task Implementation
- [ ] Implement (or extend) the traceability scanner to: (1) parse `docs/plan/specs/1_prd.md` for all `1_PRD-REQ-*` tags using a regex like `\[1_PRD-REQ-\d+\]`, (2) scan all `*.rs` files in the workspace for `// Covers: 1_PRD-REQ-*` annotations, (3) build a mapping of requirement → covering tests, (4) compute `traceability_pct`, (5) set `passed: true` only if every requirement has at least one covering test.
- [ ] Write the output to `target/traceability.json` conforming to the schema defined in the PRD spec (section 4.6.1).
- [ ] If any requirements are uncovered, print each uncovered requirement ID to stdout (one per line, prefixed with `UNCOVERED: `), then exit with code 1.
- [ ] Integrate the scanner into `./do test` as the final step: after `cargo test` completes (regardless of test result), run the scanner. If `cargo test` failed, `./do test` exits non-zero regardless. If `cargo test` passed but the scanner fails, `./do test` exits non-zero.
- [ ] Add `// Covers: 1_PRD-KPI-BR-011` annotations to the scanner implementation tests.

## 3. Code Review
- [ ] Verify the scanner parses the PRD source file directly (not a manually maintained list) — this is consistent with sibling requirement [1_PRD-KPI-BR-013].
- [ ] Verify the `traceability_pct` calculation uses float division: `covered_requirements as f64 / total_requirements as f64 * 100.0`.
- [ ] Verify the scanner handles the case where `docs/plan/specs/1_prd.md` does not exist (should error clearly, not silently produce an empty report).
- [ ] Verify the scanner handles zero requirements gracefully (edge case).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test` targeting the traceability scanner tests.
- [ ] Run `./do test` on the actual workspace and inspect `target/traceability.json` for correct output.

## 5. Update Documentation
- [ ] Ensure the `// Covers:` annotation convention is documented in a developer guide or in the `./do` script's help output.

## 6. Automated Verification
- [ ] Run `./do test` and assert exit code reflects traceability status.
- [ ] Parse `target/traceability.json` and assert it conforms to the expected schema (all required fields present, types correct).
- [ ] Introduce a fake `[1_PRD-REQ-999]` tag into the PRD file, run `./do test`, confirm it exits non-zero and lists `1_PRD-REQ-999` as uncovered. Then revert.
