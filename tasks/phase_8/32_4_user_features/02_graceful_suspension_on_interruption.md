# Task: Implement Graceful Suspension on Interruption (Sub-Epic: 32_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-043]

## 1. Initial Test Written
- [ ] Write a unit test in `src/orchestrator/state-manager.test.ts` that simulates a network loss (e.g., throwing a `NetworkError` from the LLM provider API).
- [ ] Assert that the `Orchestrator` catches the error, transitions its state to `SUSPENDED`, and synchronously saves the current agent turn context to the SQLite `state` database.
- [ ] Write a test that simulates restarting the `devs run` command, verifying it detects the `SUSPENDED` state in SQLite and successfully resumes from the exact last turn.

## 2. Task Implementation
- [ ] Modify the LLM client wrapper in `src/llm/client.ts` to explicitly categorize network-related errors (e.g., timeouts, DNS failures, `ECONNRESET`) as `NetworkInterruptionError`.
- [ ] Update the main agent loop in `src/orchestrator/loop.ts` to catch `NetworkInterruptionError`.
- [ ] On catch, serialize the current graph state, pending tool calls, and turn context, and save it to the SQLite `state.sqlite` database using `StateRepository.saveCheckpoint(status: 'SUSPENDED')`.
- [ ] Gracefully exit the CLI process with a message indicating suspension due to network issues.
- [ ] Update the initialization logic in `src/orchestrator/init.ts` to check for a `SUSPENDED` state upon startup (`devs run` or `devs resume`). If found, load the checkpoint and resume the graph execution natively.

## 3. Code Review
- [ ] Verify that the SQLite state checkpointing is atomic and does not leave corrupted or partial state if the process is hard-killed during the save.
- [ ] Ensure that sensitive data (if any) in the turn context is not inadvertently logged in plaintext outside the SQLite database.
- [ ] Check that the resume logic correctly restores the exact context window and tool call queue without duplicating actions.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- src/orchestrator/state-manager.test.ts` to ensure the suspension and resumption flows pass.
- [ ] Execute the full integration suite to verify this new error handling doesn't break existing failover mechanisms.

## 5. Update Documentation
- [ ] Update `docs/architecture/state_machine.md` to include the new `SUSPENDED` state and its trigger conditions.
- [ ] Document the auto-resume behavior in `docs/cli.md` under the `devs run` and `devs resume` commands.

## 6. Automated Verification
- [ ] Create an E2E test script that starts a `devs run` process, mocks an HTTP timeout from the LLM endpoint midway, verifies the process exits cleanly with a suspension message, and then restarts the process to verify it resumes and completes the task.