# Task: Create an ESLint Rule to Enforce Anti-Magic Motion (Sub-Epic: 48_Motion_Philosophy)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-006-2]

## 1. Initial Test Written
- [ ] Create ESLint RuleTester tests at packages/eslint-plugin-motion/src/rules/no-decorative-motion.test.ts that assert the rule flags the following cases:
  - CSS-in-JS or styled-components: transition: 'all 500ms ease' (should be flagged)
  - Inline style: style={{ transition: 'width 200ms ease' }} (flagged)
  - Valid cases (no flag): style uses only transform/opacity in transition, duration <= 250ms, easing === policy easing.

Test details:
1. Use ESLint RuleTester to provide code examples as strings and assert errors.
2. Ensure tests validate auto-fix where possible (e.g., rewrite 'all 500ms' to 'transform 250ms cubic-bezier(0.4,0,0.2,1)') or at least provide a clear error message.

## 2. Task Implementation
- [ ] Implement a lightweight ESLint plugin package: packages/eslint-plugin-motion with rule 'no-decorative-motion' that enforces:
  - Transition properties must be only 'transform' and/or 'opacity'.
  - Duration must be <= ANIMATION_POLICY.maxDurationMs.
  - Easing must match ANIMATION_POLICY.easing (or be equivalent). 
  - Rule should inspect both CSS-in-JS template literals and React inline style objects.
- [ ] Add the plugin to root .eslintrc or the UI workspace .eslintrc with the rule enabled as error for UI packages.

Implementation notes:
1. Use AST traversal to find JSXAttribute 'style' and template literal tagged with styled-components or css imports.
2. For performance, the rule should only run on files under packages/ui-*/ or src/ui.

## 3. Code Review
- [ ] Verify rule accuracy (no false positives for non-UI code), test coverage is comprehensive, error messages provide guidance and suggested fixes.

## 4. Run Automated Tests to Verify
- [ ] Run: pnpm --filter @devs/eslint-plugin-motion test (or run eslint --ext .tsx,.ts on UI packages with the rule enabled and expect zero rule violations for compliant code; intentionally failing examples should report errors).

## 5. Update Documentation
- [ ] Document the rule in packages/eslint-plugin-motion/README.md with examples of violations and recommended fixes, and reference requirement ID.

## 6. Automated Verification
- [ ] Add an npm script that lints the ui packages and exits non-zero if the rule fails: "lint:motion": "eslint 'packages/ui-**/**' --rule 'motion/no-decorative-motion: error'". CI should run this as part of the UI pipeline.