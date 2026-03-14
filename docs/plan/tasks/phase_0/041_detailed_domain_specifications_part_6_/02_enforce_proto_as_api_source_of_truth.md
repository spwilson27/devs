# Task: Enforce gRPC Proto Files as Versioned API Source of Truth (Sub-Epic: 041_Detailed Domain Specifications (Part 6))

## Covered Requirements
- [1_PRD-REQ-061]

## Dependencies
- depends_on: ["01_enforce_no_web_and_no_auth_policy.md"]
- shared_components: [devs-proto]

## 1. Initial Test Written
- [ ] Create `crates/devs-core/tests/architecture_proto_authority.rs` with the following tests:
  - `test_proto_files_exist_in_canonical_location`: Assert that the `proto/devs/v1/` directory exists and contains at least one `.proto` file. Tag with `// Covers: 1_PRD-REQ-061`.
  - `test_no_alternative_api_description_files`: Walk the repository (excluding `target/`, `.git/`) and assert no `.thrift`, `.avsc` (Avro), `.fbs` (FlatBuffers), or GraphQL `.graphql`/`.gql` schema files exist that define service APIs. Tag with `// Covers: 1_PRD-REQ-061`.
  - `test_proto_files_are_version_controlled`: Run `git ls-files proto/devs/v1/` and assert the proto files are tracked (not just on disk but in git). If `git` is not available in test env, skip gracefully. Tag with `// Covers: 1_PRD-REQ-061`.
  - `test_proto_files_declare_package`: Read each `.proto` file under `proto/devs/v1/` and assert it contains a `package devs.v1;` declaration. This ensures consistent namespacing. Tag with `// Covers: 1_PRD-REQ-061`.
  - `test_no_service_definitions_outside_proto`: Scan all `.rs` files under `crates/` for `tonic::include_proto!` or `prost::Message` derive macros and assert they only appear in `crates/devs-proto/`. This ensures devs-proto is the sole generated-code location. Tag with `// Covers: 1_PRD-REQ-061`.

## 2. Task Implementation
- [ ] Implement the test file. Reuse `walkdir` dev-dependency from task 01.
- [ ] For the git check, use `std::process::Command` to invoke `git ls-files`. If the command fails (e.g., not in a git repo during CI), mark the test as skipped with a printed warning, not a failure.
- [ ] Integrate into `./do lint` alongside the no-web tests: `cargo test -p devs-core --test architecture_proto_authority`.

## 3. Code Review
- [ ] Verify that the canonical proto path (`proto/devs/v1/`) matches what `devs-proto`'s `build.rs` uses for code generation.
- [ ] Ensure the scan for `tonic::include_proto!` doesn't produce false positives from comments or doc strings.
- [ ] Confirm cross-platform path handling.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --test architecture_proto_authority` and confirm all tests pass.
- [ ] Verify that adding a `.thrift` file to the repo root causes the test to fail, then remove it.

## 5. Update Documentation
- [ ] Add doc comments in the test file explaining that proto files are the single source of truth for the API surface.

## 6. Automated Verification
- [ ] Run `./do lint` and confirm proto authority tests execute.
- [ ] Run `./do test` and confirm all tests pass.
