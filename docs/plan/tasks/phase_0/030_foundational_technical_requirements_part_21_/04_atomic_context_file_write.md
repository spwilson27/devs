# Task: Atomic Context File Write Utility (Sub-Epic: 030_Foundational Technical Requirements (Part 21))

## Covered Requirements
- [2_TAS-REQ-023C]

## Dependencies
- depends_on: [03_agent_context_serialization_truncation.md]
- shared_components: [devs-executor]

## 1. Initial Test Written
- [ ] Create an integration test in `devs-executor/src/fs_utils.rs` (or similar relevant module) that attempts to write a context file using the atomic utility.
- [ ] Verify that:
    - The final file exists at the target path.
    - The file contains the expected JSON.
    - A partial write (e.g., interrupted or failed) does not leave a half-written file at the target path.

## 2. Task Implementation
- [ ] Implement an atomic write function `write_context_atomic(target_path: &Path, content: &[u8]) -> Result<()>` in `devs-executor`.
- [ ] Steps:
    1. Define the temporary path as `target_path.with_extension("tmp")`.
    2. Write the content to the temporary path using `std::fs::write`.
    3. Ensure the file is synced to disk (fsync).
    4. Call `std::fs::rename(temp_path, target_path)`. On POSIX, this is atomic. On Windows, use a platform-specific rename if `std::fs::rename` is not sufficient for atomicity (but generally `std::fs::rename` is the standard approach).
    5. Ensure the `devs-executor` crate is initialized with necessary I/O support.
- [ ] Ensure that a failure to write or rename causes the stage to be marked as `Failed` in the caller (this task only implements the write utility).

## 3. Code Review
- [ ] Verify that errors from each step are handled and propagated correctly.
- [ ] Ensure that temporary files are cleaned up in case of failure.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-executor` to ensure the atomic write utility works as expected.

## 5. Update Documentation
- [ ] Provide doc comments explaining the atomicity guarantees and usage of the utility.

## 6. Automated Verification
- [ ] Run `./do test` and verify that [2_TAS-REQ-023C] is mapped correctly in `traceability.json`.
