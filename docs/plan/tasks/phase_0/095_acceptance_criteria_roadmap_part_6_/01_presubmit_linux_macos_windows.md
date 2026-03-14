# Task: Presubmit Exit-0 Verification on Linux, macOS, and Windows (Sub-Epic: 095_Acceptance Criteria & Roadmap (Part 6))

## Covered Requirements
- [AC-ROAD-P0-001], [AC-ROAD-P0-002], [AC-ROAD-P0-003]

## Dependencies
- depends_on: ["none"]
- shared_components: ["./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] Create `tests/acceptance/phase_0_presubmit.rs` (or a shell-based test script `tests/acceptance/test_phase0_presubmit.sh`) containing three acceptance tests:
  1. **AC-ROAD-P0-001 — Presubmit exits 0 on Linux**: A test that invokes `./do presubmit` in a clean checkout and asserts exit code 0 within 900 seconds. If running in CI, this test is gated to the `linux` runner tag. The test must capture wall-clock time and assert it is < 900s.
  2. **AC-ROAD-P0-002 — devs-core forbidden dependency check**: A test that runs `cargo tree -p devs-core --edges normal` and asserts the output contains **none** of the strings `tokio`, `git2`, `reqwest`, `tonic`. Use exact word-boundary matching to avoid false positives (e.g., `tokio-` prefix in unrelated crates should still fail). The test must fail if any forbidden dependency appears.
  3. **AC-ROAD-P0-003 — shellcheck POSIX enforcement**: A test that temporarily injects `[[` (bash-specific syntax) into a copy of `./do`, runs `./do lint` (or directly `shellcheck --shell=sh ./do`), and asserts exit code is non-zero. Then verifies the unmodified `./do` passes shellcheck cleanly.
- [ ] Each test must include a `// Covers: AC-ROAD-P0-00X` annotation for traceability.

## 2. Task Implementation
- [ ] Ensure `./do presubmit` runs format, lint, test, coverage, and ci sub-commands sequentially and enforces the 900-second hard timeout (this should already exist from the `./do` entrypoint script shared component — verify, do not recreate).
- [ ] Ensure `./do lint` includes a `shellcheck --shell=sh ./do` step. If not present, add it as a lint sub-step.
- [ ] Ensure `./do lint` or a dedicated CI step runs `cargo tree -p devs-core --edges normal` and greps for forbidden dependencies (`tokio`, `git2`, `reqwest`, `tonic`), failing if any are found.
- [ ] Update `.gitlab-ci.yml` to run the presubmit acceptance tests on all three platforms (Linux, macOS, Windows Git Bash). Each platform job should invoke `./do presubmit` and report the exit code.

## 3. Code Review
- [ ] Verify `./do` contains no bash-specific syntax (`[[`, `(( ))`, arrays, `local -a`, etc.) — only POSIX sh.
- [ ] Verify the forbidden-dependency check uses `cargo tree --edges normal` (not `--edges all`) to exclude dev/build dependencies.
- [ ] Verify CI jobs are defined for all three platforms with appropriate runner tags.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` and confirm it exits 0 on the current codebase.
- [ ] Run `cargo tree -p devs-core --edges normal` manually and confirm no forbidden crates appear.
- [ ] Run `shellcheck --shell=sh ./do` and confirm exit 0.
- [ ] Run the three acceptance tests and confirm all pass.

## 5. Update Documentation
- [ ] Add traceability entries for AC-ROAD-P0-001, AC-ROAD-P0-002, AC-ROAD-P0-003 to any traceability index if one exists.

## 6. Automated Verification
- [ ] Run `./do presubmit` end-to-end on a Linux runner and assert exit code 0.
- [ ] Run `grep -c 'Covers: AC-ROAD-P0-001\|Covers: AC-ROAD-P0-002\|Covers: AC-ROAD-P0-003'` across the test files and assert count >= 3.
