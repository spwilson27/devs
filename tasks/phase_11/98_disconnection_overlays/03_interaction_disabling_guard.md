# Task: Global Interaction Disabling Guard During Disconnection (Sub-Epic: 98_Disconnection_Overlays)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-098], [6_UI_UX_ARCH-REQ-049]

## 1. Initial Test Written
- [ ] In `packages/ui-hooks/src/__tests__/useInteractionGuard.test.ts`, write unit tests:
  - Test that `useInteractionGuard()` returns `{ disabled: false }` when store `connectionState.status === 'CONNECTED'`.
  - Test that `useInteractionGuard()` returns `{ disabled: true }` when store `connectionState.status === 'RECONNECTING'`.
  - Test that `getButtonProps(onClick)` returns `{ disabled: true, 'aria-disabled': true, onClick: undefined }` when disconnected.
  - Test that `getButtonProps(onClick)` returns `{ disabled: false, 'aria-disabled': false, onClick }` when connected.
  - Test that `getLinkProps(href)` returns `{ 'aria-disabled': true, tabIndex: -1, href: undefined }` when disconnected.
- [ ] In `packages/webview/src/__tests__/DirectiveWhisperer.test.tsx`, add tests:
  - When `connectionState.status === 'RECONNECTING'`, assert the `<input>` for the directive whisperer has `disabled` attribute.
  - When `connectionState.status === 'RECONNECTING'`, assert submit button has `disabled` and `aria-disabled="true"`.
- [ ] In `packages/webview/src/__tests__/DAGCanvas.test.tsx`, add tests:
  - When disconnected, clicking a DAG node should not invoke the node focus callback.

## 2. Task Implementation
- [ ] Create `packages/ui-hooks/src/useInteractionGuard.ts`:
  - Reads `connectionState.status` from the Zustand UI store via a selector.
  - Returns:
    ```ts
    {
      disabled: boolean;
      getButtonProps: (onClick?: () => void) => { disabled: boolean; 'aria-disabled': boolean; onClick?: () => void };
      getLinkProps: (href?: string) => { 'aria-disabled': boolean; tabIndex: number; href?: string };
    }
    ```
  - When `disabled === true`: `getButtonProps` strips `onClick`; `getLinkProps` strips `href` and sets `tabIndex: -1`.
- [ ] Export `useInteractionGuard` from `packages/ui-hooks/src/index.ts`.
- [ ] Update `packages/webview/src/components/DirectiveWhisperer/DirectiveWhisperer.tsx`:
  - Import and call `useInteractionGuard()`.
  - Apply `getButtonProps` to the submit button.
  - Apply `disabled={disabled}` to the `<input>` field.
  - Do NOT remove the component from the DOM — keep it visible but non-interactive to avoid layout shift.
- [ ] Update `packages/webview/src/components/DAGCanvas/DAGCanvas.tsx`:
  - Import and call `useInteractionGuard()`.
  - Wrap node click and focus handlers: `if (disabled) return;` at the top of each handler.
- [ ] Update any other primary interactive components in the webview (e.g., `SpecSignOff`, `RoadmapDAGEditor`, `PhaseStepperControls`) to use `useInteractionGuard()` in the same pattern.

## 3. Code Review
- [ ] Verify `useInteractionGuard` is a thin selector hook — no business logic, only reads from store and transforms to prop shapes.
- [ ] Confirm that components remain **visible** but **non-interactive** during RECONNECTING (no `display: none` or `visibility: hidden` on primary controls) to avoid layout shift.
- [ ] Verify `aria-disabled="true"` is always applied alongside `disabled` attribute so assistive technology users receive the correct signal.
- [ ] Confirm no component conditionally renders or unmounts based on connection state — only prop values change.
- [ ] Verify the DAG node click guard (`if (disabled) return;`) is at the very top of the handler before any state mutation.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/ui-hooks test` and confirm all `useInteractionGuard.test.ts` tests pass.
- [ ] Run `pnpm --filter @devs/webview test` and confirm all updated component tests pass with the disconnected guard assertions.
- [ ] Run `pnpm typecheck` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Create `packages/ui-hooks/src/useInteractionGuard.agent.md` documenting:
  - Hook purpose: enforcing the global interaction-disabled contract during MCP disconnection.
  - `getButtonProps` and `getLinkProps` API surface.
  - Which components MUST use this hook (list them explicitly).
  - Instructions for adding new interactive components: always use `getButtonProps`/`getLinkProps`.
- [ ] Update `packages/ui-hooks/README.md` exports table to include `useInteractionGuard`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/ui-hooks test --reporter=json > /tmp/interaction-guard-results.json` and assert exit code `0`.
- [ ] Run `node -e "const r = require('/tmp/interaction-guard-results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"` to verify independently.
- [ ] Run `grep -r "onClick" packages/webview/src/components/DirectiveWhisperer/ | grep -v "getButtonProps\|disabled"` to assert no raw `onClick` bypasses the guard.
