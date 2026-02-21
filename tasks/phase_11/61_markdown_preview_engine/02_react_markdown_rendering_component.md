# Task: Implement react-markdown-based Rendering Component (Sub-Epic: 61_Markdown_Preview_Engine)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-016]

## 1. Initial Test Written
- [ ] Write unit tests for a new `ThoughtStreamer` React component at `packages/ui/src/components/ThoughtStreamer/ThoughtStreamer.test.tsx` using `@testing-library/react` and Jest. The tests must assert that the component: (a) renders GitHub-Flavored Markdown via `react-markdown` with `remark-gfm`, (b) when receiving incremental markdown chunks (simulate by re-rendering with added chunks) the DOM appends new block nodes without replacing previously rendered nodes, and (c) snapshot the DOM structure before/after an incremental update to detect full-tree re-renders.

## 2. Task Implementation
- [ ] Implement `ThoughtStreamer` using `react-markdown` + `remark-gfm` and a streaming buffer: accept `chunks: string[]` prop, internally maintain an append-only array of parsed blocks, and render each block as a stable keyed child so React performs minimal updates. Provide a `components` override for code blocks to delegate to the project's `CodeBlock` renderer. Ensure the component exposes a small API for incremental append (e.g., `appendChunk(chunk:string)`).

## 3. Code Review
- [ ] Verify the component uses stable keys for block-level nodes, avoids re-creating component props on every render, restricts re-renders via `React.memo` and selective props, and that `remark-gfm` is used explicitly. Confirm XSS mitigations (rehype-sanitize) are applied to any rendered HTML.

## 4. Run Automated Tests to Verify
- [ ] Run `yarn test packages/ui -- ThoughtStreamer.test.tsx` (or equivalent) and ensure snapshots and incremental-append assertions pass; include coverage threshold checks for the component.

## 5. Update Documentation
- [ ] Add `packages/ui/docs/ThoughtStreamer.md` describing the streaming API, prop contract (`chunks: string[]`, `appendChunk`), recommended usage patterns, and notes about DOM stability and performance.

## 6. Automated Verification
- [ ] Add a unit-level performance regression test that mounts the component and measures render counts across 100 incremental appends (using `jest.fn()` to count renders) and fails if average render-per-append exceeds a small threshold (e.g., >1.2 renders/append).
