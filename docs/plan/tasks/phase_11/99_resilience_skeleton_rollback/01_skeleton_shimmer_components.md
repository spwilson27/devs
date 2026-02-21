# Task: Implement Skeleton Shimmer Loader Components for Dashboard & DAG (Sub-Epic: 99_Resilience_Skeleton_Rollback)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-086], [7_UI_UX_DESIGN-REQ-UI-DES-086-1]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/components/skeletons/__tests__/`, create `SkeletonTile.test.tsx` and `SkeletonDAG.test.tsx`.
- [ ] **`SkeletonTile.test.tsx`**:
  - Write a test that renders `<SkeletonTile />` and asserts it contains an element with `data-testid="skeleton-tile"`.
  - Write a test asserting the rendered element has `animationName` or inline `background` style referencing a shimmer keyframe gradient (use `getComputedStyle` or assert a CSS class that maps to the shimmer animation).
  - Write a test confirming `aria-busy="true"` and `aria-label="Loading..."` are present on the skeleton container for accessibility.
- [ ] **`SkeletonDAG.test.tsx`**:
  - Write a test that renders `<SkeletonDAG />` and asserts it renders at least 5 placeholder node rectangles (`data-testid="skeleton-dag-node"`).
  - Write a test confirming the shimmer animation class is applied to each node placeholder.
  - Write a test ensuring `role="status"` and `aria-label="Loading roadmap..."` are present on the DAG skeleton wrapper.
- [ ] In `packages/vscode/src/webview/hooks/__tests__/`, create `useSkeletonState.test.ts`:
  - Write a test that calls `useSkeletonState()` in a component that starts with `isSyncing: true`, and asserts `showSkeleton` is `true`.
  - Write a test that transitions `isSyncing` to `false` and asserts `showSkeleton` becomes `false` after a 200ms debounce (use `jest.useFakeTimers()`).
- [ ] In `packages/vscode/src/webview/styles/__tests__/`, create `shimmer.css.test.ts`:
  - Write a test that imports the shimmer CSS module and asserts `shimmer` class is defined and references `--vscode-editor-lineHighlightBackground` CSS variable (parse the stylesheet string).

## 2. Task Implementation
- [ ] **CSS / Tailwind shimmer animation**: In `packages/vscode/src/webview/styles/shimmer.css`, define a `@keyframes shimmer` animation:
  ```css
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  .shimmer {
    background: linear-gradient(
      90deg,
      var(--vscode-editor-lineHighlightBackground) 25%,
      color-mix(in srgb, var(--vscode-editor-lineHighlightBackground) 60%, transparent) 50%,
      var(--vscode-editor-lineHighlightBackground) 75%
    );
    background-size: 800px 100%;
    animation: shimmer 1.5s infinite linear;
  }
  ```
- [ ] **`SkeletonTile` component**: Create `packages/vscode/src/webview/components/skeletons/SkeletonTile.tsx`:
  - Renders a `<div>` with `data-testid="skeleton-tile"`, `aria-busy="true"`, `aria-label="Loading..."`, and `className="shimmer"`.
  - Accept a `height?: string` prop (default `"64px"`) and a `width?: string` prop (default `"100%"`) applied via inline style.
  - Export as named export `SkeletonTile`.
- [ ] **`SkeletonDAG` component**: Create `packages/vscode/src/webview/components/skeletons/SkeletonDAG.tsx`:
  - Renders a `<div role="status" aria-label="Loading roadmap...">` wrapping an `<svg>`.
  - Within the SVG, render 8 `<rect>` elements with `data-testid="skeleton-dag-node"` and `className="shimmer"`, arranged in a grid pattern (e.g., 2 columns, 4 rows, with 180×64 dimensions matching `7_UI_UX_DESIGN-REQ-UI-DES-046-1`).
  - Connect placeholder rects with simple `<line>` elements to mimic DAG edges.
- [ ] **`useSkeletonState` hook**: Create `packages/vscode/src/webview/hooks/useSkeletonState.ts`:
  - Reads `isSyncing` from the Zustand global UI store (Tier 2 state slice).
  - Returns `{ showSkeleton: boolean }`.
  - Implements a 200ms debounce before setting `showSkeleton` to `false` after `isSyncing` becomes `false` to prevent flash of content.
- [ ] **Dashboard integration**: In `packages/vscode/src/webview/views/DashboardView.tsx`:
  - Import `useSkeletonState` and `SkeletonTile`.
  - For each Dashboard tile (Epic Progress, Phase Stepper, Active Task Card, Token Budget), conditionally render `<SkeletonTile />` when `showSkeleton === true`.
- [ ] **Roadmap DAG integration**: In `packages/vscode/src/webview/views/RoadmapView.tsx` (or `DAGCanvas.tsx`):
  - Conditionally render `<SkeletonDAG />` when `showSkeleton === true`, replacing the real DAGCanvas.
- [ ] **Zustand store**: Ensure `isSyncing` is set to `true` at the start of Tier 2 state hydration (`sync_all` message receipt) and set to `false` upon completion, in `packages/vscode/src/webview/store/uiStore.ts`.

## 3. Code Review
- [ ] Verify that the shimmer CSS uses only `--vscode-editor-lineHighlightBackground` (a VSCode design token) — no hardcoded color hex values, per `6_UI_UX_ARCH-REQ-004`.
- [ ] Verify `SkeletonTile` and `SkeletonDAG` have no logic coupling to data layer — they are purely presentational.
- [ ] Verify `useSkeletonState` is the single source of truth for skeleton visibility; no ad-hoc `isSyncing` reads are scattered across components.
- [ ] Confirm the `shimmer` CSS class is imported via the CSS module pattern compatible with the Shadow DOM isolation strategy (`6_UI_UX_ARCH-REQ-070`).
- [ ] Confirm all skeleton elements have appropriate ARIA attributes (`aria-busy`, `role="status"`) satisfying WCAG 2.1 AA per `7_UI_UX_DESIGN-REQ-UI-DES-084-1`.
- [ ] Confirm `SkeletonDAG` node placeholder dimensions (180×64) match `7_UI_UX_DESIGN-REQ-UI-DES-046-1`.

## 4. Run Automated Tests to Verify
- [ ] Run: `pnpm --filter @devs/vscode test -- --testPathPattern="skeletons|useSkeletonState|shimmer"` and confirm all tests pass with zero failures.
- [ ] Run the full webview test suite: `pnpm --filter @devs/vscode test` and confirm no regressions.

## 5. Update Documentation
- [ ] Update `packages/vscode/src/webview/components/skeletons/README.agent.md` (create if absent) to document: component API, the shimmer CSS variable dependency, and the `useSkeletonState` hook contract.
- [ ] Update `packages/vscode/src/webview/hooks/README.agent.md` to describe `useSkeletonState` return value and debounce timing.
- [ ] Add a note in the phase 11 agent memory log (`tasks/phase_11/agent_memory.md`) recording that skeleton components are gated by `isSyncing` in the Zustand store.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode test -- --coverage --testPathPattern="skeletons|useSkeletonState|shimmer"` and assert coverage for `SkeletonTile.tsx`, `SkeletonDAG.tsx`, and `useSkeletonState.ts` is ≥ 90%.
- [ ] Run `grep -r "hardcoded\|#[0-9a-fA-F]\{3,6\}\|rgb(" packages/vscode/src/webview/styles/shimmer.css` and assert zero matches (no hardcoded colors).
- [ ] Run `pnpm --filter @devs/vscode build` and assert the build succeeds without warnings related to these new files.
