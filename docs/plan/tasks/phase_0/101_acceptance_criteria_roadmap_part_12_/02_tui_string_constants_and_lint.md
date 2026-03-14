# Task: TUI String Constants with Compile-Time Assertions and Inline Error Lint (Sub-Epic: 101_Acceptance Criteria & Roadmap (Part 12))

## Covered Requirements
- [AC-TYP-020], [AC-TYP-021]

## Dependencies
- depends_on: [01_tui_status_logic_and_labels.md]
- shared_components: [devs-tui (owner of strings module)]

## 1. Initial Test Written
- [ ] In `devs-tui/src/strings.rs`, add a compile-time assertion test. Use `const_assert!` from the `static_assertions` crate (or a manual `const` block assertion) to verify that `STATUS_RUN_.len() == 4`. The constant value `"RUN "` is exactly 4 bytes (3 letters + 1 trailing space). The compile-time assertion must cause a build failure if the length changes. Add `// Covers: AC-TYP-020` annotation.
- [ ] Create `devs-tui/tests/lint_strings.rs` (integration test file) containing a test function `strings_no_inline_errors`:
  - The test reads all `.rs` files under `devs-tui/src/widgets/` recursively using `std::fs::read_dir` (or `walkdir` if available as a dev-dependency).
  - For each file, read its contents as a string.
  - Search for any occurrence of a string literal starting with `"not_found:"` — use a regex or simple string search for `"not_found:` (opening quote followed by `not_found:`).
  - If any match is found, the test must `panic!` with a message identifying the file path and line number of the violation.
  - If no widget files exist yet, the test should pass (empty directory is valid).
  - Add `// Covers: AC-TYP-021` annotation.
- [ ] Write a companion test `strings_no_inline_errors_detects_violation` that:
  - Creates a temporary `.rs` file in a temp directory containing `let msg = "not_found:test";`.
  - Runs the same detection logic against that temp directory.
  - Asserts the detection returns at least one violation.
  - This proves the lint actually catches violations (the positive case).

## 2. Task Implementation
- [ ] Add `static_assertions` as a dev-dependency in `devs-tui/Cargo.toml` (if not already present): `static_assertions = "1"`.
- [ ] Create or update `devs-tui/src/strings.rs`:
  - Define `pub const STATUS_RUN_: &str = "RUN ";` — exactly 4 characters: `R`, `U`, `N`, ` ` (space).
  - Add the compile-time length assertion: `static_assertions::const_assert_eq!(STATUS_RUN_.len(), 4);` or use a `const _: () = assert!(STATUS_RUN_.len() == 4);` block (Rust 1.57+ supports `assert!` in const context).
  - Export `STATUS_RUN_` as a public constant from the `strings` module.
- [ ] Ensure `devs-tui/src/lib.rs` (or `mod.rs`) declares `pub mod strings;`.
- [ ] Implement the lint detection logic as a reusable function `fn find_inline_error_strings(dir: &Path) -> Vec<(PathBuf, usize, String)>` that returns `(file, line_number, line_content)` tuples for violations. Use this from both the real lint test and the companion detection test.
- [ ] In `strings_no_inline_errors`, call `find_inline_error_strings` with the path to `devs-tui/src/widgets/`. Determine the crate root at runtime using `env!("CARGO_MANIFEST_DIR")` to construct the widgets path: `Path::new(env!("CARGO_MANIFEST_DIR")).join("src/widgets")`.
- [ ] Create `devs-tui/src/widgets/` directory (with a `mod.rs` if it doesn't exist) so the lint test has a valid target directory.

## 3. Code Review
- [ ] Verify the trailing space in `STATUS_RUN_` is present — the value must be `"RUN "` not `"RUN"`.
- [ ] Verify the compile-time assertion would fail if someone changes the value to `"RUNNING"` (length 7 ≠ 4).
- [ ] Verify `strings_no_inline_errors` uses `CARGO_MANIFEST_DIR` for path resolution, not a hardcoded relative path.
- [ ] Verify the lint searches for the pattern `"not_found:` (with the opening double-quote) to avoid false positives on comments or variable names containing `not_found`.
- [ ] Verify the lint test does NOT panic on an empty widgets directory.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui -- strings_no_inline_errors` and confirm it passes (no violations in widget files).
- [ ] Run `cargo build -p devs-tui` and confirm the compile-time assertion passes.
- [ ] Temporarily change `STATUS_RUN_` to `"RUN"` (3 chars) and confirm `cargo build -p devs-tui` fails with a compile error from the assertion.
- [ ] Run `cargo test -p devs-tui` to confirm all tests pass.

## 5. Update Documentation
- [ ] Add a doc comment on `STATUS_RUN_` explaining it is a fixed-width status label used in TUI column rendering and its length is compile-time enforced.
- [ ] Add a doc comment on the `strings_no_inline_errors` test explaining the `"not_found:"` prefix convention and why inline error strings in widgets are prohibited.

## 6. Automated Verification
- [ ] Run `./do test` and confirm both the compile-time assertion and `strings_no_inline_errors` lint test execute successfully.
- [ ] Run `cargo test -p devs-tui 2>&1 | grep strings_no_inline_errors` to confirm the test was executed.
