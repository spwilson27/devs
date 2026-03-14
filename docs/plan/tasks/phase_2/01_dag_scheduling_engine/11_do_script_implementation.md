# Task: ./do Script Implementation (Sub-Epic: 01_dag_scheduling_engine)

## Covered Requirements
- [2_TAS-REQ-083], [2_TAS-REQ-084], [2_TAS-REQ-085]

## Dependencies
- depends_on: ["05_phase_1_completion_gate.md"]
- shared_components: [./do Entrypoint Script & CI Pipeline (owner — script implementation), Traceability & Coverage Infrastructure (consumer — traceability.json generation)]

## 1. Initial Test Written
- [ ] Create `tests/do_script_tests.rs` (integration test using `assert_cmd` crate).
- [ ] Write integration test `test_do_setup_exits_success`: run `./do setup`, assert exit code 0. Annotate `// Covers: 2_TAS-REQ-083`.
- [ ] Write integration test `test_do_build_exits_success`: run `./do build`, assert exit code 0. Annotate `// Covers: 2_TAS-REQ-083`.
- [ ] Write integration test `test_do_test_exits_success`: run `./do test`, assert exit code 0. Annotate `// Covers: 2_TAS-REQ-083`.
- [ ] Write integration test `test_do_lint_exits_success`: run `./do lint`, assert exit code 0. Annotate `// Covers: 2_TAS-REQ-083`.
- [ ] Write integration test `test_do_format_exits_success`: run `./do format`, assert exit code 0. Annotate `// Covers: 2_TAS-REQ-083`.
- [ ] Write integration test `test_do_coverage_exits_success`: run `./do coverage`, assert exit code 0. Annotate `// Covers: 2_TAS-REQ-083`.
- [ ] Write integration test `test_do_presubmit_exits_success`: run `./do presubmit`, assert exit code 0 (may take long, use timeout). Annotate `// Covers: 2_TAS-REQ-083, 2_TAS-REQ-085`.
- [ ] Write integration test `test_do_ci_exits_success`: run `./do ci`, assert exit code 0. Annotate `// Covers: 2_TAS-REQ-083`.
- [ ] Write integration test `test_do_unknown_subcommand_fails`: run `./do foobar`, assert exit code 1 and stderr contains "Valid commands" or similar help message. Annotate `// Covers: 2_TAS-REQ-084`.
- [ ] Write integration test `test_do_no_args_shows_help`: run `./do` with no args, assert exit code 1 and stderr shows usage/help. Annotate `// Covers: 2_TAS-REQ-084`.
- [ ] Write integration test `test_do_presubmit_timeout_enforced`: create a test script that replaces `./do test` with `sleep 9999`, run `./do presubmit` with a short timeout (e.g., 10 seconds for test purposes). Assert `./do presubmit` exits non-zero and child processes are killed. Annotate `// Covers: 2_TAS-REQ-085`.
- [ ] Write integration test `test_do_setup_idempotent`: run `./do setup && ./do setup`, assert both invocations exit 0. Annotate `// Covers: 2_TAS-REQ-083`.

## 2. Task Implementation
- [ ] Create `./do` as a POSIX sh-compatible script at repository root.
- [ ] Implement subcommand parsing using `case` statement for: `setup`, `build`, `test`, `lint`, `format`, `coverage`, `presubmit`, `ci`.
- [ ] Implement `setup` subcommand:
  - Install `rustfmt`, `clippy`, `llvm-tools-preview` via `rustup component add`.
  - Install `cargo-llvm-cov` via `cargo install`.
  - Install `protoc` if not present (platform-specific: apt, brew, or download).
  - Ensure idempotence (re-running does not fail).
- [ ] Implement `build` subcommand: `cargo build --release --workspace`.
- [ ] Implement `test` subcommand: `cargo test --workspace`.
- [ ] Implement `lint` subcommand:
  - `cargo fmt --check --all`
  - `cargo clippy --workspace --all-targets -- -D warnings`
  - `cargo doc --no-deps --workspace`
  - Dependency audit: `cargo tree -p devs-core --edges normal` (check for forbidden deps)
  - PTC validation: check `docs/adr/*-phase-*-complete.md` files for `verified: false`
  - BOOTSTRAP-STUB check: grep for `// TODO: BOOTSTRAP-STUB` (fail if Phase 3+ complete)
- [ ] Implement `format` subcommand: `cargo fmt --workspace`.
- [ ] Implement `coverage` subcommand:
  - Run `cargo llvm-cov --workspace --json > target/coverage/report.json`
  - Parse report and enforce QG-001 (90% unit), QG-002 (80% E2E), QG-003/004/005 (50% per interface)
  - Generate `target/traceability.json` from `// Covers:` annotations
  - Exit non-zero if any gate fails.
- [ ] Implement `presubmit` subcommand:
  - Run in order: `setup`, `format`, `lint`, `test`, `coverage`, `ci`.
  - Implement 15-minute (900,000 ms) hard timeout using background timer process.
  - Write incremental timing data to `target/presubmit_timings.jsonl` (one line per step, flushed immediately).
  - Kill child processes on timeout.
  - Clean up timer PID file on all exit paths.
- [ ] Implement `ci` subcommand:
  - Copy working directory to temporary commit.
  - Run all presubmit checks on the temporary commit.
  - Clean up temporary commit on exit.
- [ ] Implement unknown subcommand handling:
  - Print "Valid commands: setup, build, test, lint, format, coverage, presubmit, ci" to stderr.
  - Exit with code 1.
- [ ] Add `// Covers: 2_TAS-REQ-083`, `// Covers: 2_TAS-REQ-084`, `// Covers: 2_TAS-REQ-085` annotations in script comments.

## 3. Code Review
- [ ] Verify script is POSIX sh-compatible (no bashisms like `[[`, arrays, etc.).
- [ ] Verify timeout is enforced by separate background process, not `timeout` command wrapper.
- [ ] Verify `target/presubmit_timings.jsonl` is written incrementally (line-by-line with flush).
- [ ] Verify timer PID file is cleaned up on all exit paths (including error exits).
- [ ] Verify unknown subcommand prints valid command list to stderr and exits 1.
- [ ] Verify `setup` is idempotent (can run multiple times without failure).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test do_script_tests` and verify all tests pass.
- [ ] Manually verify `./do setup`, `./do build`, `./do test`, `./do lint`, `./do format` work.
- [ ] Verify `./do foobar 2>&1` exits 1 and shows valid commands.

## 5. Update Documentation
- [ ] Add header comment to `./do` explaining its purpose and all subcommands.
- [ ] Add README section in `docs/plan/tasks/phase_2/01_dag_scheduling_engine/` explaining the script.
- [ ] Document the 15-minute timeout and timing data format.

## 6. Automated Verification
- [ ] Run `cargo test --test do_script_tests --format=json 2>&1 | grep '"passed"'` and confirm all tests passed.
- [ ] Verify `./do presubmit` completes within 15 minutes on a clean workspace.
- [ ] Verify `target/traceability.json` is generated after `./do test` and contains valid JSON with `phase_gates` array.
- [ ] Verify `target/presubmit_timings.jsonl` is generated after `./do presubmit` and each line is valid JSON.
