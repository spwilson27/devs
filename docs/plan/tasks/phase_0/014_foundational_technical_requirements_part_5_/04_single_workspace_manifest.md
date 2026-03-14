# Task: Single Cargo Workspace Manifest Enforcement (Sub-Epic: 014_Foundational Technical Requirements (Part 5))

## Covered Requirements
- [2_TAS-REQ-001D]

## Dependencies
- depends_on: []
- shared_components: [./do Entrypoint Script & CI Pipeline (consumer)]

## 1. Initial Test Written
- [ ] In a workspace-level integration test file `tests/workspace_manifest.rs`, write a test annotated `// Covers: 2_TAS-REQ-001D` that reads the root `Cargo.toml`, parses it with `toml` crate, and asserts:
  1. A `[workspace]` key exists at the top level.
  2. The `workspace.members` array contains all expected crate directory names (devs-core, devs-proto, devs-config, devs-checkpoint, devs-adapters, devs-pool, devs-executor, devs-scheduler, devs-webhook, devs-grpc, devs-mcp, devs-server, devs-cli, devs-tui, devs-mcp-bridge).
  3. The `workspace.resolver` field is set to `"2"`.
- [ ] Write a second test that iterates every `*/Cargo.toml` matching workspace members, parses each, and asserts that no library crate's `[dependencies]` (non-dev) references a crate outside the workspace members list OR the approved third-party crates from the TAS §2.2 list. Use `cargo metadata --format-version 1` to get the dependency graph and check each edge.

## 2. Task Implementation
- [ ] Ensure the root `Cargo.toml` has `[workspace]` with `members` listing all 15 crates, `resolver = "2"`, workspace lint table, and Cargo profiles (dev, test, release).
- [ ] For each crate, ensure its `Cargo.toml` exists with at minimum a `[package]` section and `name` matching the directory.
- [ ] Add a step in `./do lint` that runs `cargo metadata --format-version 1 --no-deps` and verifies the workspace member count equals the expected number. This catches accidentally excluded crates.

## 3. Code Review
- [ ] Verify no second `Cargo.toml` with `[workspace]` exists anywhere in the repo (only root).
- [ ] Confirm all crate directories listed in `workspace.members` actually exist on disk.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test workspace_manifest` and confirm all tests pass.
- [ ] Run `cargo build --workspace` to verify the workspace compiles.

## 5. Update Documentation
- [ ] Ensure root `Cargo.toml` has a comment referencing the single-workspace requirement [2_TAS-REQ-001D].

## 6. Automated Verification
- [ ] Run `cargo build --workspace && cargo test --test workspace_manifest` and confirm exit code 0.
- [ ] Grep test source for `// Covers: 2_TAS-REQ-001D` to confirm traceability annotation.
