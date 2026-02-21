# Task: Implement PhaseStepper Component (Sub-Epic: 07_Project Dashboard Modules)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-090-4]

## 1. Initial Test Written
- [ ] Create `packages/webview-ui/src/components/dashboard/__tests__/PhaseStepper.test.tsx`.
- [ ] Define the ordered phase list used throughout the tests: `["Research", "Design", "Distill", "Implement", "Validate"]`.
- [ ] Write a unit test rendering `<PhaseStepper currentPhase="Research" />` and asserting:
  - Five step elements are rendered (one per phase), each identified by `data-phase` attribute set to the phase name.
  - The "Research" step has `aria-current="step"`.
  - All other steps do not have `aria-current`.
- [ ] Write a test for `currentPhase="Implement"` and assert:
  - Steps "Research", "Design", and "Distill" have class `step--completed`.
  - Step "Implement" has class `step--active` and `aria-current="step"`.
  - Step "Validate" has class `step--pending`.
- [ ] Write a test confirming that a connector line element (e.g., `<div className="step-connector">`) exists between each pair of adjacent steps (4 connectors for 5 steps) and that connectors before the active step have class `connector--completed`.
- [ ] Write a test passing an `onPhaseClick` callback prop and confirming that clicking a completed step's element calls `onPhaseClick` with the phase name, while clicking a pending step does not fire the callback.
- [ ] Write an accessibility test confirming the stepper root is `<nav aria-label="Project phases">` and contains an `<ol>` with each step as `<li>`.
- [ ] Confirm all tests **fail** before implementation.

## 2. Task Implementation
- [ ] Create `packages/webview-ui/src/components/dashboard/PhaseStepper.tsx`.
- [ ] Define the constant: `export const PHASES = ["Research", "Design", "Distill", "Implement", "Validate"] as const;` and the derived type `export type Phase = typeof PHASES[number];`.
- [ ] Define component props: `{ currentPhase: Phase; onPhaseClick?: (phase: Phase) => void; className?: string }`.
- [ ] Compute `currentIndex = PHASES.indexOf(currentPhase)`.
- [ ] Render `<nav aria-label="Project phases"><ol className="phase-stepper">` containing one `<li>` per phase.
- [ ] For each phase at index `i`:
  - Determine status: `i < currentIndex` → `"completed"`, `i === currentIndex` → `"active"`, `i > currentIndex` → `"pending"`.
  - Render `<li className={"step step--" + status} data-phase={phase} aria-current={status === "active" ? "step" : undefined}>`.
  - Inside the `<li>`: a step circle `<span className="step-circle">` containing a checkmark icon (SVG) for completed, the 1-based index number for pending/active, and the phase label `<span className="step-label">{phase}</span>`.
  - Attach `onClick={() => onPhaseClick?.(phase)}` only when `status === "completed"` and `onPhaseClick` is defined; set `role="button" tabIndex={0}` on the completed step circle for keyboard accessibility.
- [ ] Between each adjacent `<li>` pair, render `<li aria-hidden="true" className={"step-connector" + (i < currentIndex ? " connector--completed" : "")} />`.
- [ ] Create `packages/webview-ui/src/hooks/useCurrentPhase.ts`. This hook subscribes to `phase:transition` events on the RTES `EventBus` and returns the current `Phase` string. Initialize from the last stored value in the VS Code `ExtensionState` (via the existing `vscode.postMessage` bridge) if available, defaulting to `"Research"`.
- [ ] Export `PhaseStepper` and `PHASES` from `packages/webview-ui/src/components/dashboard/index.ts`.

## 3. Code Review
- [ ] Verify that `PHASES` is a `readonly` tuple const so TypeScript catches invalid phase strings at compile time.
- [ ] Confirm the `onPhaseClick` handler is only attached (and `role="button"` applied) to completed steps; active and pending steps must not be interactive to prevent users from jumping to unstarted phases.
- [ ] Verify that the connector `<li>` elements have `aria-hidden="true"` so screen readers announce only the 5 meaningful steps.
- [ ] Confirm the component is pure and stateless — it accepts `currentPhase` as a prop and does not subscribe to `EventBus` directly; subscription is delegated to `useCurrentPhase`.
- [ ] Verify keyboard navigation: completed step circles with `role="button"` must handle `onKeyDown` for `Enter` and `Space` keys in addition to `onClick`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern=PhaseStepper` and confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --coverage --testPathPattern=PhaseStepper` and confirm line coverage ≥ 90% for `PhaseStepper.tsx` and `useCurrentPhase.ts`.

## 5. Update Documentation
- [ ] Add a JSDoc block to `PhaseStepper.tsx` documenting the `PHASES` constant, the `Phase` type, step status derivation logic, and the interactivity constraint (completed-only click).
- [ ] Add a `## PhaseStepper` section to `docs/ui-components.md` with: purpose, prop table, phase lifecycle diagram (Mermaid state diagram: Research → Design → Distill → Implement → Validate), and accessibility notes.
- [ ] Update `memory/phase_12_decisions.md`: `PhaseStepper is stateless; PHASES const drives type safety; only completed steps are clickable; useCurrentPhase hook owns EventBus subscription`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test -- --ci --forceExit --testPathPattern=PhaseStepper` and assert exit code is `0`.
- [ ] Run `pnpm --filter @devs/webview-ui build` and assert exit code is `0`.
