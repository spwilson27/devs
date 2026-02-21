# Task: View-Specific Transient State Restoration (Sub-Epic: 08_Persistence_Recovery)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-065]

## 1. Initial Test Written
- [ ] Create a test for the `DAGCanvas` (or a mock view) component.
- [ ] Simulate a user panning or zooming the canvas.
- [ ] Verify that these transient values are updated in the view's internal or shared state.
- [ ] Verify that when the component is unmounted and remounted, it receives the previously cached pan/zoom values from the store.
- [ ] Verify that switching between different views (e.g., ROADMAP vs RESEARCH) preserves the distinct transient state for each.

## 2. Task Implementation
- [ ] Update the Global UI Store (Zustand) to include a `viewTransientStates` map.
- [ ] In the `DAGCanvas` component:
    - On change (pan/zoom), update the store with the current transform coordinates.
    - On mount, check the store for cached coordinates for the `DAG_VIEW` and apply them to the D3 or React-Zoom-Pan-Pinch instance.
- [ ] Ensure that `6_UI_UX_ARCH-REQ-065` is met by ensuring the router/store handles the "caching" logic.
- [ ] Implement similar logic for other views with transient state (e.g., scroll positions in long lists if not handled by the browser).
- [ ] Integrate these transient states into the persistence cycle (Task 02 and 03) so they survive a Webview reload.

## 3. Code Review
- [ ] Verify that transient state updates are debounced or throttled before being persisted to `vscode.getState()` to avoid excessive I/O.
- [ ] Ensure that restoring transient state doesn't cause visual "jank" or flickering on load.
- [ ] Check that the cached state is cleared if the underlying data (e.g., the DAG itself) changes significantly, making the old pan/zoom invalid.

## 4. Run Automated Tests to Verify
- [ ] Run the `DAGCanvas` interaction tests.
- [ ] Verify that pan/zoom is preserved across tab switches in the Webview.

## 5. Update Documentation
- [ ] Document the `viewTransientStates` schema in the global store documentation.

## 6. Automated Verification
- [ ] Execute a test that simulates a view switch and verifies that the `vscode.getState()` payload contains the updated transient state for the previous view.
