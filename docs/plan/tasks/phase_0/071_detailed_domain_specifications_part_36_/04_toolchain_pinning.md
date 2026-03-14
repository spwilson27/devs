# Task: Rust Toolchain Pinning via rust-toolchain.toml (Sub-Epic: 071_Detailed Domain Specifications (Part 36))

## Covered Requirements
- [2_TAS-REQ-433]

## Dependencies
- depends_on: []
- shared_components: []

## 1. Initial Test Written
- [ ] Create a test in `tests/toolchain_pinning.rs` (workspace-level integration test) or in `./do lint` logic that:
  1. Asserts the file `rust-toolchain.toml` exists at the repository root.
  2. Parses the file as TOML and asserts it contains a `[toolchain]` section with a `channel` key.
  3. Asserts the `channel` value is a valid Rust channel string (e.g., matches pattern `stable`, `nightly`, or `1.XX.X`).
  4. Add `// Covers: 2_TAS-REQ-433` annotation.
- [ ] Add a lint check in `./do lint` that verifies `rust-toolchain.toml` exists at the repo root and is valid TOML. If missing, the lint fails with a clear message: `"rust-toolchain.toml must be present at repository root (2_TAS-REQ-433)"`.

## 2. Task Implementation
- [ ] Create `rust-toolchain.toml` at the repository root (if not already present) with content:
  ```toml
  [toolchain]
  channel = "stable"
  components = ["rustfmt", "clippy"]
  ```
- [ ] Ensure the file is committed and tracked by git (not in `.gitignore`).

## 3. Code Review
- [ ] Verify `rust-toolchain.toml` is at the exact repository root (not in a subdirectory).
- [ ] Verify the file is valid TOML parseable by `rustup`.
- [ ] Verify `rustfmt` and `clippy` are listed as components so they are automatically installed.

## 4. Run Automated Tests to Verify
- [ ] Run the toolchain pinning test and confirm it passes.
- [ ] Run `./do lint` and confirm no errors related to toolchain pinning.

## 5. Update Documentation
- [ ] Add a comment at the top of `rust-toolchain.toml`: `# Pinned toolchain — required by 2_TAS-REQ-433`.

## 6. Automated Verification
- [ ] Run `./do test` and confirm the traceability scanner detects `// Covers: 2_TAS-REQ-433`.
- [ ] Run `rustup show` and confirm the active toolchain matches the pinned channel.
