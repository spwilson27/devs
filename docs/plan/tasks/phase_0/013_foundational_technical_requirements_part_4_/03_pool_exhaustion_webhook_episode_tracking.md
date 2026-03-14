# Task: Implement Pool Exhaustion Webhook Once-Per-Episode Firing (Sub-Epic: 013_Foundational Technical Requirements (Part 4))

## Covered Requirements
- [2_TAS-BR-WH-003]

## Dependencies
- depends_on: []
- shared_components: [devs-core (consumer — uses domain types for pool state and event definitions)]

## 1. Initial Test Written
- [ ] Create test module in `devs-core` for pool exhaustion episode tracking (e.g., `devs-core/src/pool_exhaustion_tests.rs` or inline `#[cfg(test)]`).
- [ ] **Test: `exhaustion_fires_once_per_episode`** — Create an `ExhaustionEpisodeTracker` for pool `"primary"`. Call `on_pool_exhausted()` three times consecutively. Assert that `should_emit_event()` returns `true` only on the first call, and `false` on the second and third.
- [ ] **Test: `recovery_resets_episode`** — After exhaustion, call `on_agent_recovered()`. Then call `on_pool_exhausted()` again. Assert `should_emit_event()` returns `true` (new episode started).
- [ ] **Test: `multiple_pools_independent_episodes`** — Create trackers for pools `"primary"` and `"secondary"`. Exhaust `"primary"` (event fires). Exhaust `"secondary"` (event fires independently). Recover `"primary"`. Exhaust `"primary"` again (event fires). Assert `"secondary"` episode state was unaffected by `"primary"` transitions.
- [ ] **Test: `recovery_without_prior_exhaustion_is_noop`** — Call `on_agent_recovered()` on a fresh tracker. Assert no state change and no panic.
- [ ] **Test: `episode_boundary_is_first_available_agent`** — Exhaust pool. Recover one agent. Exhaust again. Assert two distinct `PoolExhausted` events were eligible (two episodes). This verifies the spec: "episode begins when all agents are unavailable and ends when at least one becomes available again."
- [ ] Annotate all tests with `// Covers: 2_TAS-BR-WH-003`.

## 2. Task Implementation
- [ ] In `devs-core`, define `ExhaustionEpisodeTracker`:
  ```rust
  pub struct ExhaustionEpisodeTracker {
      is_exhausted: bool,
  }
  ```
- [ ] Implement:
  - `fn new() -> Self` — initializes with `is_exhausted: false`.
  - `fn on_pool_exhausted(&mut self) -> bool` — if `!self.is_exhausted`, set to `true` and return `true` (emit event). Otherwise return `false` (suppress duplicate).
  - `fn on_agent_recovered(&mut self)` — set `is_exhausted` to `false`. This ends the current episode.
  - `fn is_in_exhaustion_episode(&self) -> bool` — returns current state for diagnostics.
- [ ] This is a pure data structure in `devs-core` with no runtime dependencies. The actual webhook dispatch and pool integration happens in `devs-pool` (Phase 1) and `devs-webhook` (Phase 2). This task establishes the episode-tracking invariant that those crates will consume.
- [ ] Add struct-level doc comment: "Tracks pool exhaustion episodes per [2_TAS-BR-WH-003]. The `pool.exhausted` event fires at most once per episode. An episode begins when all agents become unavailable and ends when at least one becomes available again."

## 3. Code Review
- [ ] Verify `ExhaustionEpisodeTracker` is `Clone`, `Debug`, and `Default`.
- [ ] Confirm the state machine has exactly two states (`exhausted` / `not_exhausted`) and two transitions.
- [ ] Verify that `on_agent_recovered` is idempotent (calling it when not exhausted is harmless).
- [ ] Confirm no runtime dependencies (no tokio, no channels) — this is a pure state-tracking type.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- pool_exhaustion` to execute all episode tracking tests.
- [ ] Run `./do test` to verify traceability annotations.

## 5. Update Documentation
- [ ] Add doc comments explaining the episode model and how downstream crates (`devs-pool`, `devs-webhook`) should integrate with this tracker.

## 6. Automated Verification
- [ ] Run `./do lint` and confirm no warnings.
- [ ] Run `cargo test -p devs-core` and confirm all tests pass.
