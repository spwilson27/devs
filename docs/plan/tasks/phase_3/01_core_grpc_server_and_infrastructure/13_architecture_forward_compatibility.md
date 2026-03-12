# Task: Architecture Forward Compatibility (Sub-Epic: 01_Core gRPC Server and Infrastructure)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-022], [5_SECURITY_DESIGN-REQ-026], [5_SECURITY_DESIGN-REQ-073]

## Dependencies
- depends_on: [01_core_grpc_server_and_lifecycle.md]
- shared_components: [devs-grpc, devs-executor]

## 1. Initial Test Written
- [ ] Create a placeholder gRPC interceptor that logs "Auth interceptor placeholder" and verify it is called for every RPC.
- [ ] Write a test for environment variable inheritance: verify the order is server -> workflow -> stage.
- [ ] Test the context file size limit: verify that `.devs_context.json` is truncated if it exceeds 10 MiB.

## 2. Task Implementation
- [ ] Ensure that all gRPC service handlers use `tonic::Request` and `tonic::Response` to remain compatible with future middleware.
- [ ] Implement the environment variable inheritance chain in `devs-executor`.
- [ ] Implement the 10 MiB cap for the context file, truncating stage outputs proportionally if exceeded.
- [ ] Design the MCP tool handlers to be composable as `tower` services for future authentication integration.

## 3. Code Review
- [ ] Confirm that no "just-in-case" auth logic is implemented at MVP, only the infrastructure hooks.
- [ ] Verify that environment inheritance is correctly implemented (later overrides earlier).
- [ ] Ensure that truncation logic for the context file is robust.

## 4. Run Automated Tests to Verify
- [ ] `cargo test -p devs-server -p devs-executor`

## 5. Update Documentation
- [ ] Document the environment variable inheritance rules and context size limits.

## 6. Automated Verification
- [ ] Verify that a workflow with extremely large outputs across many stages still produces a context file within the 10 MiB limit.
