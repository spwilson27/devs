# Task: Implement SVG Visual Link Renderer between Thoughts and ToolCalls (Sub-Epic: 58_Thought_Connectivity)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-084]

## 1. Initial Test Written
- [ ] Add a React unit test that mounts two DOM nodes (a Thought node and a ToolCall node) and asserts the `ThoughtLinkRenderer` renders an SVG `<path>` element connecting their centers.
  - File: `src/ui/components/__tests__/ThoughtLinkRenderer.test.tsx`
  - Testing details:
    1. Render a wrapper div with two children `div[data-thought-id="thought-1"]` and `div[data-toolcall-id="call-1"]` with fixed bounding boxes (jsdom style mocking of `getBoundingClientRect`).
    2. Render `<ThoughtLinkRenderer links={[{ source: 'thought-1', target: 'call-1' }]} />` and assert the DOM contains an `svg path` with a `d` attribute that is not empty.
    3. Snapshot the `svg` and ensure `className` contains `thought-link`.
  - Run: `pnpm test -- src/ui/components/__tests__/ThoughtLinkRenderer.test.tsx`.

## 2. Task Implementation
- [ ] Implement `ThoughtLinkRenderer` component.
  - File: `src/ui/components/ThoughtLinkRenderer.tsx`
  - API: `props: { links: Array<{ sourceThoughtId: string; targetId: string; id?: string; }>; stroke?: string; }`
  - Behavior:
    1. For each link, find DOM nodes with `data-thought-id` and `data-toolcall-id` attributes.
    2. Use `getBoundingClientRect()` for each node and compute an SVG path connecting the midpoints (simple cubic bezier or straight line).
    3. Use a `ResizeObserver` and `MutationObserver` to recompute positions when layout changes.
    4. Throttle recomputations to a maximum of 60 FPS using `requestAnimationFrame`.
    5. Add a CSS animation class `thought-link--pulse` for a subtle pulse on creation (`opacity` & `stroke-dashoffset` animation).
    6. Graceful fallback: if nodes are not found, do not render the path and log a debug message.

## 3. Code Review
- [ ] Verify:
  - No layout thrashing (batch `getBoundingClientRect` calls) and `requestAnimationFrame` used for DOM reads/writes separation.
  - Observers are properly disconnected on unmount.
  - Paths are accessible (add `aria-hidden="true"` to decorative SVG elements) and CSS animations respect `prefers-reduced-motion`.

## 4. Run Automated Tests to Verify
- [ ] Run the component test: `pnpm test -- src/ui/components/__tests__/ThoughtLinkRenderer.test.tsx` and the component snapshot tests.

## 5. Update Documentation
- [ ] Add a small developer doc at `docs/ui/components/thought-link-renderer.md` describing props, performance considerations, and examples.

## 6. Automated Verification
- [ ] Add a visual regression test (Chromatic or Playwright screenshot) that renders a Thought + ToolCall pair and stores a golden snapshot to detect regressions to the path geometry or style.