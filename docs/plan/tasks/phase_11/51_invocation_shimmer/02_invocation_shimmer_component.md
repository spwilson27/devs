# Task: Implement InvocationShimmer React component (Sub-Epic: 51_Invocation_Shimmer)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-052-1]

## 1. Initial Test Written
- [ ] Create a failing unit test at `src/components/InvocationShimmer/__tests__/InvocationShimmer.test.tsx` that uses the project's testing utilities (Jest/Vitest + @testing-library/react). The test should:
  - Render `<InvocationShimmer active={false} />` and assert an element with `data-testid="invocation-shimmer"` exists in the DOM.
  - Render `<InvocationShimmer active={true} />` and assert the element's `style.backgroundImage` contains `linear-gradient(` or that the element has the `.invocation-shimmer` class which uses the CSS variable from task 01.
  - Snapshot both idle and active markup outputs.
  - Confirm the test fails initially.

## 2. Task Implementation
- [ ] Implement `src/components/InvocationShimmer/InvocationShimmer.tsx` as a small, accessible React component with the API:
  - Props: `{ active?: boolean; status?: 'idle' | 'active' | 'success' | 'failure'; className?: string }`.
  - Render structure:
    - `<div data-testid="invocation-shimmer" className={cx('invocation-shimmer', className, statusClass)} aria-hidden={true} role="presentation" />` where `statusClass` maps to `invocation--active`, `invocation--success`, `invocation--failure`.
    - When `active === true`, the component should expose the progress sweep element (task 03).
  - Styling:
    - Use inline `style={{ backgroundImage: `var(--invocation-shimmer-gradient)` }} ` OR set `style.backgroundImage = getInvocationShimmerGradient(theme)` using the helper from task 01.
    - Respect `prefers-reduced-motion` by disabling animations (see CSS snippet in task 01).
- [ ] Export default and named types for easy testing.

## 3. Code Review
- [ ] Verify ARIA: `aria-hidden` for decorative shimmer; role set to `presentation`.
- [ ] Verify separation of concerns: animation tokens live in `src/ui/animationTokens.ts`, CSS in `src/styles/_invocation-shimmer.css`, component is purely presentational.
- [ ] Ensure component accepts `className` and is small enough for snapshot testing.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test` and then run the new test file: `npx jest src/components/InvocationShimmer --runInBand` (or project equivalent). Confirm snapshots are created/updated only after implementation and tests pass.

## 5. Update Documentation
- [ ] Add a short usage example to `docs/components.md` or Storybook (see task 07) showing the component with `active`, `success`, and `failure` states.

## 6. Automated Verification
- [ ] `npx jest --json --outputFile=./tmp/invocation-shimmer-component.json` and assert `numFailedTests === 0` and `success === true` in the output. If the repository uses another test runner, run its equivalent and assert exit code 0.
