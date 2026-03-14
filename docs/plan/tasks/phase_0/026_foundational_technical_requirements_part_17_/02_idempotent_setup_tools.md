# Task: Implement Idempotent Developer Toolchain Setup (Sub-Epic: 026_Foundational Technical Requirements (Part 17))

## Covered Requirements
- [2_TAS-REQ-014A], [2_TAS-REQ-014B]

## Dependencies
- depends_on: [none]
- shared_components: ["./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] Create `tests/do_script/setup_idempotent_test.sh` with the following test cases:
  1. **First run**: Execute `./do setup` on the current machine. Assert exit code 0. Assert each of the following commands succeeds: `rustup --version`, `rustc --version`, `cargo fmt --version`, `cargo clippy --version`, `cargo llvm-cov --version`, `protoc --version`, `git --version`.
  2. **Idempotent re-run** ([2_TAS-REQ-014A]): Execute `./do setup` a second time immediately after. Assert exit code 0. Assert no errors or warnings on stderr. Assert tool versions are unchanged (capture `--version` output before and after, diff them).
  3. **Version verification** ([2_TAS-REQ-014B]): After setup, assert `rustc --version` reports stable ≥ 1.80.0. Assert `cargo llvm-cov --version` reports 0.6.x. Assert `protoc --version` is present. Assert `git --version` is present.
- [ ] On CI, these tests run on Linux, macOS, and Windows runners to confirm platform-specific install paths work.

## 2. Task Implementation
- [ ] Implement the `setup` subcommand in the `./do` script with the following logic, executed in order:
  1. **rustup**: Check `command -v rustup`. If missing, install via `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable`. If present, skip.
  2. **Rust stable toolchain with components**: Run `rustup toolchain install stable --component rustfmt clippy llvm-tools-preview`. This is inherently idempotent — rustup skips already-installed components.
  3. **cargo-llvm-cov**: Check `cargo llvm-cov --version 2>/dev/null | grep -q '0\.6'`. If the check fails, run `cargo install cargo-llvm-cov --version 0.6 --locked`. If it passes, skip.
  4. **protoc**: Check `command -v protoc`. If missing:
     - Linux: `sudo apt-get install -y protobuf-compiler`
     - macOS: `brew install protobuf`
     - Windows: `choco install protobuf` or `winget install protobuf`
     If present, skip.
  5. **git**: Check `command -v git`. If missing, install via system package manager (same platform detection as protoc). If present, skip.
  6. **Verification pass**: After all installs, run `<tool> --version` for each tool listed in [2_TAS-REQ-014B]. If any fails, print an error to stderr and exit 1.
- [ ] Platform detection: use `uname -s` for Linux/macOS, check for `MSYSTEM` or `OS=Windows_NT` for Windows.
- [ ] All installation commands must be guarded by presence checks to satisfy [2_TAS-REQ-014A] idempotency.

## 3. Code Review
- [ ] Verify that every tool listed in [2_TAS-REQ-014B] is covered: `rustup`, Rust stable ≥ 1.80.0, `cargo-llvm-cov` 0.6, `protoc`, `git`.
- [ ] Verify no nightly Rust features are enabled or installed.
- [ ] Verify the script is POSIX sh-compatible (no bashisms) for maximum portability.
- [ ] Verify that `rust-toolchain.toml` at the repo root is respected (contains `llvm-tools-preview` component).
- [ ] Verify that running `./do setup` on a machine where everything is already installed produces zero side effects (no reinstalls, no downloads).

## 4. Run Automated Tests to Verify
- [ ] Run `./do setup` and confirm exit code 0.
- [ ] Run `./do setup` again and confirm exit code 0 with no visible install activity.
- [ ] Run the test harness from step 1 and confirm all test cases pass.

## 5. Update Documentation
- [ ] Add inline comments in the `./do` script's `setup` function documenting each tool's install method and the requirement IDs covered (`2_TAS-REQ-014A`, `2_TAS-REQ-014B`).

## 6. Automated Verification
- [ ] Run: `./do setup && echo "PASS"` — assert exit 0.
- [ ] Run: `rustc --version && cargo llvm-cov --version && protoc --version && git --version` — assert all exit 0.
- [ ] Run: `./do setup 2>&1 | tee /tmp/setup2.log && ./do setup 2>&1 | tee /tmp/setup3.log && diff /tmp/setup2.log /tmp/setup3.log` — assert identical output (idempotency).
