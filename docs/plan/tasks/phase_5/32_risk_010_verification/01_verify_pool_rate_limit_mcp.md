# Task: Verify MCP get_pool_state Rate-Limit Cooldown (Sub-Epic: 32_Risk 010 Verification)

## Covered Requirements
- [AC-RISK-010-03]

## Dependencies
- depends_on: []
- shared_components: [devs-pool, devs-proto, devs-server]

## 1. Initial Test Written
- [ ] Create an MCP integration test in `crates/devs-mcp/tests/pool_rate_limit_mcp_test.rs` that:
    - Starts a mock server with a rate-limited agent pool.
    - Simulates a rate-limit event for an agent in the pool.
    - Calls the `get_pool_state` MCP tool.
    - Asserts that the response includes a `"rate_limited_until"` field with a valid ISO8601 timestamp for the rate-limited agent.
    - Waits for the cooldown to expire (using `tokio::time::pause()` or a mock clock if available, otherwise a short timeout).
    - Calls `get_pool_state` again and asserts that `"rate_limited_until"` is now `null`.

## 2. Task Implementation
- [ ] Ensure the `get_pool_state` implementation in `devs-mcp` correctly extracts the `rate_limited_until` field from the internal `PoolState` (owned by `devs-pool`).
- [ ] Update the MCP response schema in `devs-proto` (or its generated Rust code/adapter) to include the `rate_limited_until` field as an optional `DateTime<Utc>` (serialized as string).
- [ ] Ensure `devs-pool` correctly tracks `rate_limited_until` in its `AgentStatus`.

## 3. Code Review
- [ ] Verify that the ISO8601 formatting is consistent with the `Redacted<T>` serialization and other platform standards (RFC 3339).
- [ ] Confirm that `rate_limited_until` is correctly reported as `null` (and not omitted) when no rate limit is active.

## 4. Run Automated Tests to Verify
- [ ] Run the newly created integration test: `cargo test --package devs-mcp --test pool_rate_limit_mcp_test`.

## 5. Update Documentation
- [ ] Document the addition of the `rate_limited_until` field in the MCP API documentation or `3_mcp_design.md` if necessary.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `traceability.json` shows [AC-RISK-010-03] as covered by the new test.
