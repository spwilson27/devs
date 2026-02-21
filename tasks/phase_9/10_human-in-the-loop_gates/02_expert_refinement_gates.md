# Task: Implement Expert Refinement Gates (Sub-Epic: 10_Human-in-the-Loop & Gates)

## Covered Requirements
- [8_RISKS-REQ-021]

## 1. Initial Test Written
- [ ] Write a test in `tests/orchestrator/expert_gate.test.ts` that defines a mock module with the `"Expert Only"` metadata flag.
- [ ] Assert that when the orchestrator processes a task associated with this module, it injects the high-reasoning model configuration (e.g., Gemini 3 Pro instead of Flash).
- [ ] Assert that the task state machine requires a 3-agent logic verification (Dev, Reviewer, and a secondary Auditor) before allowing a `CommitNode` transition.

## 2. Task Implementation
- [ ] Extend the task schema in `src/models/Task.ts` and the SQLite `tasks` table to support an `is_expert_only` boolean flag.
- [ ] Modify `src/orchestrator/nodes/ImplementationNode.ts` to check `is_expert_only`. If true, override the model selection to use the configured `HIGH_REASONING_MODEL`.
- [ ] Update `src/orchestrator/nodes/VerificationNode.ts` to support an extended 3-agent verification loop when `is_expert_only` is true. The loop should require unanimous approval from the Dev, Reviewer, and a new `AuditorAgent` instance.
- [ ] Add MCP configuration options for users to tag specific files or directories as "Expert Only" via the `devs configure` command or UI.

## 3. Code Review
- [ ] Review the `ImplementationNode` and `VerificationNode` to ensure the logic cleanly separates standard TDD tasks from expert tasks without duplicating core orchestration logic.
- [ ] Verify that the database schema migration for `is_expert_only` includes proper defaults and rollback strategies.

## 4. Run Automated Tests to Verify
- [ ] Execute `npm run test tests/orchestrator/expert_gate.test.ts` to validate the model swap and 3-agent requirement.
- [ ] Run `npm run test` to confirm standard tasks are not forced through the expert verification loop.

## 5. Update Documentation
- [ ] Create `.agent/expert_refinement.agent.md` explaining the conditions under which a task is elevated to Expert status and the expectations of the 3-agent loop.
- [ ] Document the database schema changes in `docs/architecture/database_schema.md`.

## 6. Automated Verification
- [ ] Implement a script `scripts/verify_expert_mode.ts` that manually inserts an expert task into the database, runs the orchestration loop in a mock mode, and extracts the logs to verify that the `HIGH_REASONING_MODEL` was used and 3 distinct agent signatures are present on the commit.
