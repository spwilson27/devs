# Task: Virtualized Agent Log List for Trace Streaming (Sub-Epic: 03_Agent Console UI Components)

## Covered Requirements
- [1_PRD-REQ-UI-005], [8_RISKS-REQ-036]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/components/AgentConsole/__tests__/VirtualizedTraceList.test.tsx`, write tests using React Testing Library and a mocked `react-window` (or `@tanstack/react-virtual`) that:
  - Assert `VirtualizedTraceList` renders a `<div data-testid="virtualized-trace-list" role="log" aria-label="Agent trace log">` outer container.
  - Assert that with 10,000 `TraceEntry` items supplied, only items whose indices fall within the visible window (mocked `overscanCount + visibleRange`) are rendered in the DOM — use `getAllByTestId(/trace-entry-/)` and assert count is ≤ 30.
  - Assert that the total scrollable height reported on the inner container equals `itemCount * itemSize` (virtualization contract).
  - Assert each rendered `TraceEntry` item displays: `type` badge, `text` content, and `timestamp` formatted as `HH:mm:ss.SSS`.
  - Assert `aria-rowcount` attribute on the list equals the total `items.length` (accessibility: announce true count to screen readers even when items are virtualized).
  - Assert that appending a new item to `items` prop triggers a re-render showing the new item's `data-testid` (integration with data update).
  - Assert auto-scroll-to-bottom behavior: when `autoScroll` prop is `true`, the virtualized list scrolls to the last item index on `items` update.
  - Assert auto-scroll is suppressed when `autoScroll` prop is `false`.

## 2. Task Implementation
- [ ] Add `react-window` and `@types/react-window` as dependencies:
  `pnpm --filter @devs/webview-ui add react-window && pnpm --filter @devs/webview-ui add -D @types/react-window`.
- [ ] Add to `packages/webview-ui/src/components/AgentConsole/types.ts`:
  ```typescript
  export interface TraceEntry {
    id: string;
    timestamp: number;   // Unix ms
    type: ThoughtType;   // Reuse existing union
    text: string;
  }
  ```
- [ ] Create `packages/webview-ui/src/components/AgentConsole/VirtualizedTraceList.tsx`:
  - Accept props: `items: TraceEntry[]`, `autoScroll?: boolean`, `itemSize?: number` (default `56`), `className?: string`.
  - Render outer `<div data-testid="virtualized-trace-list" role="log" aria-label="Agent trace log" aria-rowcount={items.length}>`.
  - Use `react-window`'s `FixedSizeList` internally:
    ```tsx
    <AutoSizer>
      {({ height, width }) => (
        <FixedSizeList
          ref={listRef}
          height={height}
          width={width}
          itemCount={items.length}
          itemSize={itemSize}
          itemData={items}
          overscanCount={5}
        >
          {TraceEntryRow}
        </FixedSizeList>
      )}
    </AutoSizer>
    ```
    where `react-virtualized-auto-sizer` is used for `AutoSizer` (add as dependency).
  - `TraceEntryRow`: a memoized `React.memo` component rendered by `FixedSizeList`. Renders:
    - `<div data-testid={`trace-entry-${items[index].id}`} style={style}>` (must apply the `style` prop from `react-window` for positioning).
    - A `<span className={styles[entry.type]}>` badge showing the `type` label.
    - A `<span className={styles.traceText}>` for `text`.
    - A `<time dateTime={...}>` with timestamp formatted `HH:mm:ss.SSS`.
  - Implement auto-scroll: `useEffect(() => { if (autoScroll && items.length > 0) listRef.current?.scrollToItem(items.length - 1, 'end'); }, [items.length, autoScroll])`.
- [ ] Create `packages/webview-ui/src/components/AgentConsole/VirtualizedTraceList.module.css`:
  - `.traceList` — `height: 100%; width: 100%;`
  - `.traceEntry` — `display: flex; align-items: center; gap: var(--spacing-sm); padding: 0 var(--spacing-sm); border-bottom: 1px solid var(--vscode-panel-border, #2a2a2a);`
  - `.reasoning`, `.action`, `.observation` — distinct `background-color` left-strip via `box-shadow: inset 3px 0 0 <color>`.
  - `.traceText` — `font-family: Georgia, serif; font-size: 0.8125rem; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`
  - `.badge` — `font-size: 0.625rem; text-transform: uppercase; letter-spacing: 0.05em; padding: 1px 4px; border-radius: 2px; flex-shrink: 0;`
- [ ] Replace `ThoughtStream`'s internal plain `map()` rendering with `VirtualizedTraceList` — pass `ThoughtEntry[]` cast to `TraceEntry[]` (compatible shape) and `autoScroll={!isUserScrolled}`.
- [ ] Add `react-virtualized-auto-sizer` dependency: `pnpm --filter @devs/webview-ui add react-virtualized-auto-sizer`.
- [ ] Create `packages/webview-ui/src/__mocks__/react-window.tsx` with a minimal jest mock that renders all visible items for testing (bypasses virtualization in test environment so RTL queries work normally), using a configurable visible range of 20 items.

## 3. Code Review
- [ ] Confirm `TraceEntryRow` is wrapped in `React.memo` to prevent re-renders when only unrelated items update.
- [ ] Verify the `style` prop from `react-window` is spread onto the root element of `TraceEntryRow` — failure to do so breaks virtualization positioning.
- [ ] Confirm `aria-rowcount` equals the **total** item count (not the rendered subset) per ARIA 1.2 `log` role guidelines.
- [ ] Validate `overscanCount={5}` is set — this ensures smooth scrolling by pre-rendering 5 items outside the visible window.
- [ ] Confirm `itemSize` is a fixed number (not dynamic) — `VariableSizeList` must NOT be used unless row heights genuinely vary, as it is significantly more expensive.
- [ ] Verify auto-scroll uses `scrollToItem` API (not raw DOM `scrollTop`) so `react-window` can control positioning correctly.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="VirtualizedTraceList"` and confirm all assertions pass.
- [ ] Run the full `AgentConsole` test suite: `pnpm --filter @devs/webview-ui test -- --testPathPattern="AgentConsole"` — confirm no regressions from swapping `ThoughtStream` internals.
- [ ] Run a performance smoke test: in a Playwright E2E test (if configured), inject 5,000 `TraceEntry` items, measure frame time via `page.evaluate(() => performance.now())` over 2 seconds of scroll, and assert P95 frame time ≤ 16.7 ms (60 FPS target from `9_ROADMAP-REQ-036`).

## 5. Update Documentation
- [ ] Update `packages/webview-ui/docs/COMPONENTS.md` to add `VirtualizedTraceList` with prop table and a note explaining why `FixedSizeList` was chosen over `VariableSizeList`.
- [ ] Add a performance note: "Virtualized list renders only ~20 DOM nodes regardless of total trace count (10,000+ entries supported)."
- [ ] Record in `.devs/memory/phase_12_decisions.md`: "Agent trace/thought stream uses `react-window` `FixedSizeList` with `overscanCount=5` and `itemSize=56`. `ThoughtStream` delegates rendering to `VirtualizedTraceList`. Auto-scroll implemented via `scrollToItem` API."

## 6. Automated Verification
- [ ] `pnpm --filter @devs/webview-ui test -- --ci --forceExit --testPathPattern="VirtualizedTraceList|AgentConsole"` exits with code 0.
- [ ] `pnpm --filter @devs/webview-ui build` completes without errors.
- [ ] DOM node count assertion: in the E2E / Storybook smoke test with 10,000 items loaded, run `document.querySelectorAll('[data-testid^="trace-entry-"]').length` and assert the count is ≤ 30 (proving virtualization is active, not bypassed).
