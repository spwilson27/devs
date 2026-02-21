# Task: Initialize Review Dashboard UI Shell and Routes (Sub-Epic: 10_Review Dashboard UI)

## Covered Requirements
- [4_USER_FEATURES-REQ-029]

## 1. Initial Test Written
- [ ] Create a unit test file at tests/components/ReviewDashboard.shell.test.tsx using Jest + React Testing Library that:
  - Renders the application Router (use BrowserRouter or app's test wrapper) and navigates to "/review-dashboard".
  - Asserts there is a top-level element with role="region" and data-testid="review-dashboard".
  - Asserts placeholders with data-testid="brief-pane" and data-testid="spec-pane" exist.
  - Uses a snapshot of the initial render to detect regressions.

## 2. Task Implementation
- [ ] Implement src/components/ReviewDashboard/index.tsx:
  - Export a typed functional React component that renders a responsive two-column layout with left pane (BriefViewer) and right pane (SpecViewer).
  - Add data-testid attributes: "review-dashboard", "brief-pane", "spec-pane" and semantic roles (region, complementary, main as appropriate).
  - Add a route in the app router (e.g., src/app/routes.tsx or src/App.tsx) to mount the component at /review-dashboard.
  - Implement minimal CSS (CSS module or styled-components) to create a two-column responsive layout and ensure testability.
  - Add placeholder subcomponents BriefViewer and SpecViewer (accepting prop content:string) and export them for unit testing.

## 3. Code Review
- [ ] Verify components follow composition (container vs presentational), use semantic HTML and ARIA where needed, include TypeScript interfaces for props, and keep styles isolated.

## 4. Run Automated Tests to Verify
- [ ] Run the project test runner (eg. npm test -- -t "ReviewDashboard.shell") and ensure the new test passes locally and in CI.

## 5. Update Documentation
- [ ] Add docs/ui/review_dashboard.md describing the component responsibilities, route, public props for BriefViewer/SpecViewer, and developer notes on where to plug content providers.

## 6. Automated Verification
- [ ] Run full test suite (npm test) and confirm exit code 0; optionally start dev server and curl http://localhost:3000/review-dashboard and assert response contains data-testid="review-dashboard".