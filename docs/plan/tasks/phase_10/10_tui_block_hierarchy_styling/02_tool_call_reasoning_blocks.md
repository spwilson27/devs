# Task: Apply Structured Block Styling to Tool Calls & Reasoning (Sub-Epic: 10_TUI Block & Hierarchy Styling)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-065-1]

## 1. Initial Test Written
- [ ] Create or update `packages/cli/src/tui/components/__tests__/LogTerminal.test.tsx`.
- [ ] Mock the agent event stream to include `TOOL_CALL` and `REASONING_TURN` events.
- [ ] Verify that `TOOL_CALL` events are rendered using the `StructuredBlock` component.
- [ ] Verify that the tool name (e.g., `READ_FILE`) is rendered in **Monospace Bold** within the block.
- [ ] Verify that `REASONING_TURN` events are rendered using the `StructuredBlock` component with Italic styling (ANSI fallback for Serif).
- [ ] Verify that the appropriate colors are used (e.g., Magenta for reasoning as per `7_UI_UX_DESIGN-REQ-UI-DES-024-3`).

## 2. Task Implementation
- [ ] Update `LogTerminal` component in `packages/cli/src/tui/components/LogTerminal.tsx`.
- [ ] Integrate `StructuredBlock` into the rendering loop for log entries.
- [ ] For `TOOL_CALL` entries:
    - Wrap the call details in a `StructuredBlock`.
    - Set the title to the tool name (e.g., `ACTION: READ_FILE`).
    - Use `chalk.bold` or Ink's `bold` prop for the tool name.
- [ ] For `REASONING_TURN` (Thought) entries:
    - Wrap the reasoning text in a `StructuredBlock`.
    - Use Italic styling for the content.
    - Set the `borderColor` to Magenta.
- [ ] Ensure that multi-line thoughts and tool arguments are correctly padded within the box.

## 3. Code Review
- [ ] Verify that the `LogTerminal` remains performant (uses `React.memo` where appropriate) during high-frequency streaming.
- [ ] Ensure that the visual separation between thoughts and actions is clear and consistent.
- [ ] Check that the Monospace Bold requirement for tool names is strictly followed.

## 4. Run Automated Tests to Verify
- [ ] Execute `npx vitest packages/cli/src/tui/components/__tests__/LogTerminal.test.tsx` and ensure all tests pass.

## 5. Update Documentation
- [ ] Update the `LogTerminal` section in the phase documentation to reflect the new structured block rendering for agent events.

## 6. Automated Verification
- [ ] Run the orchestrator in a simulation mode `devs run --simulate` and capture the TUI output to a file, then grep for box-drawing characters to confirm they are being emitted for tool calls.
