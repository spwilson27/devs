# Task: Implement real-time resource gauges (CPU / memory) (Sub-Epic: 24_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-032]

## 1. Initial Test Written
- [ ] Create unit tests at tests/unit/resource-gauges.spec.ts that validate a GaugeCollector module exposing getMetrics(): { cpuPercent:number, memoryBytes:number, rss:number } and emit events when thresholds cross. Use mocked process.cpuUsage and process.memoryUsage to simulate values.

## 2. Task Implementation
- [ ] Implement src/lib/monitor/gauges.ts with:
  - startSampling(intervalMs = 1000) and stopSampling()
  - getLatestMetrics() and an EventEmitter that emits 'threshold' events when metrics exceed configured thresholds.
  - Implement efficient sampling using process.cpuUsage()/os.totalmem() or third-party libs if available; keep sampling overhead minimal.
  - Expose an MCP metric endpoint or integrate with existing MCP server hooks for live scraping.

## 3. Code Review
- [ ] Ensure sampling interval is configurable, sampling is non-blocking, emitted metric payloads are small and typed, and that collector shuts down cleanly on process exit.

## 4. Run Automated Tests to Verify
- [ ] Run: npx vitest tests/unit/resource-gauges.spec.ts --run and confirm collector correctly reports mocked metrics and emits events on threshold breaches.

## 5. Update Documentation
- [ ] Document gauges in docs/risks/resource_gauges.md with configuration keys (SAMPLER_INTERVAL_MS, CPU_THRESHOLD_PERCENT, MEMORY_THRESHOLD_BYTES) and examples of how agents should subscribe to events.

## 6. Automated Verification
- [ ] Run a small script that starts the sampler, mocks a high-memory condition (if supported in test harness) and assert that the 'threshold' event is emitted and that an MCP endpoint exposes the same metrics.
