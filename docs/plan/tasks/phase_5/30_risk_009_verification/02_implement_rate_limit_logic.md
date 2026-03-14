# Task: Implement Rate-Limit Logic and Cooldown (Sub-Epic: 30_Risk 009 Verification)

## Covered Requirements
- [RISK-010], [RISK-010-BR-001], [RISK-010-BR-002]

## Dependencies
- depends_on: []
- shared_components: [devs-pool, devs-core, devs-adapters]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-pool/src/tests.rs` that:
    - Sets up a pool with one agent.
    - Simulates a `report_rate_limit` event (active detection).
    - Asserts that the agent's `rate_limited_until` in `PoolState` is set to exactly 60 seconds from "now".
    - Asserts that a second rate-limit report during the cooldown DOES NOT reset the timer.
- [ ] Create an integration test in `devs-core/src/state_machine/tests.rs` that:
    - Dispatches a stage to an agent.
    - Injects a `RateLimitEvent` with `attempt_incremented: false`.
    - Asserts that the `StageRun.attempt` counter remains UNCHANGED.
    - Asserts that the stage transitions to `Eligible` (or a similar re-queue state) instead of failing.
- [ ] Create a unit test in `devs-adapters` (or relevant crate) that:
    - Simulates an agent process exiting with code 1 and a rate-limit pattern in stderr (passive detection).
    - Verifies it produces a `RateLimitEvent`.

## 2. Task Implementation
- [ ] **devs-pool**:
    - Update the `RateLimitEvent` struct (or create it) to include a boolean `attempt_incremented: false`.
    - Update `PoolState` to include `rate_limited_until: HashMap<AgentID, DateTime<Utc>>`.
    - Implement logic in the pool router to skip agents where `now < rate_limited_until`.
    - Implement the 60s cooldown logic when a rate limit is detected.
- [ ] **devs-core**:
    - Update the `StateMachine` to handle `RateLimitEvent`.
    - Ensure the transition logic respects the `attempt_incremented` flag and skips the attempt counter increment for rate limits.
- [ ] **devs-adapters**:
    - Add passive rate-limit detection to the agent adapter by matching known stderr patterns and exit codes.
    - Ensure it returns a `RateLimitEvent` instead of a standard `Error` when a match occurs.

## 3. Code Review
- [ ] Verify that the `rate_limited_until` uses absolute UTC timestamps to survive restarts (if persisted).
- [ ] Confirm that `attempt_incremented: false` is hardcoded for rate limit events to prevent accidental increments in the scheduler.
- [ ] Ensure that the passive detection regex/pattern matching is robust and doesn't trigger on unrelated stderr noise.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-pool -p devs-core -p devs-adapters` and ensure all tests pass.

## 5. Update Documentation
- [ ] Document the rate-limit mitigation strategy in `docs/plan/requirements/8_risks_mitigation.md` (or equivalent).

## 6. Automated Verification
- [ ] Run the traceability tool: `python3 .tools/verify_requirements.py --req RISK-010 RISK-010-BR-001 RISK-010-BR-002`.
