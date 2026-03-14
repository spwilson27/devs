# Task: Validate Workspace Builds on All Platforms with Stub Crates (Sub-Epic: 001_Workspace & Toolchain Setup)

## Covered Requirements
- [1_PRD-REQ-002], [2_TAS-REQ-003], [2_TAS-REQ-021], [2_TAS-REQ-005]

## Dependencies
- depends_on: ["02_cargo_workspace_manifest.md"]
- shared_components: []

## 1. Initial Test Written
- [ ] Write a Rust integration test in `tests/workspace_validation.rs` that:
  1. Uses `std::process::Command` to run `cargo build --workspace` and asserts exit code 0.
  2. Uses `std::process::Command` to run `cargo build --workspace --all-features` and asserts exit code 0 (per [2_TAS-REQ-004F] CI builds with `--all-features`).
  3. Uses `std::process::Command` to run `cargo clippy --workspace -- -D warnings` and asserts exit code 0.
  4. Parses `cargo metadata --format-version 1` JSON output and asserts:
     - Exactly 15 workspace members exist.
     - Each member crate name matches one of the 15 crates from [2_TAS-REQ-021].
     - No workspace member depends on `anyhow` unless it is a binary crate (name in `devs-server`, `devs-tui`, `devs-cli`, `devs-mcp-bridge`).
  5. Asserts `reqwest` resolved features do NOT include `native-tls` or `native-tls-alpn`.
  6. Annotate with `// Covers: 1_PRD-REQ-002`, `// Covers: 2_TAS-REQ-003`, `// Covers: 2_TAS-REQ-021`, `// Covers: 2_TAS-REQ-005`.

## 2. Task Implementation
- [ ] Ensure every stub crate's `src/lib.rs` or `src/main.rs` compiles cleanly with `missing_docs = "deny"` by adding top-level `//!` doc comments.
- [ ] Ensure every stub crate's `Cargo.toml` has `[lints] workspace = true`.
- [ ] For each library crate stub, create a minimal `src/lib.rs`:
  ```rust
  //! <Crate name> - <one-line description>.
  ```
- [ ] For each binary crate stub, create a minimal `src/main.rs`:
  ```rust
  //! <Crate name> - <one-line description>.
  fn main() {
      println!("stub");
  }
  ```
- [ ] Run `cargo build --workspace` and `cargo build --workspace --release` and fix any compilation errors.
- [ ] Run `cargo fmt --all -- --check` and fix any formatting issues.

## 3. Code Review
- [ ] Verify that all 15 crates are present under `crates/` with valid `Cargo.toml` and stub source files.
- [ ] Verify that no crate uses `unsafe` blocks (enforced by `unsafe_code = "deny"`).
- [ ] Verify that the workspace compiles with zero warnings under `clippy::all = deny`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --workspace` and confirm all tests pass including the new workspace validation test.
- [ ] Run `cargo build --workspace --release` and confirm release build succeeds.

## 5. Update Documentation
- [ ] No documentation updates required for this task.

## 6. Automated Verification
- [ ] Run `cargo build --workspace 2>&1; echo "EXIT: $?"` and confirm `EXIT: 0`.
- [ ] Run `cargo clippy --workspace -- -D warnings 2>&1; echo "EXIT: $?"` and confirm `EXIT: 0`.
- [ ] Run `cargo fmt --all -- --check 2>&1; echo "EXIT: $?"` and confirm `EXIT: 0`.
- [ ] Run `cargo metadata --format-version 1 | jq '[.workspace_members[] | split(" ")[0]] | sort'` and confirm the sorted list matches the 15 expected crate names.
