# Task: Build Requirement-to-TAS Cross-Reference Data Model (Sub-Epic: 11_Document Approval and Requirement Linking)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-092-2]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/lib/__tests__/requirementIndex.test.ts`, write unit tests for a `RequirementIndex` class:
  - Test `buildIndex(prdContent: string, tasContent: string): RequirementIndex` returns a map of `reqId → Set<erdEntityId>`.
  - Test that hovering over a REQ-ID that appears in both PRD and TAS produces a non-empty highlight set.
  - Test that a REQ-ID present only in the PRD returns an empty highlight set without throwing.
  - Test that the parser correctly handles malformed REQ-ID strings without crashing.
  - Test `getHighlightsForReq(reqId: string): string[]` returns the list of TAS ERD entity IDs linked to the given requirement.
- [ ] In `packages/webview-ui/src/components/__tests__/RequirementHighlighter.test.tsx`, write React Testing Library tests:
  - Render a `<RequirementHighlighter prdHtml={...} tasErdData={...} index={...} />` component and assert that mousing over a `data-req-id` span dispatches a `highlight` event containing the correct ERD entity IDs.
  - Assert that mouse-out clears the highlight set.
  - Assert the component renders without crashing when `index` is empty.

## 2. Task Implementation
- [ ] Create `packages/webview-ui/src/lib/requirementIndex.ts`:
  - Define `type ErdEntityId = string` and `type ReqId = string`.
  - Export class `RequirementIndex` with:
    - `private map: Map<ReqId, Set<ErdEntityId>>`
    - `buildIndex(prdText: string, tasText: string): void` — scan both documents for REQ-ID tokens (regex `[A-Z0-9_]+-REQ-[A-Z0-9_-]+`) and record co-occurrences with Mermaid ERD entity names (regex matching `erDiagram` blocks).
    - `getHighlightsForReq(reqId: ReqId): ErdEntityId[]`
    - `clear(): void`
  - Export `buildRequirementIndex(prdText: string, tasText: string): RequirementIndex` factory function.
- [ ] Create `packages/webview-ui/src/components/RequirementHighlighter.tsx`:
  - Accept props: `prdHtml: string`, `tasErdData: MermaidErdAST`, `index: RequirementIndex`.
  - Render the PRD HTML using `dangerouslySetInnerHTML` inside a container with `onMouseOver` delegation.
  - On hover over any element with `data-req-id`, call `index.getHighlightsForReq()` and dispatch a custom DOM event `devs:highlight-erd-entities` with the entity IDs payload.
  - On mouse-out, dispatch `devs:clear-erd-highlight`.
- [ ] Annotate the PRD markdown-to-HTML renderer (`packages/webview-ui/src/lib/markdownRenderer.ts`) to inject `data-req-id="{id}"` attributes onto REQ-ID tokens during rendering.

## 3. Code Review
- [ ] Verify `RequirementIndex` has O(n) build complexity and no redundant passes over the document text.
- [ ] Ensure no direct DOM manipulation inside React components — all side effects must go through the custom event dispatch pattern.
- [ ] Confirm `dangerouslySetInnerHTML` is guarded by a DOMPurify sanitization step before insertion.
- [ ] Check that `data-req-id` attributes are stripped from any HTML exported outside the webview to prevent data leakage.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="requirementIndex|RequirementHighlighter"` and confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/webview-ui run typecheck` and confirm zero TypeScript errors in the new files.

## 5. Update Documentation
- [ ] Add a section "Requirement Highlighting" to `packages/webview-ui/AGENT.md` describing the `RequirementIndex` API, the `data-req-id` annotation convention, and the custom event protocol (`devs:highlight-erd-entities` / `devs:clear-erd-highlight`).
- [ ] Update `packages/webview-ui/src/lib/requirementIndex.ts` JSDoc with parameter descriptions and example usage.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test --coverage -- --testPathPattern="requirementIndex|RequirementHighlighter"` and assert branch coverage ≥ 90% for `requirementIndex.ts` and `RequirementHighlighter.tsx`.
- [ ] Run `pnpm --filter @devs/webview-ui run build` and confirm the build exits with code 0 — no new bundle errors introduced.
