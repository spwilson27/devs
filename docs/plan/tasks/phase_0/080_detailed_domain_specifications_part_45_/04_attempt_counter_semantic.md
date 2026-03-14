# Task: Stage Run Attempt Counter Semantic (Sub-Epic: 080_Detailed Domain Specifications (Part 45))

## Covered Requirements
- [2_TAS-REQ-478]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-core"]

## 1. Initial Test Written
- [ ] In `devs-core`, create test module `tests::attempt_counter`
- [ ] Write test `test_attempt_starts_at_one`: create a new `StageRun`. Assert `stage_run.attempt == 1`.
- [ ] Write test `test_attempt_increments_on_failure`: create a `StageRun` with `attempt = 1`. Call the retry/failure handler (the method that processes a genuine failure — non-zero exit with no rate-limit match). Assert `attempt == 2`. Repeat, assert `attempt == 3`.
- [ ] Write test `test_rate_limit_fallback_does_not_increment`: create a `StageRun` with `attempt = 1`. Simulate a rate-limit event that triggers pool fallback (call the rate-limit handler). Assert `attempt` is still `1`.
- [ ] Write test `test_rate_limit_then_failure_increments_once`: create a `StageRun` at `attempt = 1`. Process a rate-limit event (no increment). Then process a genuine failure (increment). Assert `attempt == 2`.
- [ ] Write test `test_multiple_rate_limits_no_increment`: process 3 consecutive rate-limit events on the same `StageRun`. Assert `attempt` remains `1`.

## 2. Task Implementation
- [ ] In the `StageRun` struct, ensure `attempt` field is initialized to `1` in the constructor (not `0`).
- [ ] Create a method `pub fn record_failure(&mut self)` that increments `self.attempt += 1`. This is called only for genuine failures.
- [ ] Create a method `pub fn record_rate_limit(&mut self)` (or equivalent) that handles rate-limit events WITHOUT incrementing `attempt`. This method may update other fields (e.g., `last_rate_limit_at`) but must not touch `attempt`.
- [ ] Ensure the distinction is clear in the API: callers must determine whether a failure is a genuine failure vs. a rate-limit before calling the appropriate method.
- [ ] Add doc comments on both methods explaining the semantic difference per this requirement.

## 3. Code Review
- [ ] Verify `attempt` is never set to `0` anywhere in the codebase.
- [ ] Verify the rate-limit handler does not call `record_failure` or otherwise increment `attempt`.
- [ ] Verify the `attempt` field is not directly `pub` — mutations go through the defined methods.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core attempt_counter` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-478` annotation to each test function.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core attempt_counter -- --nocapture` and verify zero failures. Grep for `2_TAS-REQ-478`.
