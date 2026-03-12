# Task: Verify Checkpoint Corruption Recovery (Sub-Epic: 17_Risk 003 Verification)

## Covered Requirements
- [AC-RISK-003-03], [AC-RISK-003-04]

## Dependencies
- depends_on: [none]
- shared_components: [devs-checkpoint]

## 1. Initial Test Written
- [ ] Create an integration test `crates/devs-checkpoint/tests/corruption_recovery_tests.rs`.
- [ ] Test 1 (`test_orphaned_tmp_cleanup`): Manually create a `checkpoint.json.tmp` file in a run directory. Call `CheckpointStore::load_all_runs()`. Verify the `.tmp` file is deleted and a `WARN` log is emitted with `event_type: "checkpoint.orphan_cleanup"`.
- [ ] Test 2 (`test_mid_write_crash_recovery`): Create multiple valid runs. For one run, simulate a mid-write crash by creating a `checkpoint.json.tmp` but NO `checkpoint.json` (or an old one). Verify that after `load_all_runs()`, the old `checkpoint.json` is still valid and the run recovers, OR if no `checkpoint.json` exists, it is marked `Unrecoverable` but doesn't block other runs.

## 2. Task Implementation
- [ ] Ensure `devs_checkpoint::CheckpointStore::load_all_runs` implementation scans for `*.tmp` files before loading.
- [ ] Implement the orphan cleanup logic in `crates/devs-checkpoint/src/store.rs`.
- [ ] Ensure `load_all_runs` handles `io::Error` or parsing errors by marking the specific run as `Unrecoverable` (a variant in `RunStatus` or a separate state) instead of returning a global `Err`.
- [ ] Verify that `fsync` and `rename` are used in the write sequence as per `[RISK-003-BR-001]` (though that's owner of Phase 1, we verify it here).

## 3. Code Review
- [ ] Verify that `load_all_runs` uses `tokio::fs` for non-blocking I/O.
- [ ] Confirm that `WARN` logs use structured fields compatible with the `devs` logging standard.
- [ ] Check that `Unrecoverable` runs are reported but do not prevent the server from binding its ports and serving other projects.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint --test corruption_recovery_tests`.

## 5. Update Documentation
- [ ] Update `docs/plan/tasks/phase_5/17_risk_003_verification/01_verify_checkpoint_corruption_recovery.md` with "Completed" status if applicable (local memory).

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows `AC-RISK-003-03` and `AC-RISK-003-04` as covered.
