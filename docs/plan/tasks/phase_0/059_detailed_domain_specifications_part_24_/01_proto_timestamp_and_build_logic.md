# Task: Proto Infrastructure & Timestamp Refinement (Sub-Epic: 059_Detailed Domain Specifications (Part 24))

## Covered Requirements
- [2_TAS-REQ-238], [2_TAS-REQ-240], [2_TAS-REQ-244]

## Dependencies
- depends_on: [none]
- shared_components: [devs-proto]

## 1. Initial Test Written
- [ ] Create a shell script `tests/verify_proto_infrastructure.sh` that:
    - Scans all `.proto` files in `proto/devs/v1/` and ensures that any field related to time (ending in `_at` or `_time`) uses `google.protobuf.Timestamp`.
    - Checks `devs-proto/build.rs` for the presence of `println!("cargo:rerun-if-changed=...")` for each proto file or the proto directory.
    - Simulates the absence of `protoc` (by shadowing the PATH) and verifies that `cargo build -p devs-proto` emits a `cargo:warning=protoc not found` and does not fail.

## 2. Task Implementation
- [ ] Update all `.proto` files in `proto/devs/v1/` (e.g., `common.proto`, `run.proto`, `stage.proto`):
    - Import `google/protobuf/timestamp.proto`.
    - Change types like `int64` or `string` used for timestamps to `google.protobuf.Timestamp`.
- [ ] Modify `devs-proto/build.rs`:
    - Use `std::fs::read_dir` to iterate over `proto/devs/v1/*.proto` and emit `cargo:rerun-if-changed` for each file.
    - Implement `protoc` detection logic: attempt to run `protoc --version`. If it fails, print `cargo:warning=protoc not found; using committed generated files.` and return `Ok(())` without calling `tonic_build`.
- [ ] Ensure that `tonic-build` is configured to map `google.protobuf.Timestamp` to `prost_types::Timestamp`.

## 3. Code Review
- [ ] Verify that no raw `int64` or `string` timestamps remain in any `.proto` file.
- [ ] Verify that `build.rs` does not hardcode proto filenames but discovers them dynamically to prevent future omissions.
- [ ] Confirm that `build.rs` logic for `protoc` absence matches the requirement exactly.

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/verify_proto_infrastructure.sh`.
- [ ] Run `cargo build -p devs-proto` and verify it rebuilds when a proto file is touched.
- [ ] Run `cargo build -p devs-proto` with `protoc` removed from PATH and verify the warning.

## 5. Update Documentation
- [ ] Update `devs-proto/README.md` to document the requirement for `google.protobuf.Timestamp` and the `protoc` fallback behavior.

## 6. Automated Verification
- [ ] Run `./do lint` and ensure no documentation or clippy errors are introduced.
- [ ] Run `./do test` and ensure `target/traceability.json` reflects coverage for the listed requirements.
