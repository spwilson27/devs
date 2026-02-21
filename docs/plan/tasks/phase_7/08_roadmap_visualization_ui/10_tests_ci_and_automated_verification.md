# Task: Tests, CI Integration, and Automated Verification for Roadmap UI (Sub-Epic: 08_Roadmap_Visualization_UI)

## Covered Requirements
- [1_PRD-REQ-UI-006], [4_USER_FEATURES-REQ-033], [1_PRD-REQ-UI-003], [4_USER_FEATURES-REQ-014], [4_USER_FEATURES-REQ-073]

## 1. Initial Test Written
- [ ] Consolidate and create a test matrix at tests/roadmap/README.md listing all unit, integration, and E2E tests created by the tasks above and mark the primary smoke tests that must run on PRs (scaffold mount, renderer snapshot, API contract, approval flow, redistill job).

## 2. Task Implementation
- [ ] Add a CI workflow at .github/workflows/roadmap-ui.yml that runs on push/pull_request for changes under src/ui/** and src/core/** and executes:
  - Install dependencies
  - Run linter
  - Run unit tests (fast suite)
  - Run integration tests (api/store)
  - Run a headless E2E smoke test for RoadmapViewer using Playwright or Puppeteer
- [ ] Provide caching for node_modules and a matrix for node versions used by the project.

## 3. Code Review
- [ ] Ensure the CI workflow fails fast on lint/test failures, artifacts (test-results, coverage) are uploaded, and that the workflow exposes logs for re-distill jobs and approval actions. Confirm the workflow does not run expensive E2E tests by default on every push (only on main or scheduled runs).

## 4. Run Automated Tests to Verify
- [ ] Manually trigger the CI workflow for a branch with the new tests and assert all steps complete; locally run `npm ci && npm test` and `npm run test:integration` to validate in dev.

## 5. Update Documentation
- [ ] Add docs/ci_roadmap.md summarizing the workflow, required secrets (if any), and how to run smoke checks locally. Document the canonical commands used in CI to run subsets of tests.

## 6. Automated Verification
- [ ] Add a meta-verification script `scripts/verify_all_roadmap_checks.sh` that runs the fast test matrix locally, collects exit codes, and exits non-zero if any smoke tests fail. The script should be used by CI as the fast-gate step.