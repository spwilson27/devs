# Task: Implement Entropy Backoff and Automated Pause Strategy (Sub-Epic: 08_1_PRD)

## Covered Requirements
- [1_PRD-REQ-IMP-005]

## 1. Initial Test Written
- [ ] Create tests that simulate repeated identical failures and assert BackoffManager returns a pause action and persists counters:
  - Inject identical error outputs into BackoffManager.on_error and assert it returns action {type: "pause", reason: "entropy", retry_after: <seconds>} when threshold reached.
  - Assert that transient non-identical errors do not trigger pause and that counters increment appropriately.
  - Use a sandboxed sqlite DB to verify persistent counters survive process restart.

## 2. Task Implementation
- [ ] Implement BackoffManager with:
  - on_error(task_id, output): computes hash via EntropyDetector, updates persistent counters in backoff.sqlite, and returns next action.
  - Configurable strategy parameters: repeat_threshold (default 3), base_backoff_seconds, max_backoff_seconds, jitter_pct.
  - Implement jittered exponential backoff and a clear/panic policy (e.g., escalate to human after configurable attempts).
  - Ensure persistent counters are transactional and namespaced by task_id.

## 3. Code Review
- [ ] Verify backoff logic has ceilings, jitter, and that state is durable; verify it cannot produce negative retry_after and handles DB errors gracefully.

## 4. Run Automated Tests to Verify
- [ ] Run tests that simulate error streams and validate returned actions and DB state; restart process and verify counters persist.

## 5. Update Documentation
- [ ] Update docs/entropy.md with BackoffManager configuration, example timelines, and escalation policy.

## 6. Automated Verification
- [ ] Provide scripts/simulate_backoff.sh that feeds repeated failure fixtures to BackoffManager and validates the pause action and persisted counters; exit 0 only on success.
