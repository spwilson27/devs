# Task: Console ThoughtStreamer & SAOP Trace Rendering (Sub-Epic: 13_Console_Settings_Views)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-058]

## 1. Initial Test Written
- [ ] Write a test for the `ThoughtStreamer` component to verify incremental Markdown rendering using `react-markdown` (REQ-016).
- [ ] Write a test to ensure that thoughts are rendered in a distinct serif/italic font stack (REQ-017, REQ-076).
- [ ] Write a test to verify that `REQ-ID` mentions in thoughts are decorated with hoverable badges (REQ-019).
- [ ] Write a test for the `Chain-of-Thought` visualization, ensuring vertical connecting lines link tool calls to their preceding reasoning blocks (REQ-084).

## 2. Task Implementation
- [ ] Implement the `ThoughtStreamer` component logic to append-only stream SAOP `reasoning_chain` content without re-rendering the entire block.
- [ ] Implement the "Action Card" rendering in `ToolLog` for tool calls, showing tool names and arguments in a collapsed code block (REQ-083, REQ-104).
- [ ] Apply the distinctive typography for thoughts (Serif/Italic, Line-height 1.6) and observations (Mono, Dark background) (REQ-076, REQ-083).
- [ ] Implement the `DirectiveWhisperer` component with auto-complete for `@file` and `#requirement` IDs (REQ-031).
- [ ] Implement the "Directive Injected" success badge animation (transient +20px Y-offset) upon directive submission (UI-DES-054-1).
- [ ] Integrate `shiki` or Prism for syntax highlighting in terminal-themed observation blocks (REQ-077).

## 3. Code Review
- [ ] Verify that all real-time streams pass through the `SecretMasker` and show `[REDACTED]` for sensitive data (REQ-083).
- [ ] Ensure the font stack follows the hierarchy defined in REQ-076.
- [ ] Confirm that "Internal Thought" is visually separated from "External Output" (Action/Observation).

## 4. Run Automated Tests to Verify
- [ ] Run unit tests for `ThoughtStreamer`, `ToolLog`, and `DirectiveWhisperer`.
- [ ] Verify that the Markdown rendering supports GFM.

## 5. Update Documentation
- [ ] Update the UI Component Library documentation with the new `ActionCard` and `ThoughtStreamer` specifications.

## 6. Automated Verification
- [ ] Run a simulation that injects a directive and verifies the appearance of the "Directive Injected" badge and its subsequent disappearance.
