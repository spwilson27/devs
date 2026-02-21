# Task: Implement Card component styles and apply design tokens (Sub-Epic: 41_Container_Radius_Shadow)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-047]

## 1. Initial Test Written
- [ ] Create a component unit test at tests/ui/Card.spec.tsx using React Testing Library and the project's test runner (jest/vitest). The test MUST:
  - Render the <Card> component with default props.
  - Assert that the rendered element either contains the utility class names (e.g. 'rounded-card' and 'border-card') OR that computed styles include border-radius: 4px and border-width: 1px (use getComputedStyle in a headless browser test if available).
  - Render <Card elevation="md"> and assert the shadow utility/class for the md variant is applied.

Write this test first and ensure it fails before implementing the component changes.

## 2. Task Implementation
- [ ] Implement or update src/ui/components/Card.tsx (or equivalent) to:
  - Export a Card component that applies token-driven styles: either className="rounded-card border border-card shadow-card-sm" or style={{ borderRadius: 'var(--devs-radius-card)', borderWidth: 'var(--devs-border-card)', boxShadow: 'var(--devs-shadow-sm)' }}.
  - Support an 'elevation' prop: 'sm' | 'md' which selects the correct shadow token (sm -> var(--devs-shadow-sm), md -> var(--devs-shadow-md)).
  - Ensure padding is configurable via props but defaults to the project's standard card padding.
- [ ] Add or update TypeScript types and export from package entry points if applicable.
- [ ] Add Storybook story (if project uses Storybook) to visually demonstrate both elevation variants and confirm token usage.

## 3. Code Review
- [ ] Reviewer checklist:
  - Component consumes tokens instead of hard-coded values.
  - Props are well-typed and documented.
  - Snapshot/unit tests exist for default, sm, and md variants.
  - No global CSS leakage; styles are scoped to the component or use class-based utilities.

## 4. Run Automated Tests to Verify
- [ ] Run npm test tests/ui/Card.spec.tsx and ensure tests pass after implementation.
- [ ] Run lint and type checks: npm run lint && npm run typecheck (adjust commands to repo scripts).

## 5. Update Documentation
- [ ] Update docs/ui/components.md or docs/ui/card.md with the Card API, examples of usage with Tailwind utilities and CSS variables, and a short migration note for other components to adopt tokens.

## 6. Automated Verification
- [ ] Add a tiny Playwright/Puppeteer script scripts/verify-card-render.js that mounts the Card in a headless browser, measures computed style (borderRadius and boxShadow), and fails CI if values differ from the token definitions.
