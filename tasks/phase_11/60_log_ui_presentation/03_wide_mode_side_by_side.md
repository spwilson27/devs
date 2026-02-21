# Task: Implement Wide Mode Side-by-Side Log Pane (Sub-Epic: 60_Log_UI_Presentation)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-083-2-2]

## 1. Initial Test Written
- [ ] Add layout integration tests at src/components/Layout/__tests__/wideModeLog.test.tsx BEFORE implementing the feature. Tests must include:
  - "wide mode renders log pane side-by-side": render the main ViewRouter/Layout with a mocked viewport width >= 1024px and assert that an element with data-testid="log-pane" exists and that it is a sibling of the primary content pane (data-testid="main-pane"); assert computed layout roles by verifying that log-pane is present in DOM and has expected CSS class (e.g., contains "w-1/3" or "grid-column") or that the parent grid has two columns.
  - "log pane is resizable and persists size": simulate dragging a resize handle (or programmatically set size) and assert that the persisted user preference (localStorage or Zustand state) updates; write the test to mock the storage layer.
  - "initial render uses truncated logs": assert the LogWindow inside the pane renders truncated content (data-testid="log-read-more" exists when content > limit).

## 2. Task Implementation
- [ ] Implement the wide-mode layout support in the layout manager/ViewRouter and add the log-pane component at src/components/LogWindow/LogPane.tsx:
  - Detect wide mode via a layout hook (useViewport or CSS media query) and render a two-column grid with main content and log pane side-by-side. Default split should allocate ~25%-35% width to the log pane.
  - LogPane should render LogWindow with props {mode: 'wide'} and support a drag handle to resize; persist the split in persisted UI state (Zustand or localStorage key `ui.logPaneWidth`).
  - Ensure the pane uses Tailwind utility tokens and respects theme variables (no hardcoded colors).
  - Add data-testid attributes: log-pane, log-resize-handle for deterministic tests.

## 3. Code Review
- [ ] During review, verify:
  - Layout uses CSS Grid/Flexbox reliably across viewports and is implemented inside Shadow DOM or scoped styles to avoid VSCode cross-scope leakage.
  - Resizing logic is debounced and persisted via a single source-of-truth state (Zustand slice or localStorage wrapper).
  - No blocking synchronous recalculations on window resize; heavy ops offloaded to requestAnimationFrame.

## 4. Run Automated Tests to Verify
- [ ] Run the layout and integration tests: npm run test -- --testPathPattern=wideModeLog --runInBand and confirm pass. For manual inspection, run a headless browser test at 1280x800 to validate side-by-side rendering.

## 5. Update Documentation
- [ ] Update src/components/LogWindow/README.md and the design note in tasks/phase_11/60_log_ui_presentation/ describing the wide-mode behavior, persisted preference key `ui.logPaneWidth`, and the adaptive CSS classes used.

## 6. Automated Verification
- [ ] Add a CI smoke test that runs at a wide viewport size and asserts that data-testid="log-pane" is present and that the persisted `ui.logPaneWidth` value is written when resizing is simulated; fail CI if missing.