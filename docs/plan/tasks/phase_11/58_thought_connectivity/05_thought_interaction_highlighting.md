# Task: Interaction: Click/Hover ToolCall -> Highlight Originating Thought (Sub-Epic: 58_Thought_Connectivity)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-084]

## 1. Initial Test Written
- [ ] Add an E2E test (Playwright or Cypress) that validates clicking a ToolCall node highlights the originating Thought and scrolls it into view.
  - File: `tests/e2e/thought-linking.spec.ts`
  - Test steps:
    1. Render the app (or a test harness) with a seeded Thought `thought-1` and a ToolCall `{ id:'call-1', sourceThoughtId: 'thought-1' }`.
    2. Click the DOM node representing the ToolCall.
    3. Assert the Thought DOM node contains the `is-highlighted` CSS class and has focus (or `aria-selected="true"`).
  - Run: `pnpm test:e2e -- tests/e2e/thought-linking.spec.ts`.

## 2. Task Implementation
- [ ] Wire UI interactions:
  - Files to modify/add:
    - `src/ui/components/ToolCallItem.tsx` - dispatch `selectThought(sourceThoughtId)` on click and keyboard activation (Enter/Space).
    - `src/ui/components/ThoughtItem.tsx` - subscribe to selection state, apply `is-highlighted` class, and call `element.scrollIntoView({ behavior: 'smooth', block: 'center' })` when selected.
  - Ensure keyboard accessibility: ToolCallItem should be `role="button"` or a real `<button>` and support `tabindex` and `aria-expanded`/`aria-controls` where appropriate.

## 3. Code Review
- [ ] Verify:
  - Focus management is correct (no focus traps); when a thought is highlighted it receives focus only if the user initiated the action.
  - CSS highlight meets contrast and reduced-motion rules.
  - Tests cover keyboard and mouse interactions.

## 4. Run Automated Tests to Verify
- [ ] Run the E2E test suite for the scenario: `pnpm test:e2e -- tests/e2e/thought-linking.spec.ts`.

## 5. Update Documentation
- [ ] Add UX notes `docs/ui/interaction-thought-highlighting.md` describing keyboard interactions, ARIA roles used, and the highlight visual token.

## 6. Automated Verification
- [ ] Add an integration smoke test that simulates the click and uses `page.$eval` to assert the class and focus state for CI.