# Task: Implement Reusable TUI Progress Indicators (Sub-Epic: 13_TUI Progress & Status Dashboards)

## Covered Requirements
- [9_ROADMAP-REQ-UI-001], [4_USER_FEATURES-REQ-025]

## 1. Initial Test Written
- [ ] Create unit tests for the `StepProgress` and `ProgressBar` components in `@devs/cli/src/tui/components/__tests__/ProgressIndicators.test.tsx`.
- [ ] Test that the `ProgressBar` correctly renders a progress bar using block characters (e.g., `█`).
- [ ] Test the `StepProgress` component to ensure it correctly renders a sequence of steps (Completed, In-Progress, Pending).
- [ ] Verify that the `ProgressBar` correctly handles various percentages (0%, 50%, 100%).
- [ ] Test that research-specific labels (e.g., "[Scraping competitors...]") are correctly rendered when appropriate.

## 2. Task Implementation
- [ ] Implement the `ProgressBar` component in `@devs/cli/src/tui/components/ProgressBar.tsx`.
    - Support for custom widths.
    - Support for color-coding (e.g., Magenta for "Thinking," Green for "Complete").
    - Use block character `█` with a fallback character `#` for older terminals.
- [ ] Implement the `StepProgress` component in `@devs/cli/src/tui/components/StepProgress.tsx`.
    - Render a vertical or horizontal list of steps.
    - Status-based icons (e.g., Checkmark for Done, Spinner for In-Progress, Dot for Pending).
- [ ] Implement a specialized research progress component to meet [4_USER_FEATURES-REQ-025].
    - This should display the current research task name (e.g., "Scraping competitors...") alongside a `ProgressBar`.

## 3. Code Review
- [ ] Ensure that the `ProgressBar` and `StepProgress` components are highly performant and use `Static` where applicable to avoid flickering in the TUI.
- [ ] Check that Unicode fallbacks are correctly implemented for non-Unicode-compliant terminals.
- [ ] Verify that the component styles align with the "Minimalist Authority" design philosophy.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test @devs/cli/src/tui/components/__tests__/ProgressIndicators.test.tsx` and ensure all tests pass.
- [ ] Run a small integration script that simulates a multi-step research process and verify the TUI output.

## 5. Update Documentation
- [ ] Add the `ProgressBar` and `StepProgress` components to the `@devs/cli/tui` component library documentation.
- [ ] Document the use cases for these components, specifically highlighting the research progress bar implementation.

## 6. Automated Verification
- [ ] Create a script `scripts/verify_progress_tui.ts` that uses `ink-testing-library` to render the `ProgressBar` with 50% progress and validates that exactly half of the bar consists of block characters.
