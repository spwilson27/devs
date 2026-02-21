# Task: Implement dynamic imports and route-level code-splitting for heavy visualization libraries (Sub-Epic: 46_Memoization_Lazy_Loading)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-007], [6_UI_UX_ARCH-REQ-078]

## 1. Initial Test Written
- [ ] Create an integration test script scripts/tests/lazy-load-manifest.test.js that runs the webview build (vite build) and then inspects the generated manifest (dist/manifest.json or dist/assets) to assert that heavy libraries (mermaid, d3) are NOT present in the initial entry chunk.
  - Test steps:
    - Run: npm run build:webview (or pnpm build in the webview package).
    - Load dist/manifest.json and assert that files referencing "mermaid" or "d3" are present only in separate chunks (not in the main entry chunk).

## 2. Task Implementation
- [ ] Refactor route and component entry points to use dynamic imports and React.lazy for heavy views:
  - Example: const RoadmapView = React.lazy(() => import('./views/RoadmapView'));
  - Inside RoadmapView, dynamically import heavy libs only when needed: const { default: mermaid } = await import('mermaid'); const d3 = await import('d3');
- [ ] Update Vite/Rollup configuration to encourage separate chunks for heavy libraries (manualChunks or dynamic import usage). Example vite.config.ts addition:
  - build: { rollupOptions: { output: { manualChunks(id) { if (id.includes('node_modules/mermaid') || id.includes('node_modules/d3')) return 'vendor-heavy'; } } } }
- [ ] Add a lightweight skeleton placeholder UI for Roadmap and Spec views that appears while the heavy chunk downloads.
- [ ] Ensure all imports of mermaid/d3 are removed from top-level modules and moved into dynamic import call sites.

## 3. Code Review
- [ ] Verify no top-level imports of heavy visualization libraries remain in the initial bundle.
- [ ] Confirm placeholder UX is present and accessible during lazy-load.
- [ ] Confirm CSP and vscode-resource considerations: dynamic import path resolution must not violate Webview CSP.

## 4. Run Automated Tests to Verify
- [ ] Run the manifest inspection test: node scripts/tests/lazy-load-manifest.test.js after building the webview and ensure assertions pass.

## 5. Update Documentation
- [ ] Document lazy-loading policy in docs/ui-performance.md describing when to lazy-load, which modules are considered "heavy", and how to add a new heavy module in the future.

## 6. Automated Verification
- [ ] Add the manifest inspection script to CI after the webview build step so Pull Requests fail if the initial entry bundle regresses and includes heavy libraries.