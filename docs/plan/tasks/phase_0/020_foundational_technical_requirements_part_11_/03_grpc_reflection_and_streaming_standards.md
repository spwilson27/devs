# Task: gRPC Reflection and Streaming Cancellation Standards (Sub-Epic: 020_Foundational Technical Requirements (Part 11))

## Covered Requirements
- [2_TAS-REQ-002T], [2_TAS-REQ-002U]

## Dependencies
- depends_on: [02_grpc_standard_unary_responses_and_error_mapping.md]
- shared_components: [devs-proto (consumer — descriptor sets for reflection)]

## 1. Initial Test Written
- [ ] Create `crates/devs-grpc/tests/reflection_test.rs` (integration test) that:
    - Starts a `tonic::Server` on a random port with `tonic_reflection::server::Builder` configured with the project's file descriptor set.
    - Uses `tonic_reflection::pb::server_reflection_client::ServerReflectionClient` to connect and issue a `ListServices` request.
    - Asserts that all expected `devs.v1.*` services appear in the response (at minimum `devs.v1.ServerService`).
    - Issues a `FileContainingSymbol` request for a known service method and asserts the returned file descriptor is valid.
    - This confirms [2_TAS-REQ-002U]: tools like `grpcurl` can discover the full schema without local `.proto` files.
- [ ] Create `crates/devs-grpc/tests/streaming_cancellation_test.rs` (integration test) that:
    - Implements a test streaming RPC handler that sends messages in an infinite loop with 50ms intervals, using `tokio::select!` to monitor for client disconnection.
    - The handler increments an `Arc<AtomicU64>` counter each iteration and sets an `Arc<AtomicBool>` flag when it detects cancellation and exits.
    - Starts the server, connects a client, reads 3-5 messages, then drops the client stream (simulating cancellation).
    - Asserts the server handler's cancellation flag is set within 500ms of the client drop (use `tokio::time::timeout(Duration::from_millis(500), ...)` or poll the flag).
    - Asserts the counter stops incrementing after cancellation (no resource leak / runaway task).
    - This confirms [2_TAS-REQ-002T]: streaming RPCs respect cancellation within 500ms.
- [ ] Create a test that verifies the streaming cancellation helper/wrapper (to be implemented) correctly propagates `tonic::Code::Cancelled` status when the client disconnects.

## 2. Task Implementation
- [ ] Add `tonic-reflection` as a dependency in the appropriate crate (`devs-grpc` or `devs-server`). Configure the `build.rs` to output the file descriptor set (e.g., via `tonic_build::configure().file_descriptor_set_path(...)`) so it can be loaded at runtime.
- [ ] Implement a `build_reflection_service()` function that:
    - Loads the compiled file descriptor set bytes via `include_bytes!`.
    - Constructs a `tonic_reflection::server::Builder` and adds the descriptor set.
    - Returns the configured reflection service ready to be added to `tonic::Server::builder().add_service(...)`.
- [ ] Implement a `CancellableStream<T>` wrapper (or a helper function `cancellable_stream`) that:
    - Takes a `tokio::sync::mpsc::Receiver<T>` (or similar stream source) and the request's `tonic::Request<tonic::Streaming<...>>` context.
    - Uses `tokio::select!` internally to monitor both the stream source and client disconnection.
    - When the client disconnects (the send side returns an error or the request context is cancelled), the wrapper:
        1. Drops all held resources (receivers, file handles, etc.).
        2. Logs the cancellation event.
        3. Returns `Err(tonic::Status::cancelled("client disconnected"))`.
    - Guarantees cleanup completes within 500ms by not performing any blocking I/O in the cancellation path.
- [ ] Wire the reflection service into the server builder so that every `tonic::Server` instance in the application includes reflection by default.
- [ ] Document the pattern for implementing streaming RPCs: all streaming handlers MUST use the `CancellableStream` wrapper or directly implement `tokio::select!` with the client context to comply with the 500ms cancellation requirement.

## 3. Code Review
- [ ] Verify `tonic-reflection` is configured with the complete file descriptor set — all `.proto` files in the project are included, not just a subset.
- [ ] Verify the `CancellableStream` wrapper does not hold any `Clone`-able references that could prevent resource cleanup after cancellation.
- [ ] Confirm no streaming handler uses a plain `while let Some(msg) = rx.recv().await` loop without cancellation monitoring — all must use `tokio::select!` or the wrapper.
- [ ] Verify the 500ms budget is realistic: the cancellation path contains no blocking calls (`spawn_blocking`, file I/O, network calls).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-grpc -- reflection` to run the reflection integration test.
- [ ] Run `cargo test -p devs-grpc -- streaming_cancellation` to run the cancellation test.
- [ ] Run `./do test` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `build_reflection_service()` explaining how to extend it when new `.proto` files are added.
- [ ] Add doc comments to `CancellableStream` explaining the 500ms cancellation contract and showing a usage example.
- [ ] Document in the developer guide that all streaming RPCs must use the cancellation wrapper per [2_TAS-REQ-002T].

## 6. Automated Verification
- [ ] Run the streaming cancellation test 10 times in a loop (`for i in $(seq 1 10); do cargo test -p devs-grpc -- streaming_cancellation || exit 1; done`) to verify it is not flaky and the 500ms deadline is consistently met.
- [ ] Start a test server and run `grpcurl -plaintext localhost:<port> list` to confirm reflection returns the expected service list.
