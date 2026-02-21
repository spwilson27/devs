# Task: CLI Progress Bar for Research Phase (Sub-Epic: 11_User Interface & Progress Reporting)

## Covered Requirements
- [4_USER_FEATURES-REQ-025]

## 1. Initial Test Written
- [ ] In `packages/cli/src/__tests__/ResearchProgressBar.test.tsx`, write unit tests using `ink-testing-library` for the `ResearchProgressBar` Ink component:
  - Test: renders the text `[Scraping competitors...]` when `phase === 'scraping_competitors'`.
  - Test: renders `[Fetching market data...]` when `phase === 'fetching_market'`.
  - Test: renders `[Analyzing technology landscape...]` when `phase === 'analyzing_tech'`.
  - Test: renders `[Mapping user journeys...]` when `phase === 'mapping_users'`.
  - Test: renders a percentage completion value (e.g., `42%`) when `props.percent` is provided.
  - Test: renders a filled progress bar (`█`) proportional to `props.percent` out of a 40-character bar width.
  - Test: renders `[Done]` and a full bar when `phase === 'done'`.
  - Test: component unmounts cleanly without console errors.
- [ ] In `packages/cli/src/__tests__/ResearchProgressBarStream.test.ts`, write an integration test verifying that emitting a `RESEARCH_PROGRESS` event from the core `EventEmitter` causes the rendered Ink output to update the phase label and percentage.

## 2. Task Implementation
- [ ] Create `packages/cli/src/components/ResearchProgressBar.tsx`:
  - Accept props: `phase: ResearchPhase`, `percent: number` (0–100), `queryLabel?: string`.
  - Use Ink's `<Box>`, `<Text>` components and `chalk` for color (green for in-progress, gray for done).
  - Render a 40-character wide ASCII progress bar using `█` (filled) and `░` (empty) characters.
  - Display the phase label in brackets, e.g., `[Scraping competitors...]`.
  - Optionally display `queryLabel` below the bar (the current search query string), truncated to terminal width.
  - Export a `ResearchPhase` union type: `'scraping_competitors' | 'fetching_market' | 'analyzing_tech' | 'mapping_users' | 'done'`.
- [ ] Create `packages/cli/src/hooks/useResearchProgress.ts`:
  - Subscribe to the core process `EventEmitter` for `RESEARCH_PROGRESS` events.
  - Maintain state: `{ phase: ResearchPhase, percent: number, queryLabel: string }`.
  - Return current state; update on each event.
  - Clean up the event listener on unmount (use `useEffect` cleanup).
- [ ] In `packages/cli/src/commands/start.tsx` (or the relevant command entry point), render `<ResearchProgressBar>` within the Ink `<App>` component during Phase 1 execution, driven by `useResearchProgress`.
- [ ] Ensure the core agent emits `RESEARCH_PROGRESS` events with payload `{ phase: ResearchPhase, percent: number, queryLabel: string }` from `ResearchManager` at appropriate checkpoints (query dispatch, URL scrape complete, report finalized).

## 3. Code Review
- [ ] Verify `ResearchProgressBar` has no side effects — it is a pure presentational component driven entirely by props.
- [ ] Verify `useResearchProgress` correctly removes the event listener in the `useEffect` cleanup to prevent memory leaks.
- [ ] Confirm the progress bar width calculation uses `Math.round((percent / 100) * 40)` and never exceeds 40 characters.
- [ ] Confirm all phase label strings match the exact format specified in `4_USER_FEATURES-REQ-025` (e.g., `[Scraping competitors...]`).
- [ ] Verify the component degrades gracefully in non-TTY environments (falls back to plain text log lines).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter cli test` and confirm all new tests pass with zero failures.
- [ ] Run `pnpm --filter cli build` to verify TypeScript compilation succeeds with no errors.
- [ ] Run `pnpm --filter cli lint` to confirm no ESLint errors.

## 5. Update Documentation
- [ ] Document the `ResearchProgressBar` component in `packages/cli/docs/components.md` with the full list of supported phases, prop types, and an ASCII example of the rendered output.
- [ ] Document the `RESEARCH_PROGRESS` event payload schema in `docs/ipc-events.md` under a new section "Research Phase Events".
- [ ] Update the agent memory file `docs/agent-memory/phase_5.md` to record: "CLI uses Ink-based `ResearchProgressBar` component fed by `RESEARCH_PROGRESS` IPC events emitted by `ResearchManager`."

## 6. Automated Verification
- [ ] Run `pnpm --filter cli test --coverage` and assert coverage for `ResearchProgressBar.tsx` and `useResearchProgress.ts` is ≥ 90%.
- [ ] Run `node scripts/verify_task.mjs --task 02_cli_progress_bar_research_phase` to confirm the `RESEARCH_PROGRESS` event is emitted from `ResearchManager` at a minimum of 3 distinct checkpoints (verifiable via a grep of the source file).
