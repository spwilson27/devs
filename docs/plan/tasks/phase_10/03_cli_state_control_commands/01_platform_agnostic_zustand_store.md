# Task: Platform-Agnostic Zustand Store Implementation (Sub-Epic: 03_CLI State Control & Commands)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-035]

## 1. Initial Test Written
- [ ] Create unit tests in `packages/core/src/state/__tests__/orchestratorStore.test.ts` to verify the Zustand store's behavior in a Node.js environment.
- [ ] Test state transitions: Verify that calling `pause()`, `resume()`, and `updateTask()` correctly updates the store's internal state.
- [ ] Test middleware: Verify that a custom middleware correctly persists state changes to the `.devs/state.sqlite` via the `PersistenceManager`.
- [ ] Test reactivity: Verify that subscribers (simulating CLI Ink components or VSCode React components) receive updates when the state changes.

## 2. Task Implementation
- [ ] Define the `OrchestratorState` interface in `packages/core/src/state/types.ts`, including project status, current epic/task IDs, token usage, and agent telemetry.
- [ ] Implement the Zustand store in `packages/core/src/state/orchestratorStore.ts` using the `vanilla` (non-React) export to ensure compatibility with CLI/Node.js.
- [ ] Implement a `useOrchestratorStore` hook/wrapper in `packages/ui/src/hooks/useOrchestratorStore.ts` that exports the React version of the store for the VSCode extension.
- [ ] Integrate the store with the `PersistenceManager` to ensure that state changes are atomically flushed to SQLite.
- [ ] Ensure the store handles "Hydration" by loading the initial state from `.devs/state.sqlite` on startup.

## 3. Code Review
- [ ] Verify that the store does not use any browser-specific APIs (like `window` or `localStorage`) to maintain platform agnosticism.
- [ ] Ensure the store uses `immer` or similar for immutable state updates to prevent side effects in complex nested state objects.
- [ ] Check that the store's action methods are properly typed and handle error states gracefully.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test packages/core/src/state/__tests__/orchestratorStore.test.ts` and ensure 100% pass rate.
- [ ] Run a cross-platform check (e.g., using a simple Node script) to confirm the store works without React.

## 5. Update Documentation
- [ ] Update `docs/architecture/state-management.md` to describe the platform-agnostic store pattern and how it synchronizes CLI and VSCode.
- [ ] Add JSDoc comments to the store actions and state properties.

## 6. Automated Verification
- [ ] Run `npm run validate:state` (or a custom script) that initializes the store, performs a series of updates, and verifies the SQLite file matches the expected final state.
