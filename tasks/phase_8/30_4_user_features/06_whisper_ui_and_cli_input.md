# Task: Implement Context Injection (Whispering) UI and CLI Input (Sub-Epic: 30_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-010]

## 1. Initial Test Written
- [ ] Create unit tests for CLI in `src/cli/__tests__/whisper.command.test.ts`:
  - Test `devs whisper --agent <agentId> --message "..."` parses arguments and calls `ContextInjectionService.inject(agentId, message)` without blocking the main execution loop (assert it returns a 202-like acknowledgement promise).
  - Test missing `--agent` or `--message` results in usage error and non-zero exit code.
- [ ] Create unit tests for VSCode extension integration in `src/vscode/__tests__/whisperInput.test.ts` (if extension exists):
  - Mock VSCode `window.createInputBox()` or webview input to assert the submitted directive calls the backend `ContextInjectionService` via the extension's message channel.
  - Test that the UI input is non-blocking (UI acknowledges with ephemeral toast) and does not pause running agent tasks.

## 2. Task Implementation
- [ ] Implement CLI command `src/cli/commands/whisper.command.ts` that exposes `devs whisper --agent <agentId> --message "..."`:
  - Validate inputs and call `ContextInjectionService.inject(agentId, message)`.
  - Immediately print an acknowledgement `"Directive queued for agent <agentId>"` and exit `0` (do not wait for agent processing).
- [ ] If project has a VSCode extension (`src/vscode/extension.ts`), add a `Whisper` input UI component:
  - Add a sidebar/input contribution that sends directive text to the backend via the extension bridge (use the established IPC/MCP mechanism).
  - UI should provide agent selection dropdown for active agents and an input box for directives, with a non-blocking submit.
- [ ] Implement `src/context/context.injection.ts` client-side helper that serializes directive metadata `{ agentId, message, source, timestamp }` and sends to server endpoint or local agent queue.

## 3. Code Review
- [ ] Ensure the injection mechanism is non-blocking: CLI and UI acknowledge immediately and enqueue directive asynchronously.
- [ ] Verify input sanitization for directive messages to prevent command injection in logs or downstream tools.
- [ ] Confirm the UI shows a clear audit trail entry in the task log for each injected directive (link to Task history persists directive metadata).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="whisper.command|whisperInput|context.injection"` and ensure passing tests.
- [ ] Manually test the VSCode input if the extension harness is available: submit a directive while a dummy agent runs and assert agent receives it.

## 5. Update Documentation
- [ ] Add `docs/ui/WHISPER.md` documenting CLI usage and VSCode whisper input behavior, including security notes about directive content.
- [ ] Update `docs/agents/AGENT_API.md` with the directive message schema and expected acknowledgement behavior.

## 6. Automated Verification
- [ ] Create an automated e2e test that starts a mock agent loop, sends `devs whisper --agent test-agent --message "patch: ignore TODO"`, and asserts the mock agent's in-memory short-term memory contains the directive within 5s.
- [ ] CI step verifies that whisper CLI exits quickly (time < 1s) and that message appears in the agent queue (inspect test-only queue endpoint).
