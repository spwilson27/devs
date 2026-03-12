# Task: Implement Pool Exhaustion Detection and State Tracking (Sub-Epic: 09_Pool Events & Monitoring)

## Covered Requirements
- [2_TAS-REQ-033], [2_TAS-REQ-047]

## Dependencies
- depends_on: [none]
- shared_components: [devs-pool, devs-core]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-pool` that simulates a scenario where all agents in a pool are simultaneously rate-limited (cooldown active).
- [ ] The test should verify that the `AgentPool` transitions its internal `is_exhausted` state to `true` when the last available agent enters cooldown.
- [ ] The test should verify that the `AgentPool` transitions its internal `is_exhausted` state to `false` when the first agent's cooldown expires (using mock time).
- [ ] The test should verify that an "Exhaustion Event" is only generated exactly ONCE per `false → true` transition.

## 2. Task Implementation
- [ ] Update `AgentPool` struct in `devs-pool` to include an `is_exhausted: bool` flag and a mechanism to notify the server of exhaustion events (e.g., a `tokio::sync::mpsc` sender).
- [ ] Implement the `Pool Selection Flow` ([2_TAS-REQ-113]) logic to detect when all matching agents are in cooldown.
- [ ] Implement the `false → true` transition logic: if `is_exhausted` is `false` and no agents are available due to rate-limiting, set `is_exhausted = true` and emit a `PoolExhausted` internal event.
- [ ] Implement the `true → false` transition logic: in the pool's maintenance or next allocation attempt, if `is_exhausted` is `true` and at least one agent's cooldown has expired, set `is_exhausted = false`.
- [ ] Use `tokio::time::Instant` or mockable clock to track cooldowns ([2_TAS-REQ-114]).

## 3. Code Review
- [ ] Ensure the "at most once per exhaustion episode" constraint is strictly followed.
- [ ] Verify that no extra events are fired if multiple agents enter cooldown simultaneously while the pool is already exhausted.
- [ ] Confirm that `PoolExhausted` is NOT fired if the pool is empty because of capability filters but some agents *are* available (this is a `PoolError`, not exhaustion).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-pool` to verify the state transitions and event emission logic.

## 5. Update Documentation
- [ ] Update the `devs-pool` module documentation to describe the exhaustion tracking logic and its emission of internal events.

## 6. Automated Verification
- [ ] Run `./do test --package devs-pool` and ensure all tests pass with 100% requirement traceability for `2_TAS-REQ-033`.
