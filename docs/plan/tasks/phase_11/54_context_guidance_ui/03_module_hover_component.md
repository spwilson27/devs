# Task: Implement ModuleHover React component (Sub-Epic: 54_Context_Guidance_UI)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-130], [7_UI_UX_DESIGN-REQ-UI-DES-130-1]

## 1. Initial Test Written
- [ ] Write failing component tests at `packages/webview/src/components/ModuleHover/__tests__/ModuleHover.test.tsx` using `@testing-library/react` + `vitest`:
  - Render `ModuleHover` with a mocked summary `{ intent, hooks, testStrategy }` and assert that the DOM contains labeled sections: "Intent", "Hooks" (rendered as list), and "Test Strategy".
  - Accessibility: assert the component has `role="tooltip"` or `role="dialog"` as appropriate, contains `aria-live="polite"` for non-interrupting updates, and is reachable via keyboard focus (tab/focus) in tests.
  - Snapshot: create a snapshot test ensuring markup stability.

## 2. Task Implementation
- [ ] Implement `ModuleHover` at `packages/webview/src/components/ModuleHover/ModuleHover.tsx`:
  - Props: `{ summary: { intent: string; hooks: string[]; testStrategy: string }; visible: boolean; anchorRect?: DOMRect }`.
  - Render a visually compact summary card with three labeled sections. Use Tailwind utility classes and theme tokens (`--vscode-*`) rather than hardcoded colors.
  - Support theme-awareness (light/dark/HC) and reduced-motion using `prefers-reduced-motion` media query.
  - Use `role="tooltip"` when anchored to an element and `aria-live="polite"` for content updates; ensure focus management when interactive content is present.
  - Memoize rendering via `React.memo` and avoid re-renders when `summary` object identity is stable (shallow compare hooks array length/content).

## 3. Code Review
- [ ] Verify the component is small, uses theme tokens, is accessible (roles/aria), is keyboard navigable if interactive, has no hardcoded colors, and includes unit tests and a snapshot.

## 4. Run Automated Tests to Verify
- [ ] Run: `npx vitest packages/webview/src/components/ModuleHover/__tests__/ModuleHover.test.tsx` and ensure tests and snapshots pass.

## 5. Update Documentation
- [ ] Add a short story in the webview README (or Storybook if present) demonstrating `ModuleHover` usage and expected props. Include a small screenshot or markup example in the docs.

## 6. Automated Verification
- [ ] Add an accessibility check in CI for the component tests using `jest-axe` or `axe-core` integration; include a script `scripts/verify-module-hover-a11y.js` that runs the test and reports violations (exit non-zero on critical issues).
