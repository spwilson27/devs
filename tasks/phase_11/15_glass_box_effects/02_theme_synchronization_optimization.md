# Task: High-Performance Theme Synchronizer for DAG Canvas (Sub-Epic: 15_Glass_Box_Effects)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-026]

## 1. Initial Test Written
- [ ] Create a Vitest performance test in `src/vscode-extension/webview/performance/theme-latency.test.ts` to simulate a VSCode theme change (via `MutationObserver` on `document.body` class/attributes) and measure the time it takes for the theme state to update in the DAG canvas.
- [ ] Test should assert that the latency from the theme signal (change in `vscode-theme-kind`) to the start of the theme-aware frame update is less than 50ms.
- [ ] Create a Playwright performance test in `tests/performance/webview/theme-switch.spec.ts` to verify that a theme switch does not trigger a full React re-render of the `DAGCanvas` component (e.g., by mocking a `useEffect` and tracking its call count).

## 2. Task Implementation
- [ ] Implement a `ThemeObserver` utility in `src/vscode-extension/webview/utils/theme-observer.ts` using `MutationObserver` to watch for changes to the `class` or `data-vscode-theme-kind` on the `document.body`.
- [ ] Create a `ThemeSyncService` that exposes a callback or an event for theme updates.
- [ ] Integrate the `ThemeSyncService` with the `DAGCanvas` (D3/Canvas based) component.
- [ ] Implement a `requestAnimationFrame` loop in the `DAGCanvas` that checks for a "theme dirty" flag.
- [ ] Ensure that when a theme change is detected, the `ThemeSyncService` sets the "theme dirty" flag and the canvas re-paints with the updated CSS variables retrieved via `getComputedStyle(document.documentElement)`.
- [ ] Confirm that this bypasses the React reconciliation for the `DAGCanvas` entire subtree, as the canvas itself handles its own redrawing.

## 3. Code Review
- [ ] Verify that the `ThemeObserver` correctly captures all VSCode-emitted theme change events.
- [ ] Ensure that `getComputedStyle` is called only when necessary (e.g., when the theme actually changes) to minimize overhead.
- [ ] Confirm that the implementation avoids React state updates for the theme that would trigger expensive re-renders of the entire DAG SVG/Canvas.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test:performance` to execute the theme latency and re-render tests.
- [ ] Use the VSCode Webview Developer Tools (performance tab) to manually verify that a theme switch happens smoothly and without significant script execution blocks.

## 5. Update Documentation
- [ ] Update the `TAS` section on "Interface-Core Decoupling" and performance in `docs/2_tas.md` to document this optimized theme synchronization pattern.
- [ ] Reflect the theme observer pattern in the `AOD` in `.agent/vscode-performance.md`.

## 6. Automated Verification
- [ ] Execute a performance script `scripts/verify-theme-latency.js` that uses the Chrome DevTools Protocol to measure the time between a style change and the next paint event for the canvas element.
