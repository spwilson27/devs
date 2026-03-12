# Task: TUI Log Processing (ANSI Stripping) (Sub-Epic: 094_Acceptance Criteria & Roadmap (Part 5))

## Covered Requirements
- [AC-LOG-005]

## Dependencies
- depends_on: [none]
- shared_components: [devs-tui, devs-core]

## 1. Initial Test Written
- [ ] Write a unit test for `LogLine` in `devs-tui/src/logs.rs` (or equivalent).
- [ ] The test should pass a string containing ANSI CSI sequences (e.g., `\x1b[32m[INFO]\x1b[0m message`) to the `raw_content` field.
- [ ] The test should assert that the `content` field contains the plain, stripped version (e.g., `[INFO] message`).
- [ ] Test multiple ANSI sequences like color codes, bold, and other common CSI sequences.

## 2. Task Implementation
- [ ] Implement the `LogLine` struct and its initialization logic.
- [ ] Implement an ANSI stripping function to process `raw_content` into `content`.
- [ ] Ensure that `LogLine` keeps both the `raw_content` (for possible color-aware rendering) and `content` (for searching, alignment, etc.).
- [ ] The stripping logic should be efficient and handle multiple/nested ANSI codes.

## 3. Code Review
- [ ] Verify that the ANSI stripping logic is robust against malformed or partial ANSI sequences.
- [ ] Ensure that both the raw and stripped versions of the log line are properly stored and used in the appropriate contexts.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui` and verify that the `LogLine` ANSI stripping tests pass.

## 5. Update Documentation
- [ ] No documentation updates required for this internal logic change.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows [AC-LOG-005] as covered.
