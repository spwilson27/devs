# Task: Implement Lock Acquisition Order Static Analysis (Sub-Epic: 13_Risk 001 Verification)

## Covered Requirements
- [AC-RISK-001-06]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a "poisoned" Rust source file in `tests/fixtures/lock_violation.rs` that deliberately acquires locks in the wrong order: `PoolState` before `SchedulerState` (e.g., nesting `.lock().await` calls).
- [ ] Create a Python test `tests/test_lock_lint.py` that invokes the proposed lint script on this fixture.
- [ ] Verify that the Python test fails to identify the violation initially.

## 2. Task Implementation
- [ ] Develop a Python script `.tools/check_lock_order.py` that uses regular expressions or `tree-sitter` (if available) to detect nested lock acquisitions.
- [ ] Define the canonical order in the script: `SchedulerState` -> `PoolState` -> `ProjectState`.
- [ ] The script must identify blocks where `pool_state.lock().await` is called within the scope of a `scheduler_state.lock().await` guard.
- [ ] Integrate `.tools/check_lock_order.py` into the `cmd_lint` function of the `./do` script.
- [ ] Ensure that `cmd_lint` returns a non-zero exit code if any violations are found.

## 3. Code Review
- [ ] Verify that the lint script identifies the file and exact line number of the violation.
- [ ] Check for common false positive scenarios (e.g., unrelated lock types named similarly) and refine patterns to minimize noise.
- [ ] Ensure the script's execution is performant and does not significantly slow down the overall linting process.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` and ensure it fails on the "poisoned" fixture.
- [ ] Remove the fixture and confirm `./do lint` passes on the existing codebase.

## 5. Update Documentation
- [ ] Document the required lock acquisition order in `docs/plan/requirements/8_risks_mitigation.md` for `RISK-001`.
- [ ] Add a comment to the `./do` script explaining the purpose of the lock order check.

## 6. Automated Verification
- [ ] Run `pytest tests/test_lock_lint.py` to confirm the lint logic correctly identifies violations in the test fixture.
- [ ] Run `grep -r "lock().await" crates/` to manually confirm current code is compliant with the enforced order.
