# Task: PRD Requirement Coverage Enforcement Gate (Sub-Epic: 010_Foundational Technical Requirements (Part 1))

## Covered Requirements
- [1_PRD-BR-004], [2_PRD-BR-003]

## Dependencies
- depends_on: [docs/plan/tasks/phase_0/007_traceability_and_reporting_schema/01_implement_traceability_scanner.md, docs/plan/tasks/phase_0/007_traceability_and_reporting_schema/02_implement_traceability_reporter.md]
- shared_components: [Traceability & Coverage Infrastructure (consumer — uses `// Covers: REQ-ID` scanner and `target/traceability.json` output)]

## 1. Initial Test Written
- [ ] **Test: `test_uncovered_requirement_causes_gate_failure`** — Create a temporary directory with a mock `docs/plan/requirements/test.md` containing a requirement `[TEST-REQ-001]` and a Rust source file with NO `// Covers: TEST-REQ-001` annotation. Run the traceability scanner/gate logic against this directory. Assert the gate exits non-zero and the error output names `TEST-REQ-001` as uncovered. Annotate with `// Covers: 1_PRD-BR-004`.
- [ ] **Test: `test_covered_requirement_passes_gate`** — Same setup but the Rust source file contains `// Covers: TEST-REQ-001`. Run the gate. Assert exit code 0. Annotate with `// Covers: 1_PRD-BR-004`.
- [ ] **Test: `test_failing_test_for_stage_blocks_completion`** — Simulate the scenario from [2_PRD-BR-003]: a requirement has a `// Covers:` annotation in a test function, but that test function is marked `#[ignore]` or returns `Err`. The gate must report this requirement as "covered but not passing" and exit non-zero. Annotate with `// Covers: 2_PRD-BR-003`.
- [ ] **Test: `test_traceability_json_lists_uncovered_requirements`** — Run the scanner on a directory with both covered and uncovered requirements. Parse `target/traceability.json`. Assert the `uncovered_requirements` array contains exactly the uncovered IDs. Annotate with `// Covers: 1_PRD-BR-004`.
- [ ] **Test: `test_multiple_tests_can_cover_same_requirement`** — Two different test files both have `// Covers: TEST-REQ-001`. Gate passes. The traceability report shows the requirement covered by 2 tests. Annotate with `// Covers: 1_PRD-BR-004`.

## 2. Task Implementation
- [ ] Extend the traceability scanner (from sub-epic 007) to cross-reference all requirement IDs extracted from `docs/plan/requirements/*.md` against `// Covers: <REQ-ID>` annotations found in `**/*.rs` files.
- [ ] The scanner must extract requirement IDs matching the pattern `[<PREFIX>-<ID>]` from markdown headers (e.g., `### **[1_PRD-BR-004]**`).
- [ ] Implement an `uncovered_requirements` field in `target/traceability.json` that lists all requirement IDs with zero covering test annotations.
- [ ] Integrate the coverage enforcement check into `./do test` so that after `cargo test` completes, the traceability scanner runs and the gate fails if any requirement is uncovered.
- [ ] For [2_PRD-BR-003] enforcement: after `cargo test` runs, parse the test output (or `--format json` output) to identify which `// Covers:` annotated tests actually passed. Requirements whose only covering tests failed or were ignored must be flagged as "not verified."
- [ ] Add the enforcement step to `./do presubmit` (it already runs `./do test`, so this is inherited).

## 3. Code Review
- [ ] Verify the requirement ID regex handles all ID formats in the project: `1_PRD-BR-NNN`, `2_PRD-BR-NNN`, `2_TAS-REQ-NNN`, `ROAD-*`, `AC-ROAD-*`, `RISK-*`, etc.
- [ ] Confirm that the gate produces a human-readable summary listing each uncovered requirement with its description.
- [ ] Ensure the gate does not false-positive on requirement IDs that appear in non-requirement contexts (e.g., in prose text).
- [ ] Verify [2_PRD-BR-003] logic correctly distinguishes between "annotation exists but test fails" vs "no annotation at all."

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test` (which triggers the traceability gate) and confirm it passes on the current codebase.
- [ ] Temporarily remove a `// Covers:` annotation from a test, run `./do test`, and confirm it fails with a clear message naming the uncovered requirement.
- [ ] Restore the annotation and confirm `./do test` passes again.

## 5. Update Documentation
- [ ] Add a doc comment in the traceability scanner module explaining the enforcement policy: every requirement in `docs/plan/requirements/` must have at least one passing test with a `// Covers:` annotation.
- [ ] Document the `uncovered_requirements` field in the `target/traceability.json` schema.

## 6. Automated Verification
- [ ] Run `./do presubmit` and confirm exit code 0 (which includes the traceability gate).
- [ ] Verify `target/traceability.json` exists and contains `uncovered_requirements` as an array (may be empty if all requirements are covered; must be present regardless).
- [ ] Run `grep -c 'Covers:' devs-core/tests/*.rs devs-core/src/**/*.rs` to confirm annotations exist in the codebase.
