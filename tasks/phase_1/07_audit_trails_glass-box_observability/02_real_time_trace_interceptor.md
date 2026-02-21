# Task: Real-time Trace Interceptor (Flight Recorder) (Sub-Epic: 07_Audit Trails & Glass-Box Observability)

## Covered Requirements
- [TAS-001], [3_MCP-MCP-002], [TAS-046], [TAS-056], [1_PRD-REQ-PIL-004]

## 1. Initial Test Written
- [ ] Create an integration test in `packages/core/test/audit/trace_interceptor.test.ts` that simulates an agent's turn (thought -> action -> observation).
- [ ] The test should verify that after each simulated turn, entries are automatically written to the `agent_logs` table.
- [ ] Verify that the recorded data accurately reflects the inputs (e.g., thought content matches exactly).
- [ ] Test the interceptor's behavior when the DB is temporarily unavailable (should handle gracefully or retry).

## 2. Task Implementation
- [ ] Implement a `TraceInterceptor` class in `@devs/core/audit` that hooks into the LangGraph node execution flow.
- [ ] Create an `EventBus` in `@devs/core` to publish events when an agent emits a thought, initiates a tool call, or receives a tool result.
- [ ] Subscribe the `TraceInterceptor` to the `EventBus` and implement the `persistTrace` method to write incoming events to the `agent_logs` table in `state.sqlite`.
- [ ] Ensure that trace persistence happens **synchronously** or is awaited before proceeding to the next LangGraph state transition to guarantee audit trail integrity.
- [ ] Include metadata such as `task_id`, `turn_index`, and `agent_role` in every trace record.

## 3. Code Review
- [ ] Verify that the `TraceInterceptor` does not introduce significant latency to the agent implementation loop.
- [ ] Ensure that sensitive data (e.g., API keys) is redacted *before* it is written to the audit log (using `SecretMasker` if already available, otherwise ensure it's a future integration point).
- [ ] Confirm that the persistence logic is ACID-compliant and uses transactions to prevent partial log writes.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test packages/core/test/audit/trace_interceptor.test.ts` to confirm real-time capture and storage.

## 5. Update Documentation
- [ ] Update the `Flight Recorder` documentation in `@devs/core/audit/README.md` to describe how the `TraceInterceptor` operates within the orchestration cycle.
- [ ] Document the `EventBus` event types used for tracing.

## 6. Automated Verification
- [ ] Run a sample LangGraph turn and then query the `agent_logs` table via `sqlite3` to confirm the presence of 'THOUGHT', 'ACTION', and 'OBSERVATION' entries for the sample task.
