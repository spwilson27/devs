# Task: ACID State Transition Guard (Sub-Epic: 07_Audit Trails & Glass-Box Observability)

## Covered Requirements
- [3_MCP-REQ-SYS-002]

## 1. Initial Test Written
- [ ] Create a unit test in `packages/core/test/audit/acid_guard.test.ts` that wraps a mock tool call with a state transition logger.
- [ ] The test should verify that a database write to `state.sqlite` is completed and flushed *before* the mock tool's implementation is invoked.
- [ ] Use a spy or mock to ensure the execution order: `DB.write()` -> `Tool.execute()`.
- [ ] Test failure scenario: If the DB write fails, the tool call must NOT be executed, and an error should be raised.

## 2. Task Implementation
- [ ] Implement a `StateTransitionGuard` in `@devs/core/orchestration` that wraps tool execution.
- [ ] Modify the `ToolRegistry` or the tool execution handler to invoke the `StateTransitionGuard` before any tool call is dispatched to the sandbox.
- [ ] The guard must:
  - 1. Capture the current LangGraph state.
  - 2. Open a SQLite transaction.
  - 3. Persist the state checkpoint and a 'PRE_TOOL_EXECUTION' log entry to `agent_logs`.
  - 4. Commit the transaction using ACID-compliant settings (ensure `synchronous = FULL` or `NORMAL` with WAL).
- [ ] Only after the commit succeeds should the tool execution proceed.

## 3. Code Review
- [ ] Ensure the guard is implemented as a middleware or higher-order function that is impossible to bypass for any tool call.
- [ ] Verify that the performance impact of synchronous DB writes before tool calls is acceptable (should be negligible for SQLite on local SSD).
- [ ] Confirm that no partial states are left in the DB if a crash occurs exactly between the write and the tool call.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test packages/core/test/audit/acid_guard.test.ts` to verify the execution sequence and reliability.

## 5. Update Documentation
- [ ] Update the `TAS` section regarding "ACID State Transitions" to reflect the implementation of the `StateTransitionGuard`.
- [ ] Note in the implementation documentation that this guard is a critical safety component for crash recovery.

## 6. Automated Verification
- [ ] Using a test script, intentionally throw an error in the DB write phase and verify that the tool call was never initiated (e.g., check for missing output files or logs from the tool).
