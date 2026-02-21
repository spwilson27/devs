# Task: Benchmark harness for 60FPS animations (Sub-Epic: 49_Animation_Targets)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-059-1]

## 1. Initial Test Written
- [ ] Create an E2E benchmark test that measures average FPS over a 5 second window using requestAnimationFrame inside a real browser context (Playwright recommended). Write the test at tests/e2e/animation-benchmark.spec.ts and have it:
  - open a blank page (about:blank) and run page.evaluate to install a rAF loop that records timestamps for exactly 5000ms,
  - within each frame simulate a tight-but-representative small UI workload (e.g., read offsetHeight from a 100-element document fragment and toggle a lightweight CSS variable) to approximate typical webview layout cost,
  - compute average FPS = (frames - 1) / ((lastTs - firstTs) / 1000) and return it to the test harness,
  - assert average FPS >= 55 to allow minor CI noise while enforcing the 60FPS target.

Example Playwright snippet (put in the test file):

```ts
import { test, expect } from '@playwright/test';

test('animation average fps >= 55 over 5s', async ({ page }) => {
  const avgFps = await page.evaluate(async () => {
    return await new Promise<number>((resolve) => {
      const samples: number[] = [];
      const start = performance.now();
      let last = start;
      let frames = 0;

      // prepare small representative DOM workload
      const frag = document.createDocumentFragment();
      for (let i = 0; i < 100; i++) {
        const d = document.createElement('div');
        d.style.width = '1px';
        d.style.height = '1px';
        frag.appendChild(d);
      }
      document.body.appendChild(frag as any);

      function tick(ts: number) {
        samples.push(ts);
        frames++;
        // representative tiny work: read and toggle a property
        for (let i = 0; i < 10; i++) {
          void (document.body.children[i] as HTMLElement).offsetHeight;
        }
        document.documentElement.style.setProperty('--benchmark-tick', String(frames % 2));

        if (ts - start >= 5000) {
          const fps = (frames - 1) / ((ts - start) / 1000);
          resolve(fps);
          return;
        }
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  });

  expect(avgFps).toBeGreaterThan(55);
});
```

## 2. Task Implementation
- [ ] Implement a lightweight FrameMeter module at packages/webview/src/lib/frameMeter.ts with the following API surface: start(): void, stop(): void, reset(): void, getAverageFPS(windowMs?: number): number, subscribe(cb: (avgFps:number)=>void): () => void. Use requestAnimationFrame and performance.now to record timestamps and compute a sliding-window moving-average (use a circular buffer or typed array to minimize allocations).
- [ ] Expose hooks so the webview UI root can start the meter on mount and stop on unmount. Provide a dev-only export on window.__devsFrameMeter for CI debug runs.

## 3. Code Review
- [ ] Verify there is a single RAF-based meter instance per mounted webview root (no per-component RAFs).
- [ ] Ensure the implementation minimizes per-frame allocations (reuse arrays), unsubscribes on unmount, includes TypeScript types, and has unit tests covering start/stop/reset/getAverageFPS edge cases.

## 4. Run Automated Tests to Verify
- [ ] Run the e2e test: npx playwright test tests/e2e/animation-benchmark.spec.ts (or npm run test:e2e if a script is added). The test must return avg FPS >= 55; otherwise fail the PR.

## 5. Update Documentation
- [ ] Add an entry to docs/ui/animation.md describing the FrameMeter API, how to run the benchmark, CI expectations (threshold), and how to interpret test output.

## 6. Automated Verification
- [ ] Add a CI job step that runs the above Playwright test and fails the pipeline if the measured FPS is below the configured threshold. If Playwright cannot run in CI, add a fallback unit-level verification that runs a simulated FrameMeter workload and verifies getAverageFPS() returns >= 55 under the simulated workload.
