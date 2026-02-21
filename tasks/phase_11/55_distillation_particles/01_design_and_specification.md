# Task: Design and Specification: Distillation Sweep Visual & Timing Tokens (Sub-Epic: 55_Distillation_Particles)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-057-1], [7_UI_UX_DESIGN-REQ-UI-DES-057-3]

## 1. Initial Test Written
- [ ] Write unit tests that assert exported design tokens and timing constants exist and have correct types and default values: create tests at tests/ui/distillation/spec.test.ts (or src/ui/distillation/__tests__/spec.test.ts). Use the repository test runner (jest/vitest) and assert that importing { DISTILLATION } from 'src/ui/distillation/spec' returns an object with keys: sweepDurationMs (number), particleCount (number), staggerBaseMs (number), staggerFactor (number), and an object cssVars containing '--devs-distill-duration', '--devs-distill-count', '--devs-distill-stagger'. Validate default ranges (duration 200-2000ms; count 4-200; staggerBase 8-200ms) and add tests that verify values can be overridden by theme injection or CSS variables.

## 2. Task Implementation
- [ ] Implement src/ui/distillation/spec.ts (TypeScript) exporting a typed constant DISTILLATION and helper functions: getDistillationCSSVars(theme?) returning CSS custom property mappings, and computeStaggerTimes(count, baseMs, factor). Wire these tokens into the Webview theme injector so they are available at runtime as --devs-distill-*. Add a small index barrel export and register the token names in whatever theme/token module exists (e.g., src/ui/theme/tokens.ts).

## 3. Code Review
- [ ] Verify exported names follow project naming conventions, TypeScript types are explicit, no hard-coded animation values are used in components (always read from tokens/CSS variables), tokens are documented with JSDoc, and functions are pure where practical. Ensure tests are small and deterministic.

## 4. Run Automated Tests to Verify
- [ ] Run the repository test command (npm test / pnpm test / yarn test) and ensure the new spec.test.ts initially fails (TDD) then passes after implementation; run only the distillation spec tests with the test runner's filter option.

## 5. Update Documentation
- [ ] Add docs/ui/distillation.md describing the visual intent (distillation sweep "fly" metaphor), token names and default values, recommended ranges, and examples of overriding tokens via theme injection or CSS variables; link this doc from the UI design index.

## 6. Automated Verification
- [ ] Add a small verification script (npm run verify-distillation or tests/scripts/verify-distillation.js) that imports the built spec module and validates token types and presence of CSS variable names. Ensure this script can be run locally and return non-zero on mismatch.
