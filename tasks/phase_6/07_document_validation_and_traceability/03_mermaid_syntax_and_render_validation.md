# Task: Implement Mermaid Syntax and Render Validator (Sub-Epic: 07_Document Validation and Traceability)

## Covered Requirements
- [9_ROADMAP-REQ-028]

## 1. Initial Test Written
- [ ] Create unit tests at tests/validators/mermaidValidator.spec.js that:
  - Call the mermaid validator API `validateMermaid(code: string)` with the following cases:
    1. `validDiagram`: a minimal valid Mermaid ERD and a sequence diagram; assert `validateMermaid` returns an empty error list.
    2. `syntaxErrorDiagram`: intentionally malformed Mermaid (unclosed braces, invalid directive); assert validator returns specific error objects with `line`, `message`, and `severity`.
    3. `resourceHeavyDiagram`: intentionally large diagram that may exceed a configured node/edge limit; assert validator returns a `resourceLimit` error.
  - Create an integration test that runs headless rendering (using mermaid CLI or Playwright-based render of mermaid API) and asserts output is valid SVG (parseable XML) and contains expected `<svg` tag.

## 2. Task Implementation
- [ ] Implement `src/validators/mermaidValidator.(js|ts)` exposing `validateMermaid(code: string, options?: {maxNodes?: number, timeoutMs?: number}): Promise<Array<MermaidError>>` where `MermaidError = {line?: number, message: string, code?: string, severity: 'error'|'warning'}`.
- [ ] Use the mermaid (mermaid-cli or mermaid.mjs) parser API if available; otherwise spawn a headless renderer via Playwright/Chromium to render the diagram to SVG and capture parse/runtime errors.
- [ ] Implement resource safety: enforce `maxNodes` and `timeoutMs` during render to avoid DoS via overly complex diagrams. Fail with deterministic `resourceLimit` error when limits exceeded.
- [ ] Add the validator to the DocumentValidator pipeline so markdown documents containing ```mermaid blocks are extracted and validated automatically.
- [ ] Provide a `--render-check` mode to perform a full headless render and return the SVG (or an error) for preview endpoints.

## 3. Code Review
- [ ] Ensure the implementation runs Mermaid parsing in a sandboxed child process or in an isolated headless browser to avoid executing untrusted JS.
- [ ] Ensure timeouts and resource limits are enforced and configurable; verify unit tests simulate timeouts.
- [ ] Validate that outputs are deterministic and that any external binaries (mermaid-cli) are optional and gracefully handled when absent.

## 4. Run Automated Tests to Verify
- [ ] Run the validator tests with `npm test -- tests/validators/mermaidValidator.spec.js` and run the integration headless render test; CI must fail on regressions.

## 5. Update Documentation
- [ ] Add `docs/validators/mermaidValidator.md` that documents the supported Mermaid dialects, the configuration knobs (`maxNodes`, `timeoutMs`), example error objects, and instructions for preview rendering.
- [ ] Update `docs/features/diagram-rendering.md` to explain the preview vs validation modes and how to interpret `resourceLimit` errors.

## 6. Automated Verification
- [ ] Provide `scripts/verify-mermaid-render.sh` that:
  - Iterates canonical mermaid files in `docs/examples/mermaid/`, runs `validateMermaid` with `--render-check`, and parses output to confirm SVG validity using `xmllint` or an XML parser.
  - Exits non-zero if any example fails to render or if a `resourceLimit` error occurs unexpectedly.
