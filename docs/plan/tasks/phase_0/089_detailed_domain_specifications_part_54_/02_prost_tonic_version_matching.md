# Task: Prost and Tonic-Build Version Matching (Sub-Epic: 089_Detailed Domain Specifications (Part 54))

## Covered Requirements
- [2_TAS-REQ-603]

## Dependencies
- depends_on: [none]
- shared_components: [devs-proto]

## 1. Initial Test Written
- [ ] Create a check in the workspace-level `Cargo.toml` or a dedicated test `test_dependency_versions.rs` that verifies `prost` version is at least 0.13 and `tonic-build` is at least 0.12.
- [ ] Verify that there is only one version of `prost` in the dependency graph using `cargo tree`.
- [ ] Ensure that code generation from `.proto` files works correctly with these versions.

## 2. Task Implementation
- [ ] Pin `prost = "0.13"` and `tonic-build = "0.12"` in the workspace-level `Cargo.toml` (if using workspace inheritance) or in each crate's `Cargo.toml`.
- [ ] Update `devs-proto` to use these versions for Protobuf message encoding and gRPC code generation.
- [ ] Run `cargo fetch` and `cargo test -p devs-proto` to ensure compatibility.

## 3. Code Review
- [ ] Confirm that `prost` version exactly matches the requirement (0.13).
- [ ] Confirm that `tonic-build` version (0.12) is compatible and uses the same `prost` version internally.
- [ ] Ensure no duplicate versions of `prost` are pulled into the final binary.

## 4. Run Automated Tests to Verify
- [ ] Run `./do build`.
- [ ] Run `./do test -p devs-proto`.

## 5. Update Documentation
- [ ] Update `requirements.md` or a dependency manifest to reflect the pinned versions of `prost` and `tonic-build`.
- [ ] Add a note about version matching in the `devs-proto/README.md`.

## 6. Automated Verification
- [ ] Run `cargo tree -i prost` and verify that only version 0.13.x is used.
- [ ] Run `cargo tree -i tonic-build` and verify that only version 0.12.x is used.
