# Task: Implement ./do coverage Command (Sub-Epic: 003_Developer Entrypoint Script)

## Covered Requirements
- [1_PRD-REQ-045], [2_TAS-REQ-014]

## Dependencies
- depends_on: ["01_scaffold_do_script.md", "02_implement_setup_command.md"]
- shared_components: [./do Entrypoint Script & CI Pipeline, Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] Create `tests/do_script/test_coverage.sh` (POSIX sh-compatible) with the following test cases:
  - Test that `./do coverage` exits 0 on the stub workspace (which has trivial or no code to cover)
  - Test that `./do coverage` invokes `cargo llvm-cov` and produces output in `target/` directory
  - Test that `./do coverage` generates a coverage report file (e.g., `target/coverage/report.json` or similar)
  - Test that `./do coverage` exits non-zero if `cargo-llvm-cov` is not installed (verify error message)
- [ ] Add `// Covers: 1_PRD-REQ-045` annotation at the top of the test file

## 2. Task Implementation
- [ ] Replace the `coverage` stub in `./do` with a full implementation:
  1. Check that `cargo llvm-cov --version` succeeds; if not, print error directing user to run `./do setup` and exit 1
  2. Run `cargo llvm-cov --workspace --json --output-path target/coverage/report.json` for unit test coverage
  3. Print a summary line showing overall coverage percentage parsed from the JSON report
- [ ] Create the `target/coverage/` directory if it does not exist (`mkdir -p target/coverage`)
- [ ] Exit 0 if coverage run completes successfully (gate enforcement of specific percentages is deferred to later phases when there is actual code to measure)

## 3. Code Review
- [ ] Verify POSIX sh compatibility
- [ ] Verify `cargo llvm-cov` is invoked with `--workspace` flag
- [ ] Verify output path is consistent (`target/coverage/report.json`)
- [ ] Verify the command fails gracefully if `cargo-llvm-cov` is missing

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/do_script/test_coverage.sh` and verify all tests pass
- [ ] Run `./do coverage` on the stub workspace and verify it completes

## 5. Update Documentation
- [ ] Add inline comments in the `coverage` section of `./do` documenting the coverage tool and output paths

## 6. Automated Verification
- [ ] Run `sh tests/do_script/test_coverage.sh` from repository root; verify exit code 0
- [ ] Run `./do coverage` and confirm `target/coverage/report.json` exists after completion
