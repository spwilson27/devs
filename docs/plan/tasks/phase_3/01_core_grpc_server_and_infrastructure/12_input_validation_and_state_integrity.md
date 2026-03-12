# Task: Input Validation and State Integrity (Sub-Epic: 01_Core gRPC Server and Infrastructure)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-007], [5_SECURITY_DESIGN-REQ-008], [5_SECURITY_DESIGN-REQ-042], [5_SECURITY_DESIGN-REQ-043], [5_SECURITY_DESIGN-REQ-049], [5_SECURITY_DESIGN-REQ-050], [5_SECURITY_DESIGN-REQ-067]

## Dependencies
- depends_on: [07_filesystem_security_and_path_handling.md]
- shared_components: [devs-core, devs-checkpoint]

## 1. Initial Test Written
- [ ] Write a test for structured output parsing that attempts to parse a JSON file with > 128 nested levels and verifies it fails with `structured_output_parse_error`.
- [ ] Create a test for the `success` field in `structured_output` verifying that only literal booleans are accepted.
- [ ] Implement a test for checkpoint integrity: verify that checkpoint JSONs are correctly versioned and basic schema validation is performed on load.

## 2. Task Implementation
- [ ] Use `serde_json` with a custom depth-limited deserializer for all structured output parsing.
- [ ] Implement strict type checking for the `success` field in `.devs_output.json`.
- [ ] Add a 10KiB truncation limit for stage outputs included in downstream prompts.
- [ ] Implement the `devs-mcp-bridge` JSON validation: ensure every request body is valid JSON before forwarding.
- [ ] Add basic schema version checking for checkpoint files during recovery.
- [ ] Ensure that checkpoint git repositories use git's internal SHA-1 integrity checks.

## 3. Code Review
- [ ] Confirm that no unvalidated user input can reach the state machine.
- [ ] Verify that truncation logic is applied consistently across all data flow paths.
- [ ] Ensure that the MCP bridge is non-blocking and provides structured errors for malformed input.

## 4. Run Automated Tests to Verify
- [ ] `cargo test -p devs-core -p devs-checkpoint`

## 5. Update Documentation
- [ ] Document the limits (size, depth) for structured output in the developer guide.

## 6. Automated Verification
- [ ] Verify that oversized or malformed checkpoints are handled gracefully (marked as unrecoverable) without crashing the server.
