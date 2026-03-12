# Task: Stage Status Labels Implementation (Sub-Epic: 097_Acceptance Criteria & Roadmap (Part 8))

## Covered Requirements
- [AC-TYP-001], [AC-TYP-002]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create a unit test in `crates/devs-tui/src/render_utils.rs` (or `crates/devs-tui/tests/`) that asserts `stage_status_label(StageStatus::Running)` returns exactly `"RUN "`.
- [ ] Add a unit test that iterates through all `StageStatus` variants and asserts that `stage_status_label(variant).len() == 4`.
- [ ] Ensure the tests use the `// Covers: AC-TYP-001` and `// Covers: AC-TYP-002` annotations.

## 2. Task Implementation
- [ ] Implement `stage_status_label(status: StageStatus) -> &'static str` in `crates/devs-tui/src/render_utils.rs`.
- [ ] Use an exhaustive `match` on `StageStatus`.
- [ ] Map variants to their 4-character uppercase ASCII labels:
    - `Pending` -> `"PEND"`
    - `Waiting` -> `"WAIT"`
    - `Eligible` -> `"ELIG"`
    - `Running` -> `"RUN "` (trailing space)
    - `Paused` -> `"PAUS"`
    - `Completed` -> `"DONE"`
    - `Failed` -> `"FAIL"`
    - `TimedOut` -> `"TIME"`
    - `Cancelled` -> `"CANC"`
- [ ] Add a compile-time `const` assertion block using `const _: () = { ... };` to verify that each label is exactly 4 bytes long.

## 3. Code Review
- [ ] Verify that no inline string literals for status labels are used outside of `render_utils.rs` (except in `strings.rs` if they are defined there as constants).
- [ ] Ensure the `match` is exhaustive and no `_ => ...` catch-all is used.
- [ ] Confirm that `RUN ` has a trailing space and is exactly 4 bytes.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui` and ensure the new unit tests pass.

## 5. Update Documentation
- [ ] Update `GEMINI.md` or the sub-epic's status to reflect the implementation of stage status labels.

## 6. Automated Verification
- [ ] Run `./do lint` to ensure the new code satisfies formatting and clippy requirements.
- [ ] Verify that the compile-time assertions are functional by temporarily changing a label's length and confirming the build fails.
