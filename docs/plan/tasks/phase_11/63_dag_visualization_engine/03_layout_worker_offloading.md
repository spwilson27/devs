# Task: Offload heavy layout calculations to a Web Worker (Sub-Epic: 63_DAG_Visualization_Engine)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-021], [9_ROADMAP-TAS-704]

## 1. Initial Test Written
- [ ] Add unit tests at tests/workers/forceLayout.worker.test.ts that:
  - Mock a Worker (or use worker-loader/jest-worker mocks) and assert that when offload flag is enabled, the layout hook posts an "init" message to the worker with nodes/links.
  - Mock worker messages returning positions and assert the hook consumes positions and updates subscribers.
  - Ensure the worker is terminated on unmount (assert postMessage/terminate called).

## 2. Task Implementation
- [ ] Implement src/workers/forceLayout.worker.ts (TypeScript) with a minimal protocol:
  - Messages: {type: 'init', payload:{nodes,links,options}}, {type:'tick', payload:{positions}}, {type:'stop'}
  - Compute layout using d3-force inside the worker and post position updates at a throttled interval (e.g., 60ms).
- [ ] Add a bridge in src/components/DAGCanvas/hooks/useForceLayout.ts that switches to worker mode when options.offload === true.
- [ ] Update bundler config (vite/webpack) to support bundling Web Workers (add worker rule or use new URL import syntax) and add docs/comments on required build flags.

## 3. Code Review
- [ ] Verify message schema is versioned and validated on both worker and main thread.
- [ ] Confirm worker errors are caught and cleanly propagated to UI with a recoverable fallback (local simulation).
- [ ] Ensure worker startup/termination lifecycle is tied to component mount/unmount.

## 4. Run Automated Tests to Verify
- [ ] Run: npm test -- tests/workers/forceLayout.worker.test.ts and ensure all worker-message flow tests pass.

## 5. Update Documentation
- [ ] Document the worker protocol in docs/components/dagcanvas.md and include configuration flags (offload: boolean) and bundler notes.

## 6. Automated Verification
- [ ] CI step: execute a headless unit test which toggles offload on a generated 100-node graph and asserts that the useForceLayout hook receives at least one worker 'tick' event within 2s.