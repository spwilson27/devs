# Task: Proto Timestamp Enforcement & build.rs Rerun Directives (Sub-Epic: 059_Detailed Domain Specifications (Part 24))

## Covered Requirements
- [2_TAS-REQ-238], [2_TAS-REQ-240]

## Dependencies
- depends_on: [none]
- shared_components: [devs-proto]

## 1. Initial Test Written
- [ ] In `devs-proto/tests/proto_timestamp_policy.rs`, write a test `test_all_timestamp_fields_use_google_timestamp` that:
  - Reads every `.proto` file under `proto/devs/v1/` using `std::fs::read_dir` and `std::fs::read_to_string`.
  - For each file, parses lines looking for field declarations whose name ends in `_at` or `_time` (regex: `^\s*\w+\s+\w+(_at|_time)\s*=`).
  - Asserts that every such field's type is `google.protobuf.Timestamp`. Collect violations and assert the list is empty, printing all violating fields if not.
  - Add `// Covers: 2_TAS-REQ-238` annotation above the test.
- [ ] In `devs-proto/tests/proto_timestamp_policy.rs`, write a test `test_proto_files_import_google_timestamp` that:
  - For each `.proto` file that contains a `google.protobuf.Timestamp` field, asserts the file contains `import "google/protobuf/timestamp.proto";`.
  - Add `// Covers: 2_TAS-REQ-238` annotation.
- [ ] In `devs-proto/tests/build_rerun_directives.rs`, write a test `test_build_rs_emits_rerun_if_changed` that:
  - Reads the contents of `devs-proto/build.rs` as a string.
  - Asserts it contains `cargo:rerun-if-changed` logic (e.g., the string `rerun-if-changed`).
  - Reads all `.proto` files from `proto/devs/v1/` and asserts the `build.rs` either dynamically iterates the directory (contains `read_dir`) or lists each proto file explicitly.
  - Add `// Covers: 2_TAS-REQ-240` annotation.
- [ ] In `devs-proto/tests/build_rerun_directives.rs`, write a test `test_build_rs_disables_tonic_builtin_rerun` that:
  - Reads `devs-proto/build.rs` and asserts it contains `.emit_rerun_if_changed(false)` to prevent tonic-build from emitting its own directives that would conflict with the manual ones.
  - Add `// Covers: 2_TAS-REQ-240` annotation.

## 2. Task Implementation
- [ ] Update all `.proto` files in `proto/devs/v1/` to ensure every timestamp field (fields ending in `_at` or `_time`) uses `google.protobuf.Timestamp` type. Add `import "google/protobuf/timestamp.proto";` to any file that uses timestamp fields but lacks the import. Remove any `string` or `int64` typed timestamp fields and replace with `google.protobuf.Timestamp`.
- [ ] In `devs-proto/build.rs`, implement dynamic `.proto` file discovery:
  - Use `std::fs::read_dir("../proto/devs/v1")` to iterate all `.proto` files.
  - For each file, emit `println!("cargo:rerun-if-changed={}", path.display())`.
  - Also emit `cargo:rerun-if-changed` for the proto directory itself.
  - Call `.emit_rerun_if_changed(false)` on `tonic_build::configure()` to prevent duplicate directives.
- [ ] Ensure `prost-types` is listed as a dependency in `devs-proto/Cargo.toml` so that `prost_types::Timestamp` is available to consumers of the generated code.

## 3. Code Review
- [ ] Verify no raw `int64` or `string` timestamps remain in any `.proto` file — search for field names matching `*_at` or `*_time` and confirm their type.
- [ ] Verify `build.rs` uses dynamic directory iteration, not a hardcoded list of proto files for the rerun directives (the compile list can be explicit).
- [ ] Verify `emit_rerun_if_changed(false)` is set on the tonic-build configuration.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-proto --test proto_timestamp_policy` and confirm all tests pass.
- [ ] Run `cargo test -p devs-proto --test build_rerun_directives` and confirm all tests pass.
- [ ] Touch a `.proto` file, run `cargo build -p devs-proto`, and verify it triggers a rebuild (check build output for compilation messages).

## 5. Update Documentation
- [ ] Add doc comments to `build.rs` explaining the rerun-if-changed strategy and the `google.protobuf.Timestamp` policy.

## 6. Automated Verification
- [ ] Run `./do test` and confirm the new tests appear in output with passing status.
- [ ] Run `./do lint` and confirm no new warnings or errors are introduced.
- [ ] Verify `target/traceability.json` contains entries for `2_TAS-REQ-238` and `2_TAS-REQ-240`.
