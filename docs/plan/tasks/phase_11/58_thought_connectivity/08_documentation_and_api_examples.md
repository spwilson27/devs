# Task: Documentation & Examples for Thought Connectivity (Sub-Epic: 58_Thought_Connectivity)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-084], [6_UI_UX_ARCH-REQ-099]

## 1. Initial Test Written
- [ ] Add a markdown lint/check to ensure the new docs compile and link correctly.
  - File: `docs/ui/thought_connectivity.md` (to be created by this task implementation step)
  - Test: run existing doc build or `markdownlint` (e.g., `pnpm run lint:md docs/ui/thought_connectivity.md`).

## 2. Task Implementation
- [ ] Create a developer-facing doc with protocol examples, component usage, and accessibility guidance.
  - File: `docs/ui/thought_connectivity.md`
  - Content to include:
    1. Short summary mapping to requirements 6_UI_UX_ARCH-REQ-084 and 6_UI_UX_ARCH-REQ-099.
    2. JSON examples for Thought and ToolCall messages showing `sourceThoughtId`.
    3. Usage example for `ThoughtLinkRenderer` (props + expected DOM attributes on Thought/ToolCall elements).
    4. Accessibility guidance: how `aria-live` is used and how consumers can opt-out or mark messages as high priority.
    5. Mermaid diagram showing flow: Thought -> ToolCall -> Orchestrator -> Webview (use mermaid flowchart notation).

## 3. Code Review
- [ ] Verify docs:
  - Contain reproducible examples and show minimal working code snippets.
  - Mermaid diagram renders in the docs preview and uses plain text nodes.
  - Links to schema and tests are correct.

## 4. Run Automated Tests to Verify
- [ ] Run markdown linter and the doc build (if present): `pnpm run lint:md docs/ui/thought_connectivity.md` and `pnpm run docs:build`.

## 5. Update Documentation
- [ ] This task creates or updates `docs/ui/thought_connectivity.md` and adds example files under `specs/examples/thought-toolcall.json`.

## 6. Automated Verification
- [ ] Add a CI check for docs that validates the mermaid snippet by rendering it (if doc pipeline supports it) and runs the markdown linter; fail PR on broken links or missing schema references.