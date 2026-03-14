# Task: Enforce anyhow Restriction to Binary Crates Only (Sub-Epic: 022_Foundational Technical Requirements (Part 13))

## Covered Requirements
- [2_TAS-REQ-005A]

## Dependencies
- depends_on: []
- shared_components: ["./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] Write a lint script test that parses each workspace member's `Cargo.toml` and asserts that `anyhow` appears only in `[dependencies]` of binary crates (`devs-server`, `devs-tui`, `devs-cli`, `devs-mcp-bridge`) and never in library crates (`devs-core`, `devs-config`, `devs-checkpoint`, `devs-adapters`, `devs-pool`, `devs-executor`, `devs-scheduler`, `devs-webhook`, `devs-grpc`, `devs-mcp`, `devs-proto`)
- [ ] Write a negative test: temporarily add `anyhow` to a library crate's `[dependencies]` in `Cargo.toml`, run the lint check, and assert it fails with a clear error message identifying the offending crate
- [ ] Write a test that confirms all library crates use `thiserror` in their `[dependencies]` and expose domain-specific error types (not `anyhow::Error`) in their public API

## 2. Task Implementation
- [ ] Add a step to `./do lint` that iterates over all workspace members, determines if each is a library or binary crate (by checking for `[[bin]]` or `src/main.rs`), and fails if any library crate lists `anyhow` in its `[dependencies]`
- [ ] Implementation approach: use `cargo metadata --format-version 1 --no-deps` to get the list of workspace members and their manifest paths; for each, parse `Cargo.toml` and check for `anyhow` in `[dependencies]` (not `[dev-dependencies]`)
- [ ] Ensure the check distinguishes `[dependencies]` from `[dev-dependencies]` — `anyhow` in `[dev-dependencies]` of library crates is acceptable for test helpers
- [ ] Remove `anyhow` from any library crate `[dependencies]` if present, replacing with `thiserror`-based error types

## 3. Code Review
- [ ] Verify the lint script correctly classifies binary vs library crates
- [ ] Verify the script handles workspace members that have both `lib` and `bin` targets (these count as binary crates)
- [ ] Verify error messages clearly identify which crate violated the constraint

## 4. Run Automated Tests to Verify
- [ ] Run the anyhow-restriction lint step and confirm exit code 0
- [ ] Run the negative test and confirm it correctly detects the violation

## 5. Update Documentation
- [ ] Document the anyhow restriction policy in development docs: library crates must use `thiserror`, only binary crates may use `anyhow`

## 6. Automated Verification
- [ ] Run `./do lint` end-to-end and confirm exit code 0
- [ ] Run `grep -r 'anyhow' --include="Cargo.toml" crates/devs-core/ crates/devs-config/ crates/devs-proto/` (and all other library crates) and confirm no matches in `[dependencies]` sections
