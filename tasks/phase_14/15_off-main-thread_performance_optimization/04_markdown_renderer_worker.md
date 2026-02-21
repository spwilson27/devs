# Task: Move Markdown-to-HTML Rendering to Worker Thread (Sub-Epic: 15_Off-Main-Thread Performance Optimization)

## Covered Requirements
- [8_RISKS-REQ-035], [8_RISKS-REQ-128]

## 1. Initial Test Written
- [ ] Create `src/workers/__tests__/markdown-renderer-worker.test.ts` using Vitest.
- [ ] Write a unit test mocking `WorkerBridge` that calls `renderMarkdown(mdString)` and asserts the call is delegated to `WorkerBridge.post('render-markdown', mdString)` — not executed inline.
- [ ] Write an integration test using the real `markdown-renderer.worker.ts` script: send a 5,000-character Markdown string containing headings, code blocks, tables, and Mermaid fences; assert the returned HTML string is non-empty and contains the expected HTML tags (`<h1>`, `<pre>`, `<table>`).
- [ ] Write a performance test: `renderMarkdown()` on a 50KB Markdown file must resolve in < 1000ms wall-clock time.
- [ ] Write a concurrency test: issue 30 concurrent `renderMarkdown()` calls with distinct inputs and assert all resolve with non-identical HTML strings (no cross-contamination between worker invocations).
- [ ] Write a test asserting Mermaid fenced code blocks are passed through as `<pre class="mermaid">` tags (not rendered in the worker — Mermaid rendering happens client-side in the Webview).
- [ ] Write a test that passes an empty string to `renderMarkdown()` and asserts the resolved value is an empty string (no crash).

## 2. Task Implementation
- [ ] Create `src/workers/markdown-renderer.worker.ts`:
  - Import `marked` (already a project dependency) configured with `{ headerIds: false, mangle: false }`.
  - Handle message type `'render-markdown'`: receive raw Markdown string, call `marked.parse(md)`, post result HTML string.
  - Override the Mermaid code block renderer to emit `<pre class="mermaid">${code}</pre>` without further transformation.
  - Annotate: `// [8_RISKS-REQ-035] [8_RISKS-REQ-128] Markdown rendering runs off-main-thread to prevent Webview jank`.
- [ ] Create `src/dashboard/markdown-bridge.ts` exporting:
  ```ts
  // [8_RISKS-REQ-035] [8_RISKS-REQ-128]
  export async function renderMarkdown(md: string): Promise<string>
  ```
  Delegates to a singleton `WorkerPool` (`minWorkers: 1, maxWorkers: 4`) scoped to `markdown-renderer.worker.ts`.
- [ ] Locate all call sites where Markdown is rendered synchronously (likely in `src/dashboard/webview-provider.ts` and `src/report/report-generator.ts`) and replace with `await renderMarkdown(md)`.
- [ ] Register `markdownPool.drain()` in `src/extension.ts` `deactivate()`.

## 3. Code Review
- [ ] Verify no synchronous `marked.parse()` calls remain in main-thread code.
- [ ] Confirm `markdown-renderer.worker.ts` does not import `vscode` or reference the file system.
- [ ] Verify `maxWorkers: 4` is appropriate: Markdown rendering is CPU-light and stateless; 4 workers gives headroom for burst rendering (multiple document tabs open simultaneously).
- [ ] Confirm the Mermaid passthrough behaviour is tested and the comment explaining the design decision is present in the worker code.
- [ ] Verify `WorkerPool` drain is called during extension deactivation.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test src/workers/__tests__/markdown-renderer-worker.test.ts` and confirm all tests pass.
- [ ] Run `pnpm test --coverage src/dashboard/` and confirm coverage ≥ 85%.
- [ ] Run the Webview integration tests (`pnpm run test:webview`) and confirm rendered output matches snapshots.

## 5. Update Documentation
- [ ] Add a `### Markdown Rendering` subsection to `docs/architecture/performance.md`, documenting the worker script path, pool sizing rationale, and the Mermaid passthrough decision.
- [ ] Update `docs/agent-memory/phase_14_decisions.md` with: "Markdown-to-HTML rendering moved to `markdown-renderer.worker.ts`. Main thread MUST NOT call `marked.parse()` directly. Mermaid blocks are passed through as `<pre class='mermaid'>` for client-side rendering."

## 6. Automated Verification
- [ ] Run `grep -rn "marked\.parse\|marked(" src/ --include="*.ts" | grep -v "markdown-renderer.worker.ts" | grep -v ".test.ts"` and assert **zero** matches.
- [ ] Run `pnpm test src/workers/__tests__/markdown-renderer-worker.test.ts --reporter=json > /tmp/markdown-renderer-results.json && node -e "const r=require('/tmp/markdown-renderer-results.json'); if(r.numFailedTests>0) process.exit(1)"` and assert exit code 0.
