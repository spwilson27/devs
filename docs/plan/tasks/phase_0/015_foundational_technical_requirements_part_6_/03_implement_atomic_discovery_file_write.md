# Task: Implement Atomic Discovery File Write (Sub-Epic: 015_Foundational Technical Requirements (Part 6))

## Covered Requirements
- [2_TAS-REQ-001J]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-grpc]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-core/src/discovery_tests.rs` (or equivalent) that:
    - Sets up a temporary directory.
    - Creates a `server.addr` file with some dummy content.
    - Spawns multiple threads to concurrently write new addresses using the atomic write function.
    - Asserts that at no point is the file in a partially-written or corrupted state.
    - Verifies that the `.tmp` file is correctly cleaned up after each write.
    - Tests the atomic write on both Linux and Windows (using conditional compilation in tests or platform-specific CI jobs).

## 2. Task Implementation
- [ ] Implement an atomic write function `devs_core::fs::atomic_write_file(path: &Path, content: &[u8])` that:
    - Constructs a temporary path by appending `.tmp` to the target filename.
    - Ensures the parent directory of the target path exists.
    - Writes the content to the temporary file.
    - Calls `fsync` or equivalent to ensure the data is flushed to disk.
    - On POSIX (Linux/macOS): uses `std::fs::rename(tmp_path, target_path)`.
    - On Windows: Uses the `MoveFileExW` function (via a crate like `winapi` or `windows-sys`) with the `MOVEFILE_REPLACE_EXISTING` flag to ensure atomicity.
- [ ] Implement the `DiscoveryManager` in `devs-grpc/src/discovery.rs` (or `devs-core`) that:
    - Uses the `atomic_write_file` function to publish the server's gRPC address.
    - Ensures the directory `~/.config/devs/` (or the one specified in `DEVS_DISCOVERY_FILE`) is created before the write.

## 3. Code Review
- [ ] Verify the Windows implementation of the atomic move. Ensure it matches the behavior of `rename(2)` on POSIX.
- [ ] Confirm that `fsync` is called on the temp file's handle before closing it and performing the rename.
- [ ] Check for proper error handling if the parent directory cannot be created or the write fails.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and ensure the atomic write tests pass on all target platforms.

## 5. Update Documentation
- [ ] Update the `devs-core` crate's documentation to include the new `fs` module and the atomicity guarantees of its functions.

## 6. Automated Verification
- [ ] Execute `tests/verify_atomic_write.py` that:
    - Uses `inotify` (on Linux) or equivalent to monitor filesystem events during the write.
    - Asserts that only `create`, `write`, `close`, and `rename` events are observed on the target path and its temporary file.
    - Verifies no partial reads are possible by reading the file in a tight loop from a separate process.
