# Task: ThoughtStream Store Slice and Selectors (Sub-Epic: 58_Thought_Connectivity)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-084], [6_UI_UX_ARCH-REQ-099]

## 1. Initial Test Written
- [ ] Add unit tests for the UI store that validate additions of Thoughts and ToolCalls and the selector that returns toolcalls linked to a thought.
  - File: `src/ui/store/__tests__/thoughts.slice.test.ts`
  - Test steps:
    1. Import the store factory (or create a fresh instance) in the test.
    2. Dispatch an `addThought({ id: 't1', text: '...'})` action.
    3. Dispatch an `addToolCall({ id: 'c1', tool:'shell', sourceThoughtId:'t1' })` action.
    4. Assert `selectToolCallsByThoughtId('t1')` returns the `c1` toolcall record.
  - Run: `pnpm test -- src/ui/store/__tests__/thoughts.slice.test.ts`.

## 2. Task Implementation
- [ ] Implement a `thoughts` slice in the global UI store and memoized selectors.
  - Files to add/modify:
    - `src/ui/store/thoughts.slice.ts`
      - Expose actions: `addThought`, `addToolCall`, `linkToolCallToThought`, `selectThoughtById`, `selectToolCallsByThoughtId`.
      - Use Zustand + immer or a simple reducer pattern already used in the project.
    - `src/ui/store/index.ts` - register the slice with the root store.
  - Behavior requirements:
    - ToolCalls stored with a `sourceThoughtId` index for O(1) lookup.
    - Provide `selectThoughtContext(thoughtId)` that returns the thought, its immediate toolcalls, and a small history buffer for rendering.

## 3. Code Review
- [ ] Verify:
  - Selectors are memoized and do not cause unnecessary component re-renders.
  - Store mutation follows project immutability conventions (immer or functional updates).
  - Tests cover edge cases (toolcall with missing sourceThoughtId, duplicate ids).

## 4. Run Automated Tests to Verify
- [ ] Execute the store unit tests: `pnpm test -- src/ui/store/__tests__/thoughts.slice.test.ts`.

## 5. Update Documentation
- [ ] Add a short reference in `docs/ui/store.md` explaining the new slice, its actions, and how components (ThoughtStreamer, ToolCallItem) should consume selectors.

## 6. Automated Verification
- [ ] Add a small integration test rendering `ThoughtStreamer` with the real store instance and asserting the DOM contains expected nodes for the thought and linked toolcall entries (snapshot test).