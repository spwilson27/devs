# Task: gRPC Reflection Returns All 6 Service Names (Sub-Epic: 096_Acceptance Criteria & Roadmap (Part 7))

## Covered Requirements
- [AC-ROAD-P0-006]

## Dependencies
- depends_on: [none]
- shared_components: [devs-proto]

## 1. Initial Test Written
- [ ] Create `crates/devs-proto/tests/grpc_reflection_services.rs` with the following integration test:
    - Add `// Covers: AC-ROAD-P0-006` annotation at the top of the test function.
    - Include `tonic-reflection` and `tonic` as dev-dependencies if not already present.
    - Write a test `test_reflection_lists_all_six_services()` that:
        1. Loads the `FILE_DESCRIPTOR_SET` constant from `devs_proto`.
        2. Parses it using `prost_types::FileDescriptorSet::decode(FILE_DESCRIPTOR_SET)`.
        3. Iterates `file_descriptor_set.file` and collects all `service` names, fully qualified with the package prefix `devs.v1.`.
        4. Asserts that the collected set contains exactly these 6 entries (order-independent):
            - `devs.v1.WorkflowDefinitionService`
            - `devs.v1.RunService`
            - `devs.v1.StageService`
            - `devs.v1.LogService`
            - `devs.v1.PoolService`
            - `devs.v1.ProjectService`
        5. Asserts that there are no *additional* service definitions beyond these 6 (exact count == 6).
    - Write a second test `test_reflection_server_serves_all_services()` that:
        1. Builds a `tonic_reflection::server::Builder` from the `FILE_DESCRIPTOR_SET` bytes.
        2. Starts a `tonic::transport::Server` on `127.0.0.1:0` (OS-assigned port) with only the reflection service registered.
        3. Connects a `tonic_reflection::pb::server_reflection_client::ServerReflectionClient` to the server.
        4. Sends a `ListServices` request.
        5. Asserts the response contains all 6 service names listed above.
        6. Shuts down the server cleanly.

## 2. Task Implementation
- [ ] In `crates/devs-proto/build.rs`:
    - Add `.file_descriptor_set_path(out_dir.join("devs_descriptor.bin"))` to the `tonic_build::configure()` chain.
    - Ensure all `.proto` files under `proto/devs/v1/` are compiled (glob or explicit list).
- [ ] In `crates/devs-proto/src/lib.rs`:
    - Add `pub const FILE_DESCRIPTOR_SET: &[u8] = include_bytes!(concat!(env!("OUT_DIR"), "/devs_descriptor.bin"));`.
- [ ] In `crates/devs-proto/Cargo.toml`:
    - Add `tonic-reflection` to `[dependencies]` (it is needed at runtime by server consumers).
    - Add `prost-types` to `[dev-dependencies]` if not already present (for the descriptor parsing test).
- [ ] Ensure all 6 service definitions exist in their respective `.proto` files under `proto/devs/v1/`:
    - `workflow_definition_service.proto` → `service WorkflowDefinitionService`
    - `run_service.proto` → `service RunService`
    - `stage_service.proto` → `service StageService`
    - `log_service.proto` → `service LogService`
    - `pool_service.proto` → `service PoolService`
    - `project_service.proto` → `service ProjectService`
    - Each service must have at least one RPC method defined (even if it's a placeholder `GetInfo` returning an empty response) so the descriptor includes it.
    - All `.proto` files must declare `package devs.v1;` and `syntax = "proto3";`.

## 3. Code Review
- [ ] Verify all 6 `.proto` files have `package devs.v1;` — not `devs` or any other package.
- [ ] Verify `FILE_DESCRIPTOR_SET` is `pub` and accessible from integration tests.
- [ ] Verify no wire types from `devs-proto` leak into `devs-core` public API (per [2_TAS-REQ-001G]).
- [ ] Verify `tonic-reflection` version matches the `tonic` version in the workspace (per prost/tonic version matching policy).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-proto --test grpc_reflection_services -- --nocapture`.
- [ ] Confirm both tests pass: `test_reflection_lists_all_six_services` and `test_reflection_server_serves_all_services`.

## 5. Update Documentation
- [ ] Add a doc comment on the `FILE_DESCRIPTOR_SET` constant explaining its purpose and that it is consumed by `devs-server` for gRPC reflection.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` includes `AC-ROAD-P0-006` in the covered requirements.
- [ ] Run `./do lint` to confirm no new lint violations were introduced.
