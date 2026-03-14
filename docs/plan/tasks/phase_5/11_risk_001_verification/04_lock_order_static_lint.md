# Task: Implement Lock Acquisition Order Static Analysis (Sub-Epic: 11_Risk 001 Verification)

## Covered Requirements
- [RISK-001], [AC-RISK-001-06]

## Dependencies
- depends_on: ["03_scheduler_stress_testing.md"]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a "poisoned" source file in a temporary test directory that deliberately acquires locks in the wrong order: `PoolState` before `SchedulerState`.
- [ ] Develop a shell or python script that scans the "poisoned" file and correctly identifies the violation.
- [ ] Add this script to `./do lint` and ensure it exits with a non-zero status when a violation is found.

## 2. Task Implementation
- [ ] Define the canonical lock acquisition order for the `devs` platform (e.g., `SchedulerState` -> `PoolState` -> `ProjectState`).
- [ ] Implement a regex-based or tree-sitter-based scanner (as part of `./do lint`) that detects nested lock acquisitions.
- [ ] The scanner must identify blocks where `PoolState.lock()` (or equivalent `Arc<Mutex>` access) is called while a `SchedulerState` lock is already held in the same scope.
- [ ] Integrate this check into the main CI pipeline to prevent new lock order violations from being merged.

## 3. Code Review
- [ ] Verify that the scanner is robust enough to handle common Rust coding patterns (e.g., `let _guard = lock.lock().await;`).
- [ ] Ensure the scanner does not produce excessive false positives on unrelated lock types.
- [ ] Check that the error message clearly points to the file and line number where the violation occurred.

## 4. Run Automated Tests to Verify
- [ ] `./do lint` (with the new check enabled)
- [ ] Manually verify that the lint fails on the "poisoned" test file.

## 5. Update Documentation
- [ ] Document the canonical lock acquisition order in `.agent/MEMORY.md` and explain how to resolve violations reported by the lint.

## 6. Automated Verification
- [ ] Run `./do lint` on the entire codebase and verify it reports 0 violations after any necessary refactoring is completed.
