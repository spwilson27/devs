# Task: Initialize Rust Toolchain and Root Workspace Manifest (Sub-Epic: 001_Workspace & Toolchain Setup)

## Covered Requirements
- [2_TAS-REQ-003], [2_TAS-REQ-004]

## Dependencies
- depends_on: [none]
- shared_components: [none]

## 1. Initial Test Written
- [ ] Create a shell script `tests/verify_toolchain.sh` that checks if `rust-toolchain.toml` exists and contains the correct channel and components.
- [ ] The script should verify that `rustc --version` returns at least `1.80.0`.
- [ ] Create a temporary `Cargo.toml` and verify that the toolchain is correctly picked up by `cargo --version`.

## 2. Task Implementation
- [ ] Create `rust-toolchain.toml` at the repository root with the following content:
  ```toml
  [toolchain]
  channel = "stable"
  components = ["rustfmt", "clippy", "llvm-tools-preview"]
  ```
- [ ] Initialize the root `Cargo.toml` as a workspace manifest:
  ```toml
  [workspace]
  resolver = "2"
  members = []
  ```
- [ ] Ensure no `src` directory exists at the root, as it is a pure workspace.

## 3. Code Review
- [ ] Verify that `resolver = "2"` is present in the root `Cargo.toml` to satisfy [2_TAS-REQ-004D].
- [ ] Confirm that `llvm-tools-preview` is included in the toolchain components.
- [ ] Verify that the toolchain is pinned to `"stable"`.

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/verify_toolchain.sh`.
- [ ] Run `rustup show` and confirm the active toolchain matches the file.

## 5. Update Documentation
- [ ] Update `README.md` (if it exists) to note the required Rust version (1.80.0+).

## 6. Automated Verification
- [ ] Run `cargo --version` and ensure it doesn't prompt for toolchain installation.
- [ ] Verify that `rustc --version` output contains `1.80` or higher.
