# Task: Create GPU Acceleration Layer Abstraction (Sub-Epic: 66_Visual_Acceleration)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-087], [7_UI_UX_DESIGN-REQ-UI-DES-087-2]

## 1. Initial Test Written
- [ ] Add unit tests that assert the GPU layer detection and CSS-force strategy are applied and that a safe fallback is available. Create test file: webview/src/layers/gpuLayer.spec.ts. Test steps:
  - Mock global feature detection: stub OffscreenCanvas, WebGLRenderingContext, and window.getComputedStyle where needed.
  - Import { createGpuLayer } from 'webview/src/layers/gpuLayer'.
  - When OffscreenCanvas & WebGL are available, assert createGpuLayer returns an object using OffscreenCanvas and sets the container style to include transform: translate3d(0,0,0) to force GPU layer creation.
  - When features are missing, assert createGpuLayer returns a DOM-SVG fallback and does NOT apply GPU-only APIs.

## 2. Task Implementation
- [ ] Implement webview/src/layers/gpuLayer.ts and webview/src/hooks/useGpuLayer.ts with the following responsibilities:
  - Feature detection: provides isGpuAvailable() that checks for OffscreenCanvas, WebGL2/1 contexts, and CSS support for will-change/transform.
  - createGpuLayer(container: HTMLElement, options?) sets container.style.transform = 'translate3d(0,0,0)' and will-change: 'transform' when GPU is available; create and return either an OffscreenCanvas-backed rendering surface (with transfer control where supported) or a fallback SVG <g> container.
  - Provide clear API to toggle between GPU accelerated rendering and a safe SVG fallback.
  - Ensure the implementation is side-effect minimal: apply styles only to an internal wrapper, not global styles, and provide dispose() to remove wrappers and release OffscreenCanvas references.
  - Add a small utility to measure whether applying translate3d reduced CPU work (optional, instrumentation only).

## 3. Code Review
- [ ] Confirm the module: (a) correctly detects GPU capability, (b) applies transform: translate3d(0,0,0) on the canvas wrapper to force GPU layer creation per req 7_UI_UX_DESIGN-REQ-UI-DES-087-2, (c) provides OffscreenCanvas usage with proper transfer or fallback, (d) provides explicit disposals and no global DOM/CSS pollution, and (e) includes TypeScript types and runtime guards.

## 4. Run Automated Tests to Verify
- [ ] Run unit tests (npx jest webview/src/layers/gpuLayer.spec.ts). Optionally run a headless browser test (Playwright or Puppeteer) to mount a small page, create the gpu layer, and assert that computedStyle(container).transform contains 'matrix' or that will-change contains 'transform' and no exceptions were thrown.

## 5. Update Documentation
- [ ] Add docs/ui/gpu-layer.md describing the API, failure modes, and recommended usage (how to prefer GPU layer and when to fallback). Link the doc to requirements 7_UI_UX_DESIGN-REQ-UI-DES-087 and 7_UI_UX_DESIGN-REQ-UI-DES-087-2.

## 6. Automated Verification
- [ ] Add a CI smoke-test script that runs the headless browser check and fails CI if OffscreenCanvas path throws or if the fallback path is not exercised. The automated verification for unit-level confidence is the unit tests exit code 0 and the headless browser smoke test completes successfully.