# Task: Add automated accessibility tests verifying interactive target sizes and contextual focus (Sub-Epic: 43_Interactive_Targets)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-048-1], [4_USER_FEATURES-REQ-055]

## 1. Initial Test Written
- [ ] Unit-level a11y test: packages/webview/src/__tests__/a11y-interactive-targets.test.ts
  - Use jest-axe to run accessibility checks against rendered components (StandardButton, DAGNode sample) and assert no violations of critical rules.
  - Write a custom assertion that checks every element with data-interactive-size or class interactive-target has computed dimensions >= 24px (or class presence indicating sizing has been applied).
- [ ] E2E-level a11y test: cypress/integration/a11y-interactive.spec.ts using cypress-axe
  - Visit a local webview page or storybook instance and run cy.injectAxe(); cy.checkA11y() focusing on interactive elements and focus management flows.

## 2. Task Implementation
- [ ] Add dependencies if missing: jest-axe, axe-core, cypress-axe (update packages or root package.json as appropriate).
- [ ] Create the jest a11y test and Cypress spec files outlined above.
- [ ] Add npm scripts:
  - "test:a11y": "jest --config jest.a11y.config.js"
  - "e2e:a11y": "cypress run --spec cypress/integration/a11y-interactive.spec.ts"

## 3. Code Review
- [ ] Ensure tests are deterministic: mock timers or network where needed and avoid flaky selectors.
- [ ] Confirm the custom size-check assertion is robust (falls back to class-based detection if computed style is unavailable in the test environment).
- [ ] Ensure a11y checks only assert on project components and not third-party static assets.

## 4. Run Automated Tests to Verify
- [ ] Run: npm run test:a11y and ensure no new critical issues are reported.
- [ ] Run: npm run e2e:a11y (or npx cypress run --spec ...) and confirm CI-friendly, headless success.

## 5. Update Documentation
- [ ] Update docs/testing/a11y.md describing how to run the new tests locally and in CI, and include troubleshooting tips for common axe failures.

## 6. Automated Verification
- [ ] Integrate test:a11y and e2e:a11y into CI as required checks; add scripts/ci-verify-a11y.js that runs both suites and produces a machine-readable JSON report for CI dashboards.