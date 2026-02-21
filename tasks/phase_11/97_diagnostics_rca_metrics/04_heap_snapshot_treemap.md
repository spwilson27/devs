# Task: Implement Heap Snapshot Treemap Visualization (Sub-Epic: 97_Diagnostics_RCA_Metrics)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-111]
- [7_UI_UX_DESIGN-REQ-UI-DES-111-2]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/components/__tests__/HeapSnapshotView.test.tsx`, write unit tests:
  - Test that `HeapSnapshotView` renders a treemap SVG element with `data-testid="heap-treemap"` when given valid `heapData` prop.
  - Test that `HeapSnapshotView` renders a "No heap snapshot available" placeholder when `heapData` is `null`.
  - Test that modules exceeding the TAS memory quota threshold (read from a `quotaBytes` prop) are rendered with a distinct "over-quota" class or fill color.
  - Test that clicking a treemap cell calls an `onModuleClick(module: HeapModule)` callback with the correct module data.
  - Test that hovering a treemap cell calls `onModuleHover(module: HeapModule | null)` with the correct data.
  - Test that the treemap cells are labeled with the module name and size in human-readable format (e.g., "2.3 MB").
  - Test that cells below a minimum pixel area (100px²) do not render a text label (to avoid clutter).
- [ ] In `packages/vscode/src/webview/components/__tests__/HeapTooltip.test.tsx`:
  - Test that `HeapTooltip` renders `module.name`, `module.sizeBytes` formatted as MB, and an "⚠ Over quota" badge when `module.sizeBytes > quotaBytes`.
  - Test that `HeapTooltip` returns `null` when `module` prop is `null`.
- [ ] In `packages/vscode/src/webview/hooks/__tests__/useHeapSnapshotData.test.ts`:
  - Test that `useHeapSnapshotData(taskId)` returns `{ data: null, isLoading: true }` on mount.
  - Test that after a mocked `get_heap_snapshot` MCP tool call resolves, it returns `{ data: HeapModule[], isLoading: false }`.
  - Test that an error response sets `{ data: null, isLoading: false, error: string }`.
- [ ] In `packages/vscode/src/webview/utils/__tests__/treemapLayout.test.ts`:
  - Test that `computeTreemapLayout(modules, width, height)` returns an array of `{ x, y, width, height, module }` rectangles.
  - Test that the sum of all rectangle areas equals `width * height` (no gaps, no overlap within the squarified layout).
  - Test that larger modules produce larger rectangles.
  - Test that an empty `modules` array returns an empty rectangle array without throwing.

## 2. Task Implementation
- [ ] Define the `HeapModule` TypeScript interface in `packages/vscode/src/webview/types/diagnostics.ts`:
  ```ts
  export interface HeapModule {
    id: string;
    name: string;          // Module or package name (e.g., "@devs/core")
    sizeBytes: number;     // Total heap allocation attributed to this module
    selfBytes: number;     // Heap allocation exclusive to this module
    retainedBytes: number; // Bytes kept alive by this module's references
    filePath?: string;     // Source file for agent link-out
  }
  ```
- [ ] Create `packages/vscode/src/webview/utils/treemapLayout.ts`:
  - Export `computeTreemapLayout(modules: HeapModule[], width: number, height: number): TreemapRect[]`.
  - Implement the squarified treemap algorithm (Bruls et al.) to produce visually balanced rectangles.
  - Sort `modules` by `sizeBytes` descending before layout.
  - Return `TreemapRect[]` where each element is `{ x: number; y: number; width: number; height: number; module: HeapModule }`.
- [ ] Create `packages/vscode/src/webview/hooks/useHeapSnapshotData.ts`:
  - Accept `taskId: string`.
  - On mount (or when `taskId` changes), dispatch MCP tool call `{ tool: 'get_heap_snapshot', taskId }` via the extension message bridge.
  - Maintain `{ data: HeapModule[] | null, isLoading: boolean, error: string | null }` state.
  - Listen for `HEAP_SNAPSHOT_RESPONSE` message from extension host and update state.
  - Clean up on unmount.
- [ ] Create `packages/vscode/src/webview/components/HeapSnapshotView.tsx`:
  - Accept props: `{ heapData: HeapModule[] | null; quotaBytes: number; onModuleClick?: (m: HeapModule) => void; onModuleHover?: (m: HeapModule | null) => void }`.
  - If `heapData` is `null`, render `<div data-testid="heap-treemap">No heap snapshot available</div>`.
  - Otherwise, render an `<svg data-testid="heap-treemap">` that fills its container (use a `ResizeObserver` to track width/height).
  - Call `computeTreemapLayout(heapData, svgWidth, svgHeight)` to get the rectangle positions.
  - For each rectangle, render a `<rect>` with:
    - `fill`: `var(--vscode-charts-blue)` for normal modules; `var(--vscode-charts-red)` for modules where `sizeBytes > quotaBytes`.
    - `class="heap-cell"` and `class="heap-cell--over-quota"` when over-quota.
    - `stroke`: `var(--vscode-panel-border)` with `strokeWidth={1}`.
  - Render a `<text>` label inside each rectangle if `rect.width * rect.height > 100`:
    - Content: `${module.name}\n${formatBytes(module.sizeBytes)}`.
    - Font: `11px var(--vscode-editor-font-family)` (monospace metadata size per type scale).
    - `clipPath` or `textLength` clamped to the rect width.
  - On `mousemove`, determine which rect the cursor is over (using `SVGRect` hit testing) and call `onModuleHover`.
  - On `mouseleave`, call `onModuleHover(null)`.
  - On `click`, call `onModuleClick` with the hit-tested module.
- [ ] Create `packages/vscode/src/webview/utils/formatBytes.ts`:
  - Export `formatBytes(bytes: number): string` returning human-readable sizes (e.g., `"1.23 MB"`, `"456 KB"`).
- [ ] Create `packages/vscode/src/webview/components/HeapTooltip.tsx`:
  - Accept props: `{ module: HeapModule | null; quotaBytes: number; x: number; y: number }`.
  - Return `null` if `module` is `null`.
  - Render a card at `(x, y)` showing: module name (bold mono), total size (`sizeBytes` formatted), self size, retained size, and an "⚠ Over quota" warning badge if `sizeBytes > quotaBytes`.
  - Use `z-index: 200` (Overlay tier per `[7_UI_UX_DESIGN-REQ-UI-DES-049-Z2]`).
  - Use only `--vscode-*` tokens.
- [ ] Integrate into `TelemetryPanel.tsx`:
  - Use `useHeapSnapshotData(activeTaskId)` to fetch data.
  - Read `quotaBytes` from a project configuration value (fall back to `50 * 1024 * 1024` = 50 MB if not configured).
  - Render `<HeapSnapshotView heapData={data} quotaBytes={quotaBytes} onModuleHover={setHoveredModule} onModuleClick={handleModuleClick} />`.
  - Render `<HeapTooltip module={hoveredModule} quotaBytes={quotaBytes} x={mouseX} y={mouseY} />`.
  - Show `SkeletonShimmer` while `isLoading === true`.
  - Only render when `lodLevel === 'FULL'` (respect LOD gate from Task 01).
  - On `handleModuleClick`: if the module has a `filePath`, dispatch a `OPEN_FILE` message to the extension host to open the source file in the VSCode editor.

## 3. Code Review
- [ ] Verify `computeTreemapLayout` is a pure function with no side effects (easy to unit test and cache).
- [ ] Verify the `ResizeObserver` in `HeapSnapshotView` is disconnected on unmount.
- [ ] Verify over-quota cells use `var(--vscode-charts-red)` and not a hardcoded red hex value.
- [ ] Verify `formatBytes` handles edge cases: `0`, negative values (return `"0 B"`), and values over 1 GB.
- [ ] Verify `HeapTooltip` does not render outside the webview viewport (clamp position to viewport bounds).
- [ ] Verify `useHeapSnapshotData` message listener is scoped to the correct `HEAP_SNAPSHOT_RESPONSE` message type to avoid cross-contamination with other message handlers.
- [ ] Verify the SVG `<text>` labels have `aria-hidden="true"` and the `<rect>` elements have `aria-label="${module.name}: ${formatBytes(module.sizeBytes)}"` for screen reader accessibility per `[7_UI_UX_DESIGN-REQ-UI-DES-084-3]`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="HeapSnapshotView|HeapTooltip|useHeapSnapshotData|treemapLayout|formatBytes"` and confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/vscode build` and confirm no TypeScript compilation errors.

## 5. Update Documentation
- [ ] Update `docs/ui-architecture.md` with a section: "HeapSnapshotView — SVG treemap visualization of heap allocations per module. Modules exceeding `quotaBytes` are highlighted in red. Data fetched via `get_heap_snapshot` MCP tool call. Clicking a module opens its source file. Only rendered when `lodLevel === 'FULL'`. Requirement: `[7_UI_UX_DESIGN-REQ-UI-DES-111]`, `[7_UI_UX_DESIGN-REQ-UI-DES-111-2]`."
- [ ] Document the `HeapModule` interface and `get_heap_snapshot` MCP tool call in `docs/mcp-tools-reference.md`.
- [ ] Document `formatBytes` utility in `docs/utilities-reference.md`.
- [ ] Add entry to `CHANGELOG.md` under Phase 11: "feat(vscode): Add heap snapshot treemap visualization with over-quota highlighting".

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="HeapSnapshotView|HeapTooltip|useHeapSnapshotData|treemapLayout|formatBytes" --json --outputFile=/tmp/heap_test_results.json` and assert `numFailedTests === 0` in the JSON output.
- [ ] Run `grep -n "ResizeObserver" packages/vscode/src/webview/components/HeapSnapshotView.tsx` and assert at least one match.
- [ ] Run `grep -n "over-quota\|quotaBytes" packages/vscode/src/webview/components/HeapSnapshotView.tsx` and assert at least one match confirming the over-quota logic is present.
- [ ] Run `grep -rn "#[0-9a-fA-F]\{3,6\}\|rgb(" packages/vscode/src/webview/components/HeapSnapshotView.tsx packages/vscode/src/webview/components/HeapTooltip.tsx` and assert no matches (no hardcoded colors).
