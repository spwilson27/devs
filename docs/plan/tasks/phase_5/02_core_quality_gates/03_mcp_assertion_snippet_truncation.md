# Task: MCP Assertion Snippet Truncation (Sub-Epic: 02_Core Quality Gates)

## Covered Requirements
- [3_MCP_DESIGN-REQ-BR-036]

## Dependencies
- depends_on: [none]
- shared_components: [devs-mcp]

## 1. Initial Test Written
- [ ] Create a unit test in `crates/devs-mcp/src/tools/assert_stage_output.rs` (or equivalent) that:
    - Sets up a stage output with a very long `stdout` (> 500 characters).
    - Calls the assertion tool with a failing predicate.
    - Asserts that the returned `actual_snippet` in the failure record is exactly 256 characters long (if the actual value was longer).
    - Asserts that the truncation occurs correctly for both `stdout` and `stderr` fields if targeted by assertions.

## 2. Task Implementation
- [ ] Update the `assert_stage_output` MCP tool logic in `devs-mcp`:
    - When an assertion fails, capture the "actual" value that caused the failure.
    - If the "actual" value is a string and exceeds 256 characters, truncate it to 256 characters before populating the `actual_snippet` field in the `AssertionFailure` object.
    - Ensure that the truncation happens at the character level (UTF-8 safe).

## 3. Code Review
- [ ] Verify that truncation only affects the failure record's `actual_snippet`, and not the full output available through other MCP tools.
- [ ] Confirm that the truncation logic is applied consistently across all assertion types (equals, matches, json_path_contains, etc.).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp`.
- [ ] Run an E2E test that triggers an assertion failure and inspect the JSON response.

## 5. Update Documentation
- [ ] Update the MCP tool documentation to clarify that `actual_snippet` is a truncated summary and `get_stage_output` should be used for full analysis.

## 6. Automated Verification
- [ ] Verify that the `actual_snippet` length is always ≤ 256 characters in failing assertion results.
