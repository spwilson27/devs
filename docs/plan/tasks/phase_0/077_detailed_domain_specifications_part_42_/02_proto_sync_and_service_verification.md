# Task: Proto Sync and Service Verification (Sub-Epic: 077_Detailed Domain Specifications (Part 42))

## Covered Requirements
- [2_TAS-REQ-461], [2_TAS-REQ-462]

## Dependencies
- depends_on: ["008_proto_core_foundation/02_setup_devs_proto_crate.md"]
- shared_components: [devs-proto]

## 1. Initial Test Written
- [ ] Create a unit test `crates/devs-proto/src/lib.rs` (or `tests/test_services.rs`) that:
    - Asserts the presence of the following gRPC service traits/types in the generated code:
        - `devs_proto::devs::v1::workflow_definition_service_server::WorkflowDefinitionService`
        - `devs_proto::devs::v1::run_service_server::RunService`
        - `devs_proto::devs::v1::stage_service_server::StageService`
        - `devs_proto::devs::v1::log_service_server::LogService`
        - `devs_proto::devs::v1::pool_service_server::PoolService`
        - `devs_proto::devs::v1::project_service_server::ProjectService`
- [ ] Create a shell script test `tests/test_proto_sync.sh` that:
    - Runs `./do build` or a specific proto sync command.
    - Runs `git diff --exit-code crates/devs-proto/src/gen/` and verifies it exits with 0.

## 2. Task Implementation
- [ ] Implement the service presence unit tests in the `devs-proto` crate.
- [ ] Modify the `./do build` or `./do lint` command to include a proto sync check.
- [ ] Ensure `tonic-build` is configured to output to `crates/devs-proto/src/gen/`.
- [ ] Verify that running `cargo build -p devs-proto` updates the generated files correctly if the `.proto` files have changed.
- [ ] Ensure that all generated files are tracked by git and committed.

## 3. Code Review
- [ ] Verify that all six services required by [2_TAS-REQ-462] are accounted for.
- [ ] Ensure that `tonic-build` generation is deterministic and doesn't produce unexpected changes in CI.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-proto` and verify service presence tests pass.
- [ ] Run `bash tests/test_proto_sync.sh` after ensuring all proto changes are staged.

## 5. Update Documentation
- [ ] Update `devs-proto/README.md` to mention the mandatory sync check for all proto changes.

## 6. Automated Verification
- [ ] Verify that `grep -r "WorkflowDefinitionService" crates/devs-proto/src/gen/` returns results.
- [ ] Verify that `git ls-files crates/devs-proto/src/gen/` lists all expected generated `.rs` files.
