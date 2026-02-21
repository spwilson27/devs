# Task: Implement Browser/OS Polyfill Exclusion Constraint for Generated Projects (Sub-Epic: 02_Out-of-Scope Manifest - Platform & Runtime Services)

## Covered Requirements
- [1_PRD-REQ-OOS-016]

## 1. Initial Test Written
- [ ] In `src/guards/__tests__/polyfill-boundary.guard.test.ts`, write unit tests covering:
  - `PolyfillBoundaryGuard.validate(request)` returns a `BoundaryViolation` with `requirementId: "1_PRD-REQ-OOS-016"` when `request.intent` contains polyfill/compatibility signals: `"polyfill"`, `"ie11"`, `"legacy browser"`, `"browser compatibility"`, `"os-specific quirk"`, `"cross-browser"`, `"core-js"`, `"babel polyfill"`, `"webcompat"`.
  - `PolyfillBoundaryGuard.validate(request)` returns `null` for standard project generation intents.
  - The returned `BoundaryViolation` `message` explains that `devs` targets modern toolchains and that polyfilling is the responsibility of the generated project's own build pipeline.
- [ ] In `src/codegen/__tests__/project-template-validator.test.ts`, write tests that:
  - `ProjectTemplateValidator.validate(template)` returns a `TemplateViolation` list when the template's `package.json` `dependencies` or `devDependencies` contain any of: `"core-js"`, `"@babel/polyfill"`, `"whatwg-fetch"`, `"es6-promise"`, `"raf"`, `"object-assign"`, `"react-app-polyfill"`.
  - `ProjectTemplateValidator.validate(template)` returns an empty list for templates with no polyfill packages.
  - `ProjectTemplateValidator.validate(template)` returns a `TemplateViolation` when `browserslist` in `package.json` targets any browser with `>= IE 9` through `>= IE 11`, or `last 10 versions` without an explicit modern-only constraint.
  - Each `TemplateViolation` contains `requirementId: "1_PRD-REQ-OOS-016"` and `severity: "ERROR"`.
- [ ] In `src/codegen/__tests__/codegen-pipeline.test.ts` (or existing pipeline test), write an integration test that:
  - Runs the code generation pipeline with a mock spec that includes a polyfill package request.
  - Asserts the pipeline emits a `TEMPLATE_VIOLATION` event and does not generate the file containing the polyfill package.

## 2. Task Implementation
- [ ] Create `src/guards/polyfill-boundary.guard.ts`:
  - Define `POLYFILL_INTENT_SIGNALS: string[]`.
  - Implement `PolyfillBoundaryGuard.validate(request: OrchestratorRequest): BoundaryViolation | null`:
    - Normalize intent and check against signals.
    - `suggestedAction`: `"Configure legacy browser support in the generated project's build pipeline (e.g., Babel, PostCSS, Vite legacy plugin) after handover."`.
  - Export singleton: `export const polyfillBoundaryGuard = new PolyfillBoundaryGuard()`.
- [ ] Create `src/codegen/project-template-validator.ts`:
  - Define `POLYFILL_PACKAGES: string[]` — a list of known polyfill npm packages (see test list above; make it extensible).
  - Define `isLegacyBrowserslist(browserslist: string[] | undefined): boolean` — returns `true` if the list targets IE 9–11 or other legacy browsers without a modern-only override.
  - Implement `ProjectTemplateValidator.validate(template: ProjectTemplate): TemplateViolation[]`:
    - Parse `template.packageJson.dependencies` and `template.packageJson.devDependencies`.
    - For each package name in `POLYFILL_PACKAGES` found in either dep group, push a `TemplateViolation`.
    - Check `template.packageJson.browserslist` with `isLegacyBrowserslist`; push a violation if legacy targets detected.
    - Return the collected violations.
  - Create `TemplateViolation` interface in `src/codegen/template-violation.types.ts`:
    ```typescript
    export interface TemplateViolation {
      requirementId: string;
      field: string;
      offendingValue: string;
      severity: 'ERROR' | 'WARNING';
      message: string;
    }
    ```
- [ ] Integrate `ProjectTemplateValidator` into the code generation pipeline (in `src/codegen/codegen-pipeline.ts` or equivalent):
  - After the LLM generates the `package.json` content, run `ProjectTemplateValidator.validate(generatedTemplate)`.
  - If any violations with `severity: "ERROR"` exist, emit a `TEMPLATE_VIOLATION` event and halt generation of the offending file. Log the violation details.
  - If violations with `severity: "WARNING"` exist, emit a `TEMPLATE_VIOLATION` event but allow generation to proceed (with a warning in the run log).
- [ ] Register `PolyfillBoundaryGuard` in the orchestrator's request validation pipeline.

## 3. Code Review
- [ ] Verify `POLYFILL_PACKAGES` is exported from `src/codegen/project-template-validator.ts` so it can be referenced by documentation and tests without duplication.
- [ ] Verify `isLegacyBrowserslist` handles edge cases: `undefined` → `false`; empty array `[]` → `false`; `["last 2 versions"]` → `false`; `["> 1%", "ie 11"]` → `true`.
- [ ] Verify that `ProjectTemplateValidator` does not throw — it must always return an array (empty or populated).
- [ ] Verify that violations do not prevent non-offending files from being generated — only the offending `package.json` (or file containing the polyfill reference) should be blocked.
- [ ] Verify TypeScript strict mode with no `any`.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/guards/__tests__/polyfill-boundary.guard.test.ts src/codegen/__tests__/project-template-validator.test.ts --coverage` and confirm all tests pass with 100% branch coverage on `isLegacyBrowserslist` and the polyfill package detection loop.
- [ ] Run `npm test` to confirm no regressions.

## 5. Update Documentation
- [ ] Create `src/codegen/project-template-validator.agent.md` documenting: the `POLYFILL_PACKAGES` list, `isLegacyBrowserslist` logic, `TemplateViolation` severity levels, and instructions for adding new blocked packages.
- [ ] Update `docs/architecture/boundary-guards.md` with a row for `PolyfillBoundaryGuard`.
- [ ] Update `docs/architecture/codegen-pipeline.md` (create if absent) with a section `## Template Validation` describing the validation step, when it runs, and how violations are handled.
- [ ] Add a section `## Browser & OS Compatibility Policy` to `docs/architecture/oos-manifest.md` (or `manifest.md`) referencing `1_PRD-REQ-OOS-016` and explaining that generated projects target modern toolchains only.

## 6. Automated Verification
- [ ] Run the following smoke test:
  ```bash
  npx ts-node -e "
  import { ProjectTemplateValidator } from './src/codegen/project-template-validator';
  const validator = new ProjectTemplateValidator();
  const violations = validator.validate({
    packageJson: { dependencies: { 'core-js': '^3.0.0' }, devDependencies: {}, browserslist: undefined }
  });
  if (violations.length === 0) process.exit(1);
  if (violations[0].requirementId !== '1_PRD-REQ-OOS-016') process.exit(1);
  if (violations[0].severity !== 'ERROR') process.exit(1);
  const clean = validator.validate({ packageJson: { dependencies: {}, devDependencies: {}, browserslist: undefined } });
  if (clean.length !== 0) process.exit(1);
  console.log('PolyfillBoundaryGuard: PASS');
  "
  ```
  Confirm exit code 0 and output `PolyfillBoundaryGuard: PASS`.
