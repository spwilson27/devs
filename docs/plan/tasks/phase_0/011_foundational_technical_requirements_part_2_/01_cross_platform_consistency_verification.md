# Task: Cross-Platform ./do Script Consistency Verification (Sub-Epic: 011_Foundational Technical Requirements (Part 2))

## Covered Requirements
- [2_PRD-BR-006]

## Dependencies
- depends_on: []
- shared_components: [./do Entrypoint Script & CI Pipeline, Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] Create `tests/e2e/cross_platform_consistency.rs` with a `#[test]` function `test_do_script_exit_code_consistency`.
- [ ] The test must invoke `./do test` via `std::process::Command` (using `sh -c "./do test"` on Unix and `sh.exe -c "./do test"` on Windows/Git Bash) and capture the exit code.
- [ ] Assert that the exit code is `0` for a passing workspace (stub crates).
- [ ] Write a second test `test_do_script_output_normalization` that:
  - Runs `./do test` and captures stdout.
  - Applies a normalization function: replace absolute paths with `<WORKSPACE>`, normalize path separators to `/`, strip trailing `\r`.
  - Asserts the normalized output contains expected markers (e.g., `"test result: ok"` or the traceability JSON structure).
- [ ] Write a third test `test_do_script_line_ending_normalization` that reads `target/traceability.json` (if generated) and asserts it contains no `\r\n` sequences after normalization.
- [ ] Annotate all tests with `// Covers: 2_PRD-BR-006`.

## 2. Task Implementation
- [ ] Implement a `normalize_output(raw: &str) -> String` function in a test helper module (`tests/helpers/mod.rs` or inline) that:
  - Replaces all occurrences of the workspace root path (obtained via `env!("CARGO_MANIFEST_DIR")` or `std::env::current_dir()`) with `<WORKSPACE>`.
  - Replaces `\\` with `/` for path separators.
  - Strips `\r` characters.
  - Trims trailing whitespace from each line.
- [ ] Ensure `./do` script itself uses only POSIX-compatible constructs: no `timeout` command (use background process), no bashisms, no GNU-specific flags. Verify by running `shellcheck -s sh ./do` if available.
- [ ] In the `./do` script, ensure all generated artifacts (`target/traceability.json`, `target/presubmit_timings.jsonl`) use `/` as path separators internally by normalizing paths before writing.
- [ ] Verify that `rust-toolchain.toml` pins the exact same Rust version used on all CI platforms, ensuring deterministic compilation behavior.

## 3. Code Review
- [ ] Verify no hardcoded OS-specific paths (e.g., `/tmp/`, `C:\Users\`, `/home/`) appear in `./do` or test helpers.
- [ ] Verify `std::path::Path` or equivalent is used for all path manipulations in Rust test code.
- [ ] Confirm that the normalization function handles edge cases: empty output, paths with spaces, deeply nested paths.
- [ ] Ensure test does not depend on CI-only infrastructure — it must pass locally on any of the three platforms.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test cross_platform_consistency` and confirm all tests pass on the current platform.
- [ ] Run `./do test` manually and verify exit code 0.
- [ ] If on Linux, additionally verify that the test would pass under a Windows-like path scenario by injecting a mock path with backslashes into the normalization function.

## 5. Update Documentation
- [ ] Add a `// Covers: 2_PRD-BR-006` annotation comment at the top of the test file documenting which requirement this test verifies.
- [ ] Add doc comments to the `normalize_output` function explaining its purpose and the three transformations it performs.

## 6. Automated Verification
- [ ] Run `./do test` and confirm exit code 0.
- [ ] Run `grep -r "Covers: 2_PRD-BR-006" tests/` and confirm at least one match exists.
- [ ] Run `./do lint` and confirm exit code 0 (no linting regressions).
