# Task: Implement API Connectivity Status Indicators UI Component (Sub-Epic: 09_System Health and Performance Profiling)

## Covered Requirements
- [4_USER_FEATURES-REQ-070]

## 1. Initial Test Written

- [ ] In `packages/webview-ui/src/components/health/__tests__/ConnectivityStatusPanel.test.tsx`, write React Testing Library tests:
  - Render `<ConnectivityStatusPanel />` with a mock event context; assert three rows are displayed: "Gemini API", "Docker", and "Search Provider".
  - Assert each row shows an initial "Unknown" or loading indicator before the first event arrives.
  - Simulate a `system.connectivity.status` event where all services are `ok: true`; assert all three indicators render a green dot (or equivalent `data-status="ok"` attribute).
  - Simulate an event where `geminiApi.ok === false` with `error: "ECONNREFUSED"`; assert the Gemini row shows a red indicator and renders the error string in a tooltip or `aria-label`.
  - Assert `latencyMs` is displayed next to each row when the service is `ok: true` (e.g., `"12ms"`).
  - Assert the component uses `role="status"` and `aria-live="polite"` so screen readers are notified on status changes.
  - Assert that the component re-renders only the changed row when a new event arrives (use `jest.spyOn` on the row's render function or verify via test IDs).
  - Write a snapshot test for the all-services-healthy state.

## 2. Task Implementation

- [ ] Create `packages/webview-ui/src/components/health/ConnectivityStatusPanel.tsx`:
  - Subscribe to `system.connectivity.status` events from the RTES event consumer context.
  - Maintain local state: `status: ConnectivityStatus | null`.
  - Render a panel with three `<ServiceStatusRow>` sub-components, one per service.
  - Add `role="status"` and `aria-live="polite"` on the panel container.
- [ ] Create `packages/webview-ui/src/components/health/ServiceStatusRow.tsx`:
  - Accept props: `label: string`, `serviceStatus: ServiceStatus | null`.
  - Render a colored dot indicator: green (`var(--vscode-charts-green)`) when `ok: true`, red (`var(--vscode-charts-red)`) when `ok: false`, grey when `null`.
  - Set `data-status="ok" | "error" | "unknown"` on the indicator element for testability.
  - Display `latencyMs` in a muted span (e.g., `"14ms"`) when `ok: true`; hide when `null`.
  - Display an error tooltip (using VSCode's `title` attribute or a custom tooltip component) with the `error` string when `ok: false`.
  - Wrap in `React.memo`.
- [ ] Export `ConnectivityStatusPanel` from `packages/webview-ui/src/components/health/index.ts`.
- [ ] Add `ConnectivityStatusPanel` to the `HealthTelemetry` panel layout beneath `ResourceGauges`.

## 3. Code Review

- [ ] Confirm no logic for performing connectivity checks is inside the UI component; it only reads events from the bus.
- [ ] Confirm `aria-live="polite"` is present so assistive technologies announce changes without interrupting the user.
- [ ] Confirm `ServiceStatusRow` is wrapped in `React.memo` and only re-renders when its own `serviceStatus` prop changes.
- [ ] Confirm all colors use VSCode CSS variables.
- [ ] Confirm the component renders correctly in both the VSCode webview context and Storybook (if Storybook is configured).

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="ConnectivityStatusPanel"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --coverage --testPathPattern="ConnectivityStatusPanel"` and confirm line/branch coverage ≥ 85%.

## 5. Update Documentation

- [ ] Add TSDoc comments to `ConnectivityStatusPanel` and `ServiceStatusRow` describing props and behavior.
- [ ] Update `packages/webview-ui/README.md` to list `ConnectivityStatusPanel` in the "Health & Telemetry" section.
- [ ] Update `docs/agent_memory/phase_12_decisions.md`: "`ConnectivityStatusPanel` renders three `ServiceStatusRow` components (Gemini API, Docker, Search Provider). Data flows from `system.connectivity.status` events. Individual rows are memoized."

## 6. Automated Verification

- [ ] CI runs `pnpm --filter @devs/webview-ui test -- --ci --testPathPattern="ConnectivityStatusPanel"` and exits code 0.
- [ ] Snapshot `ConnectivityStatusPanel.test.tsx.snap` is committed and current.
- [ ] Run `pnpm --filter @devs/webview-ui build` and confirm zero TypeScript errors.
