# Task: MCP Response JSON Schema and Error Field Contract (Sub-Epic: 011_Foundational Technical Requirements (Part 2))

## Covered Requirements
- [2_PRD-BR-007], [2_PRD-BR-008]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core (consumer — domain types)]

## 1. Initial Test Written
- [ ] Create `crates/devs-core/src/mcp_response.rs` with a `#[cfg(test)] mod tests` block.
- [ ] Write `test_success_response_serializes_to_json_with_null_error`:
  - Construct an `McpResponse::success(serde_json::json!({"runs": []}))`.
  - Serialize to JSON string via `serde_json::to_string`.
  - Parse the JSON string back to `serde_json::Value`.
  - Assert the root is an object (not a string or array) — enforces [2_PRD-BR-007].
  - Assert `value["error"]` is `serde_json::Value::Null` — enforces [2_PRD-BR-008].
  - Assert `value["result"]` is an object with key `"runs"`.
- [ ] Write `test_error_response_serializes_with_non_null_error`:
  - Construct `McpResponse::<serde_json::Value>::error("workflow not found")`.
  - Serialize to JSON string.
  - Parse back to `serde_json::Value`.
  - Assert `value["error"]` is a string equal to `"workflow not found"`.
  - Assert `value["result"]` is `Null`.
- [ ] Write `test_error_field_always_present_in_serialized_output`:
  - For both success and error variants, serialize to JSON string.
  - Assert the raw JSON string contains the substring `"error":` (field is never omitted by `#[serde(skip_serializing_if)]`).
- [ ] Write `test_plain_text_cannot_be_primary_response`:
  - Attempt to construct `McpResponse::success("just a string")` — this should either fail to compile (if `T: Serialize + ...` is constrained to non-string types) or the test should verify the serialized `result` is a JSON string value, and a lint/review rule documents that callers must use structured objects.
- [ ] Annotate all tests with `// Covers: 2_PRD-BR-007` and `// Covers: 2_PRD-BR-008` as appropriate.

## 2. Task Implementation
- [ ] In `crates/devs-core/src/mcp_response.rs`, define:
  ```rust
  use serde::Serialize;

  #[derive(Debug, Clone, Serialize)]
  pub struct McpResponse<T: Serialize> {
      pub result: Option<T>,
      pub error: Option<String>,
  }
  ```
- [ ] Implement constructor methods:
  - `McpResponse::success(result: T) -> McpResponse<T>` — sets `result: Some(result)`, `error: None`.
  - `McpResponse::<T>::error(msg: impl Into<String>) -> McpResponse<T>` — sets `result: None`, `error: Some(msg.into())`.
- [ ] Implement a custom `Serialize` impl (or use `#[serde(serialize_with)]`) to ensure the `error` field is **always** emitted in the JSON output, even when `None`. Use `#[serde(serialize_with = "serialize_always")]` or a manual impl that writes `"error": null` explicitly. The default `Option` serialization with `serde` already serializes `None` as `null` without `skip_serializing_if`, so verify this is the case and do NOT add `#[serde(skip_serializing_if = "Option::is_none")]`.
- [ ] Add `pub mod mcp_response;` to `crates/devs-core/src/lib.rs`.
- [ ] Re-export `McpResponse` from the crate root: `pub use mcp_response::McpResponse;`.
- [ ] Ensure `serde` and `serde_json` are listed as dependencies of `devs-core` in `Cargo.toml` (not dev-dependencies — `McpResponse` is a public API type).

## 3. Code Review
- [ ] Verify `McpResponse` does not depend on `tokio`, `git2`, `reqwest`, or `tonic` — it must remain in `devs-core` per the forbidden dependency constraint [2_TAS-REQ-001E].
- [ ] Verify the `Serialize` output never omits the `error` key — test with both `serde_json::to_string` and `serde_json::to_value`.
- [ ] Verify no `Display` or `Debug` impl on `McpResponse` leaks internal Rust type names or stack traces into the error message.
- [ ] Verify the type is generic enough to be used by all future MCP tools (the `T` parameter should accept any `Serialize` type).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- mcp_response` and confirm all tests pass.
- [ ] Run `cargo test -p devs-core` to confirm no regressions in the crate.

## 5. Update Documentation
- [ ] Add rustdoc comments to `McpResponse`, `success()`, and `error()` explaining the contract: every MCP tool must use this type; the `error` field is always present in serialized JSON.
- [ ] Add `// Covers: 2_PRD-BR-007` and `// Covers: 2_PRD-BR-008` annotations to all test functions.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core` and confirm exit code 0.
- [ ] Run `grep -r "Covers: 2_PRD-BR-007" crates/devs-core/` and confirm at least one match.
- [ ] Run `grep -r "Covers: 2_PRD-BR-008" crates/devs-core/` and confirm at least one match.
- [ ] Run `./do lint` and confirm exit code 0.
