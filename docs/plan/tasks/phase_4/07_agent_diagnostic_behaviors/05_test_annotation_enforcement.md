# Task: Implement Test Annotation Enforcement for TDD Workflow (Sub-Epic: 07_Agent Diagnostic Behaviors)

## Covered Requirements
- [3_MCP_DESIGN-REQ-028]

## Dependencies
- depends_on: [none]
- shared_components: [devs-mcp, ./do Entrypoint Script, Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] Write an integration test in `crates/devs-cli/tests/annotation_enforcement_tests.rs` that verifies the following behaviors:
    1. **Test 1.1 - Valid Annotation Detection**: Create a test file with a valid `// Covers: 3_MCP_DESIGN-REQ-XXX` annotation. Run `./do test` and verify it passes the traceability check (the requirement ID is found in `docs/plan/specs/` or `docs/plan/requirements/`).
    2. **Test 1.2 - Missing Annotation Detection**: Create a test file WITHOUT any `// Covers:` annotation. Run `./do test` and verify it produces a traceability failure with exit code 1.
    3. **Test 1.3 - Invalid Requirement ID Detection**: Create a test file with `// Covers: INVALID-REQ-ID` where the ID does not exist in any spec document. Run `./do test` and verify it produces a traceability failure with exit code 1.
    4. **Test 1.4 - Multiple Annotations**: Create a test file with multiple `// Covers:` annotations (for tests covering multiple requirements). Verify all referenced IDs are validated.
    5. **Test 1.5 - Green Stage Block**: Simulate a TDD workflow where the Red stage test has an invalid annotation. Verify that the Green stage (implementation) is blocked until the annotation is fixed.
- [ ] The test should parse `target/traceability.json` output and verify the `stale_annotations` array contains the correct invalid annotations.
- [ ] Mock a TDD workflow session that attempts to proceed to Green stage after a traceability failure. Verify the session is blocked.

## 2. Task Implementation
- [ ] Implement the annotation parser in `crates/devs-cli/src/traceability/annotation_parser.rs`:
    - `parse_covers_annotations(source: &str) -> Result<Vec<RequirementId>>` - extracts all `// Covers: REQ-ID` annotations from test source
    - `validate_requirement_id(id: &str, spec_paths: &[Path]) -> Result<bool>` - checks if the ID exists in spec documents
    - `scan_test_files(test_paths: &[Path]) -> Result<AnnotationReport>` - scans all test files and builds a report
- [ ] Implement the traceability validator in `crates/devs-cli/src/traceability/validator.rs`:
    - `validate_annotations(report: &AnnotationReport) -> Result<(), Vec<TraceabilityError>>` - collects all validation errors
    - `generate_traceability_json(report: &AnnotationReport, output_path: &Path) -> Result<()>` - writes `target/traceability.json`
- [ ] Implement the TDD workflow guard in `crates/devs-cli/src/tdd/guard.rs`:
    - `check_red_stage_valid(test_path: &Path) -> Result<(), TddError>` - verifies test has valid annotation before Red stage
    - `check_green_stage_prereqs(traceability_path: &Path) -> Result<(), TddError>` - blocks Green stage if traceability failed
    - `TddError` enum with variants: `MissingAnnotation`, `InvalidRequirementId`, `TraceabilityFailure`
- [ ] Update `./do test` script to:
    - Run the annotation parser after `cargo test`
    - Generate `target/traceability.json` with structure:
      ```json
      {
        "traceability_pct": 95.5,
        "stale_annotations": ["INVALID-REQ-ID"],
        "phase_gates": [{"phase": 4, "verified": true}]
      }
      ```
    - Exit with code 1 if any stale annotations exist
- [ ] Implement the Green stage block logic in `crates/devs-cli/src/tdd/workflow.rs`:
    - Before running Green stage implementation, check `target/traceability.json`
    - If `stale_annotations` is non-empty, emit error: `TDD_BLOCKED: Traceability failure - fix annotations before Green stage`
    - Exit with code 1 to prevent implementation until fixed

## 3. Code Review
- [ ] Verify that the annotation parser correctly handles edge cases:
    - Multiple annotations on the same line
    - Annotations in comments within doc strings
    - Annotations in test helper modules
- [ ] Check that the requirement ID validation searches all spec documents under `docs/plan/specs/` and `docs/plan/requirements/`.
- [ ] Ensure the traceability JSON output matches the expected schema used by other tools.
- [ ] Verify that the Green stage block is enforced consistently (cannot be bypassed).
- [ ] Confirm that error messages are actionable and point to the exact file/line with the invalid annotation.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --package devs-cli --test annotation_enforcement_tests` to verify all enforcement behaviors.
- [ ] Run `./do test` on a test project with both valid and invalid annotations to verify the full workflow.
- [ ] Manually test the TDD workflow:
    1. Write a test with valid annotation → Red stage should fail (expected)
    2. Attempt Green stage → should succeed (implementation allowed)
    3. Write a test with invalid annotation → Red stage should fail with traceability error
    4. Attempt Green stage → should be blocked

## 5. Update Documentation
- [ ] Update `docs/agent_development.md` with the following sections:
    - "TDD Workflow: Red-Green-Refactor" - explain the annotation requirement
    - "// Covers: Annotation Format" - document the exact syntax and placement
    - "Traceability Validation" - explain how `target/traceability.json` is generated and used
- [ ] Add examples of correct annotation placement:
    ```rust
    // Covers: 3_MCP_DESIGN-REQ-028
    #[test]
    fn test_annotation_enforcement() {
        // test code here
    }
    ```
- [ ] Document the error messages agents will see:
    - `TDD_BLOCKED: Missing // Covers: annotation in test file`
    - `TDD_BLOCKED: Invalid requirement ID XYZ in // Covers: annotation`
    - `TDD_BLOCKED: Traceability failure - fix annotations before Green stage`

## 6. Automated Verification
- [ ] Run `./do presubmit` and verify all tests pass including the new annotation enforcement tests.
- [ ] Run `./do lint` and verify no clippy warnings or formatting issues in the new code.
- [ ] Verify traceability: ensure all new test functions have `// Covers: 3_MCP_DESIGN-REQ-028` annotation.
- [ ] Run `./do coverage` and verify the new code achieves ≥90% unit coverage.
- [ ] Verify that `target/traceability.json` is generated correctly and contains valid JSON.
