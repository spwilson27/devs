# Task: Offload DAG Layout Calculations to a Web Worker (Sub-Epic: 65_DAG_Layering_Strategy)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-045-4]

## 1. Initial Test Written
- [ ] Unit & integration tests at `webview/src/components/DAGCanvas/__tests__/06_worker_offload.test.tsx`:
  - Unit test: mock a `Worker` and assert `DAGCanvas` posts an `init` message with nodes/edges and receives `tick`/`complete` messages that contain `Float32Array` position buffers (transferable).
  - Integration test: run the real worker in a headless environment (or a well-configured mock) and verify layout calculations happen off-main-thread and that the main thread receives periodic `tick` messages to update positions.
  - Performance test: measure main-thread busy time when computing layout for 2000 nodes and assert layout work does not block main thread (use sampling or instrumentation to verify minimal synchronous blocking).

## 2. Task Implementation
- [ ] Implement the worker-based layout pipeline:
  - Create worker source `webview/src/workers/dagLayout.worker.ts` (or `.js`) that runs `d3-force` simulation.
  - Worker message protocol:
    - `init` { nodes: [{id}], edges: [{source,target}], options }
    - `tick` -> send partial updates using a transferable `Float32Array` buffer containing `[x0,y0,x1,y1,...]` and an index mapping.
    - `complete` -> final positions and termination signal.
    - `terminate` -> stop and clean up the simulation.
  - Use transferable `ArrayBuffer` to minimize copies: `postMessage({type:'tick', buffer:positions.buffer}, [positions.buffer])`.
  - On main thread, update the positions map from worker messages and call `updateNodes/updateEdges` inside `requestAnimationFrame` to apply positions.
  - Provide a graceful fallback to run an incremental layout on the main thread when `Worker` is unavailable, exposing the same message-based API to simplify code paths.
  - Add configuration knobs to set tick frequency and maxIterations.

## 3. Code Review
- [ ] Verify:
  - Worker code has no DOM access and is fully serializable.
  - Transferable buffers are used and reallocated appropriately.
  - Main-thread applies updates in `rAF` and does not perform layout work synchronously.
  - Robust error handling and fallback when worker fails.

## 4. Run Automated Tests to Verify
- [ ] Run unit and integration tests validating the worker protocol; ensure worker and fallback paths are both covered in CI.

## 5. Update Documentation
- [ ] Update `docs/ui/dag_layering.md` and `docs/architecture/worker-offload.md`:
  - Include the message protocol, data formats (Float32Array layout), configuration knobs, and fallback behavior.

## 6. Automated Verification
- [ ] Add `scripts/verify-worker-offload.js` that runs a headless harness sending a medium-sized graph to the worker and asserting receipt of periodic `tick` and `complete` messages and that the main thread applies positions without blocking.
