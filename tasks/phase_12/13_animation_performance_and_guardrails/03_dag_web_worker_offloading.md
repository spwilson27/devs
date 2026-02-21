# Task: Web Worker Offloading for DAG Canvas Layout (Sub-Epic: 13_Animation Performance and Guardrails)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-059], [7_UI_UX_DESIGN-REQ-UI-DES-059-3], [9_ROADMAP-REQ-036]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/__tests__/performance/`, create `dag-web-worker.test.ts`.
- [ ] Write a unit test using Vitest's `vi.stubGlobal('Worker', MockWorker)` to verify that `DAGLayoutWorker.computeLayout(nodes, edges)` posts a `{ type: 'COMPUTE_LAYOUT', payload: { nodes, edges } }` message to the worker and resolves the returned `Promise` with the layout result when the worker posts back `{ type: 'LAYOUT_RESULT', payload }`.
- [ ] Write a unit test that verifies if the Worker throws (posts `{ type: 'LAYOUT_ERROR' }`), the returned `Promise` rejects with an `Error` whose message matches the worker's error message.
- [ ] Write a test confirming that the main React thread's `requestAnimationFrame` callbacks are NOT blocked during a simulated 200ms layout computation (assert no jank using the `FPSMonitor` from Task 01).
- [ ] Write a test that `DAGLayoutWorker.terminate()` calls `worker.terminate()` and cancels any in-flight `Promise`.

## 2. Task Implementation
- [ ] Create `packages/webview-ui/src/workers/dagLayout.worker.ts`:
  - Import the `dagre` or `elkjs` layout engine (whichever is already used in `DAGCanvas`).
  - Listen for `message` events of type `COMPUTE_LAYOUT`, run the layout computation synchronously (acceptable in Worker thread), and `postMessage` a `LAYOUT_RESULT` back.
  - Wrap in `try/catch` and `postMessage` a `LAYOUT_ERROR` on exception.
  - Annotate with `/* @vite-env webworker */` so Vite bundles it as a separate chunk.
- [ ] Create `packages/webview-ui/src/performance/DAGLayoutWorker.ts`:
  - Instantiates `new Worker(new URL('../workers/dagLayout.worker.ts', import.meta.url), { type: 'module' })`.
  - Exposes `computeLayout(nodes: DAGNode[], edges: DAGEdge[]): Promise<DAGLayout>` using a `Map<string, { resolve, reject }>` keyed by `requestId` (UUID) to correlate requests with responses.
  - Exposes `terminate(): void`.
- [ ] Refactor `packages/webview-ui/src/components/DAGCanvas/DAGCanvas.tsx`:
  - Replace the inline `dagre.layout()` synchronous call with `await DAGLayoutWorker.computeLayout(nodes, edges)` inside a `useEffect`.
  - Show a loading skeleton on the canvas while the Promise is pending.
- [ ] Add `dagLayout.worker.ts` to `vite.config.ts` worker entry points if not auto-detected.

## 3. Code Review
- [ ] Verify that the `DAGLayoutWorker` singleton is instantiated once at app bootstrap (not per-component render) to avoid spawning multiple Worker threads.
- [ ] Confirm that `nodes` and `edges` data passed to the Worker are plain serializable objects (no class instances, no circular refs) to avoid `DataCloneError`.
- [ ] Check that the loading skeleton in `DAGCanvas` uses a CSS `opacity` transition (not layout-affecting properties) to avoid causing a reflow during Worker computation.
- [ ] Ensure the worker file is excluded from the main bundle via Vite's `worker` configuration and appears as a separate `.js` file in the build output.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test --reporter=verbose packages/webview-ui/src/__tests__/performance/dag-web-worker.test.ts` and confirm all assertions pass.
- [ ] Run `pnpm --filter @devs/webview-ui build` and verify the build succeeds with a separate `dagLayout.worker-[hash].js` artifact in `dist/`.

## 5. Update Documentation
- [ ] Add a `## Web Workers` section to `packages/webview-ui/AGENT.md` documenting `DAGLayoutWorker` API, the message protocol (`COMPUTE_LAYOUT` / `LAYOUT_RESULT` / `LAYOUT_ERROR`), and the rule that all CPU-intensive layout computations MUST use this worker.
- [ ] Update `docs/architecture/animation-system.md` to include the Worker offloading architecture.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test:ci` and verify exit code is `0`.
- [ ] Run `node scripts/verify-worker-bundle.js` (create if absent): reads the Vite build manifest and asserts that `dagLayout.worker` is present as a separate chunk, exiting non-zero if it is inlined into `main.js`.
