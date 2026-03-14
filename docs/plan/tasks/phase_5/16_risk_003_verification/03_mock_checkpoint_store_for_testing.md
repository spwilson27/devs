# Task: Mock CheckpointStore Implementation for StorageFull Error Simulation (Sub-Epic: 16_Risk 003 Verification)

## Covered Requirements
- [AC-RISK-003-01]

## Dependencies
- depends_on: [none]
- shared_components: [devs-checkpoint]

## 1. Initial Test Written
- [ ] Create a test fixture file at `devs-checkpoint/tests/fixtures/mock_checkpoint_store.rs`.
- [ ] Write a unit test that constructs a `MockCheckpointStore` configured to return `Err(io::Error::new(io::ErrorKind::StorageFull, "disk full"))` on the next write operation.
- [ ] Assert that the mock returns the correct error variant when `write_checkpoint()` is called.
- [ ] Write a second test that verifies the mock can be configured to succeed on the first call and fail on the second call (stateful mock).

## 2. Task Implementation
- [ ] Define a `MockCheckpointStore` struct in the test fixtures with a `fail_next_write: bool` field.
- [ ] Implement the `CheckpointStore` trait for `MockCheckpointStore` (or create a test-specific trait implementation).
- [ ] Add logic to check the `fail_next_write` flag and return `Err(io::Error::new(io::ErrorKind::StorageFull, ...))` when enabled.
- [ ] Add a method `set_fail_next_write(&mut self, fail: bool)` to configure the mock behavior.
- [ ] Ensure the mock implements `Send + Sync` for use in async test contexts.

## 3. Code Review
- [ ] Verify that the mock correctly implements the same interface as the real `CheckpointStore`.
- [ ] Ensure the mock's error type matches the production error type exactly (`io::ErrorKind::StorageFull`).
- [ ] Check that the mock is reusable across multiple test cases without state leakage.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint mock_checkpoint_store` and ensure all mock-related tests pass.

## 5. Update Documentation
- [ ] Add a comment in the mock implementation explaining its purpose for testing RISK-003 mitigations.
- [ ] Document the mock's behavior in a test README section if one exists.

## 6. Automated Verification
- [ ] Run `./do test` and verify the test is included in the traceability report.
- [ ] Confirm `target/traceability.json` shows coverage for `AC-RISK-003-01` through this mock implementation.
