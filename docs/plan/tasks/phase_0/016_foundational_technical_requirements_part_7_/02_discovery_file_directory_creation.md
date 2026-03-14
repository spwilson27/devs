# Task: Discovery File Directory Creation (Sub-Epic: 016_Foundational Technical Requirements (Part 7))

## Covered Requirements
- [2_TAS-REQ-001N]

## Dependencies
- depends_on: []
- shared_components: [Server Discovery Protocol (consumer — implements directory creation portion)]

## 1. Initial Test Written
- [ ] In `crates/devs-core/tests/discovery.rs` (or the module implementing the discovery file writer), write a test `test_discovery_dir_created_if_missing` that:
  - Sets `DEVS_DISCOVERY_FILE` to `<tempdir>/nonexistent/subdir/server.addr`.
  - Calls the discovery file write function.
  - Asserts the file was written successfully.
  - Asserts `<tempdir>/nonexistent/subdir/` exists as a directory.
- [ ] Write a test `test_discovery_dir_already_exists` that:
  - Sets `DEVS_DISCOVERY_FILE` to `<tempdir>/existing_dir/server.addr` where `existing_dir` already exists.
  - Calls the discovery file write function.
  - Asserts success (no error from directory already existing).
- [ ] Write a test `test_discovery_dir_creation_failure_is_fatal` that:
  - Sets `DEVS_DISCOVERY_FILE` to an unwritable path (e.g., `/proc/fake/server.addr` on Linux or a read-only temp dir).
  - Calls the discovery file write function.
  - Asserts it returns a fatal error (not silently ignored).
  - Asserts the error message indicates directory creation failure.

## 2. Task Implementation
- [ ] In the discovery file writer function (e.g., `write_discovery_file(addr: &str) -> Result<()>`), before writing the file:
  1. Resolve the discovery file path (from `DEVS_DISCOVERY_FILE` env var or default `~/.config/devs/server.addr`).
  2. Extract the parent directory from the path.
  3. Call `std::fs::create_dir_all(parent)` to create the directory and all missing parents.
  4. If `create_dir_all` fails, return a fatal error (this maps to startup step 9 failure per the spec).
  5. Proceed with the existing atomic write (temp file + rename) logic.
- [ ] Ensure this runs as part of the server startup sequence at step 9 (discovery file write).

## 3. Code Review
- [ ] Verify `create_dir_all` is used (not `create_dir`) so all intermediate directories are created.
- [ ] Verify that directory creation failure propagates as a fatal error, not a warning.
- [ ] Verify the function correctly extracts the parent directory even for deeply nested custom paths.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- discovery` and confirm all three tests pass.

## 5. Update Documentation
- [ ] Add a doc comment to the discovery file write function noting that it creates parent directories per [2_TAS-REQ-001N].

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core -- discovery --nocapture 2>&1 | grep -c "test result: ok"` and confirm output is `1`.
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and confirm zero warnings.
