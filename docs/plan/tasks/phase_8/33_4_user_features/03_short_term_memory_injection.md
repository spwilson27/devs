# Task: Implement Short-term Memory Injection via User Directives (Sub-Epic: 33_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-076]

## 1. Initial Test Written
- [ ] Write unit tests in `src/tests/engine/directives.test.ts` to verify that a user directive passed to the agent is correctly injected into the immediate context array.
- [ ] Write integration tests verifying that injected directives take highest precedence during the next SAOP evaluation loop.

## 2. Task Implementation
- [ ] Create an API or CLI endpoint (e.g., `/whisper` or `inject-directive`) in `src/cli/commands.ts` to accept real-time user directives for an active task.
- [ ] Modify the `PromptManager` and `PlanNode` (e.g., in `src/engine/prompts.ts`) to ingest and isolate the short-term memory block.
- [ ] Update the SAOP reasoning engine to evaluate this injected directive over default architectural constraints and standard TAS context for the active task.

## 3. Code Review
- [ ] Ensure the injected context block is strictly delimited (e.g., as `USER_DIRECTIVE`) to prevent prompt injection vulnerabilities from non-user sources.
- [ ] Verify that the injected directive is properly cleared after the current task is completed or rolled back to avoid unintended behavior in future tasks.

## 4. Run Automated Tests to Verify
- [ ] Execute `npm run test -- src/tests/engine/directives.test.ts` to confirm that injected prompts alter the default node output.

## 5. Update Documentation
- [ ] Document the CLI usage of memory injection (`/whisper`) in `docs/user-guide.md` and clarify its ephemeral nature.
- [ ] Ensure developer memory reflects how directives can override the TAS for single tasks.

## 6. Automated Verification
- [ ] Execute a script that begins a task, injects a conflicting directive mid-run via the newly added API/CLI, and asserts that the resulting implementation satisfies the injected directive rather than the underlying TAS.
