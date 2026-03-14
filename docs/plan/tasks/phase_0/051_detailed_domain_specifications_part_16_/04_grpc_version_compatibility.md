# Task: gRPC Version Compatibility Interceptor (Sub-Epic: 051_Detailed Domain Specifications (Part 16))

## Covered Requirements
- [2_TAS-REQ-130]

## Dependencies
- depends_on: [none]
- shared_components: [devs-grpc (owner — adds version interceptor), devs-proto (consumer — gRPC service definitions)]

## 1. Initial Test Written
- [ ] Create `crates/devs-grpc/tests/version_interceptor.rs`. All test functions must include `// Covers: 2_TAS-REQ-130`.

### Missing version metadata
- [ ] `test_request_without_version_metadata_returns_failed_precondition`: Create a tonic `Request` with no `x-devs-client-version` metadata. Pass it through the interceptor. Assert the result is `Err(Status)` with code `FAILED_PRECONDITION`. Assert the status message contains `"client version mismatch: client=unknown server="` followed by the server version.
- [ ] `test_request_without_version_metadata_message_format`: Verify the exact message format is `"client version mismatch: client=unknown server=<CARGO_PKG_VERSION>"` — no extra whitespace, no trailing period.

### Major version mismatch
- [ ] `test_major_version_mismatch_returns_failed_precondition`: Set `x-devs-client-version: 2.0.0` on the request (assuming server is `0.x.y` or `1.x.y`). Assert `FAILED_PRECONDITION` with message `"client version mismatch: client=2.0.0 server=<server_ver>"`.
- [ ] `test_major_version_0_vs_1_returns_failed_precondition`: Client sends `0.9.0`, server is `1.0.0`. Assert `FAILED_PRECONDITION`. This validates that `0` and `1` are treated as different major versions.

### Matching major version
- [ ] `test_matching_major_version_succeeds`: Client sends `1.5.3`, server is `1.0.0`. Assert the interceptor returns `Ok(request)` — minor/patch differences are allowed.
- [ ] `test_exact_version_match_succeeds`: Client sends the exact server version. Assert `Ok`.

### Malformed version strings
- [ ] `test_malformed_version_string_returns_failed_precondition`: Client sends `x-devs-client-version: not-a-version`. Assert `FAILED_PRECONDITION` with message treating the client version as-is (e.g., `"client version mismatch: client=not-a-version server=<server_ver>"`).
- [ ] `test_empty_version_string_returns_failed_precondition`: Client sends `x-devs-client-version:` (empty value). Assert `FAILED_PRECONDITION`.

### Interceptor applies to all RPCs
- [ ] `test_version_check_applies_to_get_info_rpc`: Send a `GetInfo` request without version metadata through the full service stack. Assert `FAILED_PRECONDITION`. This validates the interceptor is wired to all services, not just specific ones.

## 2. Task Implementation
- [ ] Create `crates/devs-grpc/src/interceptor.rs` with the version check interceptor.
- [ ] Define `const SERVER_VERSION: &str = env!("CARGO_PKG_VERSION");` to read the version at compile time.
- [ ] Implement `fn version_check(req: Request<()>) -> Result<Request<()>, Status>`:
  1. Extract `x-devs-client-version` from `req.metadata()`.
  2. If missing: return `Status::failed_precondition(format!("client version mismatch: client=unknown server={SERVER_VERSION}"))`.
  3. Parse the client version string to extract the major version (split on `.`, take first element, parse as `u64`).
  4. Parse the server version major similarly.
  5. If parsing fails for the client version (not a valid semver-like string), return `Status::failed_precondition(format!("client version mismatch: client={client_ver} server={SERVER_VERSION}"))`.
  6. If major versions differ, return the same `FAILED_PRECONDITION` status with the full version strings.
  7. If major versions match, return `Ok(req)`.
- [ ] In the gRPC server setup (e.g., `crates/devs-grpc/src/server.rs`), apply the interceptor to every service using `tonic::service::interceptor(version_check)` or by wrapping each service with `InterceptedService::new(svc, version_check)`.
- [ ] Ensure the interceptor runs BEFORE any service method handler — it must reject mismatched clients without processing the RPC.

## 3. Code Review
- [ ] Verify the interceptor is applied to ALL registered tonic services (not just one). Check that adding a new service in the future requires applying the interceptor (or use a single `Router`-level layer).
- [ ] Verify the message format exactly matches the requirement: `"client version mismatch: client=<client_ver> server=<server_ver>"` — no extra formatting.
- [ ] Verify that `CARGO_PKG_VERSION` is the `devs-grpc` crate version (which should be the workspace version).
- [ ] Verify the interceptor does not panic on any input — all error paths return `Status` rather than unwrapping.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-grpc --test version_interceptor` — all 9 tests must pass.
- [ ] Run `cargo clippy -p devs-grpc -- -D warnings` with zero warnings.

## 5. Update Documentation
- [ ] Add doc comments to the `version_check` function explaining the protocol.
- [ ] Add `// Covers: 2_TAS-REQ-130` annotation to every test function in `version_interceptor.rs`.

## 6. Automated Verification
- [ ] Run `./do lint` and `./do test` — both must exit 0.
- [ ] Verify `target/traceability.json` contains an entry for `2_TAS-REQ-130` with at least one mapped test.
