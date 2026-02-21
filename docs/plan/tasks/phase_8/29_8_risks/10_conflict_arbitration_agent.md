# Task: Conflict Resolution & Arbitration Agent (Sub-Epic: 29_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-138]

## 1. Initial Test Written
- [ ] Create unit tests at tests/agents/arbitration.spec.ts that simulate multiple conflicting patches for the same file and assert:
  - The arbitration agent evaluates proposals using the configured policy (timestamp, agentPriority, or userOverride) and selects a single patch to apply.
  - Non-selected patches are converted into review proposals with diffs, and an event is emitted `arbitration.proposalCreated`.
  - The chosen patch is applied in a temporary branch and validated by running the repository's test suite (mocked) before being merged.

## 2. Task Implementation
- [ ] Implement `src/agents/arbitration-agent.ts` exposing `arbitrate(conflicts[], policy)` which:
  - Accepts an array of conflict objects `{ agentId, diff, priority, timestamp, testsPassing }`.
  - Evaluates proposals deterministically according to `policy` and returns `{ winnerId, winnerPatch, proposalsToReview }`.
  - Applies the winner patch into a temporary git branch, runs `npm test` in that branch, and only commits+merges if tests pass; otherwise marks result as `failed_validation` and downgrades the winner.
- [ ] Create helper utilities to produce merge-friendly patches and store proposal metadata under `merge_proposals/` as JSON.

## 3. Code Review
- [ ] Ensure arbitration logic is deterministic (same input -> same output) and well-documented.
- [ ] Validate that arbitration never loses code: every non-applied proposal is persisted and reviewable by humans.
- [ ] Confirm temporary branch operations are isolated and cleaned up after success/failure.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- tests/agents/arbitration.spec.ts` to validate selection and merge simulation.
- [ ] Run an integration simulation `scripts/simulate-arbitration.sh` that creates three conflicting branches and runs arbitration end-to-end in a temp repo.

## 5. Update Documentation
- [ ] Add `docs/agents/arbitration.md` describing arbitration policies, how to configure agent priorities, and human override workflows.

## 6. Automated Verification
- [ ] Add a CI job `arbitration-sim` that runs the end-to-end simulation in a sandbox repo and verifies the outcome; job artifacts should include the temporary branch diffs and proposal JSON.
