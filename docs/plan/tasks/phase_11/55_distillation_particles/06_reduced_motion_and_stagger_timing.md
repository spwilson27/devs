# Task: Reduced Motion support & Distillation Stagger Timing (Sub-Epic: 55_Distillation_Particles)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-057-3]

## 1. Initial Test Written
- [ ] Add unit tests tests/ui/distillation/stagger.test.ts for computeStaggerTimes(count, baseMs, factor) that assert returned delay arrays for a range of counts; include tests that mock window.matchMedia('(prefers-reduced-motion: reduce)') returning true and verify computeStaggerTimes returns all zeros or minimal delays. Add tests that assert DistillationSweep immediately completes or uses a short non-animated path when reduced motion is enabled.

## 2. Task Implementation
- [ ] Implement computeStaggerTimes in src/ui/distillation/spec.ts (or a helper) and have DistillationSweep consult window.matchMedia or a theme/user preference flag to decide whether to apply stagger/delays. Add a CSS variable --devs-distill-reduced-motion to allow explicit overrides. Ensure SSR-safety by guarding matchMedia with typeof window checks and allow dependency-injection of a prefersReducedMotion flag for tests.

## 3. Code Review
- [ ] Verify accessibility conformance: matchMedia usage is guarded, reduced-motion override exists and is documented, and component tests include both reduced and normal-motion flows. Confirm deterministic behavior for both flows and that reduced-motion path avoids unnecessary animation loops.

## 4. Run Automated Tests to Verify
- [ ] Run the stagger and reduced-motion tests and ensure they pass with both simulated reduced-motion true/false. Use test runner mocking utilities for matchMedia.

## 5. Update Documentation
- [ ] Update docs/ui/distillation.md with the reduced-motion behavior, examples for theme overrides, and guidance for designers on non-animated fallbacks.

## 6. Automated Verification
- [ ] Add a CI check (or local script) that runs the reduced-motion tests under both simulated environments and fails if animations run when reduced motion is requested.
