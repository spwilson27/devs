# Task: Icon Action Trigger — E2E & CI (Sub-Epic: 40_Icon_Status_Actions)

## Covered Requirements

- [7_UI_UX_DESIGN-REQ-UI-DES-064-6]

## 1. End-to-End Tests (TDD)

- [ ] Create Playwright/Cypress e2e tests at `e2e/specs/icon-action.e2e.spec.ts` capturing realistic user flows:
  - Flow A: Remove tag via icon action and assert DOM update and focus returned to next interactive element.
  - Flow B: Use icon action to trigger inline edit and assert correct behavior.
  - Flow C: Disabled icon action does not respond to click or keyboard events.

## 2. CI Pipeline

- [ ] Add/Update CI job in `.github/workflows/e2e.yml` or `ci/` scripts to run e2e tests for PRs that touch `packages/ui` or `packages/app`.
  - Steps: `checkout`, `install`, `build`, `start app`, `run e2e`.

## 3. Automated Verification

- [ ] Ensure `scripts/verify:icon-actions` and `scripts/verify-icon-status` are run in CI and fail the job on violations.

## 4. Monitoring & Rollout

- [ ] After merge, monitor error/UX telemetry for icon actions for 48 hours to detect regressions in interactive flows (document where to check telemetry in `docs/ops.md`).

## 5. Acceptance Criteria

- [ ] E2E tests pass and CI enforces accessibility and verification scripts; interactive icon flows are stable and accessible.
