# Task: VSCode Sidebar Research Status Panel (Sub-Epic: 11_User Interface & Progress Reporting)

## Covered Requirements
- [4_USER_FEATURES-REQ-024]

## 1. Initial Test Written
- [ ] In `packages/vscode-extension/src/webview/__tests__/ResearchStatusPanel.test.tsx`, write unit tests using React Testing Library and `@vscode/webview-ui-toolkit` mocks for the `ResearchStatusPanel` component:
  - Test: renders a "Researching..." heading when `status === 'researching'`.
  - Test: renders a list of active search query strings passed via `props.activeQueries` (array of strings).
  - Test: renders a list of scraped URLs passed via `props.scrapedUrls` (array of strings).
  - Test: renders an empty list when `props.activeQueries` and `props.scrapedUrls` are empty arrays.
  - Test: transitions to an idle/complete state (no "Researching..." heading, no spinner) when `status === 'idle'`.
- [ ] In `packages/vscode-extension/src/extension/__tests__/ResearchStatusProvider.test.ts`, write unit tests for the `ResearchStatusProvider` TreeDataProvider:
  - Test: `getChildren()` returns tree items for each active query when given a populated state.
  - Test: `getChildren()` returns tree items for each scraped URL when given a populated state.
  - Test: `refresh()` fires the `onDidChangeTreeData` event.
  - Test: state updates via `updateState({ activeQueries, scrapedUrls })` are reflected in subsequent `getChildren()` calls.
- [ ] In `packages/vscode-extension/src/extension/__tests__/ResearchStatusProvider.test.ts`, write an integration test verifying that an IPC message of type `RESEARCH_STATUS_UPDATE` received on the extension host updates the provider state and triggers a tree refresh.

## 2. Task Implementation
- [ ] Create `packages/vscode-extension/src/webview/components/ResearchStatusPanel.tsx`:
  - Accept props: `status: 'idle' | 'researching'`, `activeQueries: string[]`, `scrapedUrls: string[]`.
  - When `status === 'researching'`, render a VSCode-themed spinner (use `vscode-progress-ring` from `@vscode/webview-ui-toolkit/react`) and an `<h2>Researching...</h2>` heading.
  - Render two sections: **Active Queries** and **Scraped URLs**, each as a `<ul>` list.
  - Apply Tailwind CSS classes consistent with the VSCode theme (use CSS variables `--vscode-*`).
- [ ] Create `packages/vscode-extension/src/extension/ResearchStatusProvider.ts`:
  - Implement `vscode.TreeDataProvider<ResearchStatusItem>` interface.
  - Maintain internal state: `{ activeQueries: string[], scrapedUrls: string[] }`.
  - Expose `updateState(newState)` method that merges state and fires `_onDidChangeTreeData`.
  - `getTreeItem()` returns a `vscode.TreeItem` with the query/URL as the label.
  - `getChildren()` returns separate tree items for active queries and scraped URLs, grouped under collapsible parent nodes ("Active Queries", "Scraped URLs").
- [ ] In `packages/vscode-extension/src/extension/extension.ts`, register the `ResearchStatusProvider` with `vscode.window.registerTreeDataProvider('devs.researchStatus', provider)`.
- [ ] In `package.json` of the extension, add the `devs.researchStatus` view to the `contributes.views` section under an appropriate container (e.g., `devs` sidebar container).
- [ ] Wire the IPC layer: listen for `RESEARCH_STATUS_UPDATE` messages from the core agent process and call `provider.updateState()` accordingly.

## 3. Code Review
- [ ] Verify `ResearchStatusPanel` uses only `@vscode/webview-ui-toolkit` and Tailwind CSS — no raw MUI or Bootstrap imports.
- [ ] Verify `ResearchStatusProvider` implements `vscode.TreeDataProvider` correctly and does not leak event listeners.
- [ ] Confirm IPC wiring uses the established message-passing pattern (no direct `require` of core packages from webview code).
- [ ] Check that the component handles very long URLs/query strings gracefully (truncation or word-wrap via CSS).
- [ ] Confirm `updateState` merges state immutably (no mutation of internal arrays).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter vscode-extension test` and confirm all new tests pass with zero failures.
- [ ] Run `pnpm --filter vscode-extension build` to verify the TypeScript compilation succeeds with no errors.
- [ ] Run `pnpm --filter vscode-extension lint` to confirm no ESLint errors.

## 5. Update Documentation
- [ ] Add `ResearchStatusPanel` and `ResearchStatusProvider` entries to `packages/vscode-extension/docs/components.md` with a description of props, state shape, and IPC message format (`RESEARCH_STATUS_UPDATE: { activeQueries: string[], scrapedUrls: string[] }`).
- [ ] Update the agent memory file `docs/agent-memory/phase_5.md` to record: "VSCode sidebar `devs.researchStatus` TreeView is registered and receives live research updates via IPC message `RESEARCH_STATUS_UPDATE`."

## 6. Automated Verification
- [ ] Run `pnpm --filter vscode-extension test --coverage` and assert coverage for `ResearchStatusPanel.tsx` and `ResearchStatusProvider.ts` is ≥ 90%.
- [ ] Execute `node scripts/verify_task.mjs --task 01_vscode_sidebar_research_status_panel` (or equivalent CI check script) to confirm the tree view ID `devs.researchStatus` is present in `package.json` contributes and the provider is registered in `extension.ts`.
