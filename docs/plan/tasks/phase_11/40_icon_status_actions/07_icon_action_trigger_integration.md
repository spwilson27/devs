# Task: Icon Action Trigger — Integration (Sub-Epic: 40_Icon_Status_Actions)

## Covered Requirements

- [7_UI_UX_DESIGN-REQ-UI-DES-064-6]

## 1. Integration / Consumer Tests (TDD)

- [ ] Add integration scenarios where icons are interactive in consumer flows, e.g.:
  - `packages/app/src/components/TagChip.tsx` (or exact consumer path) renders an `<Icon onClick={removeTag} actionLabel="Remove tag" />`; create an integration test `e2e/specs/icon-action.integration.spec.ts` that asserts tag removal on click and keyboard activation.
  - Scenario: Modal close via icon action in `packages/app/src/components/ModalHeader.tsx` — ensure focus management after close.

## 2. Implementation Guidance

- [ ] Ensure consumer components pass `actionLabel` and `disabled` correctly to Icon and handle focus management when the action removes DOM nodes.

## 3. Run Integration Tests

- [ ] Run `pnpm e2e` (or `yarn e2e`) and assert integration scenarios pass.

## 4. Observability and Docs

- [ ] Add Storybook stories for consumer examples: `packages/ui/stories/Icon/ActionInContext.stories.tsx` and update `docs/ui/icons.md` with guidance for consumers about focus management and removal semantics.

## 5. Acceptance Criteria

- [ ] All integration tests pass in CI and user flows using interactive icons behave correctly under keyboard and assistive technology use.
