# Task: Implement Directive Submission State Integration with MCP Tool Trigger and Optimistic ThoughtStreamer Append (Sub-Epic: 80_Priority_Toggle_Feedback)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-033]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/components/DirectiveWhisperer/__tests__/DirectiveWhispererSubmit.test.tsx`, write integration tests using Vitest + React Testing Library with mocked MCP client:
  - **MCP tool invocation test**: When the form is submitted with directive text and `isPriority=false`, assert that `mcpClient.callTool('inject_directive', { text: '<input>', priority: 'normal' })` is called exactly once.
  - **Priority MCP invocation test**: When submitted with `isPriority=true`, assert `mcpClient.callTool('inject_directive', { text: '<input>', priority: 'immediate' })` is called.
  - **Optimistic append test**: Immediately upon submission (before the MCP promise resolves), assert that a new entry appears in the `ThoughtStreamer` mock with `type: 'directive'`, `text: '<input>'`, and `status: 'pending'`.
  - **Input reset test**: After successful submission, assert that the directive text input is cleared and `isPriority` is reset to `false`.
  - **Submitting lock test**: While awaiting MCP response, assert the submit button has `disabled` attribute and `aria-busy="true"`.
  - **Error rollback test**: When the MCP call rejects, assert the optimistically appended directive entry is **removed** from `ThoughtStreamer` and an error toast/notification is displayed.
  - **Double-submit prevention test**: Rapidly clicking submit twice results in only one MCP `callTool` invocation.
- [ ] In `packages/vscode/src/webview/hooks/__tests__/useDirectiveSubmit.test.ts`, write unit tests for the `useDirectiveSubmit` hook:
  - Assert the hook returns `{ submit, isSubmitting }`.
  - Assert `isSubmitting` transitions `false → true → false` around an async MCP call.
  - Assert `submit` throws (or returns a rejected promise) when called while already submitting.

## 2. Task Implementation
- [ ] Create the hook `packages/vscode/src/webview/hooks/useDirectiveSubmit.ts`:
  - Signature: `useDirectiveSubmit(mcpClient: McpClient, thoughtStreamStore: ThoughtStreamStore): { submit: (text: string, priority: 'normal' | 'immediate') => Promise<void>; isSubmitting: boolean }`.
  - Use a `useRef` guard to prevent concurrent submissions.
  - On `submit(text, priority)`:
    1. Generate a temporary `optimisticId = crypto.randomUUID()`.
    2. Call `thoughtStreamStore.appendEntry({ id: optimisticId, type: 'directive', text, priority, status: 'pending', timestamp: Date.now() })` synchronously (optimistic update).
    3. Set `isSubmitting = true`.
    4. Call `await mcpClient.callTool('inject_directive', { text, priority })`.
    5. On success: call `thoughtStreamStore.updateEntry(optimisticId, { status: 'acknowledged' })`.
    6. On error: call `thoughtStreamStore.removeEntry(optimisticId)` and re-throw so the UI can display an error notification.
    7. Set `isSubmitting = false` in a `finally` block.
- [ ] In `DirectiveWhisperer.tsx`, wire up `useDirectiveSubmit`:
  - Import and call `useDirectiveSubmit(mcpClient, thoughtStreamStore)`.
  - On form `onSubmit`: call `submit(directiveText, isPriority ? 'immediate' : 'normal')`, then reset `directiveText` and `isPriority` state on success.
  - Pass `isSubmitting` as the `disabled` prop to `PriorityToggle` and the submit button.
  - Add `aria-busy={isSubmitting}` to the submit button.
- [ ] Extend `ThoughtStreamStore` (Zustand slice at `packages/vscode/src/webview/store/thoughtStreamSlice.ts`) with three new actions:
  - `appendEntry(entry: ThoughtEntry): void` — prepends/appends to the stream array.
  - `updateEntry(id: string, patch: Partial<ThoughtEntry>): void` — merges patch into the matching entry by `id`.
  - `removeEntry(id: string): void` — filters out the entry with the given `id`.
- [ ] Ensure `ThoughtEntry` type (in `packages/shared/src/types/thought.ts` or co-located) includes: `id: string`, `type: 'thought' | 'directive' | 'tool_call'`, `text: string`, `priority?: 'normal' | 'immediate'`, `status: 'pending' | 'acknowledged' | 'error'`, `timestamp: number`.

## 3. Code Review
- [ ] Verify the optimistic update happens **synchronously before** the `await mcpClient.callTool(...)` line, not after.
- [ ] Verify the `finally` block always resets `isSubmitting` regardless of success or failure.
- [ ] Verify the concurrent-submission guard (`useRef`) prevents re-entrant calls.
- [ ] Verify `inject_directive` is the exact MCP tool name used (no typos or string literals elsewhere).
- [ ] Verify the Zustand actions (`appendEntry`, `updateEntry`, `removeEntry`) are pure and do not mutate state directly (use Immer or spread syntax).
- [ ] Verify `ThoughtEntry.id` is always a UUID (via `crypto.randomUUID()`), not an incremental integer.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="DirectiveWhispererSubmit|useDirectiveSubmit"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/vscode test -- --coverage --testPathPattern="useDirectiveSubmit"` and confirm line and branch coverage ≥ 90% for `useDirectiveSubmit.ts`.
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="thoughtStreamSlice"` to confirm existing and new slice tests pass.

## 5. Update Documentation
- [ ] Document `useDirectiveSubmit` in `packages/vscode/src/webview/hooks/README.md` (create if absent): describe the optimistic update pattern, the MCP tool called, and the rollback behavior on error.
- [ ] Update `specs/agent_memory/phase_11_decisions.md` with: "DirectiveWhisperer submission uses `inject_directive` MCP tool. Optimistic entries are appended to ThoughtStream with `status: 'pending'` immediately on submit and rolled back on MCP error. `useDirectiveSubmit` hook owns this lifecycle."
- [ ] Update `packages/shared/src/types/thought.ts` JSDoc to document the `priority` and `status` fields.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="DirectiveWhispererSubmit|useDirectiveSubmit" --reporter=json > /tmp/submit_integration_test_results.json` and assert `"numFailedTests": 0`.
- [ ] Run `grep -rn "inject_directive" packages/vscode/src/webview/hooks/useDirectiveSubmit.ts` and assert exactly **one** match (the MCP call site).
- [ ] Run `grep -rn "removeEntry\|appendEntry\|updateEntry" packages/vscode/src/webview/store/thoughtStreamSlice.ts` and assert all three methods are present.
