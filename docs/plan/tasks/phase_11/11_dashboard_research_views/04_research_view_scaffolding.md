# Task: Scaffolding the Research View and Discovery Layout (Sub-Epic: 11_Dashboard_Research_Views)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-055]

## 1. Initial Test Written
- [ ] Write a unit test for the `ResearchView` component using React Testing Library to verify that it renders its multi-pane shell correctly.
- [ ] Write an integration test for the `ViewRouter` to ensure that navigating to the `RESEARCH` route correctly mounts the `ResearchView` component.
- [ ] Create a mock of the Zustand `useResearchStore` to verify that the `ResearchView` correctly selects research metadata (Market, Competitive, User Personas, Tech Landscape) from the global state.

## 2. Task Implementation
- [ ] Create the `ResearchView` component in `src/webview/views/ResearchView.tsx`.
- [ ] Implement the multi-pane layout for discovery as per `7_UI_UX_DESIGN-REQ-UI-DES-091`.
- [ ] Integrate the `ResearchView` with the `ViewRouter` (likely in `src/webview/components/Navigation/ViewRouter.tsx`).
- [ ] Ensure the component utilizes the `useResearchStore` hook to access research-specific data.
- [ ] Apply the platform-native "Ghost" design style as per `7_UI_UX_DESIGN-REQ-UI-DES-005`, ensuring it inherits VSCode theme variables (`--vscode-*`).
- [ ] Implement the "Incremental View Unlocking" logic to ensure the `ResearchView` is only accessible after Phase 1 (Discovery & Research) has started.

## 3. Code Review
- [ ] Verify that the `ResearchView` is correctly decoupled from the core orchestrator, using only the Zustand state mirror.
- [ ] Check that no hardcoded colors are used, adhering to `6_UI_UX_ARCH-REQ-004` (Theme-aware styling).
- [ ] Ensure that the component is memoized correctly to prevent unnecessary re-renders when other views update.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test` or the project-specific test runner to execute the new unit and integration tests.
- [ ] Verify that the `ResearchView` correctly reflects updates to the research state in the mock store.

## 5. Update Documentation
- [ ] Update the `RESEARCH_VIEW.agent.md` documentation to reflect the scaffolding and routing integration.
- [ ] Log the architectural decision for the Research multi-pane layout in the project's decision log.

## 6. Automated Verification
- [ ] Execute a CLI script (e.g., `scripts/verify-ui-route.ts`) to programmatically check if the `ResearchView` is reachable via the defined route in the `ViewRouter` manifest.
