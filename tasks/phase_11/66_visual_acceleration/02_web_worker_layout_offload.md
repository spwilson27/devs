# Task: Offload DAG layout to a Web Worker (Sub-Epic: 66_Visual_Acceleration)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-059-3]

## 1. Initial Test Written
- [ ] Write unit tests that validate the worker message protocol and that heavy layout computation is executed in a Worker context. Create test file: webview/src/workers/dagLayout.worker.spec.ts. Test steps:
  - Use a Worker mock (e.g., jest-webworker-mock) or provide a thin Worker wrapper that can be replaced with a synchronous mock in Node tests.
  - Verify that posting { type: 'layout', jobId, nodes, edges } to the worker results in a postMessage back with { type: 'layout:done', jobId, positions }.
  - Assert that when the DAGCanvas requests a layout, the main thread does not execute the d3-force layout function directly (spy on the d3 layout module in the main thread and expect it not to be called when worker is available).

## 2. Task Implementation
- [ ] Implement webview/src/workers/dagLayout.worker.ts exporting an onmessage handler that accepts layout jobs and replies with computed positions using d3-force (move heavy d3-force logic here). Implement a thin wrapper at webview/src/lib/dagLayout.ts that either spins up a Worker (new Worker(new URL('./dagLayout.worker.ts', import.meta.url))) or falls back to an in-thread implementation when Worker is unavailable.
  - Message protocol: { type: 'layout', jobId: string, payload: { nodes, edges, options } } -> worker computes positions -> postMessage({ type: 'layout:done', jobId, positions }).
  - Use transferable objects (Float32Array) for bulk buffers where possible to minimize copying.
  - Expose a Promise-based API: sendLayoutJob(payload) -> Promise<positions> which resolves on layout:done, and rejects on error/timeouts.
  - Add graceful timeouts and cancellation support (jobId-based) to avoid stale results.

## 3. Code Review
- [ ] Verify message protocol is versioned and documented, ensure transferable objects used for large buffers, ensure the worker handles errors and posts error messages back, confirm proper termination and reuse strategy (reuse worker across jobs instead of creating per-job), and ensure unit tests mock both success and error flows.

## 4. Run Automated Tests to Verify
- [ ] Run unit tests (npx jest webview/src/workers/dagLayout.worker.spec.ts or npx vitest run ...). Additionally run an integration smoke test that instantiates the DAGCanvas in a JSDOM/Headless environment, injects a worker mock, requests layout repeatedly, and asserts the main thread remained responsive (no direct call to d3-force in main thread spy).

## 5. Update Documentation
- [ ] Document the worker protocol in docs/ui/dag-worker.md with message formats, timeout defaults, cancellation semantics, and the recommended integration pattern for DAGCanvas.

## 6. Automated Verification
- [ ] Add a CI check (scripts/verify-dag-worker.sh) that runs the unit and integration tests and verifies the worker path is exercised and that the fallback path is tested (simulate no Worker support). Ensure the CI job fails on non-zero exit codes.