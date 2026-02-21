# Task: Add aria-live="polite" to ThoughtStream (Sub-Epic: 58_Thought_Connectivity)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-099]

## 1. Initial Test Written
- [ ] Add unit tests to assert the presence and behavior of the aria-live region before code changes.
  - File: `src/ui/components/__tests__/ThoughtStreamer.a11y.test.tsx`
  - Test steps:
    1. Render `<ThoughtStreamer />` with no thoughts and assert the live-region element exists and has `aria-live="polite"`.
    2. Append a mock Thought (`{ id: 't1', text: 'Hello' }`) to the store and assert that the live region's text content includes a short, human-friendly summary of the new thought (e.g., `New thought: Hello`).
    3. Use `jest.useFakeTimers()` to test that batched announcements occur if the component implements debounce.
  - Run: `pnpm test -- src/ui/components/__tests__/ThoughtStreamer.a11y.test.tsx`.

## 2. Task Implementation
- [ ] Modify `ThoughtStreamer` to include an unobtrusive, screen-reader-friendly live region.
  - File: `src/ui/components/ThoughtStreamer.tsx`
  - Implementation details:
    1. Create a visually-hidden live region element (CSS class `sr-only`) inside the component with `role="status" aria-live="polite" aria-atomic="false"`.
    2. When a new Thought is added to the store, push a succinct summary string into the live region (e.g., `New thought from Agent: "<first 120 chars>"`).
    3. Keep the live region content minimal to avoid overwhelming screen readers; only announce when new top-level thoughts are created (not every sub-log line).
    4. Respect `prefers-reduced-motion` and provide configuration to disable announcements in high-frequency streaming modes.

## 3. Code Review
- [ ] Verify:
  - The live region is not focusable and does not disrupt keyboard navigation.
  - Announcements are short, avoid raw JSON or long technical logs.
  - Announcements are debounced/throttled to prevent screen reader spam.

## 4. Run Automated Tests to Verify
- [ ] Run the a11y unit tests and the component snapshot tests:
  - `pnpm test -- src/ui/components/__tests__/ThoughtStreamer.a11y.test.tsx`

## 5. Update Documentation
- [ ] Update `docs/accessibility.md` with the ThoughtStream a11y behavior, examples of announcement copy, and a note about configuration knobs to tune announcement frequency.

## 6. Automated Verification
- [ ] Integrate `axe-core` run in CI for the component; add `npm run test:axe -- src/ui/components/ThoughtStreamer.tsx` to the PR checks to ensure no a11y regressions.