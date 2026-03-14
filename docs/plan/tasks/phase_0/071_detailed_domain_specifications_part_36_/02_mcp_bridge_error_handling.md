# Task: MCP Bridge Connection-Refused Error Handling (Sub-Epic: 071_Detailed Domain Specifications (Part 36))

## Covered Requirements
- [2_TAS-REQ-431]

## Dependencies
- depends_on: []
- shared_components: ["Server Discovery Protocol"]

## 1. Initial Test Written
- [ ] Create an E2E test in `crates/devs-mcp-bridge/tests/connection_refused.rs` that:
  1. Sets `DEVS_DISCOVERY_FILE` to a temp file containing `127.0.0.1:0` (or a port known to have no listener).
  2. Spawns the `devs-mcp-bridge` binary as a subprocess.
  3. Captures stdout and the exit code.
  4. Asserts stdout contains exactly `{"error": "connection refused", "code": 3}` (valid JSON, parseable).
  5. Asserts the process exit code is `3`.
  6. Add `// Covers: 2_TAS-REQ-431` annotation.
- [ ] Create a second test where the discovery file does not exist at all — assert the same JSON error output and exit code 3.
- [ ] Create a unit test for the error formatting function that produces the JSON string, verifying the exact field names, values, and JSON validity.

## 2. Task Implementation
- [ ] In `crates/devs-mcp-bridge/src/main.rs` (or connection module), add a connection attempt to the server address resolved from discovery.
- [ ] On connection failure (TCP refused, timeout, discovery file missing/unreadable), write `{"error": "connection refused", "code": 3}` to stdout as a single line and call `std::process::exit(3)`.
- [ ] Ensure no other output (no log lines, no stderr noise) is emitted before the JSON error line on stdout.
- [ ] Extract the error JSON formatting into a small helper function (`fn connection_refused_json() -> String`) so it can be unit-tested independently.

## 3. Code Review
- [ ] Verify the JSON output is produced by serialization (e.g., `serde_json::json!`) rather than string concatenation, to guarantee valid JSON.
- [ ] Verify exit code 3 is used consistently and matches the project convention for "unreachable server" (cross-reference with [2_TAS-REQ-432] and CLI exit code conventions).
- [ ] Verify no panic or unwrap on the connection path — all errors are caught and converted to the structured JSON response.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp-bridge --test connection_refused` and confirm all tests pass.
- [ ] Run `cargo test -p devs-mcp-bridge` (all tests) and confirm no regressions.

## 5. Update Documentation
- [ ] Add doc comment on the connection error handler explaining the exit code 3 convention and JSON format, referencing [2_TAS-REQ-431].

## 6. Automated Verification
- [ ] Run `./do test` and confirm the traceability scanner detects `// Covers: 2_TAS-REQ-431`.
- [ ] Run `./do lint` and confirm no warnings or errors.
