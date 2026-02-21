# Task: WCAG 2.1 AA Audit Toolchain Setup (Sub-Epic: 85_Accessibility_WCAG_Base)

## Covered Requirements
- [4_USER_FEATURES-REQ-044], [7_UI_UX_DESIGN-REQ-UI-DES-084]

## 1. Initial Test Written
- [ ] In `packages/vscode/webview-ui/src/__tests__/accessibility/`, create `wcag-toolchain.test.ts`.
- [ ] Write a test that imports `axe-core` (via `@axe-core/react`) and asserts it can be instantiated without error.
- [ ] Write a test using `@testing-library/react` and `jest-axe` that mounts the top-level `<App />` component (or a representative stub), runs `axe()`, and asserts the result has zero violations.
- [ ] Write a test that runs `axe()` against a stub component rendered with `data-vscode-theme="hc-black"` class applied to the container, and asserts zero violations in HC context.
- [ ] Write a Playwright E2E test in `e2e/accessibility/wcag-audit.spec.ts` that:
  - Launches the webview in a headless browser.
  - Injects `axe-core` via `page.evaluate`.
  - Calls `axe.run()` on `document.body` with `runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] }`.
  - Asserts that `violations` is an empty array.
- [ ] Write a CI configuration test (can be a JSON/YAML schema lint test) that asserts the `.github/workflows/ci.yml` contains a step named `WCAG Accessibility Audit` or equivalent.

## 2. Task Implementation
- [ ] Install dev dependencies in `packages/vscode/webview-ui`:
  ```bash
  npm install --save-dev axe-core @axe-core/react jest-axe @types/jest-axe
  npm install --save-dev playwright @playwright/test
  ```
- [ ] In `packages/vscode/webview-ui/jest.config.ts`, add a `setupFilesAfterFramework` entry for `jest-axe/extend-expect` so that `toHaveNoViolations()` is available in all test files.
- [ ] Create `packages/vscode/webview-ui/src/__tests__/accessibility/wcag-toolchain.test.ts` implementing all unit test cases described in §1.
- [ ] Create `e2e/accessibility/wcag-audit.spec.ts` implementing the Playwright axe-core integration test described in §1.
- [ ] Add an `axe.config.ts` at `packages/vscode/webview-ui/src/axe.config.ts` that exports a shared axe configuration object:
  ```ts
  export const axeConfig = {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    rules: {
      // Disable rules that conflict with VSCode webview sandboxing constraints
      'frame-tested': { enabled: false },
    },
  };
  ```
- [ ] In `.github/workflows/ci.yml` (or equivalent CI file), add a new job step after the existing `build` step:
  ```yaml
  - name: WCAG Accessibility Audit
    run: npx playwright test e2e/accessibility/wcag-audit.spec.ts --reporter=dot
  ```
- [ ] Ensure the `package.json` in `packages/vscode/webview-ui` has a script:
  ```json
  "test:a11y": "jest --testPathPattern=accessibility"
  ```

## 3. Code Review
- [ ] Verify `axe.config.ts` is imported consistently from all accessibility test files — no inline config duplication.
- [ ] Confirm that `jest-axe` `toHaveNoViolations()` is used (not raw `violations.length === 0`) for readable failure output.
- [ ] Ensure the Playwright test uses `{ tag: ['wcag2a', 'wcag2aa'] }` scope and does NOT use a blanket `{ tag: ['best-practice'] }` (which is out of scope for AA compliance).
- [ ] Confirm the CI job fails fast on any WCAG violation (exit code non-zero) and surfaces a readable report.
- [ ] Verify no `// eslint-disable` suppressions are present in new accessibility test files.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test:a11y` from `packages/vscode/webview-ui` and confirm all unit/integration tests pass.
- [ ] Run `npx playwright test e2e/accessibility/wcag-audit.spec.ts` and confirm zero WCAG violations are reported.
- [ ] Confirm CI pipeline passes the new `WCAG Accessibility Audit` step on the current branch.

## 5. Update Documentation
- [ ] Add a section titled `## Accessibility Testing` to `packages/vscode/webview-ui/README.md` (create if absent) describing:
  - How to run `npm run test:a11y`.
  - How to run the Playwright E2E WCAG audit.
  - The shared `axe.config.ts` and how to extend it.
- [ ] Update `packages/vscode/webview-ui/webview-ui.agent.md` (create if absent per AOD Density policy) with a memory entry:
  ```
  WCAG audit toolchain: jest-axe (unit) + Playwright/axe-core (E2E). Config: src/axe.config.ts. CI step: "WCAG Accessibility Audit".
  ```

## 6. Automated Verification
- [ ] Run the full CI pipeline locally (e.g., `act` or via GitHub Actions) and assert the `WCAG Accessibility Audit` step exits with code `0`.
- [ ] Execute `grep -r "toHaveNoViolations\|axe.run" packages/vscode/webview-ui/src/__tests__/accessibility/` and confirm at least two files are found.
- [ ] Execute `grep "WCAG Accessibility Audit" .github/workflows/ci.yml` and confirm the step is present.
