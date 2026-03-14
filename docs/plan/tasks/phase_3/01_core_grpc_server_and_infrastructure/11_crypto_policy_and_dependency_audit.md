# Task: Cryptographic Policy Enforcement and Dependency Audit (Sub-Epic: 01_Core gRPC Server and Infrastructure)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-017], [5_SECURITY_DESIGN-REQ-019], [5_SECURITY_DESIGN-REQ-020], [5_SECURITY_DESIGN-REQ-028], [5_SECURITY_DESIGN-REQ-047], [5_SECURITY_DESIGN-REQ-052], [5_SECURITY_DESIGN-REQ-053], [5_SECURITY_DESIGN-REQ-055], [5_SECURITY_DESIGN-REQ-060], [5_SECURITY_DESIGN-REQ-061], [5_SECURITY_DESIGN-REQ-062]

## Dependencies
- depends_on: ["04_devs_server_crate_and_startup_sequence.md"]
- shared_components: ["./do Entrypoint Script & CI Pipeline (consumer)"]

## 1. Initial Test Written
- [ ] In `crates/devs-core/tests/crypto_policy_test.rs`:
  - `test_uuid_generation_is_v4`: Generate a UUID via the project's UUID helper; assert version is 4 (REQ-055).
  - `test_no_sequential_uuid_in_security_contexts`: Assert the UUID helper does not use `uuid::Uuid::new_v1()` or `new_v7()`.
- [ ] In CI/lint tests:
  - `test_cargo_audit_runs_in_lint`: Run `./do lint` and verify `cargo audit --deny warnings` is executed (REQ-060).
  - `test_audit_toml_suppressions_have_expiry`: If `audit.toml` exists, parse it and verify all suppressed advisories have an expiry date comment (REQ-062).
- [ ] In `crates/devs-core/tests/prohibited_crypto_test.rs`:
  - `test_no_md5_import`: Grep all crate sources for `md5`, `Md5`, `MD5`; assert zero matches (REQ-053).
  - `test_no_sha1_for_signing`: Grep for `sha1` usage in signing contexts; assert zero matches (REQ-053).
  - `test_no_rc4_des_usage`: Grep for `rc4`, `des`, `RC4`, `DES`; assert zero matches.
- [ ] In `crates/devs-config/tests/checkpoint_branch_test.rs`:
  - `test_default_checkpoint_branch_is_devs_state`: Assert `ProjectEntry` defaults to `devs/state` (REQ-028).
- [ ] In `crates/devs-core/tests/workspace_boundary_test.rs`:
  - `test_filesystem_mcp_workspace_boundary`: Assert MCP file operations are restricted to workspace root (REQ-052).

## 2. Task Implementation
- [ ] Add a project-wide UUID helper in `devs-core` that always uses `uuid::Uuid::new_v4()` (REQ-055). All crates must use this helper, never construct UUIDs directly.
- [ ] Add `audit.toml` at repository root. Document format: each suppression requires `# Justification: ...` and `# Expires: YYYY-MM-DD` (REQ-062).
- [ ] Ensure `./do lint` includes `cargo audit --deny warnings` (REQ-060). Verify `./do setup` installs `cargo-audit` at a pinned version.
- [ ] Add a GitLab CI job `security-audit` that runs `cargo audit` independently on every commit (REQ-061). Job must fail pipeline on any advisory.
- [ ] Add a lint check (script or test) that greps for prohibited crypto primitives (MD5, SHA-1 for signing, RC4, DES, 3DES) across all `crates/` source files (REQ-053).
- [ ] Ensure `ProjectEntry` defaults `checkpoint_branch` to `"devs/state"` and `devs project add` documents the security rationale (REQ-028).
- [ ] Document: data integrity via git SHA-1 for content addressing is acceptable (REQ-017, REQ-020, REQ-047); `devs.toml` outside workspace is blocked by workspace boundary (REQ-019); Filesystem MCP enforces workspace boundary (REQ-052).

## 3. Code Review
- [ ] Verify no direct `uuid::Uuid::new_v1()` or `new_v7()` calls anywhere in the codebase.
- [ ] Confirm `cargo audit` CI job is a separate job, not bundled into presubmit.
- [ ] Check `audit.toml` format if any suppressions exist.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- crypto` and `cargo test -p devs-core -- prohibited` with zero failures.
- [ ] Run `cargo audit --deny warnings` and confirm clean.

## 5. Update Documentation
- [ ] Add `// Covers:` annotations for all 11 REQs.

## 6. Automated Verification
- [ ] Run `./do lint` (includes cargo audit) and `./do test` with zero failures.
