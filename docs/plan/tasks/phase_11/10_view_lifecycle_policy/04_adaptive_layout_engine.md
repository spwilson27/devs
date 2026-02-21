# Task: Implement Adaptive Layout Engine for Webview (Sub-Epic: 10_View_Lifecycle_Policy)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-080]

## 1. Initial Test Written
- [ ] Write a unit test for the `useLayoutMode` hook in `@devs/ui-hooks`. Mock `ResizeObserver` to report a width of 350px. Assert that the hook returns `{ mode: 'SIDEBAR' }`.
- [ ] Mock `ResizeObserver` to report a width of 1000px. Assert that the hook returns `{ mode: 'MAIN' }`.
- [ ] Write an integration test for the `AppLayout` component. Render the component in `SIDEBAR` mode and assert that the sidebar navigation is hidden (per `no-drawer policy` [7_UI_UX_DESIGN-REQ-UI-DES-003-2]).

## 2. Task Implementation
- [ ] Create a `useLayoutMode` custom hook that uses `ResizeObserver` to determine the viewport width:
  - `mode: 'SIDEBAR'` if `width < 600px`.
  - `mode: 'MAIN'` if `width >= 600px`.
- [ ] Implement a `LayoutProvider` in the root of the Webview app. The provider must inject the current `mode` into a context accessible by all components.
- [ ] Apply conditional CSS classes to the main container in `AppLayout.tsx` based on the current mode:
  - `SIDEBAR` mode: Linear layout, vertical stacking of elements, hidden navigation bars.
  - `MAIN` mode: Multi-pane layout, horizontal split views, persistent navigation.
- [ ] Use CSS variables (e.g., `--devs-layout-mode`) to allow child components to adapt their own internal layout logic.
- [ ] Ensure that all margin and padding adjustments are in multiples of 4px [7_UI_UX_DESIGN-REQ-UI-DES-040].

## 3. Code Review
- [ ] Verify that the `ResizeObserver` is cleaned up correctly when the component unmounts.
- [ ] Ensure that transitions between `SIDEBAR` and `MAIN` mode are instant (0ms duration) [7_UI_UX_DESIGN-REQ-UI-DES-085-4].
- [ ] Check for any potential performance bottlenecks when resizing the window rapidly (e.g., use `useMemo` for layout calculations).

## 4. Run Automated Tests to Verify
- [ ] Execute `vitest src/layout/__tests__/LayoutMode.test.tsx` to verify the adaptive logic.
- [ ] Run `npm run lint` to ensure that all layout-related CSS follows the project standards.

## 5. Update Documentation
- [ ] Update the `UI/UX Design` document to reflect the `Adaptive Layout Engine` policy.
- [ ] Document the `useLayoutMode` hook in the project's internal developer guide.

## 6. Automated Verification
- [ ] Use the `devs-layout-test.sh` script to verify that the Webview correctly adapts its layout when resized within VSCode.
