# Task: Implement virtual scrolling for ThoughtStreamer using react-window (Sub-Epic: 57_ThoughtStreamer_Component)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-018]

## 1. Initial Test Written
- [ ] Create an integration/unit test at src/ui/components/__tests__/ThoughtStreamer.virtual.spec.tsx that mounts ThoughtStreamer with a large messages array (e.g., 5,000 items) and asserts that the DOM contains only a bounded number of rendered message nodes (e.g., <= 100). Use React Testing Library + jsdom and mock viewport height if needed.

## 2. Task Implementation
- [ ] Add react-window (or react-virtual) as dependency and implement virtualization in ThoughtStreamer:
  - Replace the simple map render with <FixedSizeList> or <VariableSizeList> wrapping an item renderer that outputs the per-message element (preserve data-testid and data-type attributes).
  - Provide prop configuration for itemSize (or measurement hook) and height; expose a scrollToBottom behavior option (auto | maintain).
  - Ensure new message append semantics are correct: when auto, scroll to newest message; when maintain, preserve current scroll offset.
  - Ensure virtualization integrates with aria-live (only visible messages should be announced as appropriate and duplicates should be avoided).

## 3. Code Review
- [ ] Verify virtualization avoids rendering all nodes, ensures stable keys, correctly handles variable heights if used, and does not perform heavy synchronous work on the main render path.

## 4. Run Automated Tests to Verify
- [ ] Run the virtualization tests: npm test -- src/ui/components/__tests__/ThoughtStreamer.virtual.spec.tsx and ensure assertions about DOM node counts and scroll behavior pass.

## 5. Update Documentation
- [ ] Document virtualization usage, props, and recommended itemSize strategies in docs/ui/thoughtstreamer.md (include code examples).

## 6. Automated Verification
- [ ] Add a CI smoke script scripts/verify-virtualization.js that mounts the component with 10k messages in jsdom and asserts rendered node count <= threshold; fail CI if exceeded.
