# Task: Pool Exhaustion Episode Tracking Logic (Sub-Epic: 087_Detailed Domain Specifications (Part 52))

## Covered Requirements
- [2_TAS-REQ-514]

## Dependencies
- depends_on: none
- shared_components: [devs-pool, devs-webhook]

## 1. Initial Test Written
- [ ] In the pool or webhook dispatcher module, create test module `tests::exhaustion_episode_logic`:
  - `test_exhaustion_fires_once_per_episode`: simulate a pool where all agents become unavailable. Assert `pool.exhausted` event fires exactly once. Then simulate one agent becoming available (episode ends). Then simulate all agents becoming unavailable again (new episode). Assert `pool.exhausted` fires exactly once more (total: 2 events for 2 episodes).
  - `test_no_event_during_ongoing_exhaustion`: simulate all agents unavailable, triggering the first event. While still exhausted, trigger another unavailability check. Assert no additional `pool.exhausted` event is emitted.
  - `test_episode_ends_when_agent_available`: simulate exhaustion, then one agent becomes available. Assert the episode is marked as ended internally. Verify a subsequent full exhaustion triggers a new event.
  - `test_episode_state_not_persisted`: create a dispatcher, trigger an exhaustion episode, then drop and recreate the dispatcher (simulating restart). Simulate exhaustion again. Assert the event fires (episode state was reset on restart, not loaded from disk).
  - `test_per_pool_episode_tracking`: simulate exhaustion in pool `"primary"` (event fires). Simulate exhaustion in pool `"secondary"` (event fires independently). Assert 2 total events — episodes are tracked per pool, not globally.
- [ ] Add `// Covers: 2_TAS-REQ-514` annotation to all test functions.

## 2. Task Implementation
- [ ] In the `WebhookDispatcher` (or pool state module), add a per-pool in-memory episode tracker:
  - `HashMap<String, bool>` (pool name → currently in exhaustion episode).
  - When all agents in a pool become unavailable: check the map. If not already in an episode (`false` or absent), set to `true` and emit `pool.exhausted` event. If already `true`, do nothing.
  - When at least one agent becomes available in a pool: set the pool's entry to `false` (episode ends).
- [ ] This state is purely in-memory — not serialized to disk or checkpoint. On dispatcher creation, the map starts empty.
- [ ] Wire the episode check into the existing pool state change notification path (wherever `report_rate_limit` or agent release detects full unavailability).

## 3. Code Review
- [ ] Verify the episode tracker is per-pool, not global.
- [ ] Confirm the event fires at most once per episode — no duplicate emissions.
- [ ] Ensure the episode state is not persisted (no serialization, no checkpoint integration).
- [ ] Check thread safety: the episode map must be protected if accessed from multiple tasks (e.g., behind a `Mutex` or within the dispatcher's single-threaded event loop).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -- exhaustion_episode_logic` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments on the episode tracker explaining the lifecycle: begin (all unavailable) → fire event → end (one available) → ready for next episode.

## 6. Automated Verification
- [ ] Run `cargo test -- exhaustion_episode_logic --no-fail-fast 2>&1 | tail -20` and verify exit code 0.
