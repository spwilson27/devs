# Task: Cancel Run Atomic Checkpoint Verification (Sub-Epic: 10_Phase 2 Acceptance Verification)

## Covered Requirements
- [AC-ROAD-P2-002]

## Dependencies
- depends_on: []
- shared_components: [devs-scheduler (consumer), devs-checkpoint (consumer)]

## 1. Initial Test Written
- [ ] Create `crates/devs-scheduler/tests/ac_p2_002_cancel_run_atomic.rs` with a `#[tokio::test]` that sets up a workflow run with 4 stages: `A` (Completed), `B` (Running), `C` (Waiting), `D` (Eligible). This gives a mix of terminal and non-terminal states.
- [ ] Use a test `CheckpointStore` implementation (or the real git-backed one with a temp repo created via `git2::Repository::init`) that allows counting the number of commits created.
- [ ] Call `cancel_run(run_id)` on the scheduler.
- [ ] Assert that stage `A` remains `Completed` (terminal — not modified).
- [ ] Assert that stages `B`, `C`, and `D` are ALL transitioned to `Cancelled`.
- [ ] Count the number of new git commits in the checkpoint branch after the `cancel_run` call. Assert exactly ONE new commit was created, proving the cancellation was atomic.
- [ ] Add `// Covers: AC-ROAD-P2-002` annotation.

## 2. Task Implementation
- [ ] Ensure `cancel_run` in the scheduler collects all non-terminal `StageRun` records, transitions them to `Cancelled` in-memory, then calls `CheckpointStore::save_checkpoint` exactly once with the fully-updated `WorkflowRun`.
- [ ] Ensure the `WorkflowRun` state itself transitions to `Failed` (or `Cancelled` if that variant exists) in the same checkpoint write.
- [ ] Verify that no intermediate checkpoint writes occur during the cancellation loop (i.e., stages are NOT individually checkpointed).

## 3. Code Review
- [ ] Verify that the cancellation logic does not hold the scheduler's `RwLock` across the git write (which would block other operations). The pattern should be: acquire write lock → mutate in-memory → release lock → write checkpoint.
- [ ] Confirm no partial state is observable between individual stage cancellations.

## 4. Run Automated Tests to Verify
- [ ] Execute `cargo test -p devs-scheduler --test ac_p2_002_cancel_run_atomic -- --nocapture`

## 5. Update Documentation
- [ ] Add `// Covers: AC-ROAD-P2-002` to the test if not already present.

## 6. Automated Verification
- [ ] Run `./do test` and confirm `target/traceability.json` includes `AC-ROAD-P2-002`.
- [ ] Run `grep -r 'AC-ROAD-P2-002' crates/` and confirm annotation exists.
