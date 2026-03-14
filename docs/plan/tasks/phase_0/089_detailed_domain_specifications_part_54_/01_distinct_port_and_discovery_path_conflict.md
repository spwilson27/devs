# Task: Distinct Port and Discovery Path Conflict Handling (Sub-Epic: 089_Detailed Domain Specifications (Part 54))

## Covered Requirements
- [2_TAS-REQ-602]

## Dependencies
- depends_on: []
- shared_components: ["Server Discovery Protocol", "devs-core"]

## 1. Initial Test Written
- [ ] Create an integration test in `devs-core` (or the crate owning discovery file logic) named `test_concurrent_discovery_file_last_writer_wins` that:
  1. Creates a temporary directory for an isolated discovery file path.
  2. Spawns two async tasks that each call the atomic discovery-file write function (`write_discovery_file`) concurrently with different `host:port` values (e.g., `127.0.0.1:9001` and `127.0.0.1:9002`).
  3. After both complete, reads the discovery file and asserts exactly one of the two values is present (last-writer-wins semantics via atomic temp-file + rename).
- [ ] Create a test `test_stale_discovery_file_client_exit_code_3` that:
  1. Writes a discovery file pointing to a port where no server is listening.
  2. Invokes the client connection logic (or a helper that reads the discovery file and attempts a gRPC health check).
  3. Asserts the function returns an error that maps to exit code 3 (unreachable server).
- [ ] Create a test `test_distinct_discovery_paths_no_conflict` that:
  1. Creates two separate temporary discovery file paths.
  2. Writes different `host:port` values to each.
  3. Reads each back and asserts they contain the correct, independent values — no cross-contamination.

## 2. Task Implementation
- [ ] In the discovery file module, ensure `write_discovery_file(path, addr)` uses atomic temp-file + rename so concurrent writers produce a valid file (last writer wins, no partial writes).
- [ ] In the client connection module, implement logic that reads the discovery file, attempts a gRPC connection, and if the server is unreachable returns an error type that the CLI maps to exit code 3.
- [ ] Add documentation comments on `write_discovery_file` explaining the concurrent-instance scenario and the user's responsibility to configure distinct ports or discovery paths.

## 3. Code Review
- [ ] Verify atomic write uses `tempfile` in the same directory as the target, then `std::fs::rename` — not a two-step write+move across filesystems.
- [ ] Verify the exit-code-3 path is a distinct error variant, not a generic connection error.
- [ ] Verify no `unwrap()` or `expect()` on I/O operations in the production path.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --lib -- test_concurrent_discovery_file_last_writer_wins test_stale_discovery_file_client_exit_code_3 test_distinct_discovery_paths_no_conflict` and confirm all pass.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-602` annotation to each test function.

## 6. Automated Verification
- [ ] Run `./do test` and confirm the three new tests appear in output and pass.
- [ ] Run `grep -r "2_TAS-REQ-602" --include="*.rs"` and confirm at least one annotation exists.
