# Task: Checkpoint Resilience and Isolation (Sub-Epic: 061_Detailed Domain Specifications (Part 26))

## Covered Requirements
- [2_TAS-REQ-270], [2_TAS-REQ-271]

## Dependencies
- depends_on: [none]
- shared_components: [devs-checkpoint, devs-server]

## 1. Initial Test Written
- [ ] In `devs-checkpoint/tests/resilience.rs` (or equivalent), write an integration test that populates a `.devs/runs/` directory with one corrupt (unparseable) `checkpoint.json` and one valid `checkpoint.json`. Verify that the checkpoint store loader returns the valid run and skips/logs the corrupt one.
- [ ] In `devs-checkpoint/src/lib.rs`, write a unit test for `store.persist()` that simulates a file system write error (e.g., using a mock or a read-only directory). Verify that it returns an `Error` but that the server (represented by the test harness) can continue its operation without crashing.

## 2. Task Implementation
- [ ] In `devs-checkpoint`, update the logic for loading runs to use a `Result` that is handled at the collection level. If a single checkpoint file fails to parse, log an `ERROR` but continue loading other checkpoints.
- [ ] In the server startup logic (specifically the checkpoint restoration phase), ensure that errors from individual checkpoint loads are logged but do not prevent the server from binding ports and accepting connections.
- [ ] In `devs-checkpoint`, ensure that write failures (e.g., in `CheckpointStore::persist`) are handled gracefully. The error must be propagated to the caller (e.g., the scheduler) which should log it but MUST NOT crash, terminate the run, or revert the in-memory state change that triggered the persist attempt.
- [ ] Ensure all public items are documented with doc comments.

## 3. Code Review
- [ ] Verify that a single corrupt file cannot take down the entire server during startup.
- [ ] Verify that checkpoint write failures are logged at an appropriate level (`ERROR`) but do not lead to process termination or run cancellation.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint` and ensure the tests pass.

## 5. Update Documentation
- [ ] Document the resilience behavior of the checkpoint store in `devs-checkpoint`'s `README.md` or doc comments.

## 6. Automated Verification
- [ ] Run `./do test` and verify that the tests are correctly annotated with `// Covers: 2_TAS-REQ-270` and `// Covers: 2_TAS-REQ-271`.
