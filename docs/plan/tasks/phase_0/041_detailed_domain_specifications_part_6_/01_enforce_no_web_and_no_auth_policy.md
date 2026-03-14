# Task: Enforce No-Web and No-Auth Architectural Policy (Sub-Epic: 041_Detailed Domain Specifications (Part 6))

## Covered Requirements
- [1_PRD-REQ-059], [1_PRD-REQ-060], [1_PRD-REQ-063]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create `crates/devs-core/tests/architecture_no_web.rs` with the following tests:
  - `test_no_http_framework_dependencies`: Parse every `Cargo.toml` in the workspace using `toml` crate. Assert that none of them contain dependencies on `axum`, `warp`, `actix-web`, `actix-rt`, `rocket`, `hyper` (as a direct dep — `tonic` uses it transitively which is fine), `tower-http`, or `salvo`. The test should collect all violations and report them in the assertion message. Tag with `// Covers: 1_PRD-REQ-059`.
  - `test_no_openapi_or_swagger_files`: Walk the repository directory tree (excluding `target/`) and assert that no files named `openapi.json`, `openapi.yaml`, `openapi.yml`, `swagger.json`, `swagger.yaml`, or `swagger.yml` exist. Also assert no files with `.openapi.` in their name exist. Tag with `// Covers: 1_PRD-REQ-060`.
  - `test_no_http_route_definitions`: Scan all `.rs` files under `crates/` for patterns like `Router::new()`, `.route(`, `#[get(`, `#[post(`, `#[put(`, `#[delete(`, `HttpServer::`, `App::new()`. Assert zero matches. Tag with `// Covers: 1_PRD-REQ-059`.
  - `test_no_auth_interceptor`: Scan all `.rs` files under `crates/` for `impl.*Interceptor` patterns combined with case-insensitive `auth` within 5 lines. Assert zero matches. Tag with `// Covers: 1_PRD-REQ-063`.
  - `test_no_auth_middleware_crates`: Parse every `Cargo.toml` and assert no dependency on `tonic-auth`, `tower-sessions`, `jsonwebtoken`, `oauth2`, `openidconnect`. Tag with `// Covers: 1_PRD-REQ-063`.

## 2. Task Implementation
- [ ] Implement the test file as specified. Use `std::fs` and `walkdir` (add as a dev-dependency to `devs-core`) for directory traversal. Use `toml` crate (dev-dependency) for `Cargo.toml` parsing.
- [ ] Add a lint step to `./do lint` that runs these architecture tests specifically: `cargo test -p devs-core --test architecture_no_web -- --nocapture`. This ensures violations are caught during presubmit.
- [ ] Add a comment block at the top of the test file documenting the rationale: MVP uses gRPC only, no HTTP/REST, no authentication middleware. Reference the requirement IDs.

## 3. Code Review
- [ ] Verify error messages are actionable: each violation should print the exact file path and line number (or dependency name and `Cargo.toml` path).
- [ ] Verify the tests work on Linux, macOS, and Windows (use `std::path` correctly, not hardcoded `/`).
- [ ] Ensure `walkdir` traversal excludes `target/`, `.git/`, and `node_modules/` directories.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --test architecture_no_web` and confirm all tests pass.
- [ ] Temporarily add `axum = "0.7"` to a crate's `Cargo.toml`, run the test, confirm it fails with a clear message, then revert.

## 5. Update Documentation
- [ ] Add doc comments to the test file explaining each constraint and its requirement ID.

## 6. Automated Verification
- [ ] Run `./do lint` and confirm the architecture constraint tests are executed as part of the lint pipeline.
- [ ] Run `./do test` and confirm the tests appear in output and pass.
