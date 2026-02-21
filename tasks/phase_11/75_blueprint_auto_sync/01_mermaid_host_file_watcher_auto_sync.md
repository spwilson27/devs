# Task: MermaidHost File-Watcher & 200ms Auto-Sync (Sub-Epic: 75_Blueprint_Auto_Sync)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-110], [7_UI_UX_DESIGN-REQ-UI-DES-110-1]

## 1. Initial Test Written

- [ ] In `packages/vscode/src/extension/__tests__/blueprintWatcher.test.ts`, write a unit test that verifies the `BlueprintWatcher` class calls `onUpdate` within 200ms after a simulated `fs.watch` change event on a `.md` or `.mermaid` file. Mock `vscode.workspace.createFileSystemWatcher` and assert the callback fires with the updated file URI. Use `jest.useFakeTimers()` to control time precisely.
- [ ] In `packages/webview/src/components/__tests__/MermaidHost.test.tsx`, write a React Testing Library test that:
  1. Renders `<MermaidHost src="..." />` with an initial Mermaid diagram string.
  2. Fires a `mermaid-source-updated` custom event (simulating the postMessage relay) with a new diagram string.
  3. Asserts that within 200ms (advance fake timers), the component calls `mermaid.render()` exactly once with the new diagram string.
- [ ] Write an integration test in `packages/vscode/src/__tests__/autoSync.integration.test.ts` that verifies the end-to-end relay: a file change event → ExtensionHost emits `postMessage({ type: 'BLUEPRINT_UPDATED', payload: { uri, content } })` → Webview receives and schedules a re-render.

## 2. Task Implementation

- [ ] **ExtensionHost File Watcher** (`packages/vscode/src/extension/blueprintWatcher.ts`):
  - Create a `BlueprintWatcher` class using `vscode.workspace.createFileSystemWatcher('**/*.{md,mermaid}')`.
  - On `onDidChange`, debounce with a 150ms delay (leaving 50ms budget for the Webview render cycle) using a `clearTimeout/setTimeout` pattern.
  - Read the changed file content with `vscode.workspace.fs.readFile(uri)`.
  - Post a `{ type: 'BLUEPRINT_UPDATED', payload: { uri: uri.toString(), content: decodedString } }` message to the active Webview panel via `WebviewPanel.webview.postMessage(...)`.
  - Export a `disposable` for registration in `extension.ts`'s `context.subscriptions`.

- [ ] **Register Watcher in Extension Entry Point** (`packages/vscode/src/extension/extension.ts`):
  - Instantiate `BlueprintWatcher` inside the `activate` function.
  - Push the returned `disposable` to `context.subscriptions`.

- [ ] **MermaidHost Component** (`packages/webview/src/components/MermaidHost/MermaidHost.tsx`):
  - Create a React functional component `MermaidHost` that accepts `{ initialContent: string, diagramId: string }` as props.
  - Maintain a `content` state, initialized from `initialContent`.
  - Register a `useEffect` that adds a `window.addEventListener('message', handler)` for `{ type: 'BLUEPRINT_UPDATED' }` messages arriving from the extension host via the VS Code postMessage bridge.
  - On message receipt, call `setState(newContent)` immediately, then schedule `mermaid.render(diagramId, newContent, container)` in a `requestAnimationFrame` callback.
  - Use `useMemo` to track the last render timestamp; assert the total latency from message receipt to render completion is ≤ 200ms in development mode with a `console.warn` if exceeded.

- [ ] **Mermaid Library Integration** (`packages/webview/src/lib/mermaidInit.ts`):
  - Initialize `mermaid.initialize({ startOnLoad: false, theme: 'base', themeVariables: { ... } })` once on app load, mapping `--vscode-editor-background` to mermaid theme vars.
  - Export a typed `renderDiagram(id: string, definition: string, container: HTMLElement): Promise<void>` wrapper that handles errors from `mermaid.render()` and falls back to displaying the raw Mermaid source text in a `<pre>` block (satisfying `6_UI_UX_ARCH-REQ-028` error resilience, while not being the primary target of this task).

## 3. Code Review

- [ ] Verify that the `BlueprintWatcher` debounce is ≤ 150ms, leaving ≥ 50ms for the Webview render cycle, achieving the total 200ms SLA from `REQ-UI-DES-110-1`.
- [ ] Confirm the watcher is properly disposed via `context.subscriptions` to prevent memory leaks on extension deactivation.
- [ ] Ensure `MermaidHost` never calls `mermaid.render()` concurrently — check for a render-in-flight guard (e.g., a `isRendering` ref) to prevent race conditions on rapid saves.
- [ ] Verify that the `postMessage` handler is cleaned up in the `useEffect` return function (`window.removeEventListener`) to prevent ghost listeners.
- [ ] Confirm no hardcoded colors are used; all theme variables passed to mermaid must reference `--vscode-*` CSS custom properties.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern=blueprintWatcher` and confirm all unit tests pass.
- [ ] Run `pnpm --filter @devs/webview test -- --testPathPattern=MermaidHost` and confirm all component tests pass.
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern=autoSync.integration` and confirm the integration test passes.
- [ ] Run `pnpm typecheck` across the monorepo and confirm zero TypeScript errors in the modified files.

## 5. Update Documentation

- [ ] Update `packages/vscode/src/extension/blueprintWatcher.agent.md` (create if absent) with a summary of the `BlueprintWatcher` contract: watched glob, debounce timing, postMessage payload schema, and disposal pattern.
- [ ] Update `packages/webview/src/components/MermaidHost/MermaidHost.agent.md` (create if absent) documenting the component's expected message format, 200ms SLA, and render guard logic.
- [ ] Add an entry to `docs/architecture/webview-extension-bridge.md` under "Blueprint Auto-Sync" describing the file-change → postMessage → re-render data flow and timing budget breakdown (150ms debounce + ~50ms render).

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/vscode test --coverage -- --testPathPattern=blueprintWatcher` and assert line coverage ≥ 90% for `blueprintWatcher.ts`.
- [ ] Run `pnpm --filter @devs/webview test --coverage -- --testPathPattern=MermaidHost` and assert line coverage ≥ 90% for `MermaidHost.tsx`.
- [ ] Execute `node scripts/verify_task_coverage.js --task=01_mermaid_host_file_watcher_auto_sync` (project-level verification script) to confirm all required test IDs are present and green in the CI report.
