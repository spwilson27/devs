# Task: ConsoleView Virtualized Log List Component (Sub-Epic: 59_Log_Windowing_Core)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-094]

## 1. Initial Test Written
- [ ] Write unit tests at tests/webview/console/virtualizedConsole.test.ts that assert virtualization behavior using React Testing Library + Jest/Vitest:
  - Render VirtualizedConsole with 10,000 synthetic LogEntry items provided by a mocked WindowingStore and assert that the DOM contains only the visible row nodes (e.g., if rowHeight=24 and containerHeight=480 then only ~20-30 DOM rows exist plus overscan).
  - Assert stable itemKey behavior: when entries are inserted at the tail, existing DOM nodes are reused and do not remount unnecessarily (use jest.spyOn to detect mount/unmount counts).
  - Assert scrollToIndex(index) correctly places the expected LogEntry in the viewport and that virtualization maintains consistent indexes.

## 2. Task Implementation
- [ ] Implement src/webview/console/VirtualizedConsole.tsx with these constraints:
  - Use a battle-tested virtualization library (prefer react-window FixedSizeList) or a lean custom windowed renderer if project policy disallows new deps.
  - Provide props: items: LogEntry[], rowHeight:number, overscanCount:number, itemKey: (index:number,item:LogEntry)=>string.
  - Implement an imperative scrollToIndex(index:number) method exposed via ref that preserves scroll position when older pages are prepended by the ChunkManager (see task 04).
  - Implement a small adaptor that subscribes to WindowingStore and only passes the visible slice into the renderer.
  - Ensure the component is SSR-safe (guard window usage) and testable in jsdom.

## 3. Code Review
- [ ] Verify:
  - The virtualization strategy keeps DOM node count O(viewport_size + overscan) regardless of total items.
  - itemKey is stable and based on entry.seq to prevent reordering remounts.
  - ARIA roles and accessible markup are present: role="list" on container, role="listitem" on rows, and keyboard focus management for Read More controls.

## 4. Run Automated Tests to Verify
- [ ] Run unit tests (example: npm test -- tests/webview/console/virtualizedConsole.test.ts) and validate DOM node count assertions under jsdom.

## 5. Update Documentation
- [ ] Add a short README at src/webview/console/README.md documenting props, example usage, performance guidance (rowHeight tuning, overscan trade-offs) and known limitations.

## 6. Automated Verification
- [ ] Provide a small headless verification script tests/phase_11/virtualization_verify.js that mounts VirtualizedConsole with 50k synthetic logs and logs the number of DOM nodes created; CI should assert DOM nodes < 2 * (containerHeight / rowHeight).
