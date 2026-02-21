# Task: Implement The Distillation Sweep Animation – Phase 2 to 3 Transition (Sub-Epic: 12_Animation System and UX Feedback)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-057], [7_UI_UX_DESIGN-REQ-UI-DES-057-1], [7_UI_UX_DESIGN-REQ-UI-DES-057-2], [7_UI_UX_DESIGN-REQ-UI-DES-057-3]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/components/DistillationSweep/__tests__/DistillationSweep.test.tsx`, write Vitest + React Testing Library tests:
  - Test: `DistillationSweep` renders `null` when `requirements` prop is empty (`[]`).
  - Test: `DistillationSweep` renders one particle element per requirement in the `requirements` array when active.
  - Test: Each particle element has `data-req-id` attribute matching its requirement's ID.
  - Test: Each particle element has the CSS class `distillation-particle`.
  - Test: The first particle element has `animation-delay: 0ms`, the second has `animation-delay: 50ms`, the third has `animation-delay: 100ms` (verifies the 50ms stagger).
  - Test: Using fake timers, after `800ms + (requirements.length - 1) * 50ms` total, `onSweepComplete` callback prop is invoked.
  - Test: Snapshot test for a sweep with 3 requirements.
- [ ] In `packages/webview-ui/src/components/DistillationSweep/__tests__/RequirementBadge.test.tsx`:
  - Test: `RequirementBadge` renders the requirement ID as text.
  - Test: `RequirementBadge` has CSS class `requirement-badge`.
  - Test: `RequirementBadge` has `role="status"` and `aria-label` set to the requirement ID for accessibility.
- [ ] In `packages/webview-ui/src/hooks/__tests__/useDistillationSweep.test.ts`:
  - Mock `EventBus` from `@devs/core`.
  - Test: Hook returns `{ isSweeping: false, requirements: [] }` initially.
  - Test: On `DISTILLATION:STARTED` event with payload `{ requirements: ['REQ-001', 'REQ-002'] }`, hook returns `{ isSweeping: true, requirements: ['REQ-001', 'REQ-002'] }`.
  - Test: On `DISTILLATION:COMPLETED` event, hook returns `{ isSweeping: false, requirements: [] }`.
  - Test: Hook unsubscribes on unmount.

## 2. Task Implementation
- [ ] **CSS Keyframes** – In `packages/webview-ui/src/styles/animations.css`, add:
  ```css
  /* Distillation Sweep – particle flies from document source to roadmap target */
  @keyframes distillation-fly {
    0% {
      transform: translate(var(--sweep-origin-x, 0px), var(--sweep-origin-y, 0px)) scale(1);
      opacity: 1;
    }
    60% {
      opacity: 1;
      transform: translate(
        calc(var(--sweep-origin-x, 0px) * 0.1 + var(--sweep-target-x, 0px) * 0.9),
        calc(var(--sweep-origin-y, 0px) * 0.1 + var(--sweep-target-y, 0px) * 0.9)
      ) scale(0.6);
    }
    100% {
      transform: translate(var(--sweep-target-x, 0px), var(--sweep-target-y, 0px)) scale(0);
      opacity: 0;
    }
  }

  .distillation-particle {
    position: fixed;
    pointer-events: none;
    z-index: 9999;
    animation: distillation-fly 800ms ease-in-out forwards;
    will-change: transform, opacity;
  }

  .requirement-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 12px;
    background: var(--devs-primary-faint, rgba(99,102,241,0.15));
    border: 1px solid var(--devs-primary);
    color: var(--devs-primary);
    font-size: 11px;
    font-family: var(--devs-mono, monospace);
    white-space: nowrap;
  }
  ```
- [ ] **`RequirementBadge` Component** – Create `packages/webview-ui/src/components/DistillationSweep/RequirementBadge.tsx`:
  - Accept `{ reqId: string }` props.
  - Render: `<span className="requirement-badge" role="status" aria-label={reqId}>{reqId}</span>`.
- [ ] **`DistillationParticle` Component** – Create `packages/webview-ui/src/components/DistillationSweep/DistillationParticle.tsx`:
  - Accept props: `{ reqId: string; originRect: DOMRect; targetRect: DOMRect; delay: number }`.
  - Compute `--sweep-origin-x`, `--sweep-origin-y`, `--sweep-target-x`, `--sweep-target-y` as CSS custom properties relative to the viewport using `originRect` and `targetRect`.
  - Render a `<div>` positioned at the origin coordinates (via `style.left`, `style.top`) with class `distillation-particle` and `animation-delay: ${delay}ms`.
  - Render a `<RequirementBadge reqId={reqId} />` inside it.
  - Include `data-req-id={reqId}` attribute for testability.
- [ ] **`DistillationSweep` Component** – Create `packages/webview-ui/src/components/DistillationSweep/DistillationSweep.tsx`:
  - Accept props: `{ requirements: string[]; sourceRef: React.RefObject<HTMLElement>; targetRef: React.RefObject<HTMLElement>; onSweepComplete: () => void }`.
  - On mount (or when `requirements` changes to non-empty):
    1. Read `sourceRef.current.getBoundingClientRect()` for origin.
    2. Read `targetRef.current.getBoundingClientRect()` for target.
    3. Render one `<DistillationParticle>` per requirement with `delay = index * 50`.
    4. Schedule `onSweepComplete` after `800 + (requirements.length - 1) * 50` ms using `setTimeout`.
  - Render `null` when `requirements` is empty.
  - Store the timeout ref in `useRef` and clear it on unmount.
- [ ] **`useDistillationSweep` Hook** – Create `packages/webview-ui/src/hooks/useDistillationSweep.ts`:
  - Subscribe to `DISTILLATION:STARTED` event with payload `{ requirements: string[] }` → set `isSweeping = true`, store `requirements`.
  - Subscribe to `DISTILLATION:COMPLETED` event → set `isSweeping = false`, clear `requirements`.
  - Return `{ isSweeping: boolean; requirements: string[] }`.
  - Unsubscribe on cleanup.
- [ ] **Wire into Phase Transition View** – In the Phase 2→3 transition screen component (e.g., `packages/webview-ui/src/views/DistillationView.tsx`):
  - Call `useDistillationSweep()`.
  - Maintain `ref` for the source document preview element and the target roadmap list element.
  - Render `<DistillationSweep requirements={requirements} sourceRef={...} targetRef={...} onSweepComplete={...} />` when `isSweeping` is `true`.

## 3. Code Review
- [ ] Confirm each particle has an `animation-delay` increment of exactly `50ms` per requirement index (Waterfall effect per REQ-057-3).
- [ ] Confirm the total animation for a single particle is `800ms` (per REQ-057-3), and the last particle completes at `800 + (n-1) * 50` ms.
- [ ] Verify particles use `position: fixed` and `pointer-events: none` so they overlay the UI without blocking interaction.
- [ ] Confirm the animation transforms simulate requirements "flying" from the document preview to the roadmap list (origin → target trajectory).
- [ ] Confirm `will-change: transform, opacity` is set on `.distillation-particle` for GPU compositing performance.
- [ ] Verify `onSweepComplete` is called exactly once per sweep, not once per particle.
- [ ] Ensure `getBoundingClientRect()` is called at render time (not stale) so the coordinates reflect the current layout.
- [ ] Confirm `RequirementBadge` has `role="status"` and correct `aria-label` for screen reader accessibility.
- [ ] Verify the `z-index: 9999` on particles is consistent with the project's z-index layering strategy (check `styles/z-index.css` or equivalent).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test -- --run DistillationSweep` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --run RequirementBadge` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --run useDistillationSweep` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --run` and confirm no regressions.

## 5. Update Documentation
- [ ] Add a section `### Distillation Sweep Animation` to `packages/webview-ui/docs/animations.md` documenting:
  - Triggering event: `DISTILLATION:STARTED` with `{ requirements: string[] }` payload.
  - Completion event: `DISTILLATION:COMPLETED`.
  - Animation parameters: 800ms per particle, 50ms stagger, Waterfall pattern.
  - Components involved: `DistillationSweep`, `DistillationParticle`, `RequirementBadge`.
  - CSS custom properties used for dynamic origin/target coordinates: `--sweep-origin-x/y`, `--sweep-target-x/y`.
  - Performance note: `will-change: transform, opacity` and `position: fixed` with `pointer-events: none`.
- [ ] Update `CHANGELOG.md` with: `feat: add Distillation Sweep particle animation for Phase 2 to Phase 3 transition`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test -- --run --reporter=json > /tmp/distillation_sweep_results.json` and verify exit code `0`.
- [ ] Assert `"numFailedTests": 0` via `node -e "const r=require('/tmp/distillation_sweep_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"`.
- [ ] Run `pnpm --filter @devs/webview-ui build` and confirm exit code `0`.
