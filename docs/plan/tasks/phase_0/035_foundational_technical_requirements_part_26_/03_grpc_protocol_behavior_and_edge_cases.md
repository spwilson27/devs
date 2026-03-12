# Task: gRPC Protocol Behavior and Edge Cases (Sub-Epic: 035_Foundational Technical Requirements (Part 26))

## Covered Requirements
- [2_TAS-REQ-086M], [2_TAS-REQ-086N]

## Dependencies
- depends_on: [none]
- shared_components: [devs-proto, devs-core]

## 1. Initial Test Written
- [ ] Create unit tests in `devs-proto` (or a dedicated integration test) to verify that the gRPC error types and validation logic are correctly defined:
    - Test that `devs_proto::validate_request_size(data)` returns an error for data exceeding the maximum request size.
    - Test that malformed JSON input detection logic correctly identifies and rejects invalid JSON.
    - Test that unknown proto field handling follows the project policy (e.g., ignore or reject).
- [ ] Define the behavior of streaming gRPC calls via a trait or mock implementation:
    - Test that `StreamRunEvents` logic (mocked) provides an initial snapshot followed by event flow.
    - Test that `StreamLogs` follow/non-follow mode logic correctly distinguishes between reading existing logs and waiting for new ones.

## 2. Task Implementation
- [ ] In `devs-proto`, define the contracts and behavior for the required streaming methods in `devs.proto` using detailed comments:
    - `StreamRunEvents`: Specify snapshot + event flow + backpressure behavior.
    - `StreamLogs`: Specify follow vs. non-follow modes.
    - `WatchPoolState`: Specify real-time pool utilization updates.
- [ ] Implement foundational validation logic in `devs-proto` and `devs-core` for protocol-level edge cases:
    - Define a `ProtocolError` enum in `devs-core` for over-sized requests, unknown proto fields, malformed JSON, etc.
    - Implement a `validate_request` helper function in `devs-proto` that can be shared by the server.
- [ ] Add explicit documentation for how the server handles concurrent submissions and stream interruptions in `devs-proto/docs/protocol.md` (or equivalent).

## 3. Code Review
- [ ] Verify that the gRPC streaming contracts are clearly defined and implement the required behaviors (snapshot, follow mode, etc.).
- [ ] Ensure that the error handling logic for protocol-level edge cases is robust and consistent.
- [ ] Check that all protocol-level constraints (like request size limits) are implemented in a centralized and configurable manner.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-proto` to verify validation logic and error types.
- [ ] Run `cargo test -p devs-core` to verify protocol-related domain types and errors.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/2_tas.md` or a dedicated protocol specification file to include the finalized behavior and edge-case handling rules.
- [ ] Ensure that all proto methods have detailed doc comments explaining their streaming behavior.

## 6. Automated Verification
- [ ] Run `./do lint` to verify that all proto comments and code documentation are up to date.
- [ ] Run `./do coverage` to ensure that the new validation and error handling logic is fully covered by tests.
