# Task: Create rust-toolchain.toml with Stable Rust Pinning (Sub-Epic: 001_Workspace & Toolchain Setup)

## Covered Requirements
- [2_TAS-REQ-003], [2_TAS-REQ-004]

## Dependencies
- depends_on: [none]
- shared_components: []

## 1. Initial Test Written
- [ ] Create a shell-based test script at `tests/phase_0/test_toolchain.sh` that verifies:
  1. `rust-toolchain.toml` exists at the repository root.
  2. The file contains `channel = "stable"` (parsed via grep or toml-aware check).
  3. The components list includes `"rustfmt"`, `"clippy"`, and `"llvm-tools-preview"`.
  4. Running `rustc --version` outputs a version >= 1.80.0.
  5. No nightly-only features or attributes exist in any `.rs` file under `crates/` (grep for `#![feature(` in non-test code paths).
- [ ] Write a Rust integration test in a suitable location (e.g., `tests/workspace_checks.rs` or `crates/devs-core/tests/toolchain.rs`) that:
  1. Reads `rust-toolchain.toml` from the repo root using `std::fs::read_to_string`.
  2. Parses it as TOML and asserts `toolchain.channel == "stable"`.
  3. Asserts `toolchain.components` contains `["rustfmt", "clippy", "llvm-tools-preview"]`.
  4. Annotate with `// Covers: 2_TAS-REQ-003` and `// Covers: 2_TAS-REQ-004`.

## 2. Task Implementation
- [ ] Create `rust-toolchain.toml` at the repository root with the following exact content:
  ```toml
  [toolchain]
  channel = "stable"
  components = ["rustfmt", "clippy", "llvm-tools-preview"]
  ```
- [ ] Verify that `rustup show` reflects the pinned toolchain after creating the file.
- [ ] Ensure no workspace crate uses `#![feature(...)]` in any non-dev code path.

## 3. Code Review
- [ ] Confirm the file uses exact field names and values from [2_TAS-REQ-004] specification.
- [ ] Verify no `profile` or `targets` fields are present unless required — keep minimal.
- [ ] Ensure the `llvm-tools-preview` component is present (required by `cargo-llvm-cov` per [2_TAS-REQ-004]).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test` (or the specific test) and confirm the toolchain assertion test passes.
- [ ] Run `rustc --version` and confirm output is >= 1.80.0.

## 5. Update Documentation
- [ ] No documentation updates required for this task.

## 6. Automated Verification
- [ ] Run `cat rust-toolchain.toml` and verify the output matches the spec.
- [ ] Run `rustup show active-toolchain` and confirm it shows `stable-*`.
- [ ] Run `grep -r '#!\[feature(' crates/ --include='*.rs'` and confirm zero matches (excluding test code).
