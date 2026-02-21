# Task: Implement `useSVGViewport` Hook for Viewport-Aware Rendering (Sub-Epic: 100_Shared_Logic_SVG_Hooks)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-037]

## 1. Initial Test Written
- [ ] Create a unit test in `packages/ui-hooks/src/__tests__/useSVGViewport.test.ts`.
- [ ] Mock `ResizeObserver` and `IntersectionObserver` globals.
- [ ] Test that the hook returns `isInViewport: false` initially.
- [ ] Test that when `IntersectionObserver` triggers, `isInViewport` becomes `true`.
- [ ] Test that `ResizeObserver` updates the `width` and `height` values returned by the hook when the observed element changes size.
- [ ] Verify that the hook cleans up (disconnects) both observers on unmount.

## 2. Task Implementation
- [ ] Create `packages/ui-hooks/src/useSVGViewport.ts`.
- [ ] Implement the `useSVGViewport` hook using `useRef`, `useState`, and `useEffect`.
- [ ] Use `ResizeObserver` to monitor the dimensions of the target element.
- [ ] Use `IntersectionObserver` to detect when the element enters or leaves the viewport.
- [ ] Return an object containing `ref` (to be attached to the SVG container), `width`, `height`, and `isInViewport`.
- [ ] Ensure the hook is exported from the `@devs/ui-hooks` package.

## 3. Code Review
- [ ] Verify that the hook handles `null` refs gracefully.
- [ ] Ensure that `ResizeObserver` callbacks are debounced if necessary to prevent rapid re-renders during smooth resizing, although for 60FPS target, direct updates may be preferred with proper memoization.
- [ ] Check that the implementation adheres to the "Glass-Box" transparency by logging observer attachments if in debug mode.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test` in the `packages/ui-hooks` directory.
- [ ] Ensure all tests for `useSVGViewport` pass.

## 5. Update Documentation
- [ ] Add `useSVGViewport` to the `@devs/ui-hooks` README.md or internal documentation.
- [ ] Document that this hook is mandatory for `MermaidHost` and `DAGCanvas` to mitigate rendering overhead.

## 6. Automated Verification
- [ ] Run a script to verify that the `useSVGViewport` hook is exported in `packages/ui-hooks/index.ts`.
- [ ] Validate that no hardcoded colors or theme-violating styles are introduced in the hook's logic.
