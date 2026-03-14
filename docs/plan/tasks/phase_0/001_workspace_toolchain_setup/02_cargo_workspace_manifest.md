# Task: Create Root Cargo.toml Workspace Manifest (Sub-Epic: 001_Workspace & Toolchain Setup)

## Covered Requirements
- [1_PRD-REQ-002], [2_TAS-REQ-021], [2_TAS-REQ-004], [2_TAS-REQ-005]

## Dependencies
- depends_on: [01_rust_toolchain_pinning.md]
- shared_components: []

## 1. Initial Test Written
- [ ] Write a Rust integration test (e.g., `tests/workspace_checks.rs`) that:
  1. Reads the root `Cargo.toml` and parses it as TOML.
  2. Asserts `workspace.resolver` equals `"2"`.
  3. Asserts `workspace.members` contains all 15 crates: `devs-proto`, `devs-core`, `devs-config`, `devs-checkpoint`, `devs-scheduler`, `devs-pool`, `devs-adapters`, `devs-executor`, `devs-webhook`, `devs-mcp`, `devs-grpc`, `devs-server`, `devs-tui`, `devs-cli`, `devs-mcp-bridge`.
  4. Asserts `workspace.lints.rust.unsafe_code` equals `"deny"`.
  5. Asserts `workspace.lints.rust.missing_docs` equals `"deny"`.
  6. Asserts `workspace.lints.rust.unused_must_use` equals `"deny"`.
  7. Asserts `workspace.lints.clippy.all` is set to `deny` with priority `-1`.
  8. Asserts `workspace.lints.clippy.pedantic` is set to `warn` with priority `-1`.
  9. Asserts `profile.dev`, `profile.test`, and `profile.release` sections exist.
  10. Asserts `workspace.dependencies` contains entries for the authoritative crates from [2_TAS-REQ-005]: `tokio`, `tonic`, `prost`, `serde`, `serde_json`, `clap`, `uuid`, `tracing`, `thiserror`, etc. with correct versions and features.
  11. Asserts `anyhow` is NOT in `workspace.dependencies` (it goes only in binary crate deps).
  12. Annotate with `// Covers: 1_PRD-REQ-002`, `// Covers: 2_TAS-REQ-021`, `// Covers: 2_TAS-REQ-004`, `// Covers: 2_TAS-REQ-005`.

## 2. Task Implementation
- [ ] Create the root `Cargo.toml` with:
  - `[workspace]` section with `resolver = "2"` and all 15 member crates listed under `members` using `crates/*` glob or explicit paths.
  - `[workspace.lints.rust]` section with `missing_docs = "deny"`, `unsafe_code = "deny"`, `unused_must_use = "deny"`, `dead_code = "warn"`.
  - `[workspace.lints.clippy]` section with `all = { level = "deny", priority = -1 }`, `pedantic = { level = "warn", priority = -1 }`.
  - `[workspace.dependencies]` section listing every dependency from [2_TAS-REQ-005] with exact versions and feature flags:
    - `tokio = { version = "1.38", features = ["full"] }`
    - `tonic = { version = "0.12", features = ["transport", "codegen"] }`
    - `prost = { version = "0.13", features = ["derive"] }`
    - `tonic-build = { version = "0.12" }`
    - `tonic-reflection = { version = "0.12", features = ["server"] }`
    - `ratatui = { version = "0.28", features = ["crossterm"] }`
    - `crossterm = { version = "0.28" }`
    - `clap = { version = "4.5", features = ["derive", "env"] }`
    - `serde = { version = "1.0", features = ["derive"] }`
    - `serde_json = { version = "1.0" }`
    - `toml = { version = "0.8", features = ["serde"] }`  (note: this is the toml parsing dep, not the file format)
    - `serde_yaml = { version = "0.9" }`
    - `uuid = { version = "1.10", features = ["v4", "serde"] }`
    - `git2 = { version = "0.19", features = ["ssh", "https"] }`
    - `reqwest = { version = "0.12", features = ["json", "rustls-tls"], default-features = false }`
    - `tracing = { version = "0.1" }`
    - `tracing-subscriber = { version = "0.3", features = ["env-filter", "json"] }`
    - `portable-pty = { version = "0.8" }`
    - `tokio-stream = { version = "0.1", features = ["sync"] }`
    - `handlebars = { version = "6.0" }`
    - `chrono = { version = "0.4", features = ["serde"] }`
    - `tempfile = { version = "3.12" }`
    - `bytes = { version = "1.7" }`
    - `thiserror = { version = "1.0" }`
  - `[workspace.dev-dependencies]` for dev-only deps: `cargo-llvm-cov`, `insta`, `mockall`, `bollard`, `wiremock`, `assert_cmd`, `predicates`, `tokio-test`, `rstest`.
  - `[profile.dev]` — default or minimal overrides.
  - `[profile.test]` — default or minimal overrides.
  - `[profile.release]` — `lto = true`, `strip = true` or similar optimizations.
- [ ] Create stub `Cargo.toml` files for all 15 member crates under `crates/<name>/Cargo.toml` with:
  - `[package]` section with `name`, `version = "0.1.0"`, `edition = "2021"`.
  - `[lints] workspace = true`.
  - Minimal `[dependencies]` (empty or with only `thiserror` for library crates).
  - Binary crates (`devs-server`, `devs-tui`, `devs-cli`, `devs-mcp-bridge`) include `anyhow = "1.0"` in their local `[dependencies]`.
- [ ] Create stub `src/lib.rs` (for library crates) or `src/main.rs` (for binary crates) with a doc comment and `#![doc = "..."]` or `//!` module doc to satisfy `missing_docs = "deny"`.
- [ ] Verify `cargo build --workspace` succeeds.

## 3. Code Review
- [ ] Confirm `resolver = "2"` is set (required by [2_TAS-REQ-004D]).
- [ ] Confirm `unsafe_code = "deny"` is in the workspace lint table (required by [2_TAS-REQ-004B]).
- [ ] Confirm `reqwest` uses `default-features = false` with only `json` and `rustls-tls` (no `native-tls`).
- [ ] Confirm `anyhow` appears ONLY in binary crate `Cargo.toml` files, not in workspace dependencies or library crates.
- [ ] Confirm all 15 crates from [2_TAS-REQ-021] are listed as workspace members.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo build --workspace` and confirm it compiles with zero errors.
- [ ] Run `cargo test --workspace` and confirm the workspace structure tests pass.
- [ ] Run `cargo clippy --workspace -- -D warnings` and confirm zero warnings.

## 5. Update Documentation
- [ ] No documentation updates required for this task.

## 6. Automated Verification
- [ ] Run `cargo metadata --format-version 1 | jq '.workspace_members | length'` and confirm it returns 15.
- [ ] Run `cargo tree -p devs-core | grep -E 'tokio|git2|reqwest|tonic'` and confirm zero matches (forbidden deps check for devs-core).
- [ ] Run `grep -l 'anyhow' crates/*/Cargo.toml` and confirm results are only binary crates: `devs-server`, `devs-tui`, `devs-cli`, `devs-mcp-bridge`.
