# Task: Implement Thought Pulse Visual Styles (Sub-Epic: 50_Thought_Pulse_Logic)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-051-1], [7_UI_UX_DESIGN-REQ-UI-DES-120-1]

## 1. Initial Test Written
- [ ] Add a unit test file at `src/ui/components/__tests__/ThoughtPulse.visual.test.tsx` using Jest + React Testing Library + @testing-library/jest-dom.
  - Render `<ThoughtPulse active data-testid="thought-pulse" />` and assert the element exists.
  - Assert the element has an inline CSS variable or style reflecting pulse opacity (e.g., expect(getByTestId('thought-pulse')).toHaveStyle('--thought-pulse-opacity: 0.5')).
  - Assert the active state maps to a theme-aware color variable: set a CSS variable on the document container in the test (`container.style.setProperty('--devs-thought-pulse-active-color', 'rgb(255,0,0)')`) and assert the pulse element uses that variable via `toHaveStyle` or `getComputedStyle`.
  - Add a snapshot of the rendered markup to detect unexpected structure changes.

## 2. Task Implementation
- [ ] Create `src/ui/components/ThoughtPulse.tsx` (TypeScript React functional component):
  - Props: `active?: boolean`, `neutral?: boolean`, `durationMs?: number`, `opacity?: number`, `colorVar?: string`.
  - Default props: `durationMs = 2000`, `opacity = 0.5`, `colorVar = 'var(--devs-thought-pulse-active-color, var(--vscode-editor-foreground))'`.
  - Render a single wrapper element with `data-testid="thought-pulse"` and apply an inline `style` that sets CSS variables `--thought-pulse-opacity`, `--thought-pulse-duration`, and `--thought-pulse-color` from props.
  - Use a CSS module or Tailwind layer (e.g., `src/ui/components/ThoughtPulse.module.css` or `@layer components { .thought-pulse { ... } }`) to define keyframes `@keyframes thoughtPulse` that animate opacity using `var(--thought-pulse-opacity)` and use `animation-duration: var(--thought-pulse-duration)`.
  - Ensure the component does not hard-code colors; it must reference `--thought-pulse-color` which falls back to the theme variable for active pulses (satisfies 7_UI_UX_DESIGN-REQ-UI-DES-120-1: active thought pulse red can be injected via theme tokens during integration).
  - Export component from `src/ui/components/index.ts`.

## 3. Code Review
- [ ] Verify the implementation adheres to these rules:
  - No hard-coded color values in the component code; color must come from CSS variables or props.
  - CSS variables are namespaced (`--thought-pulse-*`) and documented in the component file header.
  - Component is a pure functional component with explicit TypeScript types and no side-effects during render.
  - Tests exercise both structure (snapshot) and style (CSS variable presence/value).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test -- --testPathPattern=ThoughtPulse.visual.test.tsx` (or `npm test -- --testPathPattern=ThoughtPulse.visual.test.tsx`) and confirm the test file passes.

## 5. Update Documentation
- [ ] Add or update `docs/ui/thought_pulse.md` describing the design tokens and CSS variables introduced:
  - Document `--thought-pulse-opacity`, `--thought-pulse-duration`, `--thought-pulse-color` and how to override the active color to satisfy the active-red requirement.

## 6. Automated Verification
- [ ] As a verification step run: `pnpm test -- --testPathPattern=ThoughtPulse.visual.test.tsx && node -e "console.log('verify:done')"` and assert a zero exit code; CI should also run the same command. Ensure snapshot changes are intentional and committed.
