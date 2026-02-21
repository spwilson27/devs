# Task: Documentation, E2E smoke, and CI verification for Module Hover (Sub-Epic: 54_Context_Guidance_UI)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-130], [7_UI_UX_DESIGN-REQ-UI-DES-130-1]

## 1. Initial Test Written
- [ ] Create an E2E smoke test spec `tests/e2e/module-hover.spec.ts` (Playwright) that launches the built webview preview (or a hosted development page) and performs:
  - Locate a sample file row in the `src/` view, hover it and assert that the Module Hover appears within 300ms and contains `Intent` and at least one `Hook` entry.
  - Take a screenshot of the hover and save to `tmp/e2e/module-hover.png` for visual inspection.

## 2. Task Implementation
- [ ] Add CI job steps (or update existing webview CI) to run the following in order:
  - Build the webview bundle: `npm run build:webview` (or repo-equivalent).
  - Run unit & integration tests: `npx vitest --run` scoped to webview module tests created in Tasks 01-04.
  - Run the Playwright E2E smoke: `npx playwright test tests/e2e/module-hover.spec.ts --project=chromium` and fail the job on failure.
  - Ensure artifact upload of the `tmp/e2e/module-hover.png` and any Playwright traces on failure.

## 3. Code Review
- [ ] Ensure CI steps are idempotent, do not require manual credentials, and that the E2E only exercises a small deterministic fixture (sample repo state committed in tests/fixtures) to avoid flakiness.

## 4. Run Automated Tests to Verify
- [ ] Locally run the CI steps: `npm run build:webview && npx vitest --run && npx playwright test tests/e2e/module-hover.spec.ts` and confirm success and artifact generation.

## 5. Update Documentation
- [ ] Add a `docs/ui/contextual-guidance.md` page describing the Module Hover UX, message contract, cache semantics, debounce and TTL configuration, and how to author `.agent.md` files so their Intent/Hooks/Test Strategy are surfaced correctly.

## 6. Automated Verification
- [ ] Add a CI verification script `scripts/verify-module-hover-ci.sh` that runs the build + tests + e2e smoke and exits non-zero on any failure; wire this script as a required check for PRs touching `tasks/phase_11/54_context_guidance_ui` or webview code touching module hover.
