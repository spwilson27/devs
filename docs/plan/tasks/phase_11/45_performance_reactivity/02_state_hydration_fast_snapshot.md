# Task: Implement sub-second state hydration with snapshot + lazy rehydration (Sub-Epic: 45_Performance_Reactivity)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-005]

## 1. Initial Test Written
- [ ] Create an integration test at tests/integration/stateHydration.test.ts that measures end-to-end hydration time for a realistic initial snapshot and asserts total time < 1000ms on CI-like environment (use performance.now or process.hrtime for measurement).
  - Arrange: prepare a serialized snapshot representing Tier-1 (layout, session, small active task) + large Tier-2 list (500 items) stored in IndexedDB (mocked) or mocked vscode.getState.
  - Act: load the webview entrypoint and trigger the hydration flow.
  - Assert: first paint-ready markers (a DOM element with data-ready) are present and hydration timer < 1000ms.

## 2. Task Implementation
- [ ] Implement hydration utilities at src/webview/store/hydration.ts:
  - Provide two functions: createSnapshot(store) -> compact snapshot and hydrateSnapshot(snapshot, {lazy=false}) -> Promise.
  - Implement tiered hydration: immediately hydrate Tier-0/1 slices required for first paint; defer heavy Tier-2 data population via requestIdleCallback or a web worker.
  - Primary storage targets: attempt vscode.getState first for small snapshots; for larger snapshots use IndexedDB (use idb-keyval) and parse in a web worker to avoid main-thread parsing cost.
  - Add snapshot versioning and simple checksum to detect stale/invalid snapshots.
  - Instrument hydration with performance.mark/measure for telemetry and assertions.

## 3. Code Review
- [ ] Ensure snapshot shape is minimal (only fields required for initial UI) and stable across versions.
- [ ] Confirm worker usage is correct (no DOM access), and that fallback paths exist for environments without requestIdleCallback.
- [ ] Validate error handling: corrupt snapshot should not crash the webview; should fall back to empty initial state and log error.

## 4. Run Automated Tests to Verify
- [ ] Run: npm run test -- tests/integration/stateHydration.test.ts and validate timing assertions. Also run jest with --runInBand to reduce timing noise.

## 5. Update Documentation
- [ ] Update docs/webview/hydration.md describing snapshot schema, tier definitions, how to trigger manual snapshot/restore, and telemetry fields recorded (hydration_time_ms).

## 6. Automated Verification
- [ ] Add a CI job step or script scripts/benchmark-hydration.js that:
  - Writes a realistic snapshot to IndexedDB (or mock), launches the hydration flow headlessly (jsdom or light electron harness), measures hydration_time_ms, and fails CI if >= 1000ms.
  - Integrate this script under npm script "bench:hydration" for quick verification.