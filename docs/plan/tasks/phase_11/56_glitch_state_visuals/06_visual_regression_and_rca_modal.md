# Task: Add Visual Regression Tests and RCA Report Modal for Glitch Events (Sub-Epic: 56_Glitch_State_Visuals)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-120], [7_UI_UX_DESIGN-REQ-UI-DES-058-2]

## 1. Initial Test Written
- [ ] Create E2E tests (Playwright) at tests/e2e/glitch-rca.spec.ts that:
  - Trigger a `STATE_REWIND` sequence and verify the rewind visual appears.
  - After a simulated restore, verify the restore feedback is shown and that the "View RCA" control is present.
  - Open the RCA modal and assert expected diagnostic fields are present (timestamp, sequence id, brief trace snippet).

## 2. Task Implementation
- [ ] Implement an RCA modal component at src/components/RcaModal.tsx that accepts props: {open:boolean, trace:{steps:Array<{time:number, event:string, payload:any}>}, onClose:()=>void}.
  - The modal must be accessible (role="dialog", aria-modal="true", focus trap), theme-aware, and include a compact trace viewer (text-based with copy-to-clipboard).
  - Provide an implementation that can be invoked by StateRestoreFeedback via `rcaLink` or programmatic API.
- [ ] Add a visual-regression harness using Playwright or Puppeteer to capture baseline screenshots of: rewind visual active, state restored banner visible, and RCA modal open. Store baselines under tests/e2e/baselines/56_glitch_state_visuals/.

## 3. Code Review
- [ ] Ensure the RCA modal only exposes diagnostic data (no secrets), data is sanitized, and focus management is correct. Verify modal styling uses tokens and is keyboard navigable.

## 4. Run Automated Tests to Verify
- [ ] Run Playwright tests locally: `npx playwright test tests/e2e/glitch-rca.spec.ts` and ensure visual regression comparisons are within thresholds. For CI, ensure Playwright is configured for headless runs.

## 5. Update Documentation
- [ ] Document the RCA modal shape in docs/ui/glitch-visuals.md and add developer notes on how to populate the trace object from the orchestrator or host.

## 6. Automated Verification
- [ ] Add a CI job that runs the Playwright visual tests and fails if new snapshots exceed diffs; provide an artifact link to failed screenshots for triage.
