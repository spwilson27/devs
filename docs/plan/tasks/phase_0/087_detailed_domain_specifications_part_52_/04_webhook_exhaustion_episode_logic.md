# Task: Implement Pool Exhaustion Episode Logic (Sub-Epic: 087_Detailed Domain Specifications (Part 52))

## Covered Requirements
- [2_TAS-REQ-514]

## Dependencies
- depends_on: [none]
- shared_components: [devs-webhook, devs-core]

## 1. Initial Test Written
- [ ] Create unit tests in `crates/devs-webhook/src/exhaustion_logic.rs` (or equivalent) that:
    - Verifies that when a pool's agents all become unavailable, the first attempt to dispatch a stage triggers exactly one `pool.exhausted` event.
    - Verifies that subsequent attempts to dispatch a stage while the pool remains fully occupied do NOT trigger further `pool.exhausted` events.
    - Verifies that once at least one agent in the pool becomes available, the "exhaustion episode" is considered ended.
    - Verifies that if the pool becomes fully occupied again after an episode has ended, a NEW `pool.exhausted` event is triggered.
    - Verifies that this state is maintained in-memory and reset on dispatcher restart.

## 2. Task Implementation
- [ ] Implement `ExhaustionEpisodeState` (likely a `HashMap<String, bool>` where the key is the pool name) within the `WebhookDispatcher` (or an equivalent shared logic module in Phase 0).
- [ ] Implement a function/method that evaluates the pool's availability.
- [ ] When a dispatch request is made and the pool is exhausted:
    - Check the in-memory episode state for the pool.
    - If no episode is in progress, transition the pool to the "Exhausted" state and emit the `pool.exhausted` event.
    - If an episode is already in progress, do NOT emit the event.
- [ ] When an agent becomes available:
    - Transition the pool's episode state to "Available" (or remove the entry).
- [ ] Ensure this logic is integrated into the stage dispatch / pool selection flow used by the scheduler.
- [ ] Confirm that `pool.exhausted` event payload correctly includes `pool_name` and `required_capabilities`.

## 3. Code Review
- [ ] Verify that the episode state is tracked per-pool.
- [ ] Ensure that no persistent storage (e.g., git checkpoint) is used for this state, as required.
- [ ] Check for thread-safety if multiple scheduler tasks or dispatchers access this state simultaneously (use `RwLock` or `AtomicBool` as appropriate).

## 4. Run Automated Tests to Verify
- [ ] Execute `./do test --package devs-webhook` (or the relevant crate where logic is implemented) and ensure all exhaustion episode tests pass.

## 5. Update Documentation
- [ ] Add a section in `devs-webhook` documentation explaining the "Exhaustion Episode" logic and its firing semantics.

## 6. Automated Verification
- [ ] Run `cargo test` and verify that the `pool_exhaustion_episode_trigger` test passes.
- [ ] Verify traceability annotations are present: `/// Verifies [2_TAS-REQ-514]`.
