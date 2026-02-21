# Task: Telemetry Visual Hierarchy & Glass-Box Implementation (Sub-Epic: 101_Interface_DOD_Polish)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-001], [7_UI_UX_DESIGN-REQ-UI-DES-007]

## 1. Initial Test Written
- [ ] Create a unit test for the `ThoughtStreamer` component in `@devs/vscode` webview.
- [ ] Mock a sequence of SAOP envelopes (`Thought`, `Action`, `Observation`) and verify that each block is rendered within a container that has high-contrast separators (e.g., specific `border-t` or `border-l` classes).
- [ ] Verify that the spacing between blocks strictly follows the 4px base grid (e.g., `p-4`, `m-8` in Tailwind).
- [ ] Add a regression test to ensure that the visual layout remains predictable (fixed zone anchors) even when content length varies, supporting "Visual Reviewer" agent parsing.

## 2. Task Implementation
- [ ] Update `ThoughtStreamer.tsx` to include high-contrast visual separators between agentic threads.
- [ ] Utilize VSCode theme variables (e.g., `--vscode-panel-border`, `--vscode-activityBar-activeBorder`) to ensure high-contrast visibility across all themes.
- [ ] Implement the "Glass-Box" philosophy by exposing detailed metadata (timestamp, REQ-ID, token count) in a technical mono font (`11px` Metadata scale) next to each reasoning block.
- [ ] Ensure all margins and paddings are multiples of `4px` according to the base grid requirement.
- [ ] Apply semantic separators that distinguish between "Human Authority" (Directives) and "Agent Autonomy" (Reasoning).

## 3. Code Review
- [ ] Verify that no hardcoded hex colors are used; all styling must derive from VSCode tokens.
- [ ] Check that the visual separators are distinct enough for OCR-based agents to segment the UI into logical blocks.
- [ ] Ensure that the typography follows the tiered font origin categorization (Serif for narrative, Mono for technical).

## 4. Run Automated Tests to Verify
- [ ] Run `vitest` in the webview package to confirm component rendering logic.
- [ ] Run `npm run lint` to ensure Tailwind class usage is consistent.

## 5. Update Documentation
- [ ] Update the `UI/UX Architecture` document to reflect the final implementation of the Glass-Box telemetry separators.
- [ ] Update the AOD (`.agent.md`) for the `ThoughtStreamer` component explaining the visual contract for other agents.

## 6. Automated Verification
- [ ] Run a screenshot capture script in the dev environment and verify that the output image exhibits clear, identifiable borders between different agent turns using a simple image analysis or manual audit.
