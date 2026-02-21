# Task: MermaidHost Component Scaffold & Lazy-Load Pipeline (Sub-Epic: 72_Mermaid_Interactive_Host)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-026]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/components/MermaidHost/__tests__/MermaidHost.test.tsx`, write a **unit test** using Vitest + React Testing Library that:
  - Asserts the component renders a `data-testid="mermaid-host-container"` wrapper element.
  - Asserts that, when passed a valid Mermaid string (e.g., `graph TD; A-->B;`), a non-empty SVG element is present in the DOM after async rendering completes (use `waitFor`).
  - Asserts that, when the `definition` prop is `undefined` or an empty string, the component renders a `data-testid="mermaid-host-empty"` placeholder and does NOT render an SVG.
  - Asserts that the `mermaid` library is NOT imported at module load time (verify via dynamic import spy/mock), confirming lazy-loading behaviour.
- [ ] In `packages/webview-ui/src/components/MermaidHost/__tests__/useMermaidRenderer.test.ts`, write a **unit test** for the custom hook `useMermaidRenderer` that:
  - Asserts that calling the hook with a valid definition triggers `mermaid.render()` exactly once.
  - Asserts the hook returns `{ svg: string | null, error: null }` on success.
  - Asserts the hook returns `{ svg: null, error: Error }` when `mermaid.render()` rejects.
  - Asserts the hook re-renders (i.e., calls `mermaid.render()` again) when the `definition` prop changes.
  - Asserts the hook does NOT call `mermaid.render()` if the definition is unchanged (referential stability via `useRef`).

## 2. Task Implementation
- [ ] Create the directory `packages/webview-ui/src/components/MermaidHost/`.
- [ ] Create `packages/webview-ui/src/components/MermaidHost/MermaidHost.tsx`:
  - Props interface: `{ definition: string | undefined; className?: string; 'data-testid'?: string }`.
  - Use a top-level `React.lazy` + `Suspense` boundary OR a dynamic `import('mermaid')` inside a `useEffect` to ensure Mermaid is **never** bundled in the initial chunk (lazy-load).
  - Internally delegate rendering to the `useMermaidRenderer` hook.
  - When `definition` is falsy, render `<div data-testid="mermaid-host-empty" />`.
  - When rendering, render `<div data-testid="mermaid-host-container" dangerouslySetInnerHTML={{ __html: svg }} />` (SVG is safe because it is produced by Mermaid's own renderer, not user input).
  - Wrap in `React.memo` to prevent unnecessary re-renders.
- [ ] Create `packages/webview-ui/src/components/MermaidHost/useMermaidRenderer.ts`:
  - Accepts `definition: string | undefined`.
  - Lazily imports `mermaid` (dynamic import) on first call and caches the module reference in a module-level `let` variable.
  - Calls `mermaid.initialize({ startOnLoad: false })` exactly once (guard with a `boolean` flag).
  - Uses a stable unique `id` (via `useId` from React 18) as the element id for `mermaid.render(id, definition)`.
  - Returns `{ svg: string | null; error: Error | null; isLoading: boolean }`.
  - Sets `isLoading: true` during async render and `false` on resolution.
  - Catches errors from `mermaid.render()` and populates `error`.
  - Cleans up any leftover DOM nodes Mermaid may inject (e.g., `document.getElementById(id)` removal) in the effect cleanup.
- [ ] Create `packages/webview-ui/src/components/MermaidHost/index.ts` exporting `MermaidHost` as the default export.
- [ ] Register the lazy chunk boundary in `packages/webview-ui/vite.config.ts` by adding `'mermaid'` to `build.rollupOptions.output.manualChunks` (or equivalent), if not already present.

## 3. Code Review
- [ ] Confirm `mermaid` does **not** appear in the initial `index.js`/`app.js` bundle chunk (run `vite build --report` and inspect the chunk manifest).
- [ ] Verify the component does not use any hardcoded color strings; it must rely on CSS variables or props only.
- [ ] Ensure `dangerouslySetInnerHTML` is only used for the SVG output (mermaid-produced) and that user-supplied `definition` strings are **never** directly injected into the HTML.
- [ ] Confirm `React.memo` wraps the component to avoid re-renders on parent state changes unrelated to `definition`.
- [ ] Verify `useMermaidRenderer` cleanup prevents memory leaks (any orphan DOM nodes removed).
- [ ] Check that the hook has no ESLint `react-hooks/exhaustive-deps` violations.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test --reporter=verbose packages/webview-ui/src/components/MermaidHost` and confirm all tests pass with 0 failures.
- [ ] Run `pnpm --filter @devs/webview-ui build` and confirm no TypeScript errors and no build failures.

## 5. Update Documentation
- [ ] Create `packages/webview-ui/src/components/MermaidHost/MermaidHost.agent.md` with the following sections:
  - **Purpose**: Centralized, lazy-loaded orchestrator for Mermaid.js diagram rendering within the Webview.
  - **Props**: Document `definition`, `className`, `data-testid`.
  - **Architecture Decision**: Why dynamic import / lazy loading is used (bundle size constraint from `6_UI_UX_ARCH-REQ-007`).
  - **Hook**: `useMermaidRenderer` — inputs, outputs, side-effects, and cleanup contract.
  - **Covered Requirements**: `[6_UI_UX_ARCH-REQ-026]`.
- [ ] Update `packages/webview-ui/src/components/README.md` (or equivalent component index) to list `MermaidHost` with a one-line description.

## 6. Automated Verification
- [ ] CI check: `pnpm --filter @devs/webview-ui test --run` exits with code `0`.
- [ ] CI check: `pnpm --filter @devs/webview-ui build` exits with code `0`.
- [ ] Chunk audit script: Run `node scripts/audit-chunks.mjs --deny mermaid --chunk index` (create this script if absent) which parses `dist/manifest.json` and exits non-zero if the `mermaid` package appears in any chunk named `index` or `app`.
