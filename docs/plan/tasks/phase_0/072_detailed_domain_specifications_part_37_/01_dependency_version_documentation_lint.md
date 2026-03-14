# Task: Dependency Version Documentation Lint (Sub-Epic: 072_Detailed Domain Specifications (Part 37))

## Covered Requirements
- [2_TAS-REQ-435]

## Dependencies
- depends_on: ["none"]
- shared_components: ["./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] Create a test in `tests/lint/dependency_doc_test.rs` (or equivalent test location) that:
  1. Parses every `Cargo.toml` in the workspace and collects all `[dependencies]`, `[dev-dependencies]`, and `[build-dependencies]` entries with their version constraints.
  2. Parses the authoritative version table in `docs/plan/specs/2_tas.md` §2.2 (or wherever the canonical dependency table lives) and collects all documented crate names.
  3. Asserts that every dependency found in any workspace `Cargo.toml` has a corresponding entry in the authoritative version table. The test must fail with a clear message listing each undocumented dependency.
  4. Asserts the reverse is also useful as a warning: any entry in the version table that is no longer used by any workspace member should produce a warning (not a failure).
- [ ] Write a unit test that given a mock `Cargo.toml` content string and a mock version-table string, the checker correctly identifies missing entries.

## 2. Task Implementation
- [ ] Implement a lint check (as a Rust integration test or a shell script invoked by `./do lint`) that:
  1. Uses `cargo_metadata` or direct TOML parsing to enumerate all workspace member dependencies.
  2. Parses the authoritative version table document (§2.2 of TAS) to extract documented dependency names.
  3. Computes the set difference: dependencies present in `Cargo.toml` files but absent from the version table.
  4. Exits with a non-zero status and prints each undocumented dependency if any are found.
- [ ] Integrate this check into `./do lint` so it runs as part of the standard lint pipeline.

## 3. Code Review
- [ ] Verify the lint correctly handles workspace-level `[workspace.dependencies]` entries and per-crate overrides.
- [ ] Verify the lint does not false-positive on path dependencies (workspace member references like `devs-core = { path = "../devs-core" }`).
- [ ] Ensure error messages are actionable: they should name the crate and the `Cargo.toml` file where it was found.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test dependency_doc_test` (or the equivalent test target) and confirm all tests pass.
- [ ] Run `./do lint` and confirm the dependency documentation check executes without error on the current workspace.

## 5. Update Documentation
- [ ] Add a `// Covers: 2_TAS-REQ-435` annotation to each test function.
- [ ] Document the lint check in the `./do` script's help text or inline comments so future developers know it exists.

## 6. Automated Verification
- [ ] Run `./do lint` end-to-end and verify exit code 0.
- [ ] Temporarily add a fake dependency to a `Cargo.toml` without updating the version table, run the lint, and confirm it fails with the expected error message. Then revert the change.
