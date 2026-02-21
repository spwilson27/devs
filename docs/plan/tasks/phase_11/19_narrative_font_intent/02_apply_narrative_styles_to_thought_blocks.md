# Task: Apply Narrative Styles to Thought Blocks (Sub-Epic: 19_Narrative_Font_Intent)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-031-2], [7_UI_UX_DESIGN-REQ-UI-DES-035-1]

## 1. Initial Test Written
- [ ] Create a React Testing Library test for the `ThoughtStreamer` component in `src/webview/components/Console/ThoughtStreamer.test.tsx`.
- [ ] The test should verify that the container for agent thoughts has the `font-family` set to the narrative serif stack.
- [ ] The test should verify that the `line-height` of the narrative text blocks is exactly `1.6`.

## 2. Task Implementation
- [ ] Locate or create the `ThoughtStreamer` component (or the specific component used for rendering agent reasoning).
- [ ] Apply the narrative font family and line-height styles:
  - Use the Tailwind class `font-narrative` (defined in the previous task).
  - Apply `leading-[1.6]` or a corresponding Tailwind utility to achieve the `1.6` line-height.
- [ ] Ensure the font size is set to `15px` or `16px` as specified in the type scale for Agent Thoughts.
- [ ] Apply these styles to the "Internal Monologue" headers as well, ensuring they use the thinking color defined by `--devs-thinking-color`.

## 3. Code Review
- [ ] Verify the "High vertical rhythm" of the thoughts to ensure it facilitates scanning long chains of thought as intended.
- [ ] Ensure the styles are applied consistently across all narrative blocks in the Console and Dashboard views.
- [ ] Check for proper contrast ratios (WCAG 2.1 AA) when using the serif font against the themed backgrounds.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test src/webview/components/Console/ThoughtStreamer.test.tsx` to verify the styles are correctly applied to the DOM.

## 5. Update Documentation
- [ ] Reflect the application of narrative styles in the component documentation or AOD files.

## 6. Automated Verification
- [ ] Use a DOM inspection script or Vitest snapshot to verify the computed `line-height` and `font-family` on the thought block elements.
