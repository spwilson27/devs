# Task: Implement Cross-Document Spec Linking and Router integration (Sub-Epic: 62_Blueprint_Spec_Views)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-061]

## 1. Initial Test Written
- [ ] Add unit tests for a `linkParser` utility and a `SpecLink` component:
  - `src/webview/lib/__tests__/linkParser.test.ts`:
    - Given inputs containing `@/path/to/doc.md`, `#REQ-123`, and `file:///path` validate the parser returns typed link objects: `{ type: 'doc'|'req'|'external', target: string }`.
  - `src/webview/components/__tests__/SpecLink.test.tsx`:
    - Mock ViewRouter navigate function; render `<SpecLink raw="See @/docs/blueprint.md" />` and assert clicking the produced anchor calls `ViewRouter.navigate('SPEC', { docId: 'docs/blueprint.md' })`.
  - Run command: `npx jest src/webview/lib/__tests__/linkParser.test.ts --runInBand --json --outputFile=tmp/link-parser-test.json`

## 2. Task Implementation
- [ ] Implement `src/webview/lib/linkParser.ts`:
  - Provide deterministic parsing with the following rules (exact regexes to be documented in code):
    - `@/path/to/doc(.md)?` => `{ type: 'doc', target: 'path/to/doc.md' }` (normalize extension)
    - `#REQ-<digits|ALPHA>` => `{ type: 'req', target: '<REQ-ID>' }`
    - `http(s)://...` => `{ type: 'external', target }`
  - Edge cases: do not match email addresses or inline code blocks; skip parsing inside fenced code blocks.

- [ ] Implement `src/webview/components/SpecLink.tsx`:
  - Accept `raw` string and render a tree of React nodes where recognized links become interactive anchors.
  - For `type:'doc'` or `'req'`, prevent default anchor navigation and call `ViewRouter.navigate('SPEC', { docId: normalizedTarget })`.
  - Expose a `data-testid` on produced anchors for testing.
  - Ensure links are keyboard accessible and use `role="link"` and `tabIndex={0}` for non-anchor elements.

## 3. Code Review
- [ ] Verify:
  - Parsing is deterministic and well-covered with tests for positive and negative cases.
  - No regex performance pitfalls (avoid catastrophic backtracking).
  - Router integration is abstracted through a single `navigate()` interface to keep components testable.

## 4. Run Automated Tests to Verify
- [ ] Run the parser and link tests:
  - `npx jest src/webview/lib/__tests__/linkParser.test.ts src/webview/components/__tests__/SpecLink.test.tsx --runInBand --json --outputFile=tmp/link-tests.json`
  - Confirm `tmp/link-tests.json` reports 0 failures.

## 5. Update Documentation
- [ ] Add `docs/spec-linking.md` documenting:
  - Link grammars, normalization rules, router contract, and how to add new link types.

## 6. Automated Verification
- [ ] Programmatically ensure the parser works by running the jest command and checking the JSON output for zero failures; also run a small Node script to validate examples from a `test-cases.json` fixture.
