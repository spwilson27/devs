# Task: RunList Navigation Resilience (Sub-Epic: 093_Acceptance Criteria & Roadmap (Part 4))

## Covered Requirements
- [AC-KEY-004]

## Dependencies
- depends_on: [none]
- shared_components: [none]

## 1. Initial Test Written
- [ ] Create a unit test for `dispatch_key(KeyCode::Down)` (or equivalent) in the TUI event handler.
- [ ] Create an `AppState` with exactly one run in the `RunList`.
- [ ] Set `selected_run_id` to that run.
- [ ] Dispatch a `↓` key event.
- [ ] Assert that the `selected_run_id` remains unchanged.
- [ ] Assert that the application does NOT panic.
- [ ] Create another unit test with zero runs in the `RunList`.
- [ ] Dispatch a `↓` key event and assert no panic.

## 2. Task Implementation
- [ ] In `crates/devs-tui/src/state.rs` (or `event.rs`), update the navigation logic for `RunList`:
  - [ ] Before incrementing the selection index, verify that the new index is within the bounds of the current run list.
  - [ ] If the current index is the last item, ensure that `↓` does not change the selection.
  - [ ] Ensure that navigation on an empty list is handled gracefully without index out-of-bounds panics.

## 3. Code Review
- [ ] Confirm that all navigation logic (Up, Down, Home, End) is robust against empty or single-item lists.
- [ ] Verify that no `unwrap()` or direct indexing is used without bounds checking in the hot path.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui` to verify that the navigation tests pass.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to record that the RunList navigation is now resilient and verified by unit tests.

## 6. Automated Verification
- [ ] Run `./do test` to ensure all tests pass and that the `RunList` navigation logic has 100% test coverage.
