# Task: Implement TAS Revision Proposal flow and Arbitrator task creation (Sub-Epic: 23_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-024]

## 1. Initial Test Written
- [ ] Write unit tests at `tests/unit/test_tas_revision_proposal.py`.
  - Test 1: DeveloperAgent.propose_tas_revision(justification, diffs) creates a `TASRevisionTask` object with fields `{id, justification, diffs, status: 'pending_approval', created_by: 'developer_agent'}` persisted to the tasks store.
  - Test 2: If a TASRevisionTask is created, it must not be applied to TAS automatically; only after Arbitrator approval will the TAS be updated.
  - Use an in-memory task store or a test double to keep tests deterministic.

## 2. Task Implementation
- [ ] Implement `devs/tas/revision.py` with a `TASRevisionTask` dataclass and persistence helpers.
- [ ] Add `DeveloperAgent.propose_tas_revision` API that:
  - Validates the provided diffs are well-formed (JSON patch or unified diff) and includes an authoritative technical justification.
  - Persists a `TASRevisionTask` with `status = 'pending_approval'` and emits an `arbitrator_event` that the Arbitrator UI/human can consume.
- [ ] Implement minimal Arbitrator enqueueing so proposals are visible to the Arbitrator agent/human workflow (e.g., write to `tasks` DB or `arbitrator_queue` table).

## 3. Code Review
- [ ] Ensure proposals are immutable once created, include a full audit trail linking the Developer Agent, PlanNode, and the original task.
- [ ] Verify that no code path applies TAS modifications without explicit `approved` state from the Arbitrator.
- [ ] Confirm that the persisted `diffs` are sanitized and do not contain secrets or direct code execution payloads.

## 4. Run Automated Tests to Verify
- [ ] Run `python -m pytest tests/unit/test_tas_revision_proposal.py -q` and ensure tests pass.
- [ ] Add an integration test that simulates human approval (Arbitrator flips status to `approved`) and asserts the TAS update is applied only after approval.

## 5. Update Documentation
- [ ] Document the TAS revision workflow in `docs/process/tas_evolution.md` describing: who can propose, required justification, format of diffs, and approval lifecycle.

## 6. Automated Verification
- [ ] Add CI coverage for the TAS revision unit tests and a nightly/smoke workflow that ensures there are no dangling `pending_approval` TAS tasks older than 7 days (a simple query/test to catch broken flows).
