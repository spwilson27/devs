# Task: Discovery File Write Protocol (Sub-Epic: 053_Detailed Domain Specifications (Part 18))

## Covered Requirements
- [2_TAS-REQ-140]

## Dependencies
- depends_on: [none]
- shared_components: [devs-grpc, devs-server]

## 1. Initial Test Written
- [ ] Create a unit test in `crates/devs-grpc/src/discovery.rs` for the discovery file write protocol.
- [ ] The test should use a temporary directory for the discovery file path.
- [ ] Test Cases:
    - Atomicity: Check that while the file is being written, only a `.tmp` file exists (or it's written and renamed so fast it's atomic).
    - Content: Verify that the content is a single line matching `<host>:<port>`.
    - Overwriting: Verify that it correctly overwrites an existing (stale) discovery file.
    - Cleanup: Verify that the file is deleted upon a "mock" SIGTERM event.

## 2. Task Implementation
- [ ] Implement `write_discovery_file(path: &Path, addr: SocketAddr) -> Result<(), IoError>` in `crates/devs-grpc/src/discovery.rs`.
- [ ] Logic MUST follow [2_TAS-REQ-140]:
    1. Serialize server address to plain string.
    2. Write string to `<path>.tmp`.
    3. Atomic rename `<path>.tmp` to `<path>`.
- [ ] Ensure the file is written ONLY after gRPC and MCP ports are bound.
- [ ] Implement a `delete_discovery_file(path: &Path) -> Result<(), IoError>` function.
- [ ] Integration: Ensure `devs-server` calls these functions correctly during startup and shutdown.

## 3. Code Review
- [ ] Verify that the rename is atomic (POSIX `rename` or Windows `MoveFileEx`).
- [ ] Ensure that no discovery file is left behind after a graceful shutdown.
- [ ] Verify that the discovery file directory is created if missing.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-grpc --lib discovery` and ensure all discovery protocol tests pass.

## 5. Update Documentation
- [ ] Document the discovery file format and write protocol in the `devs-grpc` crate.

## 6. Automated Verification
- [ ] Run `./do lint` and ensure no documentation or formatting violations are present.
