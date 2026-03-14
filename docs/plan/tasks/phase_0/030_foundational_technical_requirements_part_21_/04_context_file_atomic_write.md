# Task: Implement Context File Atomic Write with Failure Handling (Sub-Epic: 030_Foundational Technical Requirements (Part 21))

## Covered Requirements
- [2_TAS-REQ-023C]

## Dependencies
- depends_on: ["02_context_file_schema_and_dependency_scope.md", "03_context_file_size_limits_and_truncation.md"]
- shared_components: ["devs-core (consumer — extends context file module)"]

## 1. Initial Test Written
- [ ] Write an integration test `test_atomic_write_creates_context_file` that calls the write function with a valid `ContextFile` and a temp directory path, then reads back `.devs_context.json` from that directory and verifies the content matches the serialized input.
- [ ] Write an integration test `test_atomic_write_uses_temp_rename` that verifies no partial `.devs_context.json` is visible during write — assert that after a successful write, no `.devs_context.json.tmp` (or similar temp file) remains in the directory.
- [ ] Write a unit test `test_atomic_write_failure_returns_error` that passes an invalid directory path (e.g., `/nonexistent/path/`) and verifies the function returns an `Err` result (not a panic).
- [ ] Write a unit test `test_write_failure_produces_stage_failed_error` that verifies the error type returned is suitable for the caller to transition the stage to `Failed` state — i.e., the error type or variant is clearly distinguishable as a context-write failure.

## 2. Task Implementation
- [ ] In `crates/devs-core/src/context_file.rs`, implement `pub fn write_context_file(dir: &Path, context: &ContextFile) -> Result<(), ContextFileError>`.
- [ ] Define `pub enum ContextFileError { SerializationFailed(serde_json::Error), WriteFailed { path: PathBuf, source: std::io::Error } }` with `Display` and `Error` derives.
- [ ] Implementation: (1) serialize `context` to JSON bytes via `serde_json::to_vec_pretty`, (2) generate a temp file path in the same directory (e.g., `.devs_context.json.XXXX.tmp`), (3) write bytes to temp file, (4) `std::fs::rename` temp file to `dir.join(".devs_context.json")`, (5) on any failure, attempt to clean up temp file and return error.
- [ ] The write-to-temp-then-rename pattern ensures atomicity: readers never see a partial file.
- [ ] Add `// Covers: 2_TAS-REQ-023C` annotation to all test functions.

## 3. Code Review
- [ ] Verify temp file is created in the same directory as the target (required for atomic rename on the same filesystem).
- [ ] Verify error handling cleans up temp file on failure.
- [ ] Verify the error type provides enough info for callers to log and transition stage state.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- context_file` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `write_context_file` and `ContextFileError` explaining the atomicity guarantee and the caller's responsibility to fail the stage on error.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core -- context_file` and verify exit code 0.
- [ ] Run `grep -r "Covers: 2_TAS-REQ-023C" crates/devs-core/` and verify at least one match.
