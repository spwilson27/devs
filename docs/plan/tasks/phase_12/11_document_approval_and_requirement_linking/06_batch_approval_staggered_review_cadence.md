# Task: Implement Batch Approval Mode and Staggered Review Cadence Configuration (Sub-Epic: 11_Document Approval and Requirement Linking)

## Covered Requirements
- [8_RISKS-REQ-040]

## 1. Initial Test Written
- [ ] In `packages/core/src/approval/__tests__/approvalCadenceConfig.test.ts`, write unit tests:
  - Test `ApprovalCadenceConfig.default()` returns a config where P1 tasks use `'batch'` mode and P3 tasks use `'individual'` mode.
  - Test `setMode(priority: Priority, mode: 'batch' | 'individual'): void` updates the config for the given priority.
  - Test `getMode(priority: Priority): 'batch' | 'individual'` returns the correct mode.
  - Test `serialize(): string` and `static deserialize(json: string): ApprovalCadenceConfig` round-trip correctly.
  - Test that setting `mode = 'batch'` for P3 is allowed (no hard constraint enforced in config — enforcement is in the UI).
- [ ] In `packages/core/src/approval/__tests__/batchApprovalQueue.test.ts`:
  - Test `BatchApprovalQueue.enqueue(task: ApprovableTask): void` adds the task.
  - Test `BatchApprovalQueue.approveAll(): ApprovalResult[]` marks all queued tasks approved and clears the queue.
  - Test `BatchApprovalQueue.reject(taskId: string, reason: string): void` removes the task and records rejection.
  - Test `BatchApprovalQueue.pendingCount(): number` returns the correct count.
- [ ] In `packages/webview-ui/src/components/__tests__/ApprovalCadenceSettings.test.tsx`:
  - Render `<ApprovalCadenceSettings config={defaultConfig} onChange={mockFn} />`.
  - Assert two toggle groups render for P1 and P3 priorities.
  - Assert selecting "Batch" for P1 calls `onChange` with updated config.
  - Assert a warning banner renders when P3 is set to batch mode: "Individual sign-off required for architectural changes."
- [ ] In `packages/webview-ui/src/components/__tests__/BatchApprovalToolbar.test.tsx`:
  - Assert the toolbar renders "Approve All (N)" button where N is the pending count.
  - Assert clicking "Approve All" calls `onApproveAll`.
  - Assert clicking "Reject Selected" calls `onRejectSelected` with the selected task IDs.

## 2. Task Implementation
- [ ] Create `packages/core/src/approval/approvalCadenceConfig.ts`:
  - Export `type ApprovalMode = 'batch' | 'individual'`.
  - Export `class ApprovalCadenceConfig`:
    - Internal map `Map<Priority, ApprovalMode>`.
    - `static default(): ApprovalCadenceConfig` — P1 → `'batch'`, P2 → `'batch'`, P3 → `'individual'`.
    - `setMode(priority: Priority, mode: ApprovalMode): void`
    - `getMode(priority: Priority): ApprovalMode`
    - `serialize(): string` / `static deserialize(json: string): ApprovalCadenceConfig`
- [ ] Create `packages/core/src/approval/batchApprovalQueue.ts`:
  - Export `interface ApprovableTask { id: string; priority: Priority; label: string; semanticChanges: SemanticChange[] }`.
  - Export `interface ApprovalResult { taskId: string; approved: boolean; reason?: string; timestamp: number }`.
  - Export `class BatchApprovalQueue`:
    - `enqueue(task: ApprovableTask): void`
    - `approveAll(): ApprovalResult[]`
    - `reject(taskId: string, reason: string): ApprovalResult`
    - `pendingCount(): number`
    - `getPending(): ApprovableTask[]`
- [ ] Create `packages/webview-ui/src/components/ApprovalCadenceSettings.tsx`:
  - Props: `config: ApprovalCadenceConfig`, `onChange: (updated: ApprovalCadenceConfig) => void`.
  - Renders a settings section with a toggle group per priority (P1, P2, P3) using Tailwind radio-button-style pills.
  - Shows a yellow warning banner when P3 is set to `'batch'` mode.
  - Persists changes to `vscode.setState()`.
- [ ] Create `packages/webview-ui/src/components/BatchApprovalToolbar.tsx`:
  - Props: `queue: BatchApprovalQueue`, `onApproveAll: () => void`, `onRejectSelected: (ids: string[]) => void`.
  - Renders the "Approve All (N)" button (primary, green) and "Reject Selected" button (secondary, red).
  - Shows a list of pending tasks with checkboxes for selective rejection.
- [ ] Wire `ApprovalCadenceSettings` into a settings panel accessible from the dashboard header gear icon.
- [ ] Wire `BatchApprovalToolbar` into the approval workflow: when tasks in P1 mode queue up, display the toolbar; when in P3 individual mode, display individual `<RequirementSignOff>` checkboxes instead.

## 3. Code Review
- [ ] Confirm `ApprovalCadenceConfig` and `BatchApprovalQueue` are framework-agnostic (no React imports).
- [ ] Verify the P3 individual-mode enforcement is a UI-layer concern — the core classes must not hard-reject P3 batch config.
- [ ] Ensure `approveAll()` returns immutable `ApprovalResult[]` (no mutation after return).
- [ ] Confirm the warning banner for P3 batch mode is visible and not hidden behind a scroll container.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="approvalCadenceConfig|batchApprovalQueue"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="ApprovalCadenceSettings|BatchApprovalToolbar"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/core run typecheck && pnpm --filter @devs/webview-ui run typecheck` to confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Add section "Approval Cadence" to `packages/core/AGENT.md`: document `ApprovalCadenceConfig` defaults, how the orchestrator reads the config to decide whether to queue or block per priority, and the `BatchApprovalQueue` lifecycle.
- [ ] Add section "Batch Approval Toolbar" to `packages/webview-ui/AGENT.md`: describe when the toolbar appears vs. individual checkboxes, and the P3 warning behavior.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test --coverage -- --testPathPattern="approvalCadenceConfig|batchApprovalQueue"` and assert branch coverage ≥ 90%.
- [ ] Execute Playwright E2E test (`pnpm e2e -- --grep "batch approval cadence"`) that: opens settings, sets P1 to batch mode, queues 3 mock P1 tasks, clicks "Approve All (3)", and asserts all tasks are marked approved and the toolbar disappears. Confirm test exits with code 0.
