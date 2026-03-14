# Task: Protocol-Level Edge Case Validation Logic (Sub-Epic: 035_Foundational Technical Requirements (Part 26))

## Covered Requirements
- [2_TAS-REQ-086N]

## Dependencies
- depends_on: [01_json_serialization_rules.md]
- shared_components: [devs-core (consumer), devs-proto (consumer)]

## 1. Initial Test Written
- [ ] In `crates/devs-core/tests/protocol_edge_cases.rs`, write the following tests **before** implementation, one per edge case from the spec table:
  - `test_ec_p01_request_too_large`: Call `validate_request_size(data, limit)` with `data.len() > limit`. Assert error message matches `"request too large: <actual_bytes> > <limit_bytes>"` and maps to gRPC `RESOURCE_EXHAUSTED`.
  - `test_ec_p01_request_within_limit`: Call with `data.len() <= limit`. Assert `Ok(())`.
  - `test_ec_p02_unknown_proto_field_ignored`: Verify that the project policy is documented (proto3 silently ignores unknown fields). This is a proto3 default — write a compile-time or doc-test that confirms prost's default behavior. Deserialize a proto message bytes payload containing an unknown field tag; assert no error is returned and known fields are correctly parsed.
  - `test_ec_p03_invalid_inputs_json`: Call `validate_inputs_json("{not json")`. Assert error message is `"input validation: inputs_json is not valid JSON"` and maps to `INVALID_ARGUMENT`.
  - `test_ec_p03_valid_inputs_json`: Call `validate_inputs_json("{\"key\": \"value\"}")`. Assert `Ok(())`.
  - `test_ec_p04_definition_json_invalid_utf8`: Call `validate_definition_json(bytes)` with non-UTF-8 bytes. Assert error message is `"definition_json is not valid UTF-8"` and maps to `INVALID_ARGUMENT`.
  - `test_ec_p04_definition_json_valid_utf8`: Call with valid UTF-8 JSON string bytes. Assert `Ok(())`.
  - `test_ec_p05_duplicate_run_name_returns_already_exists`: This is a behavioral contract test. Define a trait method or function `check_run_name_unique(project, name) -> Result<()>`. Call twice with the same name (simulating concurrent calls). Assert the second call returns an error mapping to `ALREADY_EXISTS`.
  - `test_ec_p07_stream_terminal_run_sends_snapshot_then_closes`: (Covered by task 03, but add a contract-level assertion here.) Assert that requesting a stream for a terminal run produces exactly 1 event with `event_type == "run.snapshot"` and terminal status, then closes.
  - `test_ec_p09_broken_pipe_exit_zero`: Define a function `handle_write_error(err)` that checks for `BrokenPipe` IO error kind and returns exit code `0`. Test with `io::Error::new(io::ErrorKind::BrokenPipe, "")`, assert exit code is `0`.
  - `test_ec_p09_other_io_error_propagates`: Call `handle_write_error` with a non-BrokenPipe error. Assert it propagates the error (does not silently swallow it).
  - `test_ec_p10_double_sigterm_runs_shutdown_once`: Define an `AtomicBool` shutdown guard. Call `initiate_shutdown()` twice. Assert the shutdown body executes exactly once (use an `AtomicU32` counter).
  - `test_ec_p12_unknown_enum_value_treated_as_default`: Deserialize a proto enum field with value `999` (undefined). Assert it deserializes as the default value (value `0`, i.e., `UNSPECIFIED`). This is proto3 default behavior — verify prost handles it.

## 2. Task Implementation
- [ ] In `crates/devs-core/src/protocol.rs`, implement the following validation functions:
  - `pub fn validate_request_size(data: &[u8], max_bytes: usize) -> Result<(), ProtocolError>` — returns `ProtocolError::RequestTooLarge { actual: data.len(), limit: max_bytes }` if exceeded.
  - `pub fn validate_inputs_json(json_str: &str) -> Result<serde_json::Value, ProtocolError>` — attempts `serde_json::from_str`, returns `ProtocolError::InvalidInputsJson` on failure.
  - `pub fn validate_definition_utf8(bytes: &[u8]) -> Result<&str, ProtocolError>` — calls `std::str::from_utf8`, returns `ProtocolError::InvalidDefinitionUtf8` on failure.
  - `pub fn handle_write_error(err: std::io::Error) -> Result<(), std::io::Error>` — if `err.kind() == BrokenPipe`, returns `Ok(())`. Otherwise returns `Err(err)`.
  - `pub fn shutdown_guard() -> ShutdownGuard` — returns a guard using `AtomicBool::compare_exchange` that ensures the shutdown closure runs exactly once.
- [ ] Define `pub enum ProtocolError` in `crates/devs-core/src/protocol.rs`:
  - `RequestTooLarge { actual: usize, limit: usize }` — `Display`: `"request too large: {actual} > {limit}"`
  - `InvalidInputsJson` — `Display`: `"input validation: inputs_json is not valid JSON"`
  - `InvalidDefinitionUtf8` — `Display`: `"definition_json is not valid UTF-8"`
  - `DuplicateRunName { name: String }` — `Display`: `"run name already exists: {name}"`
- [ ] Implement a `to_grpc_status(&self) -> tonic::Status` method on `ProtocolError` mapping:
  - `RequestTooLarge` → `Status::resource_exhausted(self.to_string())`
  - `InvalidInputsJson` → `Status::invalid_argument(self.to_string())`
  - `InvalidDefinitionUtf8` → `Status::invalid_argument(self.to_string())`
  - `DuplicateRunName` → `Status::already_exists(self.to_string())`
- [ ] Add `pub mod protocol;` to `crates/devs-core/src/lib.rs`.
- [ ] Note: EC-P06 (webhook connection refused retry) is implemented in the `devs-webhook` crate (Phase 2), not here. EC-P08 (logs rotated) and EC-P11 (write_workflow_definition during active run) are behavioral and implemented in their respective crates. This task only implements the foundational validation and error types.

## 3. Code Review
- [ ] Verify `ProtocolError::Display` messages match the spec exactly (character-for-character).
- [ ] Verify `to_grpc_status` mappings use the correct gRPC status codes.
- [ ] Verify `shutdown_guard` is thread-safe (`AtomicBool` with `Ordering::SeqCst` on the CAS).
- [ ] Verify `handle_write_error` only catches `BrokenPipe`, not other error kinds.
- [ ] Verify no business logic is mixed into protocol validation — these are pure input validation functions.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- protocol_edge_cases` to verify all edge case tests pass.

## 5. Update Documentation
- [ ] Add doc comments on each function in `protocol.rs` referencing the specific EC-P## edge case it handles.
- [ ] Add a module-level doc comment referencing [2_TAS-REQ-086N] and listing all 12 edge cases with their implementation status (implemented here vs. deferred to consuming crates).

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero failures.
- [ ] Run `./do lint` and confirm zero warnings.
- [ ] Run `cargo test -p devs-core -- protocol_edge_cases --nocapture 2>&1 | grep "test result"` and confirm all tests pass.
