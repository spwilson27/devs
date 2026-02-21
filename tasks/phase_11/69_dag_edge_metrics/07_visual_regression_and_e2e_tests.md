# Task: Visual regression & E2E tests for edge weight and centered ports (Sub-Epic: 69_DAG_Edge_Metrics)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-046-3], [7_UI_UX_DESIGN-REQ-UI-DES-046-4]

## 1. Initial Test Written
- [ ] Add an end-to-end test using the repository's existing E2E/test harness (Playwright, Puppeteer, or Cypress if present). The test should load a minimal page or Webview snapshot that mounts DAGCanvas with a small deterministic graph: two nodes connected by an edge with thickness set to thin and another edge set to thick; nodes should expose multiple ports. Capture a DOM snapshot or screenshot and assert: (a) the thick edge visually has greater thickness than the thin edge (compare pixel sample or bounding box of stroke); (b) the ports on a node are centered (compute their mean X in the screenshot or via DOM bounding boxes and assert centered within 1px).

## 2. Task Implementation
- [ ] Implement E2E test at e2e/dag_edge_port.spec.ts using the project's existing test runner. For Playwright: mount the component using a test harness page that renders the DAGCanvas with inlined CSS variables for stroke overrides and deterministic layout seeds. Use page.$eval to read element.getBoundingClientRect() for ports and edges and assert numeric expectations.

## 3. Code Review
- [ ] Ensure the E2E test is deterministic (fixed node coordinates or deterministic d3-force seed), tolerances are documented, screenshots are stored when failing, and the test is fast (<= 5s ideally). Confirm the test uses CI-friendly headless configuration.

## 4. Run Automated Tests to Verify
- [ ] Run the E2E locally via npx playwright test e2e/dag_edge_port.spec.ts (or equivalent) and confirm it passes. Add the test to CI pipeline under a visual/regression stage that runs on PRs touching DAG code.

## 5. Update Documentation
- [ ] Add a short section in docs/ui/dag.md documenting the E2E test purpose and how to run it locally and in CI, including the deterministic seed value used for the DAG layout.

## 6. Automated Verification
- [ ] Configure CI to run the E2E test and fail the pipeline when: screenshot diffs exceed the tolerance threshold or DOM bounding boxes for port centering deviate > 1px. Add a small script to automatically upload failure screenshots to the PR for inspection.
