# Task: Implement Idempotent Toolchain Setup (Sub-Epic: 026_Foundational Technical Requirements (Part 17))

## Covered Requirements
- [2_TAS-REQ-014A], [2_TAS-REQ-014B]

## Dependencies
- depends_on: [none]
- shared_components: ["./do Entrypoint Script"]

## 1. Initial Test Written
- [ ] Create a test script that runs `./do setup` multiple times and verifies it passes each time without errors or warnings.
- [ ] Create a test that verifies `rustc --version`, `cargo-llvm-cov --version`, `protoc --version`, and `git --version` all match the required versions after setup.

## 2. Task Implementation
- [ ] Implement the `setup` subcommand in `./do`:
    - Check for `rustup` presence. Install via `sh <(curl https://sh.rustup.rs -sSf) -y --default-toolchain stable` if missing.
    - Set the toolchain to `stable 1.80.0` or higher, including `rustfmt`, `clippy`, and `llvm-tools-preview`.
    - Install `cargo-llvm-cov 0.6` via `cargo install cargo-llvm-cov --version 0.6 --locked`. Skip if already present at version 0.6.
    - Check for `protoc` (Protocol Buffers compiler). Install via `apt`, `brew`, or direct binary download based on the platform. Skip if version matches requirements.
    - Check for `git`. Install if missing. Skip if present.
- [ ] Ensure all tool installation commands are idempotent (e.g., check `which` and `--version` before acting).

## 3. Code Review
- [ ] Verify that `rust-toolchain.toml` is respected and contains the `llvm-tools-preview` component as per `2_TAS-REQ-004`.
- [ ] Ensure the script handles Linux, macOS, and Windows runners as per `2_TAS-REQ-010`.
- [ ] Ensure no nightly features are enabled in the installed toolchain as per `2_TAS-REQ-003`.

## 4. Run Automated Tests to Verify
- [ ] Run `./do setup` on a clean environment or container and verify all tools are correctly installed.
- [ ] Run `./do setup` again on the same environment and ensure it no-ops silently or reports that tools are already present.

## 5. Update Documentation
- [ ] Document the successful implementation of the idempotent setup in agent memory.

## 6. Automated Verification
- [ ] Verify that `./do setup` exit code is 0 after successful completion.
- [ ] Verify that all installed tools are reachable in the current shell path.
