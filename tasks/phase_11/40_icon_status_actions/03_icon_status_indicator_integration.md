# Task: Icon Status Indicator — Integration (Sub-Epic: 40_Icon_Status_Actions)

## Covered Requirements

- [7_UI_UX_DESIGN-REQ-UI-DES-064-5]

## 1. Integration Tests (TDD)

- [ ] Create integration test: `e2e/specs/icon-status.integration.spec.ts` (Playwright or Cypress) that mounts a representative UI (e.g., notification list) and asserts status indicators render next to list items:
  - Scenario A: Render a `NotificationItem` list where each item passes `status` to `<Icon />`; assert each item's icon contains `data-icon-status` with expected value.
  - Scenario B: Verify dynamic updates: updating item state from `pending` -> `success` updates the icon's `data-icon-status` attribute.

## 2. Implementation Changes

- [ ] Ensure component `packages/ui/src/components/Icon/Icon.tsx` exposes `status` prop and does not break existing usages.
- [ ] Update consumer components where appropriate: `packages/app/src/components/NotificationItem.tsx` (or exact consumer path) to pass `status` to Icon where relevant.

## 3. Run Integration Tests

- [ ] Run `pnpm e2e` or `yarn e2e` depending on repo tooling; if no e2e runner exists, add `e2e` script and Playwright/Cypress config in `e2e/`.

## 4. Observability

- [ ] Add a Storybook story showing `NotificationItem` with dynamic status updates: `packages/ui/stories/Icon/StatusInList.stories.tsx`.

## 5. Acceptance Criteria

- [ ] Icon status indicators appear in all listed contexts and update reactively; integration tests must pass in CI.
