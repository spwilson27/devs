# Task: Implement Particle Engine module (Sub-Epic: 55_Distillation_Particles)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-057-2]

## 1. Initial Test Written
- [ ] Ensure unit tests from 02_particle_engine_unit_tests exist and are failing; specifically tests for deterministic output, step updates, TTL expiry, and particle shape should be present at tests/ui/distillation/particleEngine.test.ts.

## 2. Task Implementation
- [ ] Implement the engine to satisfy the tests: add src/ui/distillation/particleEngine.ts with exported functions createParticles, stepParticles, and types. Implement a tiny seeded PRNG (xorshift32 or a small wrapper around seedrandom) and make it pluggable so callers can provide an alternative PRNG. Keep functions pure and export helper utilities (computeInitialVelocity, applyDrag) for unit testing. Add an index barrel export and update any build exports if the repository requires it.

## 3. Code Review
- [ ] Confirm there is no DOM usage, that functions are deterministic given a seed, TypeScript interfaces are exported where useful, the API surface is minimal, and JSDoc comments explain units (ms, pixels). Ensure performance considerations (mutable arrays for step loop) are documented.

## 4. Run Automated Tests to Verify
- [ ] Run the particle engine unit tests and ensure they pass; run the deterministic snapshot test to validate expected output.

## 5. Update Documentation
- [ ] Document implementation notes in docs/ui/distillation.md including PRNG choice and guidance for high-particle-count scenarios and worker offload.

## 6. Automated Verification
- [ ] Add a performance regression guard (optional) that steps a large particle array for one tick and logs/validates that the step time remains below a chosen threshold (make the test opt-in or skip on low-resource CI).
