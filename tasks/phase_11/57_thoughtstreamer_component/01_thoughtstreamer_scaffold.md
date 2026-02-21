# Task: Scaffold ThoughtStreamer component with types & store (Sub-Epic: 57_ThoughtStreamer_Component)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-015]

## 1. Initial Test Written
- [ ] Create a unit test at src/ui/components/__tests__/ThoughtStreamer.spec.tsx using Jest + React Testing Library.
  - Render the component with an empty messages array: render(<ThoughtStreamer messages={[]} />).
  - Assert root container exists: expect(screen.getByTestId('thought-streamer')).toBeInTheDocument().
  - Assert role/aria: expect(screen.getByTestId('thought-streamer')).toHaveAttribute('role','log').
  - Save a snapshot: expect(container).toMatchSnapshot(); commit the snapshot after review.

## 2. Task Implementation
- [ ] Implement src/ui/components/ThoughtStreamer.tsx (TypeScript):
  - Export a React.FC<{ messages: Array<{id:string; type: 'THOUGHT'|'ACTION'|'OBS'; text:string; timestamp:number}>; className?: string }>
  - Render a container div with: role="log", aria-live="polite", data-testid="thought-streamer".
  - Map messages -> child elements: each message should be a div with data-testid="thought-message-<id>", data-type attribute with the message type, timestamp rendered in ISO format, and the text body.
  - Keep implementation simple (no virtualization yet) and ensure proper TypeScript types and React.memo for export.
  - Export component from src/ui/components/index.ts.

## 3. Code Review
- [ ] Verify TypeScript types are strict, no any; ensure React.memo or useMemo for stable renders; no heavy logic in render; CSS classes only (no inline styles); component has a clear public props surface and exports are documented.

## 4. Run Automated Tests to Verify
- [ ] Run: npm test -- src/ui/components/__tests__/ThoughtStreamer.spec.tsx and ensure the new test and snapshot pass.

## 5. Update Documentation
- [ ] Add docs/ui/thoughtstreamer.md describing the component API, props, example usage, and webview integration notes.

## 6. Automated Verification
- [ ] Produce a JSON test report: jest --json --outputFile=reports/thoughtstreamer-tests.json and assert passCount > 0 and numFailedTests === 0 in CI verification script.
