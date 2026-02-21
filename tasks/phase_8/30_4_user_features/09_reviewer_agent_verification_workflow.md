# Task: Implement Reviewer Agent Verification Workflow and Integration (Sub-Epic: 30_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-016]

## 1. Initial Test Written
- [ ] Create unit tests in `src/reviewer/__tests__/agent.test.ts`:
  - Test that `ReviewerAgent.review(commitHash)` spins up a sandbox, runs tests, and returns a `ReviewResult` with `{ pass: boolean, evidence: string, metrics: { durationMs, testCount } }`.
  - Test that reviewer enforces TAS patterns by running a linter/formatter and including linter output in `evidence` when present.
- [ ] Create an integration test `src/reviewer/__tests__/workflow.integration.test.ts` that exercises the full flow: DeveloperAgent writes code, ReviewerAgent runs, and ReviewResult is persisted to `task_reviews` table.

## 2. Task Implementation
- [ ] Implement `src/reviewer/reviewer.agent.ts` with:
  - `async review(commitHash: string): Promise<ReviewResult>` which:
    1. Creates a sandbox (use `ReviewerSandboxManager`).
    2. Checks out `commitHash` inside sandbox.
    3. Runs `runTests` and `runLinters` and gathers outputs.
    4. Asserts TAS patterns by running a config-driven checklist (e.g., lint pass, test coverage threshold) and sets `pass` accordingly.
    5. Persists `ReviewResult` in DB table `task_reviews` with fields `{ commitHash, pass, evidence, createdAt }`.
- [ ] Expose an internal API endpoint or MCP message `reviewer/review` to trigger reviews for CI and on-demand review requests.

## 3. Code Review
- [ ] Ensure reviewer runs use a read-only view of the artifact commit and cannot mutate the main workspace.
- [ ] Verify `ReviewResult` contains machine-readable evidence and links to captured test logs/artifacts stored under `.devs/reviews/<id>/`.
- [ ] Confirm reviewer enforces configured TAS patterns and records which checks passed/failed.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="reviewer.agent|workflow.integration"`.
- [ ] Run `npm run lint` and `npm run build`.

## 5. Update Documentation
- [ ] Add `docs/reviewer/WORKFLOW.md` describing reviewer triggers, review result schema, and how to configure TAS checks.
- [ ] Update `docs/agents/AGENT_ROLES.md` to document responsibilities of ReviewerAgent vs DeveloperAgent.

## 6. Automated Verification
- [ ] CI job that creates a test commit, triggers `ReviewerAgent.review(commitHash)`, and asserts `task_reviews` contains the persisted `ReviewResult` and artifacts directory with logs.
- [ ] Add a smoke test that triggers a review via the MCP endpoint and asserts a quick acknowledgement and eventual persisted review record.
