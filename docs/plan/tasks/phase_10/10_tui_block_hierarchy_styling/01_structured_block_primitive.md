# Task: Create StructuredBlock Ink Primitive (Sub-Epic: 10_TUI Block & Hierarchy Styling)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-065]

## 1. Initial Test Written
- [ ] Create a Vitest test file `packages/cli/src/tui/components/__tests__/StructuredBlock.test.tsx`.
- [ ] Use `ink-testing-library` to verify that the `StructuredBlock` component correctly renders Unicode box-drawing characters (`┌`, `─`, `┐`, `│`, `└`, `─`, `┘`).
- [ ] Test that the component correctly wraps its children within these characters.
- [ ] Test that a `title` prop is correctly rendered in the top border (e.g., `┌─ Title ───┐`).
- [ ] Test that `borderColor` prop correctly applies ANSI color codes to the box characters.

## 2. Task Implementation
- [ ] Implement the `StructuredBlock` component in `packages/cli/src/tui/components/StructuredBlock.tsx`.
- [ ] Use React and Ink's `<Box>` and `<Text>` components.
- [ ] Implement the top border with `┌`, `─`, and `┐`. If a title is provided, it should be embedded in the top line.
- [ ] Implement the side borders with `│`.
- [ ] Implement the bottom border with `└`, `─`, and `┘`.
- [ ] Ensure the component adapts to the width of its container or content.
- [ ] Ensure the characters used are: `┌` (top-left), `┐` (top-right), `└` (bottom-left), `┘` (bottom-right), `─` (horizontal), `│` (vertical).

## 3. Code Review
- [ ] Verify that the component is highly reusable and doesn't contain logic specific to tool calls or reasoning.
- [ ] Ensure that it uses `Box` layout correctly to maintain a rigid box structure even with multi-line content.
- [ ] Check that Unicode characters are handled correctly and won't cause layout shifts in standard UTF-8 terminals.

## 4. Run Automated Tests to Verify
- [ ] Execute `npx vitest packages/cli/src/tui/components/__tests__/StructuredBlock.test.tsx` and ensure all tests pass.

## 5. Update Documentation
- [ ] Update the TUI primitive documentation (if it exists) or the internal `@devs/cli` README to include `StructuredBlock` as a shared component.

## 6. Automated Verification
- [ ] Run a small demonstration script `scripts/demo-tui-blocks.tsx` using `ts-node` that renders a few sample boxes to the terminal for manual/visual confirmation of the Unicode rendering.
