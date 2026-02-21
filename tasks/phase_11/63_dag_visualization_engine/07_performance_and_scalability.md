# Task: Performance testing, LOD, and scalability (Sub-Epic: 63_DAG_Visualization_Engine)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-075], [9_ROADMAP-TAS-704]

## 1. Initial Test Written
- [ ] Add performance harness and tests:
  - scripts/perf/generateDag.ts: script to generate synthetic DAG JSON with configurable node counts (100, 300, 1000, 5000).
  - tests/perf/layout.perf.test.ts: unit tests that assert the layout hook uses a worker for large graphs and that rendering pipeline switches to canvas when nodeCount exceeds threshold.
  - Add an automated smoke FPS measurement harness using requestAnimationFrame in a headless browser (Playwright) that records frame time for a mounted sample graph.

## 2. Task Implementation
- [ ] Implement LOD calculation utility at src/components/DAGCanvas/lod.ts that:
  - Computes levels for semantic zoom and returns which node detail tier (LOD-1/2/3) to render.
  - Integrates with RendererSelector to avoid rendering labels or heavy overlays in far LODs.
- [ ] Implement virtualization for label rendering: only render text for visible nodes per viewport and LOD.
- [ ] Add a simple telemetry emitter (local JSON output) for frame times and layout durations in scripts/perf/run-perf.ts.

## 3. Code Review
- [ ] Verify that LOD thresholds are configurable and documented.
- [ ] Ensure virtualization avoids layout thrashing and that memory allocations per frame are minimized.
- [ ] Validate fallback route to canvas renderer for very large graphs, with clear threshold comments.

## 4. Run Automated Tests to Verify
- [ ] Run: node scripts/perf/generateDag.ts --count=1000 && npm test -- tests/perf/layout.perf.test.ts and expect worker offload invoked and renderer fallback triggered.

## 5. Update Documentation
- [ ] Add a performance guide in docs/performance/dag.md describing thresholds, worker offload notes, and how to reproduce perf runs locally.

## 6. Automated Verification
- [ ] CI perf job: run the headless FPS harness against the 1000-node sample and fail the job if average frame time > 25ms or if worker offload was not used.