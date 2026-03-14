# Task: Prost and Tonic-Build Version Matching Enforcement (Sub-Epic: 089_Detailed Domain Specifications (Part 54))

## Covered Requirements
- [2_TAS-REQ-603]

## Dependencies
- depends_on: []
- shared_components: ["devs-proto"]

## 1. Initial Test Written
- [ ] Create a test (in a workspace-level integration test or a `build_tests` module) named `test_prost_tonic_build_version_compatibility` that:
  1. Parses the workspace `Cargo.toml` (or the `devs-proto` crate's `Cargo.toml`) to extract the declared `prost` dependency version and the `tonic-build` dependency version.
  2. Asserts that the `prost` major.minor version (0.13) is compatible with the `tonic-build` version (0.12 uses prost 0.13). Specifically: resolve `tonic-build`'s transitive `prost` dependency and assert it matches the workspace-declared `prost` version.
- [ ] Alternatively, create a lint script test `test_prost_version_lint` that runs `cargo tree -p devs-proto -i prost` and asserts only one version of `prost` appears (no version conflicts / duplicates).

## 2. Task Implementation
- [ ] In the workspace `Cargo.toml`, pin `prost` and `tonic-build` versions under `[workspace.dependencies]` so all crates use the same coordinated versions. Add a comment: `# 2_TAS-REQ-603: prost version must match tonic-build's expected prost version`.
- [ ] If a `./do lint` dependency-audit step exists, add a check that runs `cargo tree --duplicates` and fails if `prost` appears more than once.

## 3. Code Review
- [ ] Verify `prost` is declared exactly once in `[workspace.dependencies]` and all crate-level `Cargo.toml` files use `prost.workspace = true`.
- [ ] Verify `tonic-build` is similarly workspace-managed.
- [ ] Confirm no crate overrides the `prost` version locally.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -- test_prost` (or the relevant test name) and confirm it passes.
- [ ] Run `cargo tree --duplicates | grep prost` and confirm no duplicate versions.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-603` annotation to the test.

## 6. Automated Verification
- [ ] Run `./do lint` and confirm no dependency-audit failures related to prost version conflicts.
- [ ] Run `grep -r "2_TAS-REQ-603" --include="*.rs" --include="*.toml"` and confirm at least one annotation exists.
