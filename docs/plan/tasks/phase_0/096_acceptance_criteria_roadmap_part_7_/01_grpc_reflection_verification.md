# Task: gRPC Reflection Verification (Sub-Epic: 096_Acceptance Criteria & Roadmap (Part 7))

## Covered Requirements
- [AC-ROAD-P0-006]

## Dependencies
- depends_on: [none]
- shared_components: [devs-proto]

## 1. Initial Test Written
- [ ] Create an integration test in `crates/devs-proto/tests/reflection_test.rs` that:
    - Sets up a mock gRPC server using the descriptors from `devs-proto`.
    - Uses a gRPC reflection client to query the available services.
    - Asserts that exactly these 6 services are present:
        - `devs.v1.WorkflowDefinitionService`
        - `devs.v1.RunService`
        - `devs.v1.StageService`
        - `devs.v1.LogService`
        - `devs.v1.PoolService`
        - `devs.v1.ProjectService`

## 2. Task Implementation
- [ ] Update `crates/devs-proto/build.rs` to:
    - Generate a binary file descriptor set using `tonic_build::configure().file_descriptor_set_path(...)`.
    - Ensure all `.proto` files in `proto/devs/v1/` are included in the generation.
- [ ] Update `crates/devs-proto/src/lib.rs` to:
    - Expose the generated file descriptor set as a public constant `pub const FILE_DESCRIPTOR_SET: &[u8] = ...;`.
- [ ] Ensure `tonic-reflection` is added as a dependency in `crates/devs-proto/Cargo.toml`.

## 3. Code Review
- [ ] Verify that the proto package name is correctly set to `devs.v1` in all `.proto` files.
- [ ] Ensure no service names are missing or misspelled according to [2_TAS-REQ-008].

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-proto --test reflection_test`.

## 5. Update Documentation
- [ ] Update `devs-proto/README.md` to document how to use the `FILE_DESCRIPTOR_SET` for reflection.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows [AC-ROAD-P0-006] as covered.
