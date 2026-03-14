# Task: Implement ./do lint Command (Sub-Epic: 003_Developer Entrypoint Script)

## Covered Requirements
- [1_PRD-REQ-045], [2_TAS-REQ-014]

## Dependencies
- depends_on: ["01_scaffold_do_script.md"]
- shared_components: [./do Entrypoint Script & CI Pipeline]

## 1. Initial Test Written
- [ ] Create `tests/do_script/test_lint.sh` (POSIX sh-compatible) with the following test cases:
  - Test that `./do lint` exits 0 on a clean, correctly formatted stub workspace
  - Test that `./do lint` runs `cargo fmt --check --workspace` (introduce a formatting violation in a temp file, verify `./do lint` exits non-zero)
  - Test that `./do lint` runs `cargo clippy --workspace --all-targets -- -D warnings`
  - Test that `./do lint` runs `cargo doc --workspace --no-deps` (verify doc warnings cause non-zero exit)
  - Test that `./do lint` runs `cargo audit` (or skips gracefully if `cargo-audit` is not installed)
  - Test that `./do lint` fails at the first failing step and reports which step failed
- [ ] Add `// Covers: 1_PRD-REQ-045` annotation at the top of the test file

## 2. Task Implementation
- [ ] Replace the `lint` stub in `./do` with a full implementation that runs the following steps in order:
  1. `cargo fmt --check --workspace` — verify formatting
  2. `cargo clippy --workspace --all-targets -- -D warnings` — lint
  3. `RUSTDOCFLAGS="-D warnings" cargo doc --workspace --no-deps` — doc check
  4. `cargo audit` (if `command -v cargo-audit` succeeds; print warning and skip if not installed)
- [ ] Each step prints a header line (e.g., `=== Step: cargo fmt --check ===`) before execution
- [ ] If any step fails, print which step failed to stderr and exit non-zero immediately
- [ ] The lint command must exit 0 only if all steps succeed

## 3. Code Review
- [ ] Verify POSIX sh compatibility
- [ ] Verify step ordering matches [2_TAS-REQ-012B] (fmt, clippy, doc, audit)
- [ ] Verify `-D warnings` is passed to both clippy and rustdoc
- [ ] Verify early exit on first failure per [2_TAS-REQ-012C]

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/do_script/test_lint.sh` and verify all tests pass
- [ ] Run `./do lint` on the clean stub workspace and verify exit 0

## 5. Update Documentation
- [ ] Add inline comments in the `lint` section of `./do` documenting the step sequence and rationale

## 6. Automated Verification
- [ ] Run `sh tests/do_script/test_lint.sh` from repository root; verify exit code 0
- [ ] Run `./do lint` and confirm exit code 0 on the stub workspace
