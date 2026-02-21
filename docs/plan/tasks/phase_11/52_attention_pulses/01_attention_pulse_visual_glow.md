# Task: Implement Attention Pulse Visual (Glow) (Sub-Epic: 52_Attention_Pulses)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-053-1]

## 1. Initial Test Written
- [ ] Create unit tests at packages/ui/src/components/__tests__/AttentionPulse.test.tsx using Jest + React Testing Library.
  - [ ] Test: render <AttentionPulse active={true} color="var(--attention-color)" /> and assert getByTestId('attention-pulse') exists.
  - [ ] Test: when active=true the component has the CSS class "attention-pulse" and data attributes for color/intensity/duration (data-color, data-intensity, data-duration).
  - [ ] Test: inline style exposes CSS variables (e.g., style="--attention-color: ...") so assertions can verify the applied color via element.style.getPropertyValue('--attention-color').
  - [ ] Snapshot test: ensure the markup structure does not regress.
  - [ ] Reduced motion test: set prefers-reduced-motion media mocked to true and assert animation CSS class is not applied.
  - [ ] Accessibility test: component exposes role="status" and descriptive sr-only content when active; verify aria-hidden toggles correctly.

Notes: Tests must be written FIRST (fail) before implementing the component.

## 2. Task Implementation
- [ ] Implement a reusable React component at packages/ui/src/components/AttentionPulse/AttentionPulse.tsx with these specifics:
  - Props: { active: boolean; color?: string; intensity?: number; durationMs?: number; ariaLabel?: string }
  - Render minimal DOM: <div data-testid="attention-pulse" className={`attention-pulse${active? ' is-active':''}`} style={{"--attention-color": colorFallback, "--attention-intensity": intensity, "--attention-duration": `${durationMs}ms`}} role="status" aria-live="polite" aria-hidden={!active}><span className="sr-only">{ariaLabel}</span></div>
  - Use inline CSS variables (set on style attribute) so unit tests can read them reliably in JSDOM.

- [ ] Styling (packages/ui/src/components/AttentionPulse/pulses.css or integrated Tailwind layer):
  - Define CSS variable fallbacks: --attention-color: var(--vscode-focusBorder, rgba(255,183,77,0.9)); --attention-intensity: 1; --attention-duration: 2000ms;
  - .attention-pulse { pointer-events: none; position: relative; will-change: opacity, filter; }
  - .attention-pulse.is-active { animation: attention-glow var(--attention-duration) ease-in-out infinite; box-shadow: 0 0 calc(8px * var(--attention-intensity)) var(--attention-color); }
  - @keyframes attention-glow { 0% { opacity: 0.0; filter: blur(0px); } 50% { opacity: 1.0; filter: blur(6px); } 100% { opacity: 0.0; filter: blur(0px); } }
  - Respect prefers-reduced-motion: .attention-pulse.is-active { animation: none; opacity: 1; }
  - Use color-mix() if available to create a soft outer glow: box-shadow: 0 0 12px color-mix(in srgb, var(--attention-color) 40%, transparent);

- [ ] Export component from packages/ui/src/components/index.ts and update package build exports.
- [ ] Keep implementation small and testable: prefer CSS variables on the element (not global stylesheet) to make tests deterministic.

## 3. Code Review
- [ ] Confirm no hard-coded colors: all colors must come from CSS variables or VSCode design tokens with sensible fallbacks.
- [ ] Verify animations only affect opacity/filter and not layout-affecting properties (avoid animating width/height/margin).
- [ ] Ensure minimal DOM and that component is purely presentational (no side-effects). If side-effects required, move to a hook and test separately.
- [ ] Ensure prefers-reduced-motion support and proper ARIA semantics (role, aria-hidden, sr-only text).
- [ ] Confirm style rules are isolated (use Shadow DOM or scoped CSS/Tailwind layer) to avoid global bleed.

## 4. Run Automated Tests to Verify
- [ ] Run unit tests for the UI package: (adjust to repo scripts) `pnpm -w test --filter @devs/ui -- AttentionPulse` or `npm test -- packages/ui -- AttentionPulse.test.tsx`.
- [ ] Ensure snapshot tests are updated only after deliberate changes. CI must pass with these tests.

## 5. Update Documentation
- [ ] Add a documentation snippet under docs/ui/components/attention_pulse.md with:
  - Usage examples (JSX snippet with props shown)
  - Design tokens mapping (which CSS variables are used and their fallbacks)
  - Accessibility notes and reduced-motion behavior

## 6. Automated Verification
- [ ] Add a headless Storybook story for the AttentionPulse component and a Playwright visual snapshot test verifying active vs inactive states (or use Chromatic if available).
- [ ] Add a CI job (or extend existing UI test job) to capture the Storybook snapshot and fail on visual regression.
