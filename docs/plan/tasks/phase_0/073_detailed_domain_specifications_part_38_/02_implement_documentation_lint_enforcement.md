# Task: Documentation Lint Enforcement (Sub-Epic: 073_Detailed Domain Specifications (Part 38))

## Covered Requirements
- [2_TAS-REQ-441], [2_TAS-REQ-444]

## Dependencies
- depends_on: [01_implement_clippy_and_unsafe_lints.md]
- shared_components: [./do Entrypoint Script & CI Pipeline]

## 1. Initial Test Written
- [ ] Create `tests/lint/test_doc_lint_blocks_warnings.sh` (POSIX sh) that:
    - Creates a temporary crate under `target/test_tmp/doc_warn/` with a `lib.rs` containing a public function with a doc comment that has a broken intra-doc link (e.g., `/// See [`NonExistentType`]`).
    - Runs `./do lint` and asserts exit code is non-zero.
    - Asserts that the output contains evidence that `cargo doc` was run and its warning was detected.
    - Cleans up the temporary crate.
- [ ] Create `tests/lint/test_doc_lint_passes_clean.sh` that:
    - Runs `./do lint` on the clean codebase (no doc warnings expected).
    - Asserts exit code is 0 (assuming no other lint failures).
- [ ] Create `tests/lint/test_doc_lint_runs_after_clippy_failure.sh` that:
    - Introduces both a clippy warning AND a doc warning in separate temp crates.
    - Runs `./do lint` and captures output.
    - Asserts that BOTH the clippy error AND the doc warning are reported in the output, proving the doc lint step ran even though clippy failed ([2_TAS-REQ-444]).

## 2. Task Implementation
- [ ] In `cmd_lint()`, add a `cargo doc` lint step that runs:
    ```
    cargo doc --workspace --no-deps --all-features 2>&1
    ```
- [ ] Capture the combined stdout+stderr output of `cargo doc`.
- [ ] Scan the captured output for the strings `warning` or `error` (case-sensitive, matching `cargo doc`'s actual output format). If either string is found, treat this step as a failure ([2_TAS-REQ-441]).
    - Note: `cargo doc` may exit 0 even with warnings, so exit code alone is insufficient — the string check is required.
- [ ] Also treat a non-zero exit code from `cargo doc` as a failure.
- [ ] Append the doc lint result to the `cmd_lint()` failure aggregator (same mechanism from task 01). Do NOT exit early ([2_TAS-REQ-444]).
- [ ] Place the doc lint step after the clippy step in the `cmd_lint()` sequence.

## 3. Code Review
- [ ] Verify `cargo doc` is called with `--workspace --no-deps --all-features`.
- [ ] Confirm output is captured and scanned for both `warning` and `error` strings.
- [ ] Confirm that the scan handles `cargo doc` stderr properly (Rust toolchain writes diagnostics to stderr).
- [ ] Verify that failure aggregation is consistent with the pattern established in task 01.

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/lint/test_doc_lint_blocks_warnings.sh` and confirm it passes.
- [ ] Run `sh tests/lint/test_doc_lint_passes_clean.sh` and confirm it passes.
- [ ] Run `sh tests/lint/test_doc_lint_runs_after_clippy_failure.sh` and confirm it passes.

## 5. Update Documentation
- [ ] Add inline comments in `cmd_lint()` referencing `[2_TAS-REQ-441]` and `[2_TAS-REQ-444]` next to the doc lint step.

## 6. Automated Verification
- [ ] Run `./do lint 2>&1 | grep -q 'cargo doc\|Documenting'` to confirm `cargo doc` is being executed.
- [ ] Run `grep -q 'cargo doc' ./do` to confirm the command is present in the script.
- [ ] Run `grep -qE "warning|error" <<< "$(grep -A5 'cargo doc' ./do)"` or equivalent to confirm string-check logic exists.
