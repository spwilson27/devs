# Task: Ensure Orchestrator / Bridge Emits sourceThoughtId on ToolCalls (Sub-Epic: 58_Thought_Connectivity)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-084]

## 1. Initial Test Written
- [ ] Add an integration/unit test that asserts the orchestrator/bridge includes `sourceThoughtId` on outgoing messages when a tool call originates from a thought.
  - File: `packages/orchestrator/tests/bridge-emits-sourceThoughtId.test.ts`
  - Test behavior:
    1. Mock an agent runtime that emits a Thought event and then a ToolCall (tool invocation) referencing that Thought's local id.
    2. Spy on `webview.postMessage` (or the postMessage abstraction used by the bridge).
    3. Call the bridge handler and assert that the outgoing message body contains `sourceThoughtId` equal to the originating Thought id.
  - Run: `pnpm test -- packages/orchestrator/tests/bridge-emits-sourceThoughtId.test.ts`.

## 2. Task Implementation
- [ ] Implement the bridge wiring to attach `sourceThoughtId`.
  - Files to modify (examples):
    - `packages/orchestrator/src/bridge.ts` (or `src/bridge/index.ts`)
      - In the handler that forwards tool call events, add logic:
        ```ts
        // pseudo
        function forwardToolCall(toolCall, context) {
          const payload = { ...toolCall, sourceThoughtId: toolCall.sourceThoughtId ?? context.originatingThoughtId };
          webview.postMessage({ type: 'TOOL_CALL', payload });
        }
        ```
      - Ensure context carries `originatingThoughtId` set when the orchestrator routes messages from the agent runtime.
    - Update any transport adapters that reshape keys (snake_case vs camelCase) to preserve `sourceThoughtId`.

## 3. Code Review
- [ ] Verify:
  - No performance regressions (avoid deep-cloning large objects unnecessarily).
  - Field name is consistent across layers (prefer `sourceThoughtId`).
  - Backwards compatibility: existing clients without the field must continue to work.

## 4. Run Automated Tests to Verify
- [ ] Run the orchestrator tests + the protocol contract tests: `pnpm test -- packages/orchestrator`.

## 5. Update Documentation
- [ ] Update `packages/orchestrator/README.md` and `docs/protocol.md` describing the new envelope field and showing an example of the outgoing `TOOL_CALL` message.

## 6. Automated Verification
- [ ] Add a lightweight CI smoke test that spins up the bridge in a headless test harness and ensures a synthetic tool-call flow includes the `sourceThoughtId` field in the message captured by a test postMessage spy.