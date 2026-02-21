# Task: Implement MarkdownRenderer and MermaidHost integration (Sub-Epic: 62_Blueprint_Spec_Views)

## Covered Requirements
- [4_USER_FEATURES-REQ-008]

## 1. Initial Test Written
- [ ] Create unit tests at `src/webview/components/__tests__/MarkdownRenderer.test.tsx` and `src/webview/components/__tests__/MermaidHost.test.tsx`:
  - MarkdownRenderer test:
    - Input: a markdown string containing headings, lists, code fences and a fenced mermaid block (```mermaid\ngraph TD; A-->B```).
    - Expectation: non-mermaid markdown nodes render as HTML text, and the mermaid block is replaced by a `MermaidHost` element with the raw mermaid source passed as a prop.
  - MermaidHost test:
    - Render MermaidHost in isolation and assert it mounts a sandboxed container (iframe or a controlled div) and exposes an API to request rendering.
  - Run commands:
    - `npx jest src/webview/components/__tests__/MarkdownRenderer.test.tsx --runInBand --json --outputFile=tmp/markdown-renderer-test.json`

## 2. Task Implementation
- [ ] Implement `src/webview/components/MarkdownRenderer.tsx`:
  - Use `react-markdown` + `remark-gfm` + `rehype-sanitize` to render markdown safely.
  - Provide a custom renderer for code fences: when `language === 'mermaid'` return `<MermaidHost code={rawCode} data-testid="mermaid-host" />`.
  - Ensure images and external URLs are sanitized/validated (redact or block remote images by default unless allowed via policy).
  - Accept a `theme` prop or read theme tokens from `vscode.getState()` to enable theme sync.

- [ ] Implement `src/webview/components/MermaidHost.tsx`:
  - Preferred approach: sandbox rendering inside an `iframe` or offscreen worker + DOM injection to avoid large client-side mermaid bundles in the main bundle.
  - API: `MermaidHost({ code: string, theme?: 'light'|'dark' })` -> renders SVG output in a controlled container.
  - Provide graceful fallback when rendering fails (show sanitized raw code block and error message).

## 3. Code Review
- [ ] Verify:
  - No use of `dangerouslySetInnerHTML` without sanitization.
  - Mermaid rendering done in a sandbox (iframe or worker) to maintain CSP and reduce bundle size.
  - MarkdownRenderer is pure and easy to unit test; mermaid heavy logic isolated inside MermaidHost.
  - Types for props and clear separation of concerns.

## 4. Run Automated Tests to Verify
- [ ] Run unit tests created above:
  - `npx jest src/webview/components/__tests__/MarkdownRenderer.test.tsx --runInBand --json --outputFile=tmp/markdown-renderer-test.json`
  - Confirm `tmp/markdown-renderer-test.json` reports 0 failures.

## 5. Update Documentation
- [ ] Update `docs/components/markdown_renderer.md` and `docs/components/mermaid_host.md`:
  - Document security model (sandboxing), theme contract, and how to extend the markdown pipeline for custom nodes.

## 6. Automated Verification
- [ ] Verify automatically by running jest and ensuring the `mermaid-host` test exists and passes. Example:
  - `npx jest --config=jest.config.js --json --outputFile=tmp/markdown-test-summary.json` then check `tmp/markdown-test-summary.json` for zero failures.
