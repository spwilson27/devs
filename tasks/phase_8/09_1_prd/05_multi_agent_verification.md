# Task: Implement multi-agent verification workflow for reliability (Sub-Epic: 09_1_PRD)

## Covered Requirements
- [1_PRD-REQ-GOAL-005]

## 1. Initial Test Written
- [ ] Create an integration test `tests/integration/test_multi_agent_verification.py` that validates the verification coordinator runs multiple independent reviewer agents and reaches consensus on test outcomes. The test must:
  1. Use a small deterministic task that has a known passing test suite.
  2. After DeveloperAgent completes the implementation and commit, trigger the `VerificationCoordinator` to launch `N` reviewer instances (default `N=2`).
  3. Each reviewer must run the project's tests in an isolated deterministic sandbox and report `pass`/`fail` and a result digest (checksum).
  4. Assert that the `VerificationCoordinator` collects reviewer results, computes consensus (majority), records verification metadata in the task record (`verification_status`, `verifier_results`, `consensus_digest`) and that `verification_status == 'verified'` when reviewers agree.
  5. If reviewers disagree, assert the coordinator escalates by setting `verification_status == 'escalated'` and scheduling a human review entry.

Example pytest sketch:

```python
def test_multi_agent_verification_flow(monkeypatch):
    from devs.verification import VerificationCoordinator
    coord = VerificationCoordinator(num_reviewers=2)
    result = coord.verify(task_id="task-09-1-verify", commit_hash="abc123")
    assert result.status in ("verified", "escalated")
    assert "verifier_results" in result.metadata
```

## 2. Task Implementation
- [ ] Implement `VerificationCoordinator` and a `ReviewerAgent` wrapper:
  - `VerificationCoordinator.verify(task_id, commit_hash)` should:
    - Spawn `N` reviewer runs using `ExecutionEngine.run_in_sandbox` each isolated to prevent cross-talk.
    - Collect structured results: `{verifier_id, status: pass|fail, summary, digest}`.
    - Compute consensus: if majority status == pass and all digests for passing verifiers match, mark `verification_status = 'verified'` and persist `verifier_results` and `consensus_digest`.
    - If no majority or digest mismatch, mark `verification_status = 'escalated'` and enqueue a human review request with context.
    - Implement configurable timeouts and retries for flaky verifier runs; log and annotate transient failures.
  - Ensure reviewer runs use the deterministic execution engine and the same lockfiles to reduce environment-induced variance.
  - Persist verification metadata atomically with the final documented commit/verification record.

## 3. Code Review
- [ ] Verify:
  - Reviewer runs are isolated and deterministic.
  - Consensus algorithm is well-defined and documented (majority + digest match required for `verified`).
  - Escalation path creates a reproducible human-review record with failure artifacts.
  - Timeouts and retry policies are present and tested.

## 4. Run Automated Tests to Verify
- [ ] Run:
  - `pytest -q tests/integration/test_multi_agent_verification.py`
  - Manually inspect the persisted `verification_status`, `verifier_results`, and `consensus_digest` for the test `task_id`.

## 5. Update Documentation
- [ ] Update `docs/PRD.md` (or `docs/verification/multi_agent_verification.md`) to document:
  - The verification workflow, default `N=2` reviewers, consensus rules, escalation behavior, and where verification metadata is persisted.

## 6. Automated Verification
- [ ] Add `scripts/verify_multi_agent_verification.sh` that:
  1. Runs the integration test.
  2. Queries the state store to assert `verification_status == 'verified'` for the deterministic test case when reviewers agree, or `escalated` when they disagree.
  3. Exits non-zero on any mismatch.
