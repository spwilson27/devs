# Task: Implement TaskCard component with elevated shadow states (Sub-Epic: 42_Shadow_Task_Cards)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-047-3], [7_UI_UX_DESIGN-REQ-UI-DES-047-3-1], [7_UI_UX_DESIGN-REQ-UI-DES-047-3-2]

## 1. Initial Test Written
- [ ] Add React Testing Library unit tests at `packages/ui/src/components/TaskCard/__tests__/TaskCard.test.tsx` that:
  - Render `<TaskCard title="X" />` and assert it does NOT include elevated shadow class by default.
  - Render `<TaskCard title="X" elevated />` (or `elevation="md"`) and assert the component renders with the `devs-md` box-shadow utility/class or `style` using `var(--devs-shadow-md)`.
  - Snapshot the rendered output for both states.

## 2. Task Implementation
- [ ] Implement `packages/ui/src/components/TaskCard/TaskCard.tsx` (and `.tsx` types) with the following specifics:
  - Props: `{ title: string; children?: ReactNode; elevation?: 'none' | 'sm' | 'md'; role?: string }`.
  - Default: `elevation='none'`.
  - The component should apply `className` conditional on elevation: `devs-sm` maps to shadow-sm token, `devs-md` maps to shadow-md token.
  - Ensure markup uses semantic container (e.g., `<article role={role||'article'} aria-labelledby="taskcard-title">`) and includes a visible title element with id `taskcard-title`.
  - Add storybook story or Story file demonstrating the three elevations.

## 3. Code Review
- [ ] Verify the component follows project component patterns (functional component written in TypeScript), Prop types are strict, CSS class composition uses the design token utilities (no inline magic strings), and unit tests cover both non-elevated and elevated states. Confirm accessibility: the title is labelled and keyboard focus outline is preserved.

## 4. Run Automated Tests to Verify
- [ ] Run the UI package tests and storybook build if available. Confirm `TaskCard` tests pass and snapshots match. Example commands: `npm test --workspace=@devs/ui` (or repo equivalent) and `npm run build:storybook` if Storybook is configured.

## 5. Update Documentation
- [ ] Add component documentation at `packages/ui/src/components/TaskCard/README.md` describing the elevation prop, examples for `elevation='sm'` and `elevation='md'`, and include references to the requirement IDs.

## 6. Automated Verification
- [ ] Add an integration test in `packages/ui/e2e/active-task-card.spec.ts` (Playwright / Puppeteer / Cypress depending on repo tooling) that mounts the component in a browser-like environment and asserts the computed `box-shadow` CSS matches the token values for the elevated state.
