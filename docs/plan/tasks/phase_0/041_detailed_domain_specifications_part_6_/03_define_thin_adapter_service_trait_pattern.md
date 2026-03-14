# Task: Define Thin Adapter Pattern for gRPC Service Layer (Sub-Epic: 041_Detailed Domain Specifications (Part 6))

## Covered Requirements
- [1_PRD-REQ-062]

## Dependencies
- depends_on: [02_enforce_proto_as_api_source_of_truth.md]
- shared_components: [devs-core, devs-proto]

## 1. Initial Test Written
- [ ] Create `crates/devs-core/tests/architecture_thin_adapter.rs` with the following tests:
  - `test_domain_service_traits_have_no_transport_types`: Parse all `.rs` files under `crates/devs-core/src/` that define `pub trait` items. For each trait, scan method signatures and assert none reference types from `tonic`, `prost`, `http`, `hyper`, or any crate under `devs-proto`. Only `devs-core` types, standard library types, and common ecosystem types (`uuid`, `chrono`, `serde_json::Value`) are permitted. Tag with `// Covers: 1_PRD-REQ-062`.
  - `test_domain_error_types_are_not_grpc_status`: Scan `crates/devs-core/src/` for `enum.*Error` definitions. Assert none of them contain variants that wrap `tonic::Status` or reference gRPC status codes directly. Domain errors must be transport-agnostic. Tag with `// Covers: 1_PRD-REQ-062`.
  - `test_service_module_exists`: Assert that `crates/devs-core/src/domain/services.rs` (or `crates/devs-core/src/domain/services/mod.rs`) exists. This is the canonical location for domain service trait definitions. Tag with `// Covers: 1_PRD-REQ-062`.
- [ ] Create a unit test in `crates/devs-core/src/domain/services.rs` (inline `#[cfg(test)]` module):
  - `test_mock_service_satisfies_trait`: Define a minimal mock struct implementing one domain service trait. Assert it compiles and can be called with domain types only. Tag with `// Covers: 1_PRD-REQ-062`.

## 2. Task Implementation
- [ ] Create `crates/devs-core/src/domain/services.rs` (or `services/mod.rs` if multiple files are needed).
- [ ] Define a marker trait or documentation convention establishing the thin adapter pattern:
  - Domain service traits live in `devs-core` and use only domain types.
  - gRPC adapters (in `devs-grpc`, Phase 3) will implement `tonic` service traits by delegating to these domain traits, converting between wire types and domain types at the boundary.
- [ ] Define initial placeholder traits that establish the pattern. At minimum:
  - `pub trait ServerInfoService: Send + Sync` with a method like `async fn get_info(&self) -> Result<ServerInfo, DomainError>` using only `devs-core` types.
- [ ] Define `DomainError` enum in `crates/devs-core/src/domain/error.rs` with transport-agnostic variants (e.g., `NotFound`, `InvalidInput`, `Internal`). Each variant carries a `String` message. Do NOT include `tonic::Status` or HTTP status codes.
- [ ] Wire up the module in `crates/devs-core/src/domain/mod.rs` and `crates/devs-core/src/lib.rs`.

## 3. Code Review
- [ ] Verify that `devs-core`'s `Cargo.toml` has NO dependency on `tonic` or `prost` (not even as dev-dependencies for this purpose — the architecture tests use text scanning, not compilation checks).
- [ ] Verify trait methods use `&self` (not `self`) and return `Result<T, DomainError>`.
- [ ] Verify `DomainError` implements `std::error::Error`, `Debug`, and `Display`.
- [ ] Confirm the pattern is documented with doc comments explaining that gRPC adapters convert at the boundary.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --test architecture_thin_adapter` and confirm all tests pass.
- [ ] Run `cargo test -p devs-core` and confirm inline unit tests pass.
- [ ] Run `cargo check -p devs-core` to ensure clean compilation.

## 5. Update Documentation
- [ ] Add a doc comment on the `services` module explaining the thin adapter architectural pattern and referencing [1_PRD-REQ-062].

## 6. Automated Verification
- [ ] Run `./do lint` and confirm all architecture tests pass.
- [ ] Run `./do test` and confirm the full test suite passes.
- [ ] Run `cargo doc -p devs-core --no-deps` and confirm documentation builds without warnings.
