# Task: Scaffold Roadmap Visualization UI (Sub-Epic: 08_Roadmap_Visualization_UI)

## Covered Requirements
- [4_USER_FEATURES-REQ-033], [1_PRD-REQ-UI-003]

## 1. Initial Test Written
- [ ] Create a unit test at tests/ui/roadmap/01_scaffold.test.(ts|tsx|js) that mounts the top-level RoadmapViewer component (or the equivalent webview entrypoint) using the project's existing frontend test harness (Jest+React Testing Library or the repo's chosen framework). The test must:
  - Mock the API response for GET /api/roadmap to return { epics: [] } and assert RoadmapViewer mounts without errors.
  - Assert the component renders an element with role="region" and aria-label="Roadmap Viewer".
  - Assert that when the mocked API returns an empty roadmap the UI renders a clear empty state message (e.g., "No roadmap available").

## 2. Task Implementation
- [ ] Add a scaffold UI module at src/ui/roadmap/RoadmapViewer.(tsx|jsx) (or the equivalent framework pattern). Implementation must:
  - Provide a minimal responsive layout: header toolbar, left epic list, main canvas area for DAG/Gantt, and a right-side detail panel placeholder.
  - Perform an initial fetch to GET /api/roadmap and render placeholder content while loading.
  - Export a testable mount point (RoadmapViewer) and a programmatic init function for webview integration (e.g., registerRoadmapWebview(app)).
  - Add minimal styling in src/ui/roadmap/roadmap.css (or .module.css) and ensure accessibility attributes are present.

## 3. Code Review
- [ ] Verify separation of concerns (data fetching separated from rendering), typed models (TypeScript) or prop-types, test coverage for the mount test, and accessible markup (roles/labels). Ensure no heavy layout computation runs synchronously in the top-level render.

## 4. Run Automated Tests to Verify
- [ ] Run the unit test: `npm test -- tests/ui/roadmap/01_scaffold.test` (or the repository equivalent). Tests must pass and the component must render the empty-state message.

## 5. Update Documentation
- [ ] Update docs/ or docs/ui.md with a short entry describing the RoadmapViewer scaffolding, its mount point, and any environment variables or backend endpoints it depends on (notably GET /api/roadmap).

## 6. Automated Verification
- [ ] Add a CI smoke check to run the single scaffold test in headless mode. As a local verification step, run `node ./scripts/verify_roadmap_scaffold.js` (script to be created by the agent) which mounts the component in a headless DOM and asserts the empty state exists.
