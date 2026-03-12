# Task: Implement log chunk sequence numbers (Sub-Epic: 064_Detailed Domain Specifications (Part 29))

## Covered Requirements
- [2_TAS-REQ-289]

## Dependencies
- depends_on: [none]
- shared_components: [devs-proto, devs-core]

## 1. Initial Test Written
- [ ] Create a test in `devs-core` (or equivalent log management crate) that sends multiple log chunks and asserts that they are assigned sequence numbers starting from 1 and incrementing by 1 per-stage.
- [ ] Create a test for the client side (e.g., in a mock gRPC client) that receives log chunks with a gap in sequence numbers and verifies that it can detect the gap and surface a warning.

## 2. Task Implementation
- [ ] Update `devs.proto` to include a `uint64 sequence_number` field in the `LogLine` or `LogChunk` message.
- [ ] Implement the logic in the log service to track and assign these sequence numbers per-stage.
- [ ] Implement gap detection logic in the gRPC client (or a common log-processing utility) that checks each received log chunk's sequence number against the last received number for that stage.

## 3. Code Review
- [ ] Ensure the sequence number is 1-based and resets for each individual stage.
- [ ] Verify that the gap detection logic is robust and doesn't fire erroneously on initial connection or stage start.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test` in the log-related crate and ensure all sequence and gap detection tests pass.

## 5. Update Documentation
- [ ] Update the `LogService` documentation in `devs.proto` to reflect the new `sequence_number` field and its behavior.

## 6. Automated Verification
- [ ] Run `./do test` to ensure that existing log streaming functionality remains compatible with the new sequence number field.
