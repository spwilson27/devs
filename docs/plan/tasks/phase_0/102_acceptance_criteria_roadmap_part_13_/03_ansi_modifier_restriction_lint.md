# Task: Forbidden ANSI Modifier Lint for TUI Widget Sources (Sub-Epic: 102_Acceptance Criteria & Roadmap (Part 13))

## Covered Requirements
- [AC-TYP-027]

## Dependencies
- depends_on: []
- shared_components: [./do Entrypoint Script & CI Pipeline (consumer — lint integration)]

## 1. Initial Test Written
- [ ] Write a Rust integration test in `crates/devs-tui/tests/lint_forbidden_modifiers.rs` named `test_no_forbidden_ansi_modifiers_in_widget_sources`. The test should:
  1. Use `std::fs::read_dir` to recursively enumerate all `.rs` files under `crates/devs-tui/src/widgets/`.
  2. Read each file's contents as a string.
  3. For each file, assert that the content does NOT contain any of the following token strings: `Modifier::ITALIC`, `Modifier::UNDERLINED`, `Modifier::BLINK`, `Modifier::RAPID_BLINK`.
  4. On failure, report the exact file path and the forbidden token found.
  5. Tag with `// Covers: AC-TYP-027`.
- [ ] Write a negative-case helper test `test_lint_detects_forbidden_modifier` that creates a temp file containing `Modifier::ITALIC`, runs the same scanning logic, and asserts it returns a violation. This validates the lint logic itself.

## 2. Task Implementation
- [ ] Create a lint check function `check_forbidden_modifiers(dir: &Path) -> Vec<(PathBuf, String, usize)>` in a test utility module (e.g., `crates/devs-tui/tests/lint_utils.rs` or inline in the test file). The function recursively scans `.rs` files in the given directory and returns a vec of `(file_path, matched_token, line_number)` for any occurrence of `Modifier::ITALIC`, `Modifier::UNDERLINED`, `Modifier::BLINK`, or `Modifier::RAPID_BLINK`.
- [ ] Integrate this check into `./do lint` by adding a step that runs `cargo test -p devs-tui --test lint_forbidden_modifiers`. The lint step should fail (non-zero exit) if any violations are found.
- [ ] Ensure the scan is scoped to `crates/devs-tui/src/widgets/` only — other directories in `devs-tui` (like `tests/` or `src/app.rs`) and other crates are not subject to this restriction.

## 3. Code Review
- [ ] Verify the scan targets `Modifier::ITALIC` etc. (the fully-qualified ratatui token), not bare strings like `"ITALIC"` which could cause false positives in comments or string literals describing the restriction.
- [ ] Confirm the recursive directory walk handles nested subdirectories within `widgets/`.
- [ ] Verify the lint is included in the `./do lint` command and therefore in `./do presubmit`.
- [ ] Check that the lint does not scan generated code or test fixtures that might legitimately reference these tokens.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui --test lint_forbidden_modifiers` and verify it passes on the current codebase (no violations present).
- [ ] Temporarily add `Modifier::ITALIC` to any widget file, rerun the test, and verify it fails with a clear error message. Then revert the change.

## 5. Update Documentation
- [ ] Add a doc comment at the top of the lint test file explaining why these modifiers are forbidden (terminal compatibility — italic/underline/blink are inconsistently supported and produce visual artifacts).

## 6. Automated Verification
- [ ] Run `./do lint` and confirm it completes successfully (exit 0), which includes the forbidden modifier check.
- [ ] Run `./do test` and confirm `lint_forbidden_modifiers` appears in the test output.
