# Task: Implement Indentation & Dotted Line Hierarchy (Sub-Epic: 10_TUI Block & Hierarchy Styling)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-065-2]

## 1. Initial Test Written
- [ ] Update `packages/cli/src/tui/components/__tests__/LogTerminal.test.tsx` to include nested event structures.
- [ ] Mock a scenario where a Reviewer Agent turn is nested within a Developer Agent turn.
- [ ] Verify that the nested turn is indented by 2 spaces (`$spacing-sm`).
- [ ] Verify that a dotted vertical line character `┆` is rendered on the left side of the indented block.
- [ ] Ensure that multiple levels of nesting (though rare) would increment the indentation and vertical lines correctly.

## 2. Task Implementation
- [ ] Update the log rendering logic in `LogTerminal.tsx` to pass a `depth` or `level` prop to log entry components.
- [ ] Create a `HierarchyWrapper` component that wraps nested entries.
- [ ] For each level of depth:
    - Add a `margin-left` of 2 spaces.
    - Render the dotted line `┆` (Unicode U+250A) at the appropriate horizontal position.
- [ ] Ensure that the `StructuredBlock` component used within these nested turns respects the indentation and remains correctly aligned.
- [ ] Use `chalk.grey` or a similar metadata color for the `┆` characters to keep them subtle.

## 3. Code Review
- [ ] Verify that the use of `┆` is consistent with the "Indentation Hierarchy" requirement.
- [ ] Ensure that the indentation doesn't break the layout on narrow terminals (check for wrapping issues).
- [ ] Check that the hierarchy is correctly derived from the agent event metadata (e.g., `parent_id` or `context_depth`).

## 4. Run Automated Tests to Verify
- [ ] Execute `npx vitest packages/cli/src/tui/components/__tests__/LogTerminal.test.tsx` and ensure the nesting tests pass.

## 5. Update Documentation
- [ ] Document the hierarchy rendering logic in the `@devs/cli` technical notes, explaining how `depth` is calculated from the event stream.

## 6. Automated Verification
- [ ] Use a specialized test script `scripts/verify-tui-hierarchy.ts` that pushes nested mock events to a standalone Ink instance and captures the output to verify the presence of both the 2-space indentation and the `┆` character.
