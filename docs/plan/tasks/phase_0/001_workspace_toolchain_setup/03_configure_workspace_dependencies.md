# Task: Configure Authoritative Workspace Dependencies (Sub-Epic: 001_Workspace & Toolchain Setup)

## Covered Requirements
- [2_TAS-REQ-005]

## Dependencies
- depends_on: [02_scaffold_workspace_crates.md]
- shared_components: [none]

## 1. Initial Test Written
- [ ] Create a script `tests/verify_dependencies.sh` that runs `cargo metadata` and checks that the resolved versions for key crates (tokio, tonic, prost, etc.) match the versions specified in [2_TAS-REQ-005].
- [ ] Verify that `anyhow` is NOT present in any library crate's dependencies.

## 2. Task Implementation
- [ ] Add `[workspace.dependencies]` to the root `Cargo.toml` with the following entries and features:
  - `tokio = { version = "1.38", features = ["full"] }`
  - `tonic = { version = "0.12", features = ["transport", "codegen"] }`
  - `prost = { version = "0.13", features = ["derive"] }`
  - `tonic-reflection = { version = "0.12", features = ["server"] }`
  - `ratatui = { version = "0.28", features = ["crossterm"] }`
  - `crossterm = "0.28"`
  - `clap = { version = "4.5", features = ["derive", "env"] }`
  - `serde = { version = "1.0", features = ["derive"] }`
  - `serde_json = "1.0"`
  - `toml = { version = "0.8", features = ["serde"] }`
  - `serde_yaml = "0.9"`
  - `uuid = { version = "1.10", features = ["v4", "serde"] }`
  - `git2 = { version = "0.19", features = ["ssh", "https"] }`
  - `reqwest = { version = "0.12", features = ["json", "rustls-tls"], default-features = false }`
  - `tracing = "0.1"`
  - `tracing-subscriber = { version = "0.3", features = ["env-filter", "json"] }`
  - `portable-pty = "0.8"`
  - `tokio-stream = { version = "0.1", features = ["sync"] }`
  - `handlebars = "6.0"`
  - `chrono = { version = "0.4", features = ["serde"] }`
  - `tempfile = "3.12"`
  - `bytes = "1.7"`
  - `thiserror = "1.0"`
  - `anyhow = "1.0"`
- [ ] Update each crate's `Cargo.toml` to inherit dependencies where appropriate (e.g., `serde = { workspace = true }`).
- [ ] Ensure `reqwest` has `default-features = false` and uses `rustls-tls` to satisfy [2_TAS-REQ-006].

## 3. Code Review
- [ ] Confirm `anyhow` is only inherited by binary crates (`devs-server`, `devs-tui`, `devs-cli`, `devs-mcp-bridge`).
- [ ] Confirm `thiserror` is used by library crates.
- [ ] Verify `rustls-tls` is the only TLS backend for `reqwest`.

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/verify_dependencies.sh`.
- [ ] Run `cargo check --workspace` to ensure all crates can find their dependencies.

## 5. Update Documentation
- [ ] Update the internal "memory" or `GEMINI.md` to reflect that authoritative versions are now locked in the workspace.

## 6. Automated Verification
- [ ] Run `cargo metadata --format-version 1 | jq '.packages[] | select(.name == "reqwest") | .features' | grep -v "native-tls"` to ensure no native-tls is present.
