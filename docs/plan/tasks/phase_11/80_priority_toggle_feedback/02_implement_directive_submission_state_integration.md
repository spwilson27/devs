# Task: Implement Directive Submission State Integration with MCP Tool and Optimistic ThoughtStreamer Append (Sub-Epic: 80_Priority_Toggle_Feedback)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-033]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/components/DirectiveWhisperer/__tests__/DirectiveWhisperer.submission.test.tsx`, write unit and integration tests:
  - **Unit — MCP call on submit:**
    - Mock the `inject_directive` MCP tool invocation via `vi.mock` (Vitest) or `jest.mock` targeting the `useMcpClient` hook or equivalent bridge utility.
    - Test: submitting the DirectiveWhisperer form calls `inject_directive` with `{ text: "<directive text>", priority: false }` when the "Immediate Pivot" toggle is off.
    - Test: submitting calls `inject_directive` with `{ text: "<directive text>", priority: true }` when the "Immediate Pivot" toggle is on.
    - Test: the submit button is disabled (and shows a spinner/loading indicator) immediately after the form is submitted, until the MCP call resolves.
    - Test: after a successful MCP response, the input field is cleared and `isPriority` resets to `false`.
    - Test: after a failed MCP response, the input field retains its text, `isPriority` retains its state, and an error message is rendered below the input.
  - **Unit — Optimistic ThoughtStreamer append:**
    - Mock the global Zustand `useUiStore` (or equivalent store) and its `appendThought` action.
    - Test: immediately on form submission (before the MCP call resolves), `appendThought` is called with an optimistic thought object: `{ id: "<uuid>", type: "DIRECTIVE", text: "<directive text>", priority: <boolean>, status: "PENDING", timestamp: <now> }`.
    - Test: when the MCP call resolves successfully, the optimistic thought's `status` field is updated to `"ACKNOWLEDGED"` via `updateThoughtStatus("<uuid>", "ACKNOWLEDGED")`.
    - Test: when the MCP call fails, the optimistic thought's `status` is updated to `"FAILED"` and a `errorMessage` field is set on the thought object.
  - **Integration — form keyboard shortcut:**
    - Test: pressing `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows/Linux) while the directive input is focused triggers submission.

## 2. Task Implementation
- [ ] Locate `packages/vscode/src/webview/components/DirectiveWhisperer/DirectiveWhisperer.tsx`.
- [ ] Import (or create) `useMcpClient` hook from `packages/vscode/src/webview/hooks/useMcpClient.ts` that wraps the VSCode postMessage bridge to invoke MCP tool calls.
- [ ] In the `handleSubmit` function of `DirectiveWhisperer`:
  1. Set a local `isSubmitting` state to `true` and disable the submit button.
  2. Generate a UUID (use `crypto.randomUUID()`) as `optimisticId`.
  3. Call `appendThought({ id: optimisticId, type: "DIRECTIVE", text: directiveText, priority: isPriority, status: "PENDING", timestamp: Date.now() })` on the global Zustand store.
  4. Call `mcpClient.invokeTool("inject_directive", { text: directiveText, priority: isPriority })`.
  5. On success: call `updateThoughtStatus(optimisticId, "ACKNOWLEDGED")`, clear the input field (`setDirectiveText("")`), reset `isPriority` to `false`, set `isSubmitting` to `false`.
  6. On failure: call `updateThoughtStatus(optimisticId, "FAILED", { errorMessage: err.message })`, retain input text, set `isSubmitting` to `false`, set a local `submissionError` state to the error message string.
- [ ] Render an error message below the input when `submissionError` is non-null: `<p role="alert" className="directive-whisperer__error">{submissionError}</p>`.
- [ ] Add keyboard shortcut: attach `onKeyDown` handler to the `<textarea>` input; if `(e.metaKey || e.ctrlKey) && e.key === "Enter"`, call `handleSubmit()`.
- [ ] In `packages/vscode/src/webview/store/uiStore.ts` (Zustand store), add:
  - `appendThought(thought: OptimisticThought): void` — pushes the thought to `state.thoughts`.
  - `updateThoughtStatus(id: string, status: ThoughtStatus, extra?: Partial<OptimisticThought>): void` — finds the thought by `id` and merges new fields.
  - Define `OptimisticThought` and `ThoughtStatus` types in `packages/vscode/src/webview/types/thought.ts`.
- [ ] In `packages/vscode/src/webview/hooks/useMcpClient.ts`, implement `invokeTool(toolName: string, params: Record<string, unknown>): Promise<unknown>` using `vscode.postMessage({ type: "INVOKE_MCP_TOOL", toolName, params })` and awaiting the corresponding `MESSAGE` event with matching correlation ID.

## 3. Code Review
- [ ] Verify the optimistic append occurs **synchronously before** the async MCP call — no `await` before `appendThought`.
- [ ] Verify the directive text and `isPriority` values captured at submission time are used in both the optimistic thought and the MCP call (no stale closure).
- [ ] Verify the `isSubmitting` guard prevents duplicate submissions.
- [ ] Verify all Zustand store mutations use `set()` (no direct state mutation).
- [ ] Verify the `OptimisticThought` type is exported from `packages/vscode/src/webview/types/thought.ts` for use by `ThoughtStreamer` (Task 03).
- [ ] Verify error state is cleared when the user starts editing the directive text after a failure.
- [ ] Verify no `console.log` or debug statements are present in production code paths.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="DirectiveWhisperer.submission"` from the repository root.
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="uiStore"` to verify store action tests pass.
- [ ] Confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/vscode build` and confirm TypeScript compilation exits with code 0.

## 5. Update Documentation
- [ ] Update `packages/vscode/src/webview/components/DirectiveWhisperer/DirectiveWhisperer.agent.md`:
  - Document the full `handleSubmit` control flow: optimistic append → MCP invocation → status update.
  - Document the payload schema for `inject_directive`: `{ text: string, priority: boolean }`.
  - Document the error recovery behavior (retained input, FAILED thought status).
- [ ] Update `packages/vscode/src/webview/store/uiStore.agent.md` (create if absent):
  - Document `appendThought` and `updateThoughtStatus` actions, their signatures, and the `OptimisticThought` type.
- [ ] Update `packages/vscode/src/webview/hooks/useMcpClient.agent.md` (create if absent):
  - Document `invokeTool` signature, postMessage protocol, and correlation ID mechanism.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="DirectiveWhisperer.submission|uiStore" --json --outputFile=/tmp/test_results_02.json`.
- [ ] Assert `numFailedTests: 0` in `/tmp/test_results_02.json`.
- [ ] Run `pnpm --filter @devs/vscode build` and assert exit code 0.
