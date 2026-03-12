# Task: Streaming Infrastructure (Logs and Events) (Sub-Epic: 01_Core gRPC Server and Infrastructure)

## Covered Requirements
- [2_TAS-REQ-054], [2_TAS-REQ-072], [5_SECURITY_DESIGN-REQ-071], [5_SECURITY_DESIGN-REQ-072]

## Dependencies
- depends_on: [02_protocol_hardening_and_discovery.md]
- shared_components: [devs-grpc, devs-proto]

## 1. Initial Test Written
- [ ] Create an integration test in `crates/devs-server/tests/streaming.rs` that starts a `StreamRunEvents` gRPC stream and verifies the first message is the current authoritative state (snapshot).
- [ ] Implement a test for the `stream_logs` HTTP chunked protocol: connect to the server's log stream and verify it receives chunks of log lines as they are "emitted".
- [ ] Test the 1MiB request body limit for MCP tool calls (which will be implemented later but the infrastructure for size limiting should be tested now).

## 2. Task Implementation
- [ ] Implement `StreamRunEvents` gRPC service with the "snapshot-then-delta" pattern: the first message contains the full current state of the run.
- [ ] Set up the infrastructure for `stream_logs` using HTTP chunked transfer encoding (via `tower` or `axum/hyper` integrated with `tonic`).
- [ ] Implement the `1MiB` request limit for the HTTP/MCP interface.
- [ ] Add the gRPC per-client event buffer (cap at 256 messages) with oldest-drop policy.

## 3. Code Review
- [ ] Confirm that the first message behavior of `StreamRunEvents` is strictly implemented.
- [ ] Verify that chunked logs use standard JSON-RPC 2.0 frames if applicable or the agreed-upon chunk format.
- [ ] Ensure that the event buffer drop policy does not block the scheduler.

## 4. Run Automated Tests to Verify
- [ ] `cargo test -p devs-server`

## 5. Update Documentation
- [ ] Document the streaming log protocol and event stream behavior in `devs-proto` README or equivalent.

## 6. Automated Verification
- [ ] Verify that a slow gRPC client does not impact the server's internal state machine or other clients.
