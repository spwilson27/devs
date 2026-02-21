# Task: Implement Flamegraph Visualization UI Component (Sub-Epic: 09_System Health and Performance Profiling)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-111-1]

## 1. Initial Test Written

- [ ] In `packages/webview-ui/src/components/profiling/__tests__/FlamegraphPanel.test.tsx`, write React Testing Library tests:
  - Render `<FlamegraphPanel />` with no data; assert a placeholder message such as `"No CPU profile available. Trigger a profile via the MCP tool."` is displayed.
  - Render `<FlamegraphPanel cpuProfile={mockCpuProfilePayload} />` with a minimal mock CDP `CpuProfilePayload` (3–5 nodes); assert the flamegraph SVG/canvas element is rendered.
  - Assert that the deepest call-stack frame in the mock profile is visible as a rendered bar element with a `data-frame-name` attribute matching the function name.
  - Assert that hovering a frame bar (using `userEvent.hover`) renders a tooltip containing the function name, file URL, and self-time in milliseconds (use `data-testid="flamegraph-tooltip"`).
  - Assert the flamegraph is scrollable/zoomable: simulate a wheel event on the canvas and assert the transform scale changes (check `data-zoom-level` attribute or component state).
  - Assert that frames consuming > 20% of total CPU time are colored `var(--vscode-charts-red)` or equivalent hot-color (verify `data-heat="hot"` attribute).
  - Assert the component is accessible: the SVG has a `role="img"` and `aria-label` describing the profile duration.
  - Write a snapshot test for a stable 5-node profile.

## 2. Task Implementation

- [ ] Install `speedscope` library (or `d3-flame-graph`) as a dependency in `packages/webview-ui`: `pnpm --filter @devs/webview-ui add d3-flame-graph`.
- [ ] Create `packages/webview-ui/src/components/profiling/FlamegraphPanel.tsx`:
  - Accept optional prop `cpuProfile: CpuProfilePayload | null`.
  - When `cpuProfile` is null, render an empty-state placeholder with instructions.
  - When `cpuProfile` is provided, transform the CDP `CPUProfile` format into the `d3-flame-graph` hierarchical input format using a local utility function `transformCpuProfileToFlameData(profile: CpuProfilePayload): FlameNode`.
  - Render the flamegraph using `d3-flame-graph` inside a `<div ref={containerRef}>` using a `useEffect` to initialize/update D3.
  - Apply a custom color scale: cool colors for low CPU% frames, hot colors (`var(--vscode-charts-red)`) for frames > 20% self-time. Set `data-heat="hot"` on hot frames.
  - Implement mouse wheel zoom: scale the flamegraph D3 layout on wheel events; track the current zoom level in local state and expose it via `data-zoom-level` on the container.
  - Implement tooltip: on D3 `mouseover` event, render a React portal tooltip (`data-testid="flamegraph-tooltip"`) with function name, source URL (from `callFrame.url + ":" + callFrame.lineNumber`), and self-time.
  - Add `role="img"` and `aria-label={`CPU Flamegraph — ${profileDurationMs}ms profile`}` to the SVG element.
- [ ] Create `packages/webview-ui/src/components/profiling/transformCpuProfile.ts`:
  - Export `transformCpuProfileToFlameData(profile: CpuProfilePayload): FlameNode`.
  - Walk the CDP profile `nodes` array; build a tree from parent-child relationships using `node.parent` field; annotate each node with self-time computed from the `timeDeltas` and `samples` arrays.
- [ ] Subscribe to `system.profiling.cpuProfileReady` events in the panel's parent view and pass the payload to `<FlamegraphPanel>` as a prop.
- [ ] Export `FlamegraphPanel` from `packages/webview-ui/src/components/profiling/index.ts`.

## 3. Code Review

- [ ] Confirm D3 mutations happen inside `useEffect` with correct cleanup (call `flamegraph.destroy()` or equivalent on unmount) to prevent memory leaks.
- [ ] Confirm `transformCpuProfileToFlameData` is a pure function with no side effects, fully unit-testable in isolation.
- [ ] Confirm the color scale uses VSCode CSS variables (not hardcoded hex values) where possible; where D3 requires hex, derive them from `getComputedStyle` at render time.
- [ ] Confirm the flamegraph renders correctly at both 600px and 1200px container widths (no overflow).
- [ ] Confirm the tooltip does not escape the webview boundary.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="FlamegraphPanel|transformCpuProfile"` and confirm all tests pass.
- [ ] Run coverage and confirm line/branch coverage ≥ 85% for both `FlamegraphPanel.tsx` and `transformCpuProfile.ts`.

## 5. Update Documentation

- [ ] Add TSDoc to `FlamegraphPanel` and `transformCpuProfileToFlameData` describing props and the transformation algorithm.
- [ ] Update `packages/webview-ui/README.md` to document `FlamegraphPanel` under "Profiling & Performance" components.
- [ ] Update `docs/agent_memory/phase_12_decisions.md`: "`FlamegraphPanel` uses `d3-flame-graph`. CDP profile is transformed by `transformCpuProfile.ts`. Hot threshold: 20% self-time. D3 is initialized in `useEffect` and destroyed on unmount."

## 6. Automated Verification

- [ ] CI runs `pnpm --filter @devs/webview-ui test -- --ci --testPathPattern="FlamegraphPanel"` and exits code 0.
- [ ] Snapshot `FlamegraphPanel.test.tsx.snap` is committed and current.
- [ ] `pnpm --filter @devs/webview-ui build` succeeds with zero errors.
