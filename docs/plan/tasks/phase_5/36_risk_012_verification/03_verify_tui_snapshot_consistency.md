# Task: Verify Cross-Platform TUI Snapshot Consistency (Sub-Epic: 36_Risk 012 Verification)

## Covered Requirements
- [AC-RISK-012-04]

## Dependencies
- depends_on: [none]
- shared_components: [devs-tui]

## 1. Initial Test Written
- [ ] In `crates/devs-tui/tests/dashboard_snapshots.rs`, create a test `dashboard__run_running` that:
    - Sets up a mock `WorkflowRun` in the `Running` status with several stages.
    - Renders the dashboard to a fixed-size `TestBackend` (e.g., 80x24).
    - Uses `insta::assert_snapshot!` to save and compare the text output.
- [ ] Commit the baseline snapshot `.txt` file generated on a Linux environment.

## 2. Task Implementation
- [ ] Ensure that the TUI rendering logic does not use platform-specific characters or styling that differs across OSs (e.g., using only standardized ASCII/Unicode box-drawing characters).
- [ ] Configure the `insta` crate to use binary-identical comparison for snapshots.
- [ ] Add CI steps for `presubmit-macos` and `presubmit-windows` to run these TUI snapshot tests.

## 3. Code Review
- [ ] Verify that the generated snapshots on Windows and macOS are binary-identical to the Linux baseline.
- [ ] Ensure no `\r\n` vs `\n` line ending issues exist in the snapshots (use `insta`'s newline normalization or enforce LF).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui` on all three platforms (Linux, macOS, Windows).
- [ ] Verify that no new `.new` snapshot files are created and the tests pass.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to note that TUI visual consistency is enforced through cross-platform snapshot testing.

## 6. Automated Verification
- [ ] Verify that `insta` snapshot comparison is active in the CI for all platforms.
- [ ] Check `target/traceability.json` to ensure `AC-RISK-012-04` is covered.
