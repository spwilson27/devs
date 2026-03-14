# Task: Enforce anyhow Restriction to Binary Crates Only (Sub-Epic: 058_Detailed Domain Specifications (Part 23))

## Covered Requirements
- [2_TAS-REQ-234]

## Dependencies
- depends_on: ["none"]
- shared_components: ["./do Entrypoint Script (Consumer — lint integration)"]

## 1. Initial Test Written
- [ ] All tests must include `// Covers: 2_TAS-REQ-234`.
- [ ] Write a shell-based test script `scripts/test_anyhow_lint.sh` (or integration test) with these cases:
- [ ] `test_library_crate_with_anyhow_dependency_fails`: Create a temp directory with a `Cargo.toml` containing `[lib]` and `[dependencies] anyhow = "1.0"`. Run the enforcement check against it. Assert exit code is non-zero and stderr contains the crate name.
- [ ] `test_binary_crate_with_anyhow_dependency_passes`: Create a temp directory with `Cargo.toml` containing `[[bin]] name = "foo"` and `[dependencies] anyhow = "1.0"`. Run the enforcement check. Assert exit code is zero.
- [ ] `test_library_crate_with_anyhow_in_dev_deps_passes`: Create a temp `Cargo.toml` with `[lib]` and `[dev-dependencies] anyhow = "1.0"` (but NOT in `[dependencies]`). Assert the check passes — `[dev-dependencies]` is allowed.
- [ ] `test_library_crate_with_anyhow_in_build_deps_fails`: Create a temp `Cargo.toml` with `[lib]` and `[build-dependencies] anyhow = "1.0"`. Assert the check fails.
- [ ] `test_workspace_member_classification`: For the actual workspace, assert that crates `devs-core`, `devs-pool`, `devs-checkpoint`, `devs-adapters`, `devs-executor`, `devs-scheduler`, `devs-webhook`, `devs-config`, `devs-proto` are classified as library crates, and `devs-server`, `devs-tui`, `devs-cli`, `devs-mcp-bridge` are classified as binary crates.

## 2. Task Implementation
- [ ] Create `scripts/enforce_anyhow_restriction.sh` (POSIX sh compatible):
  - For each `Cargo.toml` in the workspace (found via `cargo metadata --no-deps --format-version 1 | jq` or by globbing `crates/*/Cargo.toml`):
    - Determine if crate is a library: check for `[lib]` section OR absence of `[[bin]]` section with presence of `src/lib.rs`.
    - If library crate: parse `[dependencies]` and `[build-dependencies]` sections. Check if `anyhow` appears as a key.
    - If found: print `ERROR: Library crate '<crate_name>' has 'anyhow' in [dependencies]. Per [2_TAS-REQ-234], anyhow MUST NOT appear in library crate dependencies. Use thiserror for typed errors instead.` and set a failure flag.
  - Exit non-zero if any violations found.
- [ ] Integrate into `./do lint` by adding a call to `scripts/enforce_anyhow_restriction.sh` in the lint function.
- [ ] The binary crates allowed to use `anyhow` are exactly: `devs-server`, `devs-tui`, `devs-cli`, `devs-mcp-bridge`.

## 3. Code Review
- [ ] Verify the library vs binary classification logic handles edge cases: a crate with both `[lib]` and `[[bin]]` is treated as having a library component (anyhow banned in its `[dependencies]`).
- [ ] Verify `[dev-dependencies]` is NOT checked — anyhow in dev-deps is acceptable per [2_TAS-REQ-234] which only restricts `[dependencies]`.
- [ ] Verify the script is POSIX sh compatible (no bashisms) per the `./do` script standards.
- [ ] Verify error messages include the crate name and the requirement ID.

## 4. Run Automated Tests to Verify
- [ ] Run `scripts/test_anyhow_lint.sh` (or equivalent) and confirm all test cases pass.
- [ ] Run `./do lint` on the workspace and confirm the anyhow check passes (no violations in current codebase).

## 5. Update Documentation
- [ ] Add a comment at the top of `scripts/enforce_anyhow_restriction.sh`: `# Enforces [2_TAS-REQ-234]: anyhow restricted to binary crates only.`

## 6. Automated Verification
- [ ] Run `./do lint` and confirm the anyhow restriction check appears in output and passes.
- [ ] Run `./do test` and confirm zero failures.
- [ ] Grep for `// Covers: 2_TAS-REQ-234` to confirm traceability annotation in test code.
