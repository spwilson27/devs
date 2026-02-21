# Task: Particle Engine: Unit Tests for deterministic particle generation and update loop (Sub-Epic: 55_Distillation_Particles)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-057-2]

## 1. Initial Test Written
- [ ] Create a test file tests/ui/distillation/particleEngine.test.ts that imports createParticles(seed, origin, target, config) and stepParticles(particles, dtMs). Tests to write: (a) deterministic generation: with the same seed and inputs createParticles returns identical arrays (deep equality); (b) position update determinism: stepping particles with fixed dt yields expected positions (use a seeded PRNG and snapshot the state after N steps); (c) lifecycle: particles are removed after TTL expires; (d) boundary conditions: zero count returns empty array; (e) particle property shape: each particle has id, x, y, vx, vy, life, ttl, radius, opacity with correct types.

## 2. Task Implementation
- [ ] Implement src/ui/distillation/particleEngine.ts as pure functions (no DOM): define Particle and ParticleConfig types and functions: createParticles(seed, origin, target, config) => Particle[] and stepParticles(particles, dtMs, config) => Particle[]. Use a deterministic PRNG (xorshift or seedrandom wrapper) seeded by the caller; implement physics parameters (initial speed variance, drag, angle spread, TTL, opacity falloff). Ensure exports are small, testable, and worker-ready.

## 3. Code Review
- [ ] Validate the engine is pure and deterministic when a seed is provided, TypeScript types are strict, functions are documented, and performance considerations (in-place mutation vs allocation) are noted. Confirm the engine contains no browser-specific APIs so it can be used in a worker.

## 4. Run Automated Tests to Verify
- [ ] Run the particle engine unit tests (filter to particleEngine.test.ts) and confirm they fail before implementation, then pass after; stabilize snapshots for deterministic output.

## 5. Update Documentation
- [ ] Add API documentation to docs/ui/distillation.md describing createParticles and stepParticles, particle shape, and recommended configs for low/medium/high density.

## 6. Automated Verification
- [ ] Add a deterministic integration test that seeds the engine with a fixed seed, records the state after a fixed number of steps, and asserts equality with a committed snapshot tests/__snapshots__/particleEngine. Provide a small verification script to run this check.
