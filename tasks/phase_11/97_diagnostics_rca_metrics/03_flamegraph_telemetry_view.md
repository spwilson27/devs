# Task: Implement Flamegraph Performance Telemetry Visualization (Sub-Epic: 97_Diagnostics_RCA_Metrics)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-111]
- [7_UI_UX_DESIGN-REQ-UI-DES-111-1]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/components/__tests__/FlamegraphView.test.tsx`, write unit tests:
  - Test that `FlamegraphView` renders a `<canvas>` element (or SVG fallback) when given valid `profileData` prop.
  - Test that `FlamegraphView` renders a "No profiling data available" placeholder when `profileData` is `null` or `undefined`.
  - Test that the component accepts a `profileData` prop conforming to the `FlameNode[]` interface and renders without throwing.
  - Test that hovering a flame bar (simulated via synthetic `mousemove` events on the canvas) calls an `onFrameHover(frame: FlameNode | null)` callback.
  - Test that clicking a flame bar calls an `onFrameClick(frame: FlameNode)` callback with the correct frame data.
  - Test that the component respects a `maxDepth` prop and does not render frames beyond the specified depth.
  - Test that the component exposes a `data-testid="flamegraph-canvas"` attribute for E2E targeting.
- [ ] In `packages/vscode/src/webview/components/__tests__/FlamegraphTooltip.test.tsx`:
  - Test that `FlamegraphTooltip` renders `frame.name`, `frame.selfTimeMs`, and `frame.totalTimeMs` when a `frame` prop is provided.
  - Test that `FlamegraphTooltip` renders `null` when `frame` is `null`.
- [ ] In `packages/vscode/src/webview/hooks/__tests__/useFlamegraphData.test.ts`:
  - Test that `useFlamegraphData(taskId)` returns `{ data: null, isLoading: true }` initially.
  - Test that after resolving a mocked MCP `get_profile_data` tool call response, it returns `{ data: FlameNode[], isLoading: false }`.
  - Test that an error from the MCP call sets `{ data: null, isLoading: false, error: 'Failed to load profile' }`.

## 2. Task Implementation
- [ ] Define the `FlameNode` TypeScript interface in `packages/vscode/src/webview/types/diagnostics.ts`:
  ```ts
  export interface FlameNode {
    id: string;
    name: string;          // Function or module name
    selfTimeMs: number;    // CPU time exclusive to this frame
    totalTimeMs: number;   // CPU time inclusive of children
    depth: number;         // Nesting depth (0 = root)
    children: FlameNode[];
    filePath?: string;     // Optional source file for agent link-out
    lineNumber?: number;
  }
  ```
- [ ] Create `packages/vscode/src/webview/hooks/useFlamegraphData.ts`:
  - Accept `taskId: string` parameter.
  - On mount (or when `taskId` changes), dispatch an MCP tool call `{ tool: 'get_profile_data', taskId }` via the extension message bridge.
  - Maintain `{ data: FlameNode[] | null, isLoading: boolean, error: string | null }` state using `useState`.
  - Listen for the `PROFILE_DATA_RESPONSE` message from the extension host and update state accordingly.
  - Clean up the message listener on unmount.
- [ ] Create `packages/vscode/src/webview/components/FlamegraphView.tsx`:
  - Accept props: `{ profileData: FlameNode[] | null; onFrameHover?: (frame: FlameNode | null) => void; onFrameClick?: (frame: FlameNode) => void; maxDepth?: number }`.
  - If `profileData` is `null`, render a placeholder: `<div data-testid="flamegraph-canvas">No profiling data available</div>`.
  - Otherwise, render a `<canvas data-testid="flamegraph-canvas">` element that fills its container width.
  - Use the HTML5 Canvas 2D API to render the flamegraph:
    - Root frames fill the full canvas width proportional to their `totalTimeMs`.
    - Child frames are nested below their parent, each row 20px tall.
    - Frame color is computed from the `name` string hash mapped to HSL hues in the blue-to-orange range using `var(--vscode-charts-blue)` and `var(--vscode-charts-orange)` as palette anchors.
    - Frames narrower than 2px are skipped (skip rendering invisible bars).
    - Frame name text is clipped to fit inside the bar using `ctx.measureText` before drawing.
  - Implement `mousemove` handler: hit-test against the pre-computed frame rectangles and call `onFrameHover` with the matching `FlameNode` or `null`.
  - Implement `click` handler: same hit-test, call `onFrameClick` with the matching `FlameNode`.
  - Respect `maxDepth` prop: skip rendering of frames with `depth > maxDepth`.
  - Use a `ResizeObserver` to re-render the canvas when the container size changes.
  - Wrap the canvas in `will-change: transform` CSS to leverage GPU compositing per `[7_UI_UX_DESIGN-REQ-UI-DES-087-2]`.
- [ ] Create `packages/vscode/src/webview/components/FlamegraphTooltip.tsx`:
  - Accept props: `{ frame: FlameNode | null; x: number; y: number }`.
  - Return `null` if `frame` is `null`.
  - Render a small card positioned absolutely at `(x, y)` showing: frame name (bold monospace), self time (ms), total time (ms), and file path if present.
  - Use `z-index: 200` (Overlay tier per `[7_UI_UX_DESIGN-REQ-UI-DES-049-Z2]`).
  - Use only `--vscode-*` tokens for colors and borders.
- [ ] Integrate `FlamegraphView` and `FlamegraphTooltip` into `TelemetryPanel.tsx`:
  - Use `useFlamegraphData(activeTaskId)` hook to fetch data.
  - Render `<FlamegraphView profileData={data} onFrameHover={setHoveredFrame} onFrameClick={handleFrameClick} />`.
  - Render `<FlamegraphTooltip frame={hoveredFrame} x={mouseX} y={mouseY} />` when `hoveredFrame !== null`.
  - Show a `SkeletonShimmer` placeholder while `isLoading === true` per `[7_UI_UX_DESIGN-REQ-UI-DES-086-1]`.
  - Only render when `lodLevel === 'FULL'` (respect LOD gate from Task 01).

## 3. Code Review
- [ ] Verify canvas rendering is performed inside a `requestAnimationFrame` loop or single `rAF` call (not synchronous in the render path) to maintain 60 FPS target per `[7_UI_UX_DESIGN-REQ-UI-DES-059-1]`.
- [ ] Verify the `ResizeObserver` is properly disconnected in the `useEffect` cleanup to prevent memory leaks.
- [ ] Verify frame color computation does not use hardcoded hex values; colors must derive from VSCode token variables or computed from them.
- [ ] Verify `maxDepth` defaults to `Infinity` when not provided (no frames are arbitrarily hidden by default).
- [ ] Verify `FlamegraphTooltip` is positioned relative to the webview root, not the canvas, to avoid clipping.
- [ ] Verify the `useFlamegraphData` hook cleans up its message listener on unmount (no orphaned listeners).
- [ ] Verify the MCP tool name `get_profile_data` matches the name registered in the `ProjectServer` profiling MCP interface.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="FlamegraphView|FlamegraphTooltip|useFlamegraphData"` and confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/vscode build` and confirm no TypeScript compilation errors.

## 5. Update Documentation
- [ ] Update `docs/ui-architecture.md` with a section: "FlamegraphView — Canvas-based CPU flamegraph. Data fetched via `get_profile_data` MCP tool call. Only rendered when `lodLevel === 'FULL'`. Requirement: `[7_UI_UX_DESIGN-REQ-UI-DES-111]`, `[7_UI_UX_DESIGN-REQ-UI-DES-111-1]`."
- [ ] Document the `FlameNode` interface and `get_profile_data` MCP tool call contract in `docs/mcp-tools-reference.md`.
- [ ] Add entry to `CHANGELOG.md` under Phase 11: "feat(vscode): Add canvas-based flamegraph telemetry panel for CPU profiling visualization".

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="FlamegraphView|FlamegraphTooltip|useFlamegraphData" --json --outputFile=/tmp/flamegraph_test_results.json` and assert `numFailedTests === 0` in the JSON output.
- [ ] Run `grep -n "requestAnimationFrame" packages/vscode/src/webview/components/FlamegraphView.tsx` and assert at least one match (canvas rendering is rAF-gated).
- [ ] Run `grep -n "ResizeObserver" packages/vscode/src/webview/components/FlamegraphView.tsx` and assert at least one match.
- [ ] Run `grep -rn "#[0-9a-fA-F]\{3,6\}\|rgb(" packages/vscode/src/webview/components/FlamegraphView.tsx` and assert no matches (no hardcoded colors).
