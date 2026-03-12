# Task: TUI Dashboard Snapshot Verification (Sub-Epic: 101_Acceptance Criteria & Roadmap (Part 12))

## Covered Requirements
- [AC-TYP-022]

## Dependencies
- depends_on: [02_tui_string_constants_and_lint.md]
- shared_components: [devs-tui]

## 1. Initial Test Written
- [ ] Create an `insta` snapshot test in `devs-tui/tests/snapshots.rs` (or similar) named `dashboard__run_running`.
- [ ] The test should set up a mock TUI environment with a dashboard showing a single running run that has a stage.

## 2. Task Implementation
- [ ] Implement the logic in the dashboard widget to render stage boxes in the format: `[ <name-20> | <STATUS> | <DURATION> ]`.
- [ ] Specifically, ensure that when a stage status is "RUN" (represented by `STATUS_RUN_`), it renders within a 4-character column.
- [ ] The full stage box format must be exactly `[ <name-20> | RUN  | <M:SS > ]`.
- [ ] Capture the snapshot with `insta::assert_debug_snapshot!`.
- [ ] Verify that the generated snapshot file contains the expected string pattern.

## 3. Code Review
- [ ] Confirm that column widths (20 for name, 4 for status, duration formatting) are strictly adhered to.
- [ ] Ensure the snapshot test is stable and does not fail due to transient time differences (use a fixed mock duration).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui` and update the snapshots with `cargo insta review` if necessary.

## 5. Update Documentation
- [ ] Update documentation if any new snapshot testing helpers or conventions are established in this task.

## 6. Automated Verification
- [ ] Run `./do test` to ensure the snapshots are verified as part of the presubmit pipeline.
