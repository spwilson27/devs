# Task: Disable Distillation Sweep Particle Effects in Reduced Motion (Sub-Epic: 91_Reduced_Motion_Transitions)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-085-3]

## 1. Initial Test Written

- [ ] In `packages/webview-ui/src/components/distillation/__tests__/DistillationSweep.test.tsx`, write tests using `@testing-library/react` and `jest`:
  - **Test 1 – particles rendered in normal motion:** Mock `useReducedMotion` (from `@devs/webview-ui/hooks`) to return `false`. Render `<DistillationSweep isActive={true} />`. Assert that the DOM contains particle elements (e.g., elements with `data-testid="distillation-particle"` or `class="distillation-particle"`). Assert that the sweep container has a non-zero `animation-duration` style (or the CSS class that triggers the fly animation is present).
  - **Test 2 – particles suppressed in reduced motion:** Mock `useReducedMotion` to return `true`. Render `<DistillationSweep isActive={true} />`. Assert that **zero** elements with `data-testid="distillation-particle"` are rendered (particles are conditionally excluded from the React tree). Assert that no element with a sweep/fly animation class is present.
  - **Test 3 – static indicator shown in reduced motion:** With `useReducedMotion` returning `true` and `isActive={true}`, assert that a static status element (e.g., `data-testid="distillation-status-indicator"`) is rendered with a visible active class (e.g., `class` contains `distillation-active`).
  - **Test 4 – static indicator absent when idle in reduced motion:** With `useReducedMotion` returning `true` and `isActive={false}`, assert that the static indicator does not have the active class.
  - **Test 5 – snapshot regression:** Render the component with `useReducedMotion` returning `true` and confirm the snapshot matches the stored reduced-motion snapshot (no particle nodes in tree).
- [ ] In `packages/webview-ui/src/styles/__tests__/distillationSweep.css.test.ts`, verify via jsdom:
  - Assert that `.distillation-sweep-container` has `animation: none !important` when the `@media (prefers-reduced-motion: reduce)` rule is active.
  - Assert that `.distillation-particle` has `display: none` or `visibility: hidden` in reduced motion mode.

## 2. Task Implementation

- [ ] Locate the existing `DistillationSweep` component (expected path: `packages/webview-ui/src/components/distillation/DistillationSweep.tsx`). If not yet created, scaffold it as part of this task.
- [ ] Import `useReducedMotion` from `../../hooks/useReducedMotion`.
- [ ] Refactor `DistillationSweep.tsx` to branch on `reducedMotion`:
  ```tsx
  import { useReducedMotion } from '../../hooks/useReducedMotion';

  interface DistillationSweepProps {
    isActive: boolean;
    particleCount?: number; // defaults to 12
  }

  export const DistillationSweep: React.FC<DistillationSweepProps> = ({
    isActive,
    particleCount = 12,
  }) => {
    const reducedMotion = useReducedMotion();

    if (reducedMotion) {
      return (
        <div
          className={`distillation-status-indicator ${isActive ? 'distillation-active' : ''}`}
          data-testid="distillation-status-indicator"
          aria-label={isActive ? 'Distillation in progress' : 'Distillation idle'}
          role="status"
        />
      );
    }

    return (
      <div className="distillation-sweep-container" aria-hidden="true">
        {isActive &&
          Array.from({ length: particleCount }).map((_, i) => (
            <span
              key={i}
              className="distillation-particle"
              data-testid="distillation-particle"
              style={{ '--particle-index': i } as React.CSSProperties}
            />
          ))}
      </div>
    );
  };
  ```
- [ ] In `packages/webview-ui/src/styles/distillationSweep.css`, add reduced-motion CSS guard rules:
  ```css
  .distillation-sweep-container {
    /* existing fly/particle animation styles */
  }

  .distillation-particle {
    /* existing particle keyframe styles */
  }

  /* Static indicator for reduced motion */
  .distillation-status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--vscode-charts-lines);
    transition: background-color var(--devs-transition-duration) ease;
  }
  .distillation-status-indicator.distillation-active {
    background-color: var(--vscode-charts-green);
  }

  @media (prefers-reduced-motion: reduce) {
    .distillation-sweep-container {
      animation: none !important;
    }
    .distillation-particle {
      display: none !important;
    }
  }
  ```
- [ ] Ensure the ARIA attributes on the static indicator (`role="status"`, `aria-label`) announce distillation state to screen readers since the visual animation is removed.
- [ ] Update all parent components or views that render `DistillationSweep` to ensure the `isActive` prop is correctly wired to Phase 3 distillation pipeline state (from Zustand store).

## 3. Code Review

- [ ] Confirm that the particle rendering code path (`Array.from({ length: particleCount })`) is **entirely absent** from the React tree when `reducedMotion` is `true` — not just hidden via CSS. The exclusion must be at the React level to eliminate layout thrash.
- [ ] Confirm the static indicator uses only VSCode design tokens (`--vscode-*`) for color — no hardcoded hex values.
- [ ] Verify the `aria-label` on the status indicator updates reactively when `isActive` changes.
- [ ] Confirm no `transform: translateY` or `@keyframes` references remain on any element rendered in reduced-motion mode.
- [ ] Check that `distillationSweep.css` imports are scoped properly (no global class name collisions with Tailwind utilities).

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="DistillationSweep"` and confirm all 5 tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui test` (full suite) and confirm zero regressions.
- [ ] Run `pnpm --filter @devs/webview-ui build` and confirm no TypeScript compilation errors.

## 5. Update Documentation

- [ ] Create `packages/webview-ui/src/components/distillation/DistillationSweep.agent.md`:
  - **Component purpose:** Renders the Phase 3 "Distillation Sweep" particle animation when `isActive` is true.
  - **Reduced motion behavior:** When `prefers-reduced-motion: reduce` is detected via `useReducedMotion()`, the entire particle tree is replaced with a single 8px circular status dot using `--vscode-charts-green` for the active state and `--vscode-charts-lines` for idle.
  - **Props:** `isActive: boolean` (required), `particleCount?: number` (default 12, only used in full-motion mode).
  - **ARIA:** The static indicator has `role="status"` and a live `aria-label` for screen readers.
- [ ] Update `packages/webview-ui/ARCHITECTURE.md` to note that all particle/sweep effects must guard their rendering on `useReducedMotion()`.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/webview-ui test -- --coverage --testPathPattern="DistillationSweep"` and assert **100% branch coverage** on `DistillationSweep.tsx` (both `reducedMotion === true` and `reducedMotion === false` branches covered).
- [ ] Run `grep -n "distillation-particle" packages/webview-ui/src/components/distillation/DistillationSweep.tsx` and confirm it only appears inside the `!reducedMotion` branch.
- [ ] Run `grep -n "animation: none" packages/webview-ui/src/styles/distillationSweep.css` and confirm the `@media (prefers-reduced-motion: reduce)` guard block is present.
