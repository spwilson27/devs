# Task: Implement ActivityFeed Component (Sub-Epic: 07_Project Dashboard Modules)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-090-2]

## 1. Initial Test Written
- [ ] Create `packages/webview-ui/src/components/dashboard/__tests__/ActivityFeed.test.tsx`.
- [ ] Write a unit test that renders `<ActivityFeed commits={[]} />` and asserts the empty-state message "No activity yet" is visible.
- [ ] Define a `TaskCommit` fixture type: `{ id: string; taskId: string; taskName: string; agentId: string; timestamp: string /* ISO 8601 */; phase: string }`.
- [ ] Write a test passing exactly 10 commits and asserting:
  - 10 list items are rendered, each with `data-commit-id` matching the commit's `id`.
  - Each item displays the `agentId`, a human-readable relative time derived from `timestamp`, and the `taskName`.
- [ ] Write a test passing 15 commits and asserting that only the **10 most recent** are rendered (sorted descending by `timestamp`).
- [ ] Write a test that simulates an `activity:commit` event arriving on the mock `EventBus` and asserts the feed prepends the new commit and drops the oldest if length exceeds 10.
- [ ] Write an accessibility test confirming the list has `role="feed"`, each item has `role="article"`, and that a live region (`aria-live="polite"`) announces new entries.
- [ ] Confirm all tests **fail** before implementation.

## 2. Task Implementation
- [ ] Create `packages/webview-ui/src/components/dashboard/ActivityFeed.tsx`.
- [ ] Define the `TaskCommit` interface: `{ id: string; taskId: string; taskName: string; agentId: string; timestamp: string; phase: string }`.
- [ ] Define component props: `{ commits: TaskCommit[]; className?: string }`.
- [ ] Sort incoming `commits` descending by `timestamp` and slice to the first 10 before rendering.
- [ ] Render a `<ul role="feed" aria-label="Recent activity">` wrapper.
- [ ] For each commit render a `<li role="article" data-commit-id={commit.id}>` containing:
  - Agent avatar/icon identified by `agentId` (render initials in a colored circle, color derived by hashing `agentId`).
  - `<strong>{commit.taskName}</strong>` as the primary label.
  - `<span>{commit.agentId}</span>` as the secondary label.
  - A relative timestamp (e.g., "3 minutes ago") computed via a pure `formatRelativeTime(isoString: string): string` utility in `packages/webview-ui/src/utils/time.ts`.
  - A `<span className="phase-badge">{commit.phase}</span>`.
- [ ] Add an `aria-live="polite"` `<div>` that announces the latest commit's `taskName` when the list changes (use `useEffect` watching the first item's `id`).
- [ ] Create `packages/webview-ui/src/hooks/useActivityFeed.ts`. This hook subscribes to `activity:commit` events on the RTES `EventBus`, maintains a local state array capped at 10 items (prepend new, drop oldest), and returns `TaskCommit[]`.
- [ ] Implement `formatRelativeTime` in `packages/webview-ui/src/utils/time.ts` supporting seconds, minutes, hours, and days buckets. Export it as a named export.
- [ ] Export the component from `packages/webview-ui/src/components/dashboard/index.ts`.

## 3. Code Review
- [ ] Verify the 10-item cap and descending sort logic are implemented as a pure `selectRecentCommits(commits: TaskCommit[]): TaskCommit[]` utility function, unit-tested separately.
- [ ] Confirm `formatRelativeTime` is a pure function with no `Date.now()` calls inside; it must accept an optional `now` parameter (defaulting to `Date.now()`) to keep tests deterministic.
- [ ] Verify `useActivityFeed` unsubscribes from the `EventBus` in its cleanup function (returned from `useEffect`) to prevent memory leaks.
- [ ] Confirm the component uses `React.memo` to avoid re-renders when the `commits` array reference has not changed.
- [ ] Ensure no more than one `aria-live` region is rendered; confirm the announcement text does not accumulate duplicates on rapid updates.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern=ActivityFeed` and confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern=time` to confirm `formatRelativeTime` unit tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --coverage --testPathPattern="ActivityFeed|time"` and confirm line coverage ≥ 90%.

## 5. Update Documentation
- [ ] Add a JSDoc block at the top of `ActivityFeed.tsx` describing the `TaskCommit` shape, sorting behaviour, 10-item cap, and live-region accessibility pattern.
- [ ] Add a `## ActivityFeed` section to `docs/ui-components.md` with: purpose, prop table, `useActivityFeed` hook data flow diagram (Mermaid: `EventBus` → `useActivityFeed` → `ActivityFeed`), and truncation rule.
- [ ] Update `memory/phase_12_decisions.md`: `ActivityFeed caps at 10 items, sorted descending by ISO timestamp; formatRelativeTime accepts optional now param for testability`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test -- --ci --forceExit --testPathPattern="ActivityFeed|time"` and assert exit code is `0`.
- [ ] Run `pnpm --filter @devs/webview-ui build` and assert exit code is `0`.
