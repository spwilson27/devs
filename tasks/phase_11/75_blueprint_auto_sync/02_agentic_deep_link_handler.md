# Task: Agentic Deep-Link Handler for Mermaid Diagram Nodes (Sub-Epic: 75_Blueprint_Auto_Sync)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-110-3]

## 1. Initial Test Written

- [ ] In `packages/webview/src/components/__tests__/MermaidHost.agenticLinks.test.tsx`, write tests that:
  1. Render `<MermaidHost ... />` with a Mermaid diagram containing annotated node IDs (e.g., `DB_Users:::agenticLink`).
  2. Simulate a `dblclick` DOM event on the SVG element whose `data-node-id` attribute equals `DB_Users`.
  3. Assert that `window.vscodeApi.postMessage` is called with `{ type: 'OPEN_TAS_DEFINITION', payload: { nodeId: 'DB_Users' } }`.
- [ ] In `packages/vscode/src/extension/__tests__/tasDefinitionResolver.test.ts`, write unit tests for `TASDefinitionResolver`:
  1. Given a `nodeId` of `DB_Users`, assert it resolves to the correct file URI and line number by scanning the mock TAS markdown content for a heading `## DB_Users` or a table row containing `DB_Users`.
  2. Assert that an unknown `nodeId` returns `null` and does not throw.
  3. Assert that `vscode.window.showTextDocument` is called with the resolved URI and `{ selection: new vscode.Range(lineNo, 0, lineNo, 0) }` when a match is found.
- [ ] In `packages/vscode/src/__tests__/agenticLinkE2E.integration.test.ts`, write an integration test verifying the full round-trip: Webview posts `OPEN_TAS_DEFINITION` → ExtensionHost receives via `webview.onDidReceiveMessage` → `TASDefinitionResolver.resolve(nodeId)` is called → `vscode.window.showTextDocument` is called with the correct arguments.

## 2. Task Implementation

- [ ] **Mermaid Node Annotation Convention** (`packages/webview/src/lib/mermaidInit.ts`):
  - Document (in the mermaid init config) that all linkable diagram nodes MUST include a CSS class `agenticLink` using Mermaid's `classDef` and `:::` syntax.
  - After `mermaid.render()` resolves, run a post-render DOM mutation: query all SVG elements with `class="agenticLink"` inside the diagram container, and for each, set `data-node-id` attribute from the node's Mermaid ID and add `cursor: pointer` style.

- [ ] **Double-Click Handler** (`packages/webview/src/components/MermaidHost/MermaidHost.tsx`):
  - After each successful render, attach a single delegated `dblclick` event listener on the diagram container `<div>`.
  - In the handler, walk up from `event.target` to find the nearest element with `data-node-id`.
  - If found, call `vscodeApi.postMessage({ type: 'OPEN_TAS_DEFINITION', payload: { nodeId: el.dataset.nodeId } })`.
  - Clean up the listener in the `useEffect` return to prevent duplicates on re-render.
  - Provide visual feedback: on `dblclick`, briefly apply a `ring-2 ring-blue-400` Tailwind class to the clicked node for 300ms then remove it.

- [ ] **ExtensionHost Message Handler** (`packages/vscode/src/extension/webviewMessageHandler.ts`):
  - In the `switch` block handling `webview.onDidReceiveMessage`, add a case for `'OPEN_TAS_DEFINITION'`.
  - Call `TASDefinitionResolver.resolve(payload.nodeId)` and, if a location is returned, call `vscode.window.showTextDocument(uri, { selection: range, preserveFocus: false })`.
  - If resolution fails, call `vscode.window.showWarningMessage(\`No TAS definition found for node: \${payload.nodeId}\`)`.

- [ ] **TASDefinitionResolver** (`packages/vscode/src/extension/tasDefinitionResolver.ts`):
  - Create a `TASDefinitionResolver` class with a `resolve(nodeId: string): Promise<{ uri: vscode.Uri, range: vscode.Range } | null>` method.
  - Search all `specs/*.md` files (using `vscode.workspace.findFiles('specs/**/*.md')`) for a heading or table row containing the `nodeId` string (case-insensitive).
  - Return the URI and a `vscode.Range` pointing to the matched line.
  - Cache results in a `Map<string, Location>` that is invalidated when a `BlueprintWatcher` file-change event fires.

## 3. Code Review

- [ ] Verify the `dblclick` handler uses event delegation on the container (not individual node elements) to avoid O(n) listener attachment on large diagrams.
- [ ] Confirm the `TASDefinitionResolver` cache is properly invalidated on file changes to prevent stale navigation targets.
- [ ] Ensure the resolver's file search is scoped to `specs/**/*.md` only and does not scan the entire workspace, preventing performance issues in large projects.
- [ ] Check that the `vscode.window.showTextDocument` call uses `preserveFocus: false` so the user's editor gains focus after navigation, matching the UX expectation of "open the definition."
- [ ] Verify the visual feedback (ring effect) on the clicked Mermaid node uses only VSCode token-based colors or Tailwind classes mapped to tokens; no hardcoded hex values.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/webview test -- --testPathPattern=MermaidHost.agenticLinks` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern=tasDefinitionResolver` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern=agenticLinkE2E` and confirm the integration test passes.
- [ ] Run `pnpm typecheck` and confirm zero TypeScript errors.

## 5. Update Documentation

- [ ] Update `packages/webview/src/components/MermaidHost/MermaidHost.agent.md` with a section "Agentic Links" explaining the `agenticLink` classDef convention, the `data-node-id` attribute pattern, and the `OPEN_TAS_DEFINITION` postMessage payload schema.
- [ ] Update `packages/vscode/src/extension/tasDefinitionResolver.agent.md` (create if absent) documenting the search scope (`specs/**/*.md`), matching logic (heading/table row), cache invalidation trigger, and return schema.
- [ ] Add a diagram to `docs/architecture/webview-extension-bridge.md` under "Agentic Deep-Link Flow" showing: `dblclick` → `postMessage(OPEN_TAS_DEFINITION)` → `TASDefinitionResolver.resolve()` → `showTextDocument()`.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/webview test --coverage -- --testPathPattern=MermaidHost` and assert branch coverage ≥ 85% for the `dblclick` handler code paths.
- [ ] Run `pnpm --filter @devs/vscode test --coverage -- --testPathPattern=tasDefinitionResolver` and assert line coverage ≥ 90% for `tasDefinitionResolver.ts`.
- [ ] Execute `node scripts/verify_task_coverage.js --task=02_agentic_deep_link_handler` to confirm all required test IDs are present and passing.
