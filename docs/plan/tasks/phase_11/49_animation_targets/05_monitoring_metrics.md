# Task: Add monitoring and metrics for animation health (Sub-Epic: 49_Animation_Targets)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-059-1], [7_UI_UX_DESIGN-REQ-UI-RISK-004]

## 1. Initial Test Written
- [ ] Create unit tests for a small metrics collector at packages/webview/src/lib/animation/metrics.test.ts. The first test should:
  - instantiate the metrics collector, record synthetic frame times and throttler events (processedCount, droppedCount, queueDepth samples),
  - assert exported metrics contain fields: averageFPS, minFPS, maxFPS, droppedCount, lastQueueDepth, and a time series of recent frameTimes,
  - assert that metrics serialization (to JSON) is below a small size threshold and that snapshotting does not mutate internal buffers.

## 2. Task Implementation
- [ ] Implement packages/webview/src/lib/animation/metrics.ts to capture low-overhead runtime metrics:
  - capture per-frame timestamps from FrameMeter and expose average/min/max FPS computed over a sliding window,
  - increment counters for throttler.processedCount and throttler.droppedCount (metrics consumer should subscribe to throttler events),
  - expose an async snapshot() API that returns a compact JSON structure { averageFPS, minFPS, maxFPS, droppedCount, queueDepth, sampleMs } for CI and telemetry consumption,
  - add a debug overlay (dev-only) component that can render the current averageFPS and queueDepth in the webview UI when a feature flag is enabled (window.__devsShowMetrics = true).

## 3. Code Review
- [ ] Verify metrics code incurs minimal allocations per-frame (use pooled arrays or typed arrays), exposes a stable snapshot contract, and that sensitive data is not leaked in telemetry snapshots. Also verify tests cover serialization and edge cases (no frames yet, extremely high drop counts).

## 4. Run Automated Tests to Verify
- [ ] Run unit tests and integration tests that exercise metrics snapshotting. Validate that CI artifact includes the metrics JSON and that the structure matches the test contract.

## 5. Update Documentation
- [ ] Document the metrics contract in docs/telemetry/animation-metrics.md listing fields, sampling window defaults, and how to enable the dev overlay.

## 6. Automated Verification
- [ ] Add a CI verification step that runs the integration stress harness (from task 03/04) and fails if metrics snapshot shows sustained averageFPS below the configured threshold or an unexpected increase in droppedCount (thresholds documented in the metrics doc).