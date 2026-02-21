# Task: Implement update batching middleware with a 32ms flush interval (Sub-Epic: 45_Performance_Reactivity)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-044]

## 1. Initial Test Written
- [ ] Add unit tests at tests/unit/store/updateBatcher.test.ts that assert multiple setState calls inside a 32ms window result in a single downstream notification:
  - Use jest fake timers to schedule 5 setState calls within 10ms and assert the observer/flush handler is invoked exactly once after advancing timers by 32ms.
  - Verify merging semantics: last-write-wins for overlapping keys and that the merged patch matches expectations.

## 2. Task Implementation
- [ ] Implement an updateBatcher middleware at src/webview/store/updateBatcher.ts:
  - Expose function createUpdateBatcher({intervalMs = 32}) which returns middleware to wrap store.setState, buffering patches and scheduling a single flush after intervalMs.
  - Support explicit flush() to force immediate emit and support cancellation on unmount.
  - Ensure middleware coexists with subscribeWithSelector and does not break selector semantics; implement a minimal diff/merge strategy to combine patches.
  - Add configuration via environment variable or store config (UI_BATCH_INTERVAL_MS) so integration tests can override to a smaller interval.

## 3. Code Review
- [ ] Review merging logic for correctness and determinism (last-write-wins), ensure no race between immediate reads and batched writes.
- [ ] Confirm middleware is lightweight and does not copy whole store on each call; use shallow merges and only copy changed slices.
- [ ] Validate that explicit flush still triggers a single notify and that pending batched updates are cleared.

## 4. Run Automated Tests to Verify
- [ ] Run: npm test -- tests/unit/store/updateBatcher.test.ts and run a micro-integration test that performs 1k updates and asserts flush count ≈ ceil(totalTime / 32ms).

## 5. Update Documentation
- [ ] Document the batching middleware in docs/webview/batching.md including config knobs, merge semantics, and examples of when to call flush() manually.

## 6. Automated Verification
- [ ] Provide a script scripts/verify-batching.js that runs a simulated workload, records number of flushes, and asserts adherence to the 32ms interval rule. Wire this script to CI as an optional performance gate.