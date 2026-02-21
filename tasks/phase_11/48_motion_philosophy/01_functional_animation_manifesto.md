# Task: Create Functional Animation Manifesto & Policy (Sub-Epic: 48_Motion_Philosophy)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-050], [7_UI_UX_DESIGN-REQ-UI-DES-006]

## 1. Initial Test Written
- [ ] Create a unit test at packages/ui-motion/src/__tests__/manifesto.test.ts that imports ANIMATION_POLICY from '@devs/ui-motion' (or from packages/ui-motion/src) and asserts all of the following:
  - policy.easing === 'cubic-bezier(0.4, 0, 0.2, 1)'
  - policy.maxDurationMs <= 250
  - policy.allowedProperties equals ['transform', 'opacity']
  - policy.prefersReducedMotionQuery === '(prefers-reduced-motion: reduce)'
  - The test must be written using Jest (or the repo's unit test runner) and must fail before implementation is added.

Detailed test steps (for the agent):
1. Create file: packages/ui-motion/src/__tests__/manifesto.test.ts
2. import { getAnimationPolicy } from '../../index'
3. const policy = getAnimationPolicy()
4. expect(policy.easing).toBe('cubic-bezier(0.4, 0, 0.2, 1)')
5. expect(policy.maxDurationMs).toBeLessThanOrEqual(250)
6. expect(policy.allowedProperties).toEqual(['transform','opacity'])
7. expect(policy.prefersReducedMotionQuery).toBe('(prefers-reduced-motion: reduce)')

## 2. Task Implementation
- [ ] Implement a small TypeScript module at packages/ui-motion/src/index.ts that exports a single, well-typed policy object and accessor:
  - export const ANIMATION_POLICY = { easing: 'cubic-bezier(0.4, 0, 0.2, 1)', maxDurationMs: 250, allowedProperties: ['transform','opacity'], prefersReducedMotionQuery: '(prefers-reduced-motion: reduce)' } as const
  - export type AnimationPolicy = typeof ANIMATION_POLICY
  - export function getAnimationPolicy(): AnimationPolicy { return ANIMATION_POLICY }
- [ ] Ensure package builds to dist (add minimal package.json in packages/ui-motion if missing, and configure build/test scripts to integrate with repo's mono-repo tooling).
- [ ] Do not introduce runtime side-effects; module must be pure and export only constants/functions.

Implementation steps (for the agent):
1. Create packages/ui-motion/src/index.ts with the policy and accessor function.
2. Add a packages/ui-motion/package.json if one does not exist with name '@devs/ui-motion', main 'dist/index.js', types 'dist/index.d.ts', and a test script pointing to the repo's test runner.
3. Build and compile the package (tsc) to ensure types and exports are valid.

## 3. Code Review
- [ ] Verify the exported policy is strictly typed, documented with JSDoc, and contains only the allowed fields.
- [ ] Verify there are no hard-coded colors, no DOM manipulation, and no runtime side-effects.
- [ ] Verify tests reference only the public accessor (getAnimationPolicy) and not internal files.

## 4. Run Automated Tests to Verify
- [ ] Run tests: pnpm --filter @devs/ui-motion test OR npm --workspace=@devs/ui-motion test. Confirm the manifesto unit test passes.
- [ ] If monorepo tooling differs, run the repository-wide unit tests and confirm the new test passes.

## 5. Update Documentation
- [ ] Add packages/ui-motion/README.md documenting the Functional Animation Manifesto, describing why only transform/opacity are allowed, linking to the requirement IDs above, and examples of correct usage.

## 6. Automated Verification
- [ ] Add a verification script: packages/ui-motion/scripts/verify-policy.js that requires the built dist and asserts JSON equality with the expected policy. Add a package.json script "verify:animation-policy": "node ./dist/scripts/verify-policy.js" and run it in CI.
- [ ] Locally run: node ./dist/scripts/verify-policy.js and confirm it outputs PASS.