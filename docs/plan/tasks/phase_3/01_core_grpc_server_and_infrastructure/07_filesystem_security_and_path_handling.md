# Task: Filesystem Security and Path Handling (Sub-Epic: 01_Core gRPC Server and Infrastructure)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-019], [5_SECURITY_DESIGN-REQ-020], [5_SECURITY_DESIGN-REQ-027], [5_SECURITY_DESIGN-REQ-028], [5_SECURITY_DESIGN-REQ-029], [5_SECURITY_DESIGN-REQ-031], [5_SECURITY_DESIGN-REQ-048], [5_SECURITY_DESIGN-REQ-052], [5_SECURITY_DESIGN-REQ-065], [5_SECURITY_DESIGN-REQ-066]

## Dependencies
- depends_on: ["01_core_grpc_server_and_lifecycle.md"]
- shared_components: [devs-core, devs-checkpoint]

## 1. Initial Test Written
- [ ] Create an integration test that attempts to read/write a file outside the project workspace using the Filesystem MCP and verifies it is rejected with a "path traversal" error.
- [ ] Write a test that creates the `.devs` directory and verifies it has mode `0700` on Unix.
- [ ] Test the `prompt_file` validation: verify that absolute paths or paths with `..` segments are rejected at workflow validation time.

## 2. Task Implementation
- [ ] Implement a `PathValidator` in `devs-core` that uses `std::fs::canonicalize` and `Path::starts_with` to enforce workspace boundaries.
- [ ] Apply the `PathValidator` to all file-related operations in the Filesystem MCP and stage executors.
- [ ] Ensure that checkpoint git repositories and log directories are created with mode `0700`.
- [ ] Implement `prompt_file` validation: reject any path containing `..` or leading `/` during workflow parsing.
- [ ] Set the default checkpoint branch to `devs/state` to isolate state from the main project code.
- [ ] Implement the `0600` mode for prompt files written to disk for agent adapters.

## 3. Code Review
- [ ] Verify that `canonicalize()` is used correctly before boundary checks.
- [ ] Confirm that Windows path normalization (forward/backward slashes) is handled correctly.
- [ ] Ensure that no file operations bypass the central `PathValidator`.

## 4. Run Automated Tests to Verify
- [ ] `cargo test -p devs-core -p devs-checkpoint`

## 5. Update Documentation
- [ ] Update the project's security design document with the enforced filesystem policies.

## 6. Automated Verification
- [ ] Run a specialized path-traversal fuzzer (basic) against the Filesystem MCP implementation in a test.
