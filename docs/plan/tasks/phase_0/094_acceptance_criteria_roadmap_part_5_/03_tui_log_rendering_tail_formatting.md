# Task: TUI Log Rendering (Tail & Formatting) (Sub-Epic: 094_Acceptance Criteria & Roadmap (Part 5))

## Covered Requirements
- [AC-LOG-006], [AC-LOG-007]

## Dependencies
- depends_on: [02_tui_log_processing_ansi_stripping.md]
- shared_components: [devs-tui, devs-core]

## 1. Initial Test Written
- [ ] Create an `insta` snapshot test for the `LogPane` component in `devs-tui`.
- [ ] Configure `TestBackend` with a 200×50 dimension.
- [ ] Inject more log lines than can fit in the visible height and verify that only the last N lines are shown (`AC-LOG-006`).
- [ ] Use a mix of stdout and stderr source types and verify the snapshot shows `[stdout] ` or `[stderr] ` prefixes for each line (`AC-LOG-007`).
- [ ] The snapshot file should be named `logs__buffered.snap`.

## 2. Task Implementation
- [ ] Implement the `LogTail` logic in `devs-tui` to determine which lines are visible based on the current pane height and scroll position.
- [ ] Update `LogPane`'s rendering logic to prepend the stream source (stdout/stderr) to each line's content before rendering it to the terminal buffer.
- [ ] Ensure that the prepended labels are clearly distinguishable (e.g., using different colors or consistent padding).
- [ ] Ensure the tail follows the bottom of the log buffer by default.

## 3. Code Review
- [ ] Verify that the `LogTail` logic correctly handles edge cases like empty buffers or buffers smaller than the window height.
- [ ] Ensure the stdout/stderr labels are added in a way that doesn't interfere with ANSI sequence handling.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui` and ensure the `insta` snapshots are correctly generated and match expectations.

## 5. Update Documentation
- [ ] Reflect the log prefix format in any user-facing TUI documentation if applicable.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows [AC-LOG-006] and [AC-LOG-007] as covered.
