# Task: Implement Battery Saver Mode Throttling (Sub-Epic: 66_Visual_Acceleration)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-087-1]

## 1. Initial Test Written
- [ ] Write unit tests for a battery-throttle hook that reduces DAGCanvas FPS when Battery Saver is active. Create test file: webview/src/hooks/useBatteryThrottle.spec.ts. Test steps:
  - Mock navigator.getBattery() to return a Promise resolving to an object with a .charging and .level and .onchange property; simulate a battery-saver flag by using .level or platform-specific API edge cases (or mock a boolean isBatterySaver getter if polyfilled).
  - Import { useBatteryThrottle } (or create a pure function getBatteryThrottleConfig) and assert that when battery-saver mode is simulated, the returned refresh target is 15 FPS, otherwise 60 FPS.
  - Test that the hook registers/unregisters event listeners on getBattery when mounted/unmounted (simulate with the test harness that can mount hooks or call lifecycle functions directly).

## 2. Task Implementation
- [ ] Implement webview/src/hooks/useBatteryThrottle.ts (or a pure helper webview/src/lib/batteryThrottle.ts) that:
  - Detects battery-saver mode using navigator.getBattery() where available; provide a fallback using the prefers-reduced-motion media query if battery API is absent.
  - Exposes an API: getVisualRefreshTarget(): number (returns 15 when battery saver, 60 otherwise) and a React hook useBatteryThrottle() that returns { targetFps, isBatterySaver } and subscribes to battery change events.
  - Integrate this API into DAGCanvas and the Graph Throttling Debouncer so that the interval and request scheduling respect the battery-saver throttle (for example, increase interval to 66ms to approximate 15 FPS or disable expensive visual effects).
  - Provide configuration flags to manually override battery detection for testing and for user preference in settings.

## 3. Code Review
- [ ] Ensure the detection is robust: gracefully handle browsers without navigator.getBattery, avoid unhandled promise rejections, remove listeners on dispose, and respect user manual overrides. Confirm that the integration to DAGCanvas uses the returned targetFps to compute intervalMs = Math.round(1000 / targetFps).

## 4. Run Automated Tests to Verify
- [ ] Run unit tests (npx jest webview/src/hooks/useBatteryThrottle.spec.ts). Then run an integration smoke test that mounts DAGCanvas with a mocked battery-saver value and asserts the canvas scheduling interval equals Math.round(1000 / 15).

## 5. Update Documentation
- [ ] Add docs/ui/battery-throttle.md describing detection heuristics, how to manually override via settings, and how this maps to requirement 7_UI_UX_DESIGN-REQ-UI-DES-087-1.

## 6. Automated Verification
- [ ] Automated verification consists of the unit tests plus a small Node script that mocks navigator.getBattery and asserts getVisualRefreshTarget() returns 15 when battery-saver is simulated; ensure the CI step runs these checks and exits non-zero on failure.