# Task: DistillationSweep React component + snapshot tests (Sub-Epic: 55_Distillation_Particles)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-057-1], [7_UI_UX_DESIGN-REQ-UI-DES-057-2]

## 1. Initial Test Written
- [ ] Create tests at tests/ui/distillation/DistillationSweep.test.tsx that (a) shallow render the DistillationSweep component and assert it renders expected root element (<svg> or <canvas>) with role="img" and aria-hidden toggled when active vs idle; (b) mock the particleEngine module to assert that when active it calls createParticles with correct args; (c) snapshot the initial render and the active render; (d) use fake timers to assert that sweep completes and component invokes onComplete callback after sweepDurationMs.

## 2. Task Implementation
- [ ] Implement src/ui/distillation/DistillationSweep.tsx as a React component that accepts props {origin, target, active, onComplete, density?, duration?}, reads defaults from src/ui/distillation/spec (or CSS vars), uses the particleEngine to generate and step particles on requestAnimationFrame, and renders to a Canvas or SVG layer. Implement a small hook useAnimationFrame for stepping and cleanup and allow injection of a particleEngine implementation for testability and worker fallback.

## 3. Code Review
- [ ] Verify use of React hooks is correct (no memory leaks), the component is accessible (aria attributes, role), props are well-typed, and heavy work is batched or offloaded. Ensure the component exposes a small public API and is documented for reuse.

## 4. Run Automated Tests to Verify
- [ ] Run the snapshot and unit tests for DistillationSweep and ensure they pass; iterate until TDD-green. Use the test runner's watch mode locally during development.

## 5. Update Documentation
- [ ] Add a usage snippet to docs/ui/distillation.md showing component props and typical integration with ThoughtStreamer or a DAG Canvas.

## 6. Automated Verification
- [ ] If E2E infra exists, add a short Playwright/Puppeteer smoke test that mounts DistillationSweep, activates it, and verifies canvas pixel changes or that onComplete fires; otherwise rely on unit timers and mocked-engine tests.
