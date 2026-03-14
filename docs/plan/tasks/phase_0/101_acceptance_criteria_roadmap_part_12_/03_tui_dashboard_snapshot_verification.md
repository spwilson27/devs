# Task: TUI Dashboard Snapshot with Running Stage Box Layout Verification (Sub-Epic: 101_Acceptance Criteria & Roadmap (Part 12))

## Covered Requirements
- [AC-TYP-022]

## Dependencies
- depends_on: [02_tui_string_constants_and_lint.md]
- shared_components: [devs-tui (owner of dashboard widget and snapshot tests), devs-core (consumer — uses RunStatus/StageStatus types)]

## 1. Initial Test Written
- [ ] Add `insta` as a dev-dependency in `devs-tui/Cargo.toml`: `insta = { version = "1", features = ["redactions"] }`.
- [ ] Create an insta snapshot test in `devs-tui/tests/snapshot_dashboard.rs` (or `devs-tui/src/widgets/dashboard/tests.rs` if using inline tests) named `dashboard__run_running`:
  - Set up a mock/test `Terminal` backend using `ratatui::backend::TestBackend::new(width, height)` with a width of at least 80 columns and height of at least 24 rows.
  - Construct test data representing a workflow run in `Running` state with at least one stage also in `Running` state:
    - Stage name: a test string like `"implement-api"` (under 20 chars to fit the name column).
    - Stage status: `StageStatus::Running` (which should render using `STATUS_RUN_` = `"RUN "`).
    - Stage duration: a fixed mock duration (e.g., `Duration::from_secs(95)` → renders as `1:35`). Do NOT use real clock — use a fixed/injected value to ensure snapshot stability.
  - Render the dashboard widget to the test terminal.
  - Capture the rendered buffer as a string (use `TestBackend::buffer()` and convert cells to string).
  - Call `insta::assert_snapshot!("dashboard__run_running", rendered_string);`.
  - Add `// Covers: AC-TYP-022` annotation.
- [ ] Write a secondary assertion within the same test (or a companion test `dashboard__run_running_stage_box_format`) that:
  - Parses the rendered output for a line matching the regex pattern `\[\s*\S{1,20}\s*\|\s*RUN\s+\|\s*\d+:\d{2}\s*\]`.
  - Asserts the stage name column is exactly 20 characters wide (padded with spaces if the name is shorter).
  - Asserts the status column contains `"RUN "` (4 characters, matching `STATUS_RUN_`).
  - Asserts the duration column matches `M:SS` format (e.g., `1:35`) with appropriate padding.
  - The full expected pattern is: `[ <name-20> | RUN  | <M:SS > ]` where `<name-20>` is left-padded/right-padded to 20 chars.

## 2. Task Implementation
- [ ] Implement the dashboard widget's stage box rendering in `devs-tui/src/widgets/dashboard.rs` (or equivalent module):
  - Each stage row renders as `[ <name> | <status> | <duration> ]`.
  - Name column: fixed 20-character width, left-aligned, truncated with ellipsis if longer than 20 chars.
  - Status column: uses the constant from `strings.rs` (e.g., `STATUS_RUN_` for running stages). Fixed 4-character width.
  - Duration column: formatted as `M:SS` (e.g., `1:35`), right-aligned in a 5-character field (or `<M:SS >` with trailing space as specified).
  - Separator: ` | ` (space-pipe-space) between columns.
  - Surrounding brackets: `[ ` prefix and ` ]` suffix.
- [ ] Import `STATUS_RUN_` from `crate::strings` in the dashboard widget for the running status display.
- [ ] Ensure the dashboard widget accepts a clock/time abstraction (trait or closure) so tests can inject a fixed duration instead of reading wall clock time.
- [ ] Create the initial insta snapshot file by running `cargo insta test -p devs-tui` followed by `cargo insta review` to accept the snapshot. The snapshot file will be saved at `devs-tui/src/snapshots/` or `devs-tui/tests/snapshots/` depending on test location.

## 3. Code Review
- [ ] Verify the stage box format in the snapshot matches `[ <name-20> | RUN  | <M:SS > ]` exactly — pay attention to column widths and spacing.
- [ ] Verify the snapshot test uses a fixed duration value, not `Instant::now()` or any real-time source.
- [ ] Verify `STATUS_RUN_` is used from `strings.rs` rather than a hardcoded `"RUN "` in the widget code.
- [ ] Verify the snapshot file is committed to version control (insta snapshots must be tracked).
- [ ] Verify truncation of long stage names (>20 chars) works correctly with an ellipsis or similar indicator.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui -- dashboard__run_running` and confirm the snapshot test passes.
- [ ] Run `cargo insta test -p devs-tui --review` to verify no pending snapshot changes.
- [ ] Run `cargo test -p devs-tui` to confirm all tests in the crate pass.

## 5. Update Documentation
- [ ] Add doc comments to the dashboard widget's stage box rendering function explaining the column layout contract: `[ <name-20> | <status-4> | <duration-5> ]`.
- [ ] Document the snapshot testing convention (fixed test data, no real-time dependencies) in a comment at the top of the snapshot test file.

## 6. Automated Verification
- [ ] Run `./do test` and confirm the snapshot test is included and passes.
- [ ] Run `cargo test -p devs-tui 2>&1 | grep dashboard__run_running` to verify the specific test executed.
- [ ] Verify the snapshot file exists: `find devs-tui -name '*dashboard__run_running*' -type f` should return exactly one file.
