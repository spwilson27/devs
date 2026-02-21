# Task: Agentic Hook Introspection Gutter Icons in VSCode Editor (Sub-Epic: 14_Loop Detection and Accessibility)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-130-2]

## 1. Initial Test Written
- [ ] In `packages/vscode-extension/src/editor/__tests__/introspectionGutterDecorator.test.ts`, write unit tests (using the VSCode extension test harness or `vscode-test` mocks) covering:
  - A `IntrospectionGutterDecorator` class that accepts a `vscode.TextEditor` and a list of `AgenticHook` objects `{ lineNumber: number; label: string }`.
  - `applyDecorations(editor, hooks)` creates a `vscode.DecorationOptions` array and applies a `vscode.TextEditorDecorationType` with the "Glass Box" gutter icon SVG path to the correct line ranges.
  - Each decoration includes `hoverMessage` set to the hook's `label` string (e.g., `"Agentic Hook: tool_call"`).
  - `clearDecorations(editor)` removes all previously applied gutter decorations from the editor.
  - When called with an empty `hooks` array, no decorations are applied.
  - When the target file changes (different `editor.document.uri`), decorations from the previous editor are cleared before applying new ones.
- [ ] In `packages/vscode-extension/src/editor/__tests__/agenticHookScanner.test.ts`, write unit tests for an `AgenticHookScanner`:
  - `scan(documentText: string): AgenticHook[]` parses the text and returns hooks at lines containing the annotation comment `// @agentic-hook` (or the project-defined annotation pattern from TAS/MCP design).
  - Returns an empty array for documents with no annotations.
  - Correctly identifies multiple hooks in a single document, including their line numbers and optional label parsed from the annotation (e.g., `// @agentic-hook tool_call` → label `"tool_call"`).

## 2. Task Implementation
- [ ] Create the SVG asset `packages/vscode-extension/src/assets/icons/glass-box-gutter.svg`:
  - A minimal 16×16 SVG icon representing a "Glass Box" (e.g., a square outline with a semi-transparent fill and a small diamond/node indicator). Use `currentColor` for strokes so VS Code's theme engine can tint it.
- [ ] Create `packages/vscode-extension/src/editor/agenticHookScanner.ts`:
  - Export type `AgenticHook = { lineNumber: number; label: string }`.
  - Export function `scanDocument(document: vscode.TextDocument): AgenticHook[]` that iterates over lines and matches the regex `/\/\/\s*@agentic-hook\s*(.*)$/` (capturing optional label).
  - Line numbers are 0-indexed to match `vscode.Position`.
- [ ] Create `packages/vscode-extension/src/editor/introspectionGutterDecorator.ts`:
  - Export class `IntrospectionGutterDecorator`.
  - In the constructor, create a single `vscode.window.createTextEditorDecorationType` with:
    - `gutterIconPath: context.asAbsolutePath('src/assets/icons/glass-box-gutter.svg')`
    - `gutterIconSize: 'contain'`
    - `overviewRulerColor: new vscode.ThemeColor('devs.agenticHookRulerColor')`
    - `overviewRulerLane: vscode.OverviewRulerLane.Left`
  - `applyDecorations(editor: vscode.TextEditor, hooks: AgenticHook[])`: maps hooks to `vscode.DecorationOptions` with `range: new vscode.Range(hook.lineNumber, 0, hook.lineNumber, 0)` and `hoverMessage: new vscode.MarkdownString(\`**Agentic Hook**: \${hook.label}\`)`, then calls `editor.setDecorations(this.decorationType, decorations)`.
  - `clearDecorations(editor: vscode.TextEditor)`: calls `editor.setDecorations(this.decorationType, [])`.
  - `dispose()`: calls `this.decorationType.dispose()`.
- [ ] Register a `vscode.ThemeColor` contribution `devs.agenticHookRulerColor` in `packages/vscode-extension/package.json` under `contributes.colors` with default light/dark/highContrast values (e.g., `#6A9FB5` / `#88C0D0` / `#FFFFFF`).
- [ ] In the extension's activation function (`packages/vscode-extension/src/extension.ts`):
  - Instantiate `IntrospectionGutterDecorator`.
  - Subscribe to `vscode.window.onDidChangeActiveTextEditor` and `vscode.workspace.onDidChangeTextDocument`.
  - On each event, call `scanDocument(editor.document)` and `decorator.applyDecorations(editor, hooks)`.
  - Push the decorator to `context.subscriptions` for automatic disposal.

## 3. Code Review
- [ ] Verify the `vscode.TextEditorDecorationType` is created **once** in the constructor (not on every `applyDecorations` call) to avoid a VS Code decoration type leak.
- [ ] Confirm `dispose()` is implemented and the decorator is registered in `context.subscriptions` so it is cleaned up when the extension deactivates.
- [ ] Verify the gutter icon SVG uses `currentColor` for theming compatibility in both light and dark VS Code themes.
- [ ] Confirm `overviewRulerColor` uses a `vscode.ThemeColor` (not a hardcoded hex string) for theme adaptability.
- [ ] Ensure `agenticHookScanner.ts` has no VSCode API imports (it should only depend on `vscode.TextDocument.lineAt` or operate on plain strings) to keep it unit-testable without a full extension host.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode-extension test -- --testPathPattern=introspectionGutterDecorator` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/vscode-extension test -- --testPathPattern=agenticHookScanner` and confirm all tests pass.
- [ ] Run the full extension test suite: `pnpm --filter @devs/vscode-extension test --ci` and confirm no regressions.

## 5. Update Documentation
- [ ] Update `docs/ui/vscode-extension.md` (create if absent) with a section `### Introspection Gutter Icons`:
  - Explain the `@agentic-hook` annotation syntax and how to add it to project source files.
  - Document the gutter icon appearance and the hover message format.
  - Explain the overview ruler indicator and its color theming.
- [ ] Update `docs/architecture/glass-box.md` (create if absent) to document the "Agentic Hook" annotation as a first-class Glass Box design concept, explaining its purpose in supporting AI agent introspection and debugging.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode-extension test --ci --forceExit` and assert exit code `0`.
- [ ] Run `grep -rn "agenticHookRulerColor" packages/vscode-extension/package.json` to confirm the color contribution is registered.
- [ ] Run `test -f packages/vscode-extension/src/assets/icons/glass-box-gutter.svg && echo "SVG exists"` to confirm the gutter icon asset is present.
- [ ] Run `grep -rn "@agentic-hook" packages/vscode-extension/src/editor/agenticHookScanner.ts` to confirm the annotation pattern is implemented.
