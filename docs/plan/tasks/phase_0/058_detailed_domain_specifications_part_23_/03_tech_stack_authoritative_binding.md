# Task: Enforce Technology Stack Binding Constraints in Workspace Manifests (Sub-Epic: 058_Detailed Domain Specifications (Part 23))

## Covered Requirements
- [2_TAS-REQ-230]

## Dependencies
- depends_on: []
- shared_components: ["./do Entrypoint Script (Consumer — lint integration)"]

## 1. Initial Test Written
- [ ] All tests must include `// Covers: 2_TAS-REQ-230`.
- [ ] In a test script or Rust test module (`crates/devs-core/src/tech_stack_tests.rs` or a workspace-level integration test), write:
- [ ] `test_workspace_uses_rust_edition_2021`: Parse root `Cargo.toml`, assert `[workspace.package].edition = "2021"`.
- [ ] `test_workspace_resolver_is_v2`: Parse root `Cargo.toml`, assert `[workspace].resolver = "2"`.
- [ ] `test_no_crate_uses_nightly_features`: Scan all `Cargo.toml` files in workspace. Assert none contain `cargo-features` requiring nightly.
- [ ] `test_workspace_dependencies_pin_versions`: Parse `[workspace.dependencies]` in root `Cargo.toml`. For each key dependency listed in [2_TAS-REQ-230] (tokio, tonic, prost, serde, clap, ratatui, git2, reqwest, chrono, uuid, thiserror, tracing), assert the version constraint is present and pinned to a specific major.minor range.
- [ ] `test_lint_rejects_unlisted_dependency`: Create a temporary `Cargo.toml` adding a dependency NOT in the approved list (e.g., `rocket`). Run the enforcement check. Assert it fails with a clear error naming the unauthorized dependency.

## 2. Task Implementation
- [ ] Add a lint check to `./do lint` (as a shell function or standalone script `scripts/enforce_tech_stack.sh`) that:
  - Parses the root `Cargo.toml` `[workspace.dependencies]` section.
  - Compares against an allowlist of approved crates derived from [2_TAS-REQ-230].
  - For each workspace member's `Cargo.toml`, verifies all `[dependencies]` entries either reference `workspace = true` or are in the approved list.
  - Exits non-zero with a clear error if any unapproved dependency is found.
- [ ] Define the approved dependency allowlist as a simple text file `config/approved_dependencies.txt` (one crate name per line) or as a constant in the lint script.
- [ ] Ensure the root `Cargo.toml` has `[workspace.package]` with `edition = "2021"` and `resolver = "2"` — add a check for this in the lint script.
- [ ] The check should print: `ERROR: Crate 'devs-foo' uses unapproved dependency 'bar'. Per [2_TAS-REQ-230], all dependencies require explicit requirement approval.`

## 3. Code Review
- [ ] Verify the allowlist matches the dependency table from [2_TAS-REQ-230] exactly — no extra crates, no missing crates.
- [ ] Verify the check is integrated into `./do lint` so it runs on every presubmit.
- [ ] Verify error messages reference [2_TAS-REQ-230] for traceability.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` on the current workspace and confirm the tech stack check passes.
- [ ] Temporarily add an unapproved dependency to a crate, run `./do lint`, confirm it fails, then revert.

## 5. Update Documentation
- [ ] Add a comment at the top of `config/approved_dependencies.txt` (or equivalent) stating: `# Authoritative dependency list per [2_TAS-REQ-230]. Deviations require a requirement change.`

## 6. Automated Verification
- [ ] Run `./do lint` and confirm the tech stack enforcement check is present in output and passes.
- [ ] Run `./do test` and confirm zero failures.
- [ ] Grep for `// Covers: 2_TAS-REQ-230` to confirm traceability annotation in test code.
