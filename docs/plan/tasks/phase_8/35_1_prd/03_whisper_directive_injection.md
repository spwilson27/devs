# Task: Implement Mid-Task Context Injection (Whisper Directives) (Sub-Epic: 35_1_PRD)

## Covered Requirements
- [1_PRD-REQ-UI-009]

## 1. Initial Test Written
- [ ] Create a new test file `src/core/orchestrator/__tests__/ContextInjector.test.ts`.
- [ ] Write a test `should receive a whisper directive and append it to the active task's context`.
- [ ] Write a test `should prioritize whisper directives over default TAS instructions in the compiled prompt`.
- [ ] Write a test `should persist the injected directive to SQLite for auditability and recovery`.

## 2. Task Implementation
- [ ] Implement a `ContextInjector` service or API endpoint (`injectDirective(taskId, directiveText)`).
- [ ] Update the `tasks` SQLite table schema (or a dedicated `task_directives` table) to store user-provided whisper text.
- [ ] Modify the `PromptManager` or Context Builder layer to actively query and prepend/append active directives to the system prompt for the `DeveloperAgent`.
- [ ] Add visual formatting in the prompt compiled output indicating `<user_whisper_directive>` to ensure the LLM treats it with highest precedence.

## 3. Code Review
- [ ] Ensure the prompt builder safely sanitizes and formats the user's whisper directive to prevent prompt injection attacks against the agent.
- [ ] Verify that injected context is only applied to the specified Task ID and doesn't leak into subsequent tasks.
- [ ] Check SQLite schema updates for proper migrations.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test -- src/core/orchestrator/__tests__/ContextInjector.test.ts`.
- [ ] Verify the compiled prompt string correctly contains the mock whisper directive.

## 5. Update Documentation
- [ ] Update `docs/user_guide/directives.md` explaining how context injection modifies agent behavior.
- [ ] Log the new schema migration in the database architecture docs.

## 6. Automated Verification
- [ ] Run a test CLI command e.g., `devs whisper "Use a functional approach here"` and verify the subsequent agent prompt generation includes the exact text.
