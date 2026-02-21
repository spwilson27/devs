# Task: Render Mermaid diagrams as interactive SVG blocks (Sub-Epic: 10_Review Dashboard UI)

## Covered Requirements
- [4_USER_FEATURES-REQ-030]

## 1. Initial Test Written
- [ ] Create unit tests at tests/components/MermaidDiagram.test.tsx that:
  - Render the MermaidDiagram component with a simple mermaid graph string and mock mermaid.mermaidAPI.render to return a deterministic SVG string.
  - Assert the component inserts an <svg> element into the DOM and exposes zoom-in/zoom-out controls with correct ARIA labels.
  - Add a test that simulates clicking zoom controls and verifies transform attributes change.

## 2. Task Implementation
- [ ] Implement src/components/MermaidDiagram/index.tsx:
  - Use mermaid.mermaidAPI.render(id, source, callback) to produce an SVG string and inject it into a ref container using dangerouslySetInnerHTML after sanitizing with DOMPurify.
  - Provide programmatic zoom/pan controls (buttons for zoom in/out/reset) using a lightweight pan/zoom library or simple SVG transform arithmetic.
  - Ensure the component exposes an onReady callback and exposes a ref-based API for parent components to call zoomToFit() in integration tests.
  - Initialize mermaid once (singleton) with { startOnLoad:false, securityLevel: 'strict' } to avoid repeated global initializations.

## 3. Code Review
- [ ] Verify mermaid initialization is singleton-safe, SVG is sanitized before insertion, component is testable (mermaid calls can be mocked), and zoom/pan controls are accessible.

## 4. Run Automated Tests to Verify
- [ ] Run npm test -- -t "MermaidDiagram" and ensure tests pass; perform a headless-render smoke test if CI supports browser rendering.

## 5. Update Documentation
- [ ] Document usage in docs/ui/review_dashboard.md including how to supply mermaid source, security considerations (DOMPurify), and how to mock mermaid in tests.

## 6. Automated Verification
- [ ] Run unit tests and a quick Puppeteer or Playwright script (if available) to render a test mermaid diagram and capture that an <svg> node exists and zoom controls function.