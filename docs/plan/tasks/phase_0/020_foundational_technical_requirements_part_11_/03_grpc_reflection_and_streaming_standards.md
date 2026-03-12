# Task: gRPC Reflection and Streaming Standards (Sub-Epic: 020_Foundational Technical Requirements (Part 11))

## Covered Requirements
- [2_TAS-REQ-002T], [2_TAS-REQ-002U]

## Dependencies
- depends_on: [none]
- shared_components: [devs-proto]

## 1. Initial Test Written
- [ ] Create a unit test `devs-proto/tests/test_grpc_server_standards.rs` (or similar) that:
    - Sets up a mock gRPC server using `tonic::Server` and registers the reflection service using `tonic_reflection`.
    - Verifies that `grpcurl` or a programmatic reflection client can discover the services and methods in the server [2_TAS-REQ-002U].
- [ ] Create a test for streaming cancellation [2_TAS-REQ-002T]:
    - Set up a mock streaming RPC.
    - Start a client that consumes the stream.
    - Cancel the client's context/receiver.
    - Verify (using a timeout or signal) that the server's streaming handler exits and releases its resources within 500ms.

## 2. Task Implementation
- [ ] Implement a `devs_server_builder()` utility function in `devs-proto` (or a helper crate) that:
    - Configures a `tonic::Server` with standard settings.
    - Automatically registers `tonic_reflection` with all the project's `.proto` files [2_TAS-REQ-002U].
- [ ] Implement a standard streaming helper (e.g., a trait or wrapper) that wraps streaming handlers and ensures they monitor `tokio::select!` on the request's context cancellation [2_TAS-REQ-002T].
- [ ] Add explicit resource release logic (e.g., dropping file handles, closing DB connections) to streaming handlers to ensure the 500ms constraint is met.

## 3. Code Review
- [ ] Ensure `tonic-reflection` is configured with the correct descriptor sets.
- [ ] Verify that streaming cancellation logic is non-blocking and doesn't hold references to large objects after cancellation.
- [ ] Check that reflection is correctly disabled (or can be toggled) for different environments if necessary (though mandated for MVP server).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-proto`.
- [ ] Use `grpcurl` against a running mock server to confirm reflection works.

## 5. Update Documentation
- [ ] Update documentation to describe how to implement a streaming RPC correctly in the project, emphasizing context cancellation.
- [ ] Document how to enable/configure reflection when starting the server.

## 6. Automated Verification
- [ ] Run the streaming cancellation test multiple times to ensure the 500ms deadline is consistently met without flakes.
