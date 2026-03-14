# Task: Atomic Discovery File Write (Sub-Epic: 015_Foundational Technical Requirements (Part 6))

## Covered Requirements
- [2_TAS-REQ-001J]

## Dependencies
- depends_on: []
- shared_components: [Server Discovery Protocol (owner contribution)]

## 1. Initial Test Written
- [ ] Create `crates/devs-core/tests/discovery_file_atomic_write.rs` with a test that calls the atomic write function with a temp directory path, then reads the resulting file and asserts contents match `host:port` format.
- [ ] Write a test that verifies atomicity: assert that a `.tmp` suffixed file does NOT exist after a successful write (it was renamed away). Use a custom temp directory and list files to confirm.
- [ ] Write a test that verifies the write is atomic under concurrent reads: spawn a reader thread that continuously reads the discovery file in a tight loop, while the writer overwrites it 100 times. Assert the reader never sees a partial/empty/corrupt file (every successful read is a valid `host:port` line).
- [ ] Write a test for the error case: target directory does not exist. Assert the function returns an appropriate error rather than panicking.
- [ ] On `cfg(unix)`, write a test that verifies the rename is a single `rename(2)` call (or at minimum that the file appears atomically by checking inode consistency).

## 2. Task Implementation
- [ ] In `devs-core` (or a `discovery` submodule), implement `pub fn write_discovery_file(path: &Path, addr: &str) -> Result<()>` that: (a) writes content to `path.with_extension("tmp")` (i.e., `<path>.tmp`), (b) calls `std::fs::rename()` from the tmp file to the final path.
- [ ] On Windows (`cfg(target_os = "windows")`), use `std::fs::rename` which maps to `MoveFileExW` with `MOVEFILE_REPLACE_EXISTING` semantics on modern Rust. Add a doc comment noting this.
- [ ] Implement `pub fn delete_discovery_file(path: &Path) -> Result<()>` for server shutdown cleanup.
- [ ] Implement `pub fn read_discovery_file(path: &Path) -> Result<String>` for client-side reading, trimming whitespace.
- [ ] Ensure the `.tmp` file is written with restrictive permissions (0o600 on Unix) before rename.

## 3. Code Review
- [ ] Verify the tmp file is in the same directory as the final file (required for atomic `rename(2)` on the same filesystem).
- [ ] Verify error handling: if the write to tmp fails, the original discovery file is untouched.
- [ ] Verify no TOCTOU race: the function does not check existence before writing.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --test discovery_file_atomic_write` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments on `write_discovery_file` referencing `[2_TAS-REQ-001J]` and explaining the atomicity guarantee across platforms.

## 6. Automated Verification
- [ ] Run `./do test` and confirm all new tests pass.
- [ ] Verify `// Covers: 2_TAS-REQ-001J` annotation exists in the test file.
