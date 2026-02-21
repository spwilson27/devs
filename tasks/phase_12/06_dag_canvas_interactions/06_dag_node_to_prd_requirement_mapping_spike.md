# Task: Spike – Research D3-to-Mermaid Interactivity for DAG Node-to-PRD Requirement Linking (Sub-Epic: 06_DAG Canvas Interactions)

## Covered Requirements
- [9_ROADMAP-SPIKE-004]

## 1. Initial Test Written
- [ ] This is a research spike. The primary output is a written spike report, not production code. However, to validate the spike's findings, write a minimal proof-of-concept (POC) test harness:
  - In `packages/webview-ui/src/spike/__tests__/dagToPrdLink.poc.test.ts`, write a test that:
    - Imports a mock DAG node with a `reqIds: string[]` field (e.g., `['1_PRD-REQ-UI-005', '7_UI_UX_DESIGN-REQ-UI-DES-055']`).
    - Imports a mock PRD Mermaid diagram string containing anchors (`#1_PRD-REQ-UI-005`).
    - Calls the candidate `resolveReqIdToMermaidAnchor(reqId, mermaidSource)` function.
    - Asserts it returns the correct line number or anchor identifier in the Mermaid source string.
    - Asserts it returns `null` for a REQ-ID not present in the Mermaid source.
  - This test proves the core linking mechanism is technically viable before committing to a full implementation.
- [ ] Write a second POC test in `packages/webview-ui/src/spike/__tests__/dagToPrdLink.d3Overlay.poc.test.ts`:
  - Renders a minimal D3 SVG with one node via `jsdom`.
  - Calls `attachReqIdTooltip(svgNode, reqId)`.
  - Asserts that a `<title>` or `data-req-id` attribute is attached to the SVG node element.
  - Asserts that calling `openPrdSection(reqId)` triggers a mock `postMessage` to the VSCode extension host with the payload `{ command: 'openPrdSection', reqId }`.

## 2. Task Implementation
- [ ] **Research Phase** – Before writing any production code, produce a written spike report at `docs/spikes/SPIKE-004-d3-mermaid-interactivity.md` covering:
  - **Option A: SVG `<a>` href overlay** – wrap D3 node SVG elements in `<a xlink:href="#reqId">` tags that deep-link into the rendered Mermaid document panel. Document feasibility, limitations (Mermaid re-renders wipe SVG DOM), and required workarounds.
  - **Option B: postMessage command** – on node click, dispatch `{ command: 'openPrdSection', reqId }` via `vscode.postMessage` to the extension host, which navigates the secondary editor pane to the PRD document at the requirement anchor. Document that this is extension-host-dependent and requires a corresponding command handler in `src/extension/commands/openPrdSection.ts`.
  - **Option C: In-panel hyperlink via Mermaid source patching** – patch the Mermaid source at render time to inject `click <nodeId> call window.navigateToReq(reqId)` directives, enabling Mermaid's built-in click handler to bridge the gap. Document Mermaid version compatibility (requires Mermaid >= 10.x `securityLevel: 'loose'`).
  - **Recommendation**: state which option to implement in Phase 12, with rationale.
- [ ] **POC Implementation** – Implement the recommended option as a minimal proof-of-concept:
  - Create `packages/webview-ui/src/spike/dagToPrdLink.ts` with:
    - `resolveReqIdToMermaidAnchor(reqId: string, mermaidSource: string): string | null` – parses the Mermaid source for a node or subgraph labelled with the REQ-ID and returns its anchor identifier.
    - `attachReqIdTooltip(svgNode: SVGElement, reqId: string): void` – attaches `data-req-id` and `title` attributes to a D3-rendered SVG node.
    - `openPrdSection(reqId: string): void` – dispatches the appropriate `postMessage` or in-panel navigation command based on the chosen option.
  - This spike code lives in `src/spike/` and is NOT imported by production code yet. It is a validated POC only.

## 3. Code Review
- [ ] Verify that the spike report (`docs/spikes/SPIKE-004-d3-mermaid-interactivity.md`) covers all three options with honest trade-offs. Confirm it makes a clear recommendation with rationale—not a "further research needed" non-answer.
- [ ] Verify that `resolveReqIdToMermaidAnchor` handles malformed Mermaid source gracefully (returns `null` rather than throwing).
- [ ] Confirm the POC code in `src/spike/` is clearly marked with a `// SPIKE: not for production use` comment at the file header, so future agents do not accidentally import it into production bundles.
- [ ] Verify the POC tests pass, confirming the recommended approach is technically feasible in the actual project environment (jsdom + VDOM, not just in a standalone script).
- [ ] Confirm the spike report specifies which Mermaid version is required for the recommended approach and whether the project's current `mermaid` package version (check `package.json`) is compatible.

## 4. Run Automated Tests to Verify
- [ ] Run: `pnpm --filter @devs/webview-ui test -- --testPathPattern="spike/dagToPrdLink"` and confirm both POC tests pass.
- [ ] Confirm the tests run within a normal CI budget (< 5 seconds for the spike test suite).
- [ ] Run the full webview-ui test suite: `pnpm --filter @devs/webview-ui test` to confirm the spike tests do not interfere with existing tests.

## 5. Update Documentation
- [ ] Save the spike report to `docs/spikes/SPIKE-004-d3-mermaid-interactivity.md`. This is the primary deliverable of this task.
- [ ] Update `docs/agent-memory/phase_12.md`: Record the outcome of SPIKE-004. State: (a) the recommended approach, (b) the Mermaid version constraint (if any), (c) the follow-on task ID that will implement the full production feature based on this spike (if Phase 12 scope permits, otherwise note it for Phase 13).
- [ ] Update `docs/agent-memory/global.md` (or equivalent cross-phase memory): Record the D3-to-PRD linking strategy so that future agents building the Document Review Panel (Phase 7/8 features) can use the same mechanism.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="spike/dagToPrdLink" --reporter=junit` and confirm zero `<failure>` elements in the JUnit XML output.
- [ ] Verify the spike report exists and is non-empty: `test -s docs/spikes/SPIKE-004-d3-mermaid-interactivity.md && echo "OK"` — confirm `OK` is printed.
- [ ] Verify the spike code is NOT exported from any `index.ts` barrel file: `grep -r "dagToPrdLink" packages/webview-ui/src/index.ts` should return no matches.
