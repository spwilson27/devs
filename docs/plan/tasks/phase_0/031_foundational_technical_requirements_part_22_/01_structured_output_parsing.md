# Task: Structured Output Parsing Logic in `devs-core` (Sub-Epic: 031_Foundational Technical Requirements (Part 22))

## Covered Requirements
- [2_TAS-REQ-024A], [2_TAS-REQ-024B], [2_TAS-REQ-024C]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create unit tests in `devs-core/src/output/parser.rs` (or equivalent) that verify the following scenarios:
    - [ ] If `.devs_output.json` exists and is valid with `"success": true`, status is `Completed`.
    - [ ] If `.devs_output.json` exists and is valid with `"success": false`, status is `Failed`.
    - [ ] If `.devs_output.json` exists but is invalid JSON, status is `Failed`.
    - [ ] If `.devs_output.json` is absent, and stdout ends with a valid JSON object containing `"success": true`, status is `Completed`.
    - [ ] If `.devs_output.json` contains `"success": "true"` (string), status is `Failed` (must be boolean).
    - [ ] Verify that `.devs_output.json` takes precedence over stdout JSON even if both are present.

## 2. Task Implementation
- [ ] Define the `StageOutput` and `StructuredOutput` types in `devs-core`.
- [ ] Implement a parsing function/struct that:
    - [ ] Checks for the existence of `.devs_output.json` in a given path.
    - [ ] Parses it according to [2_TAS-REQ-024B].
    - [ ] Explicitly validates that the `"success"` field is a JSON boolean as per [2_TAS-REQ-024C].
    - [ ] Falls back to stdout trailing JSON parsing if the file is absent.
- [ ] Ensure all parsed data is stored in the `output.structured` field of the stage result.

## 3. Code Review
- [ ] Verify that the parsing logic follows the priority table in TAS §3.6.4 exactly.
- [ ] Ensure that no "true"/"false" string-to-boolean coercion occurs; it must strictly be a JSON boolean.
- [ ] Check that file I/O errors (other than "not found") are handled and result in a `Failed` status.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib output::parser` and ensure all tests pass.

## 5. Update Documentation
- [ ] Update `devs-core` documentation or internal README reflecting the structured output parsing rules.

## 6. Automated Verification
- [ ] Run `./do test` and verify that the new tests are detected and pass.
- [ ] Verify traceability by running `.tools/verify_requirements.py` and checking for [2_TAS-REQ-024A/B/C] mappings.
