# Task: Implement Technical Block Styling with Line-Height 1.4 (Sub-Epic: 20_Technical_Font_Intent)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-035-2]

## 1. Initial Test Written
- [ ] Create a Vitest or similar component test (e.g., in `src/webview/components/TechnicalBlock.test.tsx`) that verifies the `line-height` of a technical block is exactly `1.4`.
- [ ] Add a test case to ensure that elements with the "Technical" style correctly use the monospace font defined in the `--devs-font-technical` variable.

## 2. Task Implementation
- [ ] Create a reusable Tailwind utility class or a React component (e.g., `TechnicalBlock` or `text-technical`) that applies:
  - `font-family: var(--devs-font-technical)`.
  - `font-weight: var(--devs-font-weight-technical)`.
  - `line-height: 1.4`.
  - `font-variant-ligatures: normal`.
- [ ] Apply this styling to the "Technical Logs" and "Source Code" views (e.g., in the `ConsoleView` or `LogTerminal` components).
- [ ] Ensure that the density of the technical blocks is optimized as per `7_UI_UX_DESIGN-REQ-UI-DES-035-2` while maintaining clear line-to-line separation.

## 3. Code Review
- [ ] Verify that the `line-height: 1.4` is applied consistently across all technical blocks.
- [ ] Confirm that the technical styling is only applied to relevant "Technical Logs" and "Source Code" views, not to narrative or navigation content.
- [ ] Check for readability and density balance in the log views.

## 4. Run Automated Tests to Verify
- [ ] Execute the test suite using `pnpm test src/webview/components/TechnicalBlock.test.tsx` and ensure all tests pass.

## 5. Update Documentation
- [ ] Update the UI/UX documentation (e.g., `docs/ui/components.md`) to include the "TechnicalBlock" style and its specified line-height of 1.4.
- [ ] Record the implementation of technical block styling in the project's memory or `.agent.md` file.

## 6. Automated Verification
- [ ] Use a browser-based test (e.g., Playwright) to inspect the computed CSS of a rendered log entry and verify that the `line-height` is `1.4` and the `font-family` matches the VSCode editor font.
- [ ] Validate that the layout remains responsive and readable in narrow viewports.
