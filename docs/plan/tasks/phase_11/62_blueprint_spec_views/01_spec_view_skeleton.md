# Task: Implement SPEC View skeleton and router registration (Sub-Epic: 62_Blueprint_Spec_Views)

## Covered Requirements
- [4_USER_FEATURES-REQ-008]

## 1. Initial Test Written
- [ ] Create a unit test at `src/webview/views/__tests__/SpecView.test.tsx` using React Testing Library + Jest:
  - Mock the ViewRouter to supply route params `{ docId: 'doc-123' }`.
  - Mock the document client (`fetchDocument`) to return `{ id: 'doc-123', markdown: '# Title\n\nBody' }`.
  - Test assertions (in order):
    1. Component initially renders a visible loading placeholder text `Loading spec…`.
    2. After the mocked fetch resolves, `MarkdownRenderer` is rendered with the returned markdown.
    3. `fetchDocument` is called exactly once with `'doc-123'`.
  - Run command (Jest JSON output):
    - `npx jest src/webview/views/__tests__/SpecView.test.tsx --runInBand --json --outputFile=tmp/specview-test.json`

## 2. Task Implementation
- [ ] Implement `src/webview/views/SpecView.tsx` with the following details:
  - API: read `docId` from the app's ViewRouter (route params).
  - Behavior: on mount call a single `fetchDocument(docId)` util (create `src/webview/lib/docClient.ts`) that returns `{ id, markdown }`.
  - Render states: `loading` placeholder, accessible `error` message, and success state that renders `<MarkdownRenderer markdown={markdown} />`.
  - Register the SPEC route in `ViewRouter` (e.g., add route key `'SPEC'` and wiring to accept `docId`).
  - Use dependency injection so `fetchDocument` can be mocked in tests (export a default that accepts an overridable client).
  - Keep imports lean; lazy-load `MarkdownRenderer` if it's heavyweight.

## 3. Code Review
- [ ] Verify the implementation:
  - SpecView responsibilities limited to orchestration and state; no rendering logic for markdown.
  - Uses React hooks correctly and cleans up any outstanding promises on unmount.
  - Explicit TypeScript types for the fetched document and route params; avoid `any`.
  - Tests cover loading, success, and error states; new code has unit test coverage.

## 4. Run Automated Tests to Verify
- [ ] Run:
  - `npx jest src/webview/views/__tests__/SpecView.test.tsx --runInBand --json --outputFile=tmp/specview-test.json`
  - OR `npm test -- src/webview/views/__tests__/SpecView.test.tsx`
  - Confirm exit code `0` and that `tmp/specview-test.json` indicates 0 failed tests.

## 5. Update Documentation
- [ ] Add `docs/ui/spec-view.md` (or update existing docs):
  - Document route key `'SPEC'`, route params, and the `fetchDocument` contract (input/output shapes and error modes).
  - Document how to mock `fetchDocument` in unit tests.

## 6. Automated Verification
- [ ] Programmatic check to ensure tests actually passed:
  - Run the jest command above, then run:
    - `node -e "const r=require('./tmp/specview-test.json'); process.exit(r.numFailedTests === 0 ? 0 : 1)"`
  - CI should fail on non-zero exit.
