# Task: Clarification UI — VSCode Webview & CLI Clarification Field (Sub-Epic: 11_User Interface & Progress Reporting)

## Covered Requirements
- [4_USER_FEATURES-REQ-026]
- [1_PRD-REQ-UI-013]
- [9_ROADMAP-REQ-UI-013]

## 1. Initial Test Written
- [ ] In `packages/vscode-extension/src/webview/__tests__/ClarificationPanel.test.tsx`, write unit tests for the `ClarificationPanel` React component:
  - Test: renders a visible text input (clarification field) when `props.contradictions` is a non-empty array.
  - Test: does NOT render the clarification field when `props.contradictions` is an empty array.
  - Test: displays each `contradiction.clarificationQuestion` as a separate labelled prompt above the input field.
  - Test: calls `props.onSubmit(responseText)` with the current input value when the "Submit Clarification" button is clicked.
  - Test: the "Submit Clarification" button is disabled when the input field is empty.
  - Test: displays a status message "Clarification submitted. Resuming research…" after `onSubmit` is called.
- [ ] In `packages/cli/src/__tests__/ClarificationPrompt.test.tsx`, write unit tests using `ink-testing-library` for the `ClarificationPrompt` Ink component:
  - Test: renders each `contradiction.clarificationQuestion` on a separate line when given a non-empty contradictions array.
  - Test: renders a text input field (Ink `TextInput`) for the user to type a response.
  - Test: calls `props.onSubmit(responseText)` when the user presses Enter.
  - Test: renders "Clarification submitted. Resuming research…" after submission.
- [ ] In `packages/core/src/agents/__tests__/AICEngine.resolution.test.ts`, write an integration test:
  - Test: when a `AIC_RESOLVED` event is emitted with a clarification response, `ResearchManager` resumes and proceeds to report generation.
  - Test: the clarification response text is appended to `ResearchContext.userClarifications` array before report generation begins.

## 2. Task Implementation
- [ ] Create `packages/vscode-extension/src/webview/components/ClarificationPanel.tsx`:
  - Accept props: `contradictions: Contradiction[]`, `onSubmit: (response: string) => void`.
  - Render nothing (return `null`) if `contradictions` is empty.
  - For each contradiction, render a `<p>` with `contradiction.clarificationQuestion`.
  - Render a single `<vscode-text-area>` (from `@vscode/webview-ui-toolkit/react`) for the user's consolidated clarification response.
  - Render a `<vscode-button>` labelled "Submit Clarification", disabled when input is empty.
  - On button click, call `onSubmit(inputValue)` and display an inline success message.
- [ ] In the VSCode extension's webview message handler (`packages/vscode-extension/src/webview/App.tsx`), handle incoming `AIC_REQUESTED` messages from the extension host:
  - Store the `contradictions` array in component state.
  - Render `<ClarificationPanel contradictions={contradictions} onSubmit={handleClarificationSubmit} />`.
  - `handleClarificationSubmit(response)` sends a `AIC_RESPONSE` message to the extension host.
- [ ] In the extension host (`packages/vscode-extension/src/extension/extension.ts`), handle `AIC_RESPONSE` webview messages:
  - Re-emit as a `AIC_RESOLVED` event on the core `EventEmitter` with payload `{ response: string }`.
- [ ] Create `packages/cli/src/components/ClarificationPrompt.tsx`:
  - Accept props: `contradictions: Contradiction[]`, `onSubmit: (response: string) => void`.
  - Render each `contradiction.clarificationQuestion` using Ink `<Text>`.
  - Render an Ink `<TextInput>` bound to local state.
  - On Enter key press, call `onSubmit(inputValue)` and display "Clarification submitted. Resuming research…".
- [ ] In `packages/cli/src/hooks/useAICFlow.ts`, create a hook that:
  - Listens for `AIC_REQUESTED` events from the core `EventEmitter`.
  - Stores the `contradictions` array in state.
  - Exposes `submitClarification(response: string)` which emits `AIC_RESOLVED` on the core `EventEmitter`.
  - Clears the `contradictions` state after submission.
- [ ] In `packages/cli/src/commands/start.tsx`, conditionally render `<ClarificationPrompt>` driven by `useAICFlow` when contradictions are present.

## 3. Code Review
- [ ] Verify `ClarificationPanel` (VSCode) and `ClarificationPrompt` (CLI) are purely presentational components that receive all data via props — no direct `EventEmitter` access in component code.
- [ ] Verify message flow direction: core → extension host → webview (for display); webview → extension host → core (for response). No shortcutting.
- [ ] Confirm `AIC_RESOLVED` event payload includes the user's raw response string and is documented in `docs/ipc-events.md`.
- [ ] Verify that after `AIC_RESOLVED` is emitted, the `ResearchManager` appends the response to `researchContext.userClarifications` (not discards it).
- [ ] Confirm no personally identifiable or sensitive data is logged when handling clarification responses.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter vscode-extension test` and confirm all new `ClarificationPanel` tests pass.
- [ ] Run `pnpm --filter cli test` and confirm all new `ClarificationPrompt` tests pass.
- [ ] Run `pnpm --filter core test` to confirm the resolution integration test passes.
- [ ] Run `pnpm build` (workspace root) to verify all packages compile without errors.

## 5. Update Documentation
- [ ] Document `ClarificationPanel` in `packages/vscode-extension/docs/components.md` with props, expected messages (`AIC_REQUESTED`, `AIC_RESPONSE`), and screenshots (ASCII art or Mermaid sequence diagram).
- [ ] Document `ClarificationPrompt` in `packages/cli/docs/components.md` with props and interaction flow.
- [ ] Add a Mermaid sequence diagram to `docs/flows/aic-flow.md` showing the full AIC flow: `ResearchManager` → `AIC_REQUESTED` → UI (VSCode/CLI) → user input → `AIC_RESPONSE` → `AIC_RESOLVED` → `ResearchManager` resume.
- [ ] Update the agent memory file `docs/agent-memory/phase_5.md` to record: "AIC UI fully wired: VSCode `ClarificationPanel` and CLI `ClarificationPrompt` both handle `AIC_REQUESTED` events and emit `AIC_RESOLVED` upon user submission."

## 6. Automated Verification
- [ ] Run `pnpm --filter vscode-extension test --coverage` and assert coverage for `ClarificationPanel.tsx` is ≥ 90%.
- [ ] Run `pnpm --filter cli test --coverage` and assert coverage for `ClarificationPrompt.tsx` and `useAICFlow.ts` is ≥ 90%.
- [ ] Run `node scripts/verify_task.mjs --task 05_clarification_ui` to confirm: (a) `AIC_RESPONSE` message is handled in `extension.ts`, (b) `AIC_RESOLVED` is emitted from the extension host, (c) `ResearchManager` appends to `userClarifications` on receipt of `AIC_RESOLVED` (grep/AST check).
