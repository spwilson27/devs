# Task: Mid-Task Context Injection (Whispering) (Sub-Epic: 30_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-010]

## 1. Initial Test Written
- [ ] Create `src/core/mcp/__tests__/whisper_handler.test.ts`.
- [ ] Write a test `should append injected context directly into the active task's short-term memory array`.
- [ ] Write a test `should trigger a ContextRefresh event in the orchestrator to ensure the next LLM turn includes the new context`.
- [ ] Create `src/cli/__tests__/whisper_command.test.ts` to test the CLI interface `devs whisper "message"`.

## 2. Task Implementation
- [ ] Implement `src/core/mcp/WhisperHandler.ts`. It should expose an IPC method `injectContext(taskId: string, message: string)`.
- [ ] The handler must update the active task's `MemoryLayer` (short-term memory) by appending a new system/user hybrid message: `[USER DIRECTIVE INJECTED]: {message}`.
- [ ] Modify the `ContextPruner` and the main orchestration loop to listen for a `ContextRefresh` event. If triggered, the next agent turn MUST pull the updated memory array instead of using cached context.
- [ ] Implement the CLI command `devs whisper <message>` in `src/cli/commands/whisper.ts` which sends the IPC payload to the running orchestrator server.
- [ ] Implement a VSCode UI input box (e.g., "Whisper to Agent") in the active task view that invokes the `devs.whisper` command.

## 3. Code Review
- [ ] Verify that context injection does NOT restart the active task, but smoothly integrates into the very next turn of the LangGraph state machine.
- [ ] Ensure the injected message is persisted to the `agent_logs` SQLite table for full traceability.
- [ ] Check that proper IPC authentication/validation is in place so only the valid user session can whisper to the agent.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test:unit -- src/core/mcp/__tests__/whisper_handler.test.ts` to ensure memory updates work.
- [ ] Run `npm run test:unit -- src/cli/__tests__/whisper_command.test.ts` to verify CLI parsing and IPC message dispatch.

## 5. Update Documentation
- [ ] Update `docs/user_guide/agent_interaction.md` to explain how and when to use the Whisper feature to steer the agent mid-task.
- [ ] Document the `devs whisper` command in `docs/cli_reference.md`.

## 6. Automated Verification
- [ ] Run a test script `scripts/verify_whisper_ipc.ts` that mocks an active orchestrator, sends a whisper IPC call, and asserts that the internal memory state of the mocked agent reflects the injected message.
