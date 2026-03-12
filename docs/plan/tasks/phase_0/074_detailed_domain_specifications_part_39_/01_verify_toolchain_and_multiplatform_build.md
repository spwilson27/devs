# Task: Verify Toolchain and Multi-Platform Build (Sub-Epic: 074_Detailed Domain Specifications (Part 39))

## Covered Requirements
- [2_TAS-REQ-445], [2_TAS-REQ-446]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a shell script `tests/verify_acceptance_build.sh` that:
  - Asserts `rust-toolchain.toml` exists at the repository root.
  - Checks if `cat rust-toolchain.toml | grep 'channel = "stable"'` exits 0.
  - Verifies that `cargo build --workspace --all-features` can be executed.
  - Note: Multi-platform execution is handled by CI runners (Linux, macOS, Windows) as per REQ-446.

## 2. Task Implementation
- [ ] Implement a manual verification step or a script to confirm the `rust-toolchain.toml` content exactly matches the requirements of [2_TAS-REQ-445]:
  - `channel = "stable"`
  - components includes `"rustfmt"`, `"clippy"`, `"llvm-tools-preview"`.
- [ ] Ensure the `./do build` command (which runs `cargo build --workspace --all-features`) is fully functional.
- [ ] Trigger the CI pipeline (if available) and confirm that the `presubmit-linux`, `presubmit-macos`, and `presubmit-windows` jobs all successfully execute the workspace build as per [2_TAS-REQ-446].

## 3. Code Review
- [ ] Verify that `rust-toolchain.toml` is at the root and not in a subdirectory.
- [ ] Confirm that `cargo build` is being run with `--workspace` and `--all-features` to ensure exhaustive compilation of all components.

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/verify_acceptance_build.sh` on the local machine.
- [ ] Check CI logs for successful build completion across all three targeted platforms.

## 5. Update Documentation
- [ ] Update `GEMINI.md` or a status file to record that Technology Stack Acceptance Criteria for Build and Toolchain (REQ-445, REQ-446) have been verified.

## 6. Automated Verification
- [ ] Run `cargo build --workspace --all-features` and ensure it exits 0.
- [ ] Verify `cat rust-toolchain.toml | grep 'channel = "stable"'` returns the expected line.
