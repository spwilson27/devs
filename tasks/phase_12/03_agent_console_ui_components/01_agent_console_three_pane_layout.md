# Task: AgentConsole Three-Pane Layout Scaffolding (Sub-Epic: 03_Agent Console UI Components)

## Covered Requirements
- [1_PRD-REQ-UI-005], [7_UI_UX_DESIGN-REQ-UI-DES-094-1], [7_UI_UX_DESIGN-REQ-UI-DES-094-2], [7_UI_UX_DESIGN-REQ-UI-DES-094-3]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/components/AgentConsole/__tests__/AgentConsole.layout.test.tsx`, write React Testing Library tests that:
  - Assert the `AgentConsole` root element renders with a CSS class or `data-testid="agent-console"` and a three-pane grid layout (center, right-sidebar, bottom).
  - Assert the center pane (`data-testid="thought-stream-pane"`) is present.
  - Assert the right sidebar pane (`data-testid="tool-log-pane"`) is present.
  - Assert the bottom pane (`data-testid="sandbox-terminal-pane"`) is present.
  - Assert that the three panes fill the full viewport height minus any host chrome (use `toHaveStyle` to check `height: 100%` or equivalent CSS custom property).
  - Assert each pane has a defined minimum width/height so none collapse to zero pixels on initial render.
  - Write a snapshot test capturing the structural DOM shape of `AgentConsole` when all three child panels are rendered as empty stubs.

## 2. Task Implementation
- [ ] Create `packages/webview-ui/src/components/AgentConsole/AgentConsole.tsx`:
  - The component accepts optional `className` and `style` props.
  - Use CSS Grid with three areas: `thought-stream` (center, takes remaining width), `tool-log` (right, fixed 320 px default), `sandbox-terminal` (bottom, fixed 240 px default).
  - Grid layout template: `"thought-stream tool-log" auto / 1fr 320px` with a row for `"sandbox-terminal sandbox-terminal" 240px`.
  - Render three placeholder `<div>` children with the appropriate `data-testid` attributes for each pane area.
  - Export a typed `AgentConsolePaneProps` interface with `data-testid`, `aria-label`, and `className`.
- [ ] Create `packages/webview-ui/src/components/AgentConsole/AgentConsole.module.css`:
  - Define `.agentConsole` with `display: grid`, `width: 100%`, `height: 100%`, and the grid-template-areas above.
  - Define `.thoughtStreamPane`, `.toolLogPane`, `.sandboxTerminalPane` mapped to the correct `grid-area` values.
  - Use CSS custom properties `--tool-log-width: 320px` and `--sandbox-terminal-height: 240px` for easy override in tests.
- [ ] Create `packages/webview-ui/src/components/AgentConsole/index.ts` re-exporting `AgentConsole` and its prop types.
- [ ] Register `AgentConsole` in the webview app's root router/view so it mounts when the active view is `agent-console`.

## 3. Code Review
- [ ] Verify the grid layout uses named `grid-template-areas` (not numeric track references) for maintainability.
- [ ] Confirm no hard-coded pixel values appear inside JSX — all sizing must be driven by CSS custom properties or the module CSS.
- [ ] Ensure the component is pure/stateless (no local state); all pane content will be injected as children or via context in later tasks.
- [ ] Validate TypeScript strict-mode compliance: no implicit `any`, all props typed.
- [ ] Check that the component imports no runtime dependencies beyond React — no side-effect imports.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="AgentConsole.layout"` and confirm all assertions pass with zero failures.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --coverage --testPathPattern="AgentConsole"` and verify line/branch coverage ≥ 90% for `AgentConsole.tsx`.

## 5. Update Documentation
- [ ] Add a `## AgentConsole` section to `packages/webview-ui/docs/COMPONENTS.md` describing the three-pane layout, CSS custom properties for sizing, and how to swap pane content.
- [ ] Update `packages/webview-ui/src/components/AgentConsole/AgentConsole.tsx` with a JSDoc block listing each prop and the layout contract.
- [ ] Note in agent memory (`.devs/memory/phase_12_decisions.md`) that the Agent Console uses a CSS Grid three-pane layout and records the default column/row sizing values.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test -- --ci --forceExit --testPathPattern="AgentConsole"` in CI and assert exit code 0.
- [ ] Run `pnpm --filter @devs/webview-ui build` and assert the build completes without TypeScript errors or CSS module warnings referencing `AgentConsole`.
