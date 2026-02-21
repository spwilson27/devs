# Task: Integrate shiki/Prism Syntax Highlighting with Theme Sync (Sub-Epic: 61_Markdown_Preview_Engine)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-077]

## 1. Initial Test Written
- [ ] Add unit tests at `packages/ui/src/components/CodeBlock/CodeBlock.test.tsx` that assert code blocks rendered by the `CodeBlock` component produce highlighted HTML when given a language and a simulated VSCode theme token set. Mock the chosen highlighting backend (shiki or Prism) to return deterministic HTML so tests focus on plumbing, theme selection, and correct injection into `react-markdown` code block renderer.

## 2. Task Implementation
- [ ] Implement a `CodeBlock` renderer used by `react-markdown`'s `components.code` which: (a) lazy-initializes `shiki` in a Web Worker (or falls back to Prism on main thread), (b) requests the active VSCode color theme from the webview host via `vscode.getState()` or an initial `postMessage` with `theme` payload, (c) applies the theme to the highlighter, and (d) returns safe highlighted HTML to be rendered by the `ThoughtStreamer`'s `react-markdown` instance.

## 3. Code Review
- [ ] Verify that highlighting initialization is asynchronous and non-blocking (worker-based where possible), confirm proper fallback when shiki fails to load, ensure that highlighted HTML is sanitized, and check that theme mapping honors VSCode token color variables.

## 4. Run Automated Tests to Verify
- [ ] Run `yarn test packages/ui -- CodeBlock.test.tsx` to ensure deterministic highlighting plumbing works and mocks validate the theme-to-highlighter handoff.

## 5. Update Documentation
- [ ] Document `CodeBlock` behavior in `packages/ui/docs/CodeBlock.md`: initialization sequence, worker fallback, API for registering additional languages, and notes on performance (e.g., large code blocks should be deferred to CSS-only highlighting).

## 6. Automated Verification
- [ ] Add an E2E check that opens a sample markdown file containing multiple code fences (JS, Python, large file) in a headless preview and snapshots the rendered highlighted HTML across light/dark themes; fail if token classes/styles do not change between theme snapshots.
