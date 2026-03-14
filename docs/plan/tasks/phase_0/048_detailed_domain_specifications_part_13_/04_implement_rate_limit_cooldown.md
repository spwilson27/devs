# Task: Implement Rate-Limit Cooldown State (Sub-Epic: 048_Detailed Domain Specifications (Part 13))

## Covered Requirements
- [2_TAS-REQ-114]

## Dependencies
- depends_on: [03_implement_pool_selection_flow.md]
- shared_components: [devs-pool (owner — creates cooldown module), devs-adapters (consumer — passive rate-limit detection calls into pool)]

## 1. Initial Test Written
- [ ] Create `devs-pool/src/cooldown.rs` (or `devs-pool/tests/cooldown.rs`) with the following TDD tests:
- [ ] **Test `cooldown_stored_as_option_instant`**: Create an agent state. Assert `cooldown_until` is initially `None`. Call `report_rate_limit()`. Assert `cooldown_until` is `Some(instant)` where `instant` is approximately `now + 60s`. Annotate with `// Covers: 2_TAS-REQ-114`.
- [ ] **Test `cooldown_duration_is_exactly_60_seconds`**: Capture `Instant::now()` before calling `report_rate_limit()`. Assert that `cooldown_until.unwrap() - now` is exactly `Duration::from_secs(60)`. Annotate with `// Covers: 2_TAS-REQ-114`.
- [ ] **Test `agent_unavailable_during_cooldown`**: Set cooldown on an agent. Assert `is_available()` returns `false` when checked at a time before `cooldown_until`. Annotate with `// Covers: 2_TAS-REQ-114`.
- [ ] **Test `agent_available_after_cooldown_expires`**: Set cooldown on an agent. Using a mock/test clock, advance time by 61 seconds. Assert `is_available()` returns `true`. Annotate with `// Covers: 2_TAS-REQ-114`.
- [ ] **Test `passive_detection_sets_cooldown_identically`**: Simulate a passive rate-limit detection (exit code / stderr pattern match from adapter). Assert the cooldown state is identical to an MCP `report_rate_limit` call — same 60-second duration. Annotate with `// Covers: 2_TAS-REQ-114`.
- [ ] **Test `mcp_report_sets_cooldown_identically`**: Call `report_rate_limit()` via the MCP code path. Assert cooldown is set to `now + 60s`. Annotate with `// Covers: 2_TAS-REQ-114`.
- [ ] **Test `repeated_rate_limit_resets_cooldown`**: Set cooldown. Wait 30 seconds (mock clock). Call `report_rate_limit()` again. Assert cooldown is reset to `now + 60s` from the second call, not from the first.

## 2. Task Implementation
- [ ] Add `cooldown_until: Option<tokio::time::Instant>` field to the per-agent state struct in `devs-pool`.
- [ ] Implement `pub fn report_rate_limit(&mut self, agent_id: &AgentId)` method on the pool:
  - Sets `cooldown_until = Some(Instant::now() + Duration::from_secs(60))` for the specified agent.
  - This method is called from both passive detection (adapter layer) and active MCP reporting — the behavior is identical.
- [ ] Implement `pub fn is_available(&self, agent_id: &AgentId) -> bool`:
  - Returns `false` if `cooldown_until` is `Some(t)` and `Instant::now() < t`.
  - Returns `true` if `cooldown_until` is `None` or the cooldown has expired.
  - When the cooldown has expired, lazily clears `cooldown_until` to `None`.
- [ ] Integrate with the pool selection flow (task 03): step 3 of `acquire_agent` calls `is_available()` to filter out rate-limited agents.
- [ ] Ensure the cooldown state is protected by the pool's `RwLock` — `report_rate_limit` acquires a write lock.

## 3. Code Review
- [ ] Verify the cooldown duration is hardcoded to exactly 60 seconds as specified in [2_TAS-REQ-114].
- [ ] Confirm that both passive and active rate-limit paths call the same `report_rate_limit()` method — no divergent code paths.
- [ ] Ensure `is_available()` uses `Instant` comparison (not `SystemTime`) to avoid clock skew issues.
- [ ] Verify that repeated `report_rate_limit` calls reset (not extend) the cooldown from the new call time.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-pool -- cooldown` and confirm all tests pass.
- [ ] Run `cargo clippy -p devs-pool -- -D warnings` and confirm no warnings.

## 5. Update Documentation
- [ ] Add doc comments to `report_rate_limit` and `is_available` explaining the 60-second cooldown contract.
- [ ] Add `// Covers: 2_TAS-REQ-114` annotations to each test function.

## 6. Automated Verification
- [ ] Run `grep -r 'Covers: 2_TAS-REQ-114' devs-pool/` and confirm at least 6 test functions are annotated.
- [ ] Run `./do test` and confirm the traceability report includes [2_TAS-REQ-114].
- [ ] Run `./do lint` and confirm no lint failures in the pool crate.
