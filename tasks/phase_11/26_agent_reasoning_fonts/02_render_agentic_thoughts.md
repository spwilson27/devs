# Task: Implement Agentic Reasoning (Thought) Typography (Sub-Epic: 26_Agent_Reasoning_Fonts)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-034-1], [6_UI_UX_ARCH-REQ-083]

## 1. Initial Test Written
- [ ] Create or update the `packages/vscode/webview/tests/ThoughtStreamer.test.tsx` file:
    - Verifies that any component rendered as a `THOUGHT` type includes the `font-agent-thought` class (or its Tailwind equivalent).
    - Verifies that the rendered element in JSDOM has `font-style: italic` and `font-family: serif`.
    - Check that Markdown content within thoughts (e.g., in `react-markdown`) inherits the serif/italic style.

## 2. Task Implementation
- [ ] In the `ThoughtStreamer` component (or equivalent log-rendering component), add logic to differentiate between "Thoughts", "Actions", and "Observations".
- [ ] Apply the `font-agent-thought` class to the container or wrapper of the agent reasoning (thought) text.
- [ ] If using `react-markdown`, wrap the reasoning text in a styled container to ensure all child paragraphs inherit the Italic Serif typography.
- [ ] Add the `italic` Tailwind class to the header or body of the thought blocks to ensure the required style is applied.

## 3. Code Review
- [ ] Verify that thoughts look distinct from implementation code (monospace) and observations (terminal-like).
- [ ] Ensure the "internal monologue" feel is achieved via the specific serif stack as per REQ-DES-034-1.
- [ ] Check for readability on both light and dark VSCode themes.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test` in the `@devs/vscode` package to verify the `ThoughtStreamer` styling.

## 5. Update Documentation
- [ ] Update the `AOD` in `packages/vscode/webview/src/components/ThoughtStreamer.agent.md` to explain the typography logic and the REQ-ID mapping.

## 6. Automated Verification
- [ ] Run a React Testing Library script that renders a `ThoughtStreamer` with a sample thought and asserts that the `getComputedStyle` contains `italic` and `serif`.
