# Task: Implement State Restored Feedback UI (Sub-Epic: 56_Glitch_State_Visuals)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-058-2], [7_UI_UX_DESIGN-REQ-UI-DES-120]

## 1. Initial Test Written
- [ ] Write unit tests at tests/components/StateRestoreFeedback.test.tsx that assert:
  - The component renders a visible feedback banner or toast when provided a `visible` prop.
  - The component emits an ARIA announcement via `role="status"` and `aria-live="polite"` with the message `"State restored"` (or localized equivalent) when visible becomes true.
  - The feedback auto-dismisses after the configured token duration and calls an optional `onDismiss` callback.

## 2. Task Implementation
- [ ] Implement src/components/StateRestoreFeedback.tsx (or Banner) with:
  - Semantic markup: role="status", aria-live="polite", a visible label and optional close button with aria-label.
  - Visual treatment that pairs with the rewind glitch visual (e.g., short scanline + check mark + brief text) using the tokens from src/ui/glitchTokens.css.
  - A prop API: {visible:boolean; message?:string; durationMs?:number; onDismiss?:()=>void; rcaLink?:string}.
  - If an `rcaLink` is provided, the component exposes a button "View RCA" that opens the RCA modal (see task for RCA modal). The component must not block keyboard focus.

## 3. Code Review
- [ ] Verify accessibility: focus management, screen reader announcement, dismissal semantics, and keyboard operability. Verify no long-running JS timers that block the main thread.
- [ ] Confirm visual contrast meets WCAG 2.1 AA for the message text and interactive controls.

## 4. Run Automated Tests to Verify
- [ ] Run the unit tests and an axe-based accessibility test (jest-axe) to assert no violations for the rendered component.

## 5. Update Documentation
- [ ] Document the component API in docs/ui/glitch-visuals.md and include usage examples for both simple and RCA-linked cases.

## 6. Automated Verification
- [ ] Create an integration test `tests/integration/state-restore.integration.ts` that simulates a restore event, asserts the banner appears, waits for auto-dismiss, and validates the aria-live announcement was emitted (via DOM assertions or browser automation).