# Task: Implement ./do setup with Idempotency (Sub-Epic: 003_Developer Entrypoint Script)

## Covered Requirements
- [1_PRD-REQ-045], [1_PRD-BR-002], [2_TAS-REQ-014]

## Dependencies
- depends_on: ["01_scaffold_do_script.md"]
- shared_components: [./do Entrypoint Script & CI Pipeline]

## 1. Initial Test Written
- [ ] Create `tests/do_script/test_setup.sh` (POSIX sh-compatible) with the following test cases:
  - Test that `./do setup` exits 0 on a machine where all tools are already installed (idempotency — [1_PRD-BR-002])
  - Test that running `./do setup` twice consecutively both exit 0 with no errors or warnings on stderr ([1_PRD-BR-002])
  - Test that after `./do setup`, the following tools are available: `rustup --version`, `cargo --version`, `rustfmt --version`, `cargo-clippy --version`, `cargo-llvm-cov --version`, `protoc --version`, `git --version`
  - Test that the Rust toolchain version is >= 1.80.0 by parsing `rustc --version` output
  - Test that the `rustfmt`, `clippy`, and `llvm-tools-preview` components are installed (check `rustup component list --installed`)
- [ ] Add `// Covers: 1_PRD-BR-002` annotation at the top of the test file

## 2. Task Implementation
- [ ] Replace the `setup` stub in `./do` with a full implementation
- [ ] Detect the current OS using `uname -s` (Linux, Darwin, MINGW*/MSYS* for Windows)
- [ ] For each required tool, check if it is already installed and at the correct version before attempting installation:
  - `rustup`: check `command -v rustup`; if missing, install via `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y`
  - Rust stable >= 1.80.0: `rustup toolchain install stable --component rustfmt clippy llvm-tools-preview`
  - `cargo-llvm-cov`: check `cargo llvm-cov --version`; if missing, `cargo install cargo-llvm-cov --locked`
  - `protoc`: check `command -v protoc`; if missing, install via platform-appropriate package manager (apt-get on Linux, brew on macOS, choco/winget on Windows)
  - `git`: check `command -v git`; warn if missing (assume CI provides it)
- [ ] After each installation step, verify with `<tool> --version` and abort if verification fails
- [ ] Ensure all checks are idempotent: running setup when tools already exist must not modify them and must not produce warnings

## 3. Code Review
- [ ] Verify POSIX sh compatibility — no bash-isms
- [ ] Verify idempotency: no `cargo install` if tool is already at correct version
- [ ] Verify each tool check uses `command -v` (not `which`, which is not POSIX)
- [ ] Verify platform detection handles Linux, macOS, and Windows (Git Bash/MSYS2)

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/do_script/test_setup.sh` and verify all tests pass
- [ ] Run `./do setup` twice and verify both runs exit 0 with no errors

## 5. Update Documentation
- [ ] Add inline comments in the `setup` section of `./do` documenting each tool and its version requirement

## 6. Automated Verification
- [ ] Run `sh tests/do_script/test_setup.sh` from repository root; verify exit code 0
- [ ] Run `./do setup && ./do setup` and confirm both exit 0, second run produces no "installing" messages
