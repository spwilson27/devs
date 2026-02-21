# Task: Narrative Thought Stream Typography Implementation (Sub-Epic: 17_Font_Inheritance_Stack)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-076], [7_UI_UX_DESIGN-REQ-UI-DES-034]

## 1. Initial Test Written
- [ ] Create a component test for `ThoughtStreamer` using Vitest and React Testing Library.
- [ ] Verify that the rendered "thought" blocks have a computed `font-family` containing "Georgia" or "serif".
- [ ] Verify that the `line-height` is exactly `1.6` (as per REQ-UI-DES-035).
- [ ] Verify that the text style is `italic` by default for agentic reasoning content.

## 2. Task Implementation
- [ ] Modify the `ThoughtStreamer` component (likely in `src/components/Console/ThoughtStreamer.tsx`) to apply the narrative font stack.
- [ ] Use Tailwind classes or inline styles to apply:
    - `font-family: var(--devs-font-narrative)` or `font-devs-narrative`.
    - `font-italic`.
    - `leading-relaxed` or a custom `line-height: 1.6`.
- [ ] Apply the adaptive background color using `color-mix` if not already implemented, ensuring the serif text remains legible:
    - `background-color: color-mix(in srgb, var(--vscode-editor-background), var(--devs-thinking) 8%)`.
- [ ] Ensure `react-markdown` components within the streamer also inherit these styles for paragraphs and list items.

## 3. Code Review
- [ ] Verify the distinct visual separation between "Internal Thought" (Serif/Italic) and "External Output" (Mono).
- [ ] Ensure that the 1.6 line-height provides sufficient vertical rhythm for long reasoning chains.
- [ ] Check for any font-weight clashes; ensure weights are around 450/500 if applicable.

## 4. Run Automated Tests to Verify
- [ ] Run the `ThoughtStreamer` component tests: `npm run test ThoughtStreamer`.

## 5. Update Documentation
- [ ] Capture the styling decision in the component's `.agent.md` file, noting the use of Georgia for narrative authority.

## 6. Automated Verification
- [ ] Validate the component's rendered HTML in a test environment to ensure the `font-family` and `line-height` properties are correctly inherited.
