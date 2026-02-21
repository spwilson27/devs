# Task: Security Alert Table Webview Component (Sub-Epic: 20_Security Alert Table and Escalation UI)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-075]

## 1. Initial Test Written
- [ ] In `src/webview/__tests__/SecurityAlertTable.test.tsx`, write React Testing Library tests for a `<SecurityAlertTable />` component:
  - Test that when given an empty `alerts` prop, the component renders a "No security alerts" empty-state message.
  - Test that when given a list of `SecurityAlert` objects, each row renders: `type` badge (color-coded by type), `agent_id`, truncated `detail` summary, `severity` badge, human-readable `timestamp` (via `date-fns` `formatDistanceToNow`), and an "Acknowledge" button.
  - Test that clicking the "Acknowledge" button on a row calls the `onAcknowledge(id: string)` callback with the correct alert `id`.
  - Test that acknowledged rows (where `acknowledged === 1`) render with a visual strike-through or muted style and the "Acknowledge" button is disabled.
  - Test that the table supports filtering by `type` via a dropdown; selecting "NETWORK_VIOLATION" hides rows of other types.
  - Test that the table supports sorting by `timestamp` descending (default) and ascending.
  - Test that clicking on a row expands an inline detail panel showing the full `detail` JSON formatted as a code block.
  - All tests must be written using `@testing-library/react` and must fail before implementation.

## 2. Task Implementation
- [ ] Create `src/webview/components/SecurityAlertTable.tsx`:
  - Props interface: `{ alerts: SecurityAlert[]; onAcknowledge: (id: string) => void; }`.
  - Render a `<table>` with columns: Type | Agent | Summary | Severity | Time | Action.
  - Use a `typeBadgeColor` map: `NETWORK_VIOLATION → red`, `FILESYSTEM_VIOLATION → orange`, `RESOURCE_DOS → yellow`, `REDACTION_HIT → blue`.
  - Severity badge colors: `CRITICAL → red`, `HIGH → orange`, `MEDIUM → yellow`, `LOW → green`.
  - Implement local state for `filterType` (default: `'ALL'`) and `sortOrder` (`'desc'` | `'asc'`).
  - Implement local state for `expandedRowId: string | null` to show/hide the detail JSON panel.
  - Derive filtered + sorted display list from `alerts` prop using `useMemo`.
  - Render a `<select>` dropdown for type filter with options `ALL | NETWORK_VIOLATION | FILESYSTEM_VIOLATION | RESOURCE_DOS | REDACTION_HIT`.
  - Render a "↑↓ Time" sort toggle button.
  - "Acknowledge" button calls `onAcknowledge(alert.id)` and is `disabled` when `alert.acknowledged === 1`.
  - Use Tailwind CSS utility classes consistent with the existing webview design system.
- [ ] Create `src/webview/components/SecurityAlertTable.agent.md` (stub – detailed in Task 05 docs step).
- [ ] Wire the component into the main dashboard panel `src/webview/panels/DashboardPanel.tsx`:
  - Add a `"Security Alerts"` tab alongside existing tabs.
  - On tab activation, dispatch a `GET_SECURITY_ALERTS` message to the extension host.
  - Handle `SECURITY_ALERTS_RESPONSE` message to update local `alerts` state.
  - On "Acknowledge" button click, dispatch `ACKNOWLEDGE_SECURITY_ALERT` message with the alert `id`.
- [ ] In the extension host message handler (`src/extension/webviewMessageHandler.ts`):
  - Handle `GET_SECURITY_ALERTS`: call `securityAlertLogger.getAlerts({ limit: 200 })` and post `SECURITY_ALERTS_RESPONSE` back.
  - Handle `ACKNOWLEDGE_SECURITY_ALERT`: call `securityAlertLogger.acknowledgeAlert(id)`, then post an updated `SECURITY_ALERTS_RESPONSE`.
- [ ] Ensure the `SecurityAlert` type is imported from `src/security/types.ts` (shared between extension host and webview via a `shared/` re-export path alias).

## 3. Code Review
- [ ] Verify no direct SQLite calls exist in the webview component – all data flows through the VS Code message-passing API.
- [ ] Verify `useMemo` is used for the filtered/sorted list to avoid recomputation on every render.
- [ ] Verify the `onAcknowledge` callback is not called when the button is `disabled`.
- [ ] Verify all interactive elements (buttons, select) have `aria-label` attributes for accessibility.
- [ ] Verify the component does not import any Node.js built-ins (`fs`, `path`, `better-sqlite3`).
- [ ] Verify Tailwind classes align with the design system palette defined in `src/webview/tailwind.config.js`.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="SecurityAlertTable"` and confirm all tests pass.
- [ ] Run `npm run lint` and confirm zero lint errors.
- [ ] Run `npm run typecheck` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Create `src/webview/components/SecurityAlertTable.agent.md` documenting:
  - Component props and their types.
  - The message protocol (`GET_SECURITY_ALERTS`, `SECURITY_ALERTS_RESPONSE`, `ACKNOWLEDGE_SECURITY_ALERT`).
  - How to extend with new alert types.
- [ ] Update `src/webview/README.md` to list `SecurityAlertTable` in the component inventory.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="SecurityAlertTable" --coverage` and confirm coverage ≥ 90% for `src/webview/components/SecurityAlertTable.tsx`.
- [ ] Run `npm run build:webview` and confirm the build succeeds with no errors.
