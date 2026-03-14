# Task: Implement Fan-Out Completion Serialization via Per-Run Mutex (Sub-Epic: 013_Foundational Technical Requirements (Part 4))

## Covered Requirements
- [2_TAS-BR-021]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core (consumer — uses domain types and state machine enums)]

## 1. Initial Test Written
- [ ] Create test module in `devs-core` for fan-out completion logic (e.g., `devs-core/src/fanout_tests.rs` or inline `#[cfg(test)]` module).
- [ ] **Test: `fanout_partial_completion_does_not_advance_parent`** — Create a `FanOutTracker` for a stage with `N=3` sub-agents. Record completions for sub-agents 0 and 1. Assert `is_all_complete()` returns `false` and the parent stage state remains `Running`.
- [ ] **Test: `fanout_final_completion_advances_parent`** — Continue from the above state, record completion for sub-agent 2. Assert `is_all_complete()` returns `true`. Assert the merge handler is eligible to be invoked (i.e., `ready_for_merge()` returns `true`).
- [ ] **Test: `fanout_concurrent_completions_serialized`** — Spawn `N=5` threads, each calling `record_completion(sub_agent_id)` on a shared `Arc<Mutex<FanOutTracker>>`. Assert that after all threads join, exactly `N` completions are recorded, the parent stage is complete, and no data races occurred. Use `std::sync::Barrier` to force all threads to call simultaneously.
- [ ] **Test: `fanout_sub_agent_failure_propagates`** — Create a tracker for `N=3`. Record success for sub-agent 0, failure for sub-agent 1. Assert the parent stage transitions to `Failed` (or the merge handler receives the failure) without waiting for sub-agent 2.
- [ ] **Test: `fanout_duplicate_completion_rejected`** — Record completion for sub-agent 0 twice. Assert the second call returns an error (idempotent rejection, not a panic or silent overwrite).
- [ ] Annotate all tests with `// Covers: 2_TAS-BR-021`.

## 2. Task Implementation
- [ ] In `devs-core`, define a `FanOutTracker` struct:
  ```rust
  pub struct FanOutTracker {
      expected_count: usize,
      completions: HashMap<SubAgentId, CompletionResult>,
  }
  ```
- [ ] Implement `fn record_completion(&mut self, sub_agent_id: SubAgentId, result: CompletionResult) -> Result<FanOutStatus, FanOutError>`:
  - If `sub_agent_id` already has a recorded completion, return `Err(FanOutError::DuplicateCompletion)`.
  - Insert the completion.
  - If any completion is a failure, return `Ok(FanOutStatus::Failed)`.
  - If `completions.len() == expected_count`, return `Ok(FanOutStatus::AllComplete)`.
  - Otherwise return `Ok(FanOutStatus::Pending { remaining: expected_count - completions.len() })`.
- [ ] Define `FanOutStatus` enum: `Pending { remaining: usize }`, `AllComplete`, `Failed`.
- [ ] Define `FanOutError` enum: `DuplicateCompletion { sub_agent_id: SubAgentId }`.
- [ ] Note: The `FanOutTracker` itself is NOT `Send + Sync` — it is designed to be held inside a per-run `Mutex` (as specified by [2_TAS-BR-021]: "per-run mutex serialises these calls"). The mutex wrapping is the caller's responsibility (devs-scheduler in Phase 2). This task only implements the inner data structure and its invariants.
- [ ] Document in the struct-level doc comment that concurrent access MUST be serialized by a per-run mutex, referencing [2_TAS-BR-021].

## 3. Code Review
- [ ] Verify `FanOutTracker` has no interior mutability (`Cell`, `RefCell`, `Mutex`) — it relies on external mutex.
- [ ] Confirm the `record_completion` method is `&mut self`, enforcing exclusive access at the type level.
- [ ] Verify that the failure-propagation semantics are clear: does one sub-agent failure immediately fail the parent, or does it wait for all? Ensure the chosen behavior matches the spec (immediate propagation).
- [ ] Confirm `FanOutTracker` is in `devs-core` (no runtime deps).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- fanout` to execute all fan-out tests.
- [ ] Run `./do test` to verify traceability annotations.

## 5. Update Documentation
- [ ] Add doc comments on `FanOutTracker` explaining the per-run mutex contract and the merge handler trigger condition.

## 6. Automated Verification
- [ ] Run `./do lint` and confirm no warnings.
- [ ] Run `cargo test -p devs-core -- fanout_concurrent_completions_serialized` and verify deterministic results across 10 runs.
