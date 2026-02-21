# Task: Diff Parser and Unified Diff Component (Sub-Epic: 17_TUI Diff Reviewer)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-070-1]

## 1. Initial Test Written
- [ ] Create a unit test for a new utility `parseUnifiedDiff(diffString: string)` in `@devs/cli/tui/utils/diff-parser.ts`.
  - [ ] Test that it correctly identifies added lines (`+`), removed lines (`-`), and context lines.
  - [ ] Test that it handles multiple hunks and metadata (e.g., `---`, `+++`, `@@`).
- [ ] Create a component test (using `ink-testing-library`) for `UnifiedDiffView` in `@devs/cli/tui/components/UnifiedDiffView.tsx`.
  - [ ] Assert that lines starting with `+` are rendered with green color.
  - [ ] Assert that lines starting with `-` are rendered with red color.
  - [ ] Assert that context lines are rendered with default/metadata color.

## 2. Task Implementation
- [ ] Implement `parseUnifiedDiff` utility:
  - [ ] Use a regex or line-by-line parser to split the raw diff string into an array of objects: `{ type: 'add' | 'remove' | 'context' | 'meta', content: string }`.
- [ ] Implement `UnifiedDiffView` Ink component:
  - [ ] Map the parsed diff objects to Ink `<Text>` components.
  - [ ] Apply `color="green"` for 'add' types.
  - [ ] Apply `color="red"` for 'remove' types.
  - [ ] Apply `color="grey"` (or metadata color) for 'meta' types.
  - [ ] Ensure the component handles large diffs by accepting a `maxHeight` or similar constraint if needed (though scrolling might be handled by a parent).

## 3. Code Review
- [ ] Verify that the diff parser is robust against different line ending formats (LF vs CRLF).
- [ ] Ensure color constants are used from a centralized theme or palette (e.g., `@devs/cli/tui/theme.ts`).
- [ ] Check that the component is functional-first and doesn't introduce unnecessary state.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test @devs/cli` to verify the utility and component tests pass.

## 5. Update Documentation
- [ ] Update `@devs/cli/README.md` or TUI documentation to mention the new `UnifiedDiffView` component.
- [ ] Document the `parseUnifiedDiff` utility in the internal AOD (`.agent.md`).

## 6. Automated Verification
- [ ] Execute a script `scripts/verify-diff-component.ts` that renders a sample diff using `ink-testing-library` and validates the ANSI color codes in the output string.
