# Task: Implement Brief vs Spec side-by-side viewer and data plumbing (Sub-Epic: 10_Review Dashboard UI)

## Covered Requirements
- [4_USER_FEATURES-REQ-008], [4_USER_FEATURES-REQ-029]

## 1. Initial Test Written
- [ ] Create an integration test at tests/components/ReviewDashboard.sideBySide.test.tsx that:
  - Renders ReviewDashboard and provides mock briefContent and specContent props (or mocks the content provider service).
  - Asserts the BriefViewer renders the briefContent and SpecViewer renders the specContent.
  - Asserts the layout contains two columns (check computed container class or testids) when viewport width >= 1024px and stacks vertically when narrow (simulate by setting container width or CSS class).

## 2. Task Implementation
- [ ] Implement BriefViewer and SpecViewer components at src/components/ReviewDashboard/BriefViewer.tsx and .../SpecViewer.tsx accepting content:string and optional metadata.
  - Implement a simple content provider interface at src/services/specProvider.ts with fetchBrief(projectId) and fetchSpec(projectId) that return Promise<string> and are mockable in tests.
  - Wire ReviewDashboard to call specProvider.fetchBrief/ fetchSpec in useEffect and pass content to the viewers; show loading skeletons while resolving.
  - Ensure viewers render markdown content using the project's markdown renderer (or a safe markdown renderer) and expose data-testid attributes for assertions.

## 3. Code Review
- [ ] Ensure content fetching is separated from presentation (service layer), components are pure for given props, loading/error states are covered, and network calls are abstracted for test mocking.

## 4. Run Automated Tests to Verify
- [ ] Run npm test -- -t "ReviewDashboard.sideBySide" and ensure tests pass; run full suite to confirm no regressions.

## 5. Update Documentation
- [ ] Document the content provider API (src/services/specProvider.ts), component props, and example usage in docs/ui/review_dashboard.md.

## 6. Automated Verification
- [ ] Run the integration test and a smoke manual test: start the app, navigate to /review-dashboard?project=test, and verify both panes show expected sample content.