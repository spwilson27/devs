# Task: Enforce Interface Layer Must Not Contain Business Logic (Sub-Epic: 013_Foundational Technical Requirements (Part 4))

## Covered Requirements
- [2_TAS-REQ-001A]

## Dependencies
- depends_on: []
- shared_components: [devs-core (consumer — uses domain types), devs-proto (consumer — uses generated wire types)]

## 1. Initial Test Written
- [ ] Create a test module in `devs-core` (e.g., `devs-core/src/architecture_tests.rs` or inline `#[cfg(test)]`) that defines and tests the architectural contract for interface layer handlers.
- [ ] **Test: `interface_handler_contract_type_check`** — Define a trait `InterfaceHandler` (or validate the existing handler pattern) that enforces the three-step contract:
  1. Deserialize wire request to domain type.
  2. Call exactly one engine layer method.
  3. Serialize domain response to wire type.
  Write a compile-time test (trait bound check) or unit test that verifies a sample handler implementation conforms to this shape.
- [ ] **Test: `handler_delegates_to_engine_no_branching`** — Create a mock engine trait (e.g., `trait RunEngine { fn submit(&self, req: SubmitRequest) -> Result<RunId>; }`). Implement a sample `GrpcSubmitHandler` that calls `engine.submit()` and maps the result. Assert that the handler contains no conditional logic (`if`, `match` on domain state) — verify by checking the handler returns the engine's result directly (success maps to success, error maps to error).
- [ ] **Test: `handler_rejects_direct_state_mutation`** — Verify that a handler struct does NOT own mutable state. The handler should hold only `Arc<dyn Engine>` (immutable reference to the engine). Attempt to compile a handler with `&mut self` method — this should be a design-time constraint documented and enforced by code review.
- [ ] **Test: `lint_enforcement_no_forbidden_imports_in_interface_crates`** — Write a test (or validate via `./do lint`) that `devs-grpc` and `devs-mcp` crate source files do not contain direct imports of `git2`, `reqwest`, or state-mutation types. This can be a `grep`-based assertion in the test or a `./do lint` rule. Note: these crates don't exist yet in Phase 0; this test defines the contract that Phase 3 must satisfy. Implement as a stub test with `// BOOTSTRAP-STUB: enabled after devs-grpc and devs-mcp crates exist`.
- [ ] Annotate all tests with `// Covers: 2_TAS-REQ-001A`.

## 2. Task Implementation
- [ ] In `devs-core`, define the `InterfaceHandler` architectural pattern as a documented trait or convention:
  ```rust
  /// Marker trait documenting the interface layer contract per [2_TAS-REQ-001A].
  ///
  /// Implementors MUST:
  /// 1. Deserialize the wire request into domain types.
  /// 2. Call exactly ONE engine layer method.
  /// 3. Serialize the domain response into wire types.
  ///
  /// Implementors MUST NOT:
  /// - Contain `if`/`match` on domain state (business logic).
  /// - Mutate shared state directly.
  /// - Call infrastructure layer components (git2, reqwest) directly.
  pub trait InterfaceHandlerContract {
      type WireRequest;
      type WireResponse;
      type DomainRequest;
      type DomainResponse;
      type Error;
  }
  ```
- [ ] This trait is primarily a documentation and compile-time guidance mechanism. It is NOT required that all handlers implement it literally — the contract is enforced by code review, lint rules, and the stub tests above.
- [ ] Add a `./do lint` rule (or document the rule for implementation when `devs-grpc`/`devs-mcp` exist) that checks interface crate source files for forbidden patterns:
  - No `git2::` imports.
  - No `reqwest::` imports.
  - No `tokio::fs::` imports (I/O belongs in infrastructure layer).
  - No `match.*State` patterns that indicate business logic branching.
- [ ] Since `devs-grpc` and `devs-mcp` don't exist in Phase 0, the lint rule should be defined but marked as `BOOTSTRAP-STUB` — it will activate when those crates are created in Phase 3.

## 3. Code Review
- [ ] Verify that the `InterfaceHandlerContract` trait (or documentation) clearly specifies the three permitted operations.
- [ ] Confirm that BOOTSTRAP-STUB annotations follow the project convention (checked by `./do lint`).
- [ ] Verify no business logic has been accidentally introduced in any existing interface-like code.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- interface_handler` to execute the contract tests.
- [ ] Run `./do test` to verify traceability annotations.

## 5. Update Documentation
- [ ] Add doc comments on the `InterfaceHandlerContract` trait explaining [2_TAS-REQ-001A] and the three-step handler pattern.
- [ ] Document the lint rule that will enforce this in Phase 3.

## 6. Automated Verification
- [ ] Run `./do lint` and confirm no warnings.
- [ ] Verify BOOTSTRAP-STUB annotations are present and correctly formatted for the deferred lint checks.
