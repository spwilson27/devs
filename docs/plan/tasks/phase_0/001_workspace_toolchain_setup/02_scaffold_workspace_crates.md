# Task: Scaffold Workspace Crates (Sub-Epic: 001_Workspace & Toolchain Setup)

## Covered Requirements
- [1_PRD-REQ-002], [2_TAS-REQ-021]

## Dependencies
- depends_on: [01_initialize_toolchain_and_root_manifest.md]
- shared_components: [devs-proto, devs-core, devs-config, devs-checkpoint, devs-scheduler, devs-pool, devs-adapters, devs-executor, devs-webhook, devs-mcp, devs-grpc]

## 1. Initial Test Written
- [ ] Create a python script `tests/check_workspace.py` that parses the root `Cargo.toml` and verifies all 15 crates are listed in the `members` array.
- [ ] The script should also verify that each directory exists and contains a `Cargo.toml` and a `src/` directory.

## 2. Task Implementation
- [ ] Create the following library crates using `cargo new --lib <name>`:
  - `devs-proto`
  - `devs-core`
  - `devs-config`
  - `devs-checkpoint`
  - `devs-scheduler`
  - `devs-pool`
  - `devs-adapters`
  - `devs-executor`
  - `devs-webhook`
  - `devs-mcp`
  - `devs-grpc`
- [ ] Create the following binary crates using `cargo new --bin <name>`:
  - `devs-server` (produces `devs` binary)
  - `devs-tui` (produces `devs-tui` binary)
  - `devs-cli` (produces `devs` binary via subcommands, but currently a separate crate)
  - `devs-mcp-bridge` (produces `devs-mcp-bridge` binary)
- [ ] Update the root `Cargo.toml` `members` array to include all 15 crates:
  ```toml
  members = [
      "devs-proto",
      "devs-core",
      "devs-config",
      "devs-checkpoint",
      "devs-scheduler",
      "devs-pool",
      "devs-adapters",
      "devs-executor",
      "devs-webhook",
      "devs-mcp",
      "devs-grpc",
      "devs-server",
      "devs-tui",
      "devs-cli",
      "devs-mcp-bridge",
  ]
  ```
- [ ] For `devs-server` and `devs-cli`, ensure their `Cargo.toml` defines the binary name as `devs` if required, or follow the TAS mapping.

## 3. Code Review
- [ ] Verify that all 15 crates are accounted for.
- [ ] Ensure that library crates have `src/lib.rs` and binary crates have `src/main.rs`.
- [ ] Confirm no crate is defined outside the repository root.

## 4. Run Automated Tests to Verify
- [ ] Run `python3 tests/check_workspace.py`.
- [ ] Run `cargo build` (minimal build) to ensure the workspace is valid.

## 5. Update Documentation
- [ ] Document the crate structure in a high-level `ARCHITECTURE.md` or update the project description.

## 6. Automated Verification
- [ ] Run `cargo metadata --format-version 1 | jq -r '.workspace_members[]' | wc -l` and verify it returns 15.
