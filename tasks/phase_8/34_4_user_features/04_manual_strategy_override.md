# Task: Implement Manual Strategy Override Directive (Sub-Epic: 34_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-077]

## 1. Initial Test Written
- [ ] Create `tests/api/controllers/StrategyOverride.test.ts`.
- [ ] Write a test `should expose an IPC/MCP endpoint to accept a custom user strategy string`.
- [ ] Write a test `should successfully inject the user strategy into the active task context and resume execution if paused`.
- [ ] Write a test `should reset the failure_count and entropy hash history when a manual override is applied`.

## 2. Task Implementation
- [ ] Add a `devs override --strategy "..."` CLI command in `@devs/cli` and a corresponding MCP tool/IPC endpoint in the `OrchestratorServer`.
- [ ] Implement the `applyOverride(taskId: string, strategy: string)` method in the orchestration core.
- [ ] This method must: 
    1. Append the user's explicit strategy directly to the system prompt of the active agent as a high-priority `<user_directive>`.
    2. Reset the `failure_count` to 0.
    3. Clear the `EntropyDetector`'s rolling window.
    4. Transition the task state from `PAUSED_FOR_INTERVENTION` (or its current state) back to `CodeNode` or `PlanNode`.
- [ ] Ensure the override event and the user's provided strategy string are securely logged in the `agent_logs` table.

## 3. Code Review
- [ ] Validate that the override string is appropriately sanitized before being injected into the prompt context to prevent malformed XML tags from breaking the parser.
- [ ] Ensure that the state transition safely wakes the LangGraph execution engine if it was completely halted.

## 4. Run Automated Tests to Verify
- [ ] Execute `npx vitest run tests/api/controllers/StrategyOverride.test.ts`.
- [ ] Confirm 100% pass rate.

## 5. Update Documentation
- [ ] Update `docs/cli_reference.md` and add usage examples for the `devs override` command.
- [ ] Add notes to the `human_in_the_loop.md` guide on how users can provide specific libraries or architectures to unblock a paused agent.

## 6. Automated Verification
- [ ] Simulate a paused task state, programmatically send a JSON IPC payload invoking the override with a dummy strategy, and assert that the orchestration loop resumes and the next trace log contains the dummy strategy text.