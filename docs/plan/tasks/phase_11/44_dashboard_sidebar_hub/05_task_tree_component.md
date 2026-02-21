# Task: Task Tree Component (Compact) (Sub-Epic: 44_Dashboard_Sidebar_Hub)

## Covered Requirements
- [1_PRD-REQ-INT-007], [4_USER_FEATURES-REQ-006], [7_UI_UX_DESIGN-REQ-UI-DES-090]

## 1. Initial Test Written
- [ ] Add unit tests at packages/webview/src/components/__tests__/TaskTree.test.tsx that assert:
  - The component renders the Active Epic title and a nested list of task nodes.
  - Task nodes show status tag (PENDING/SUCCESS/FAILED), progress percentage, and respond to click events by invoking onSelect(taskId).
  - Keyboard navigation works: ArrowDown moves selection, Enter triggers onOpen.

## 2. Task Implementation
- [ ] Implement TaskTree at packages/webview/src/components/TaskTree.tsx with props: rootEpic: Epic, onSelect(taskId: string), onToggle(taskId: string).
  - Each node should render: small progress bar (compact), task title (truncate to one line with ellipsis), status icon (codicon), and an affordance to expand/collapse child tasks.
  - Use minimal DOM depth and aria roles (role="tree", role="treeitem") to support screen readers.
  - Ensure component accepts a `dense` prop to switch to high-density rendering (reduced padding/margins) to satisfy High-Density Development Hub requirements.

## 3. Code Review
- [ ] Verify that the component does not render heavy subtrees until expanded (lazy render children) to reduce initial paint cost.
- [ ] Verify progress rendering uses CSS transforms for performant updates.
- [ ] Verify accessibility attributes and minimum interactive target sizes are respected (24px), but `dense` mode can reduce padding while maintaining tappable areas.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- packages/webview/src/components/__tests__/TaskTree.test.tsx` and ensure tests pass.

## 5. Update Documentation
- [ ] Add an entry in docs/components.md describing TaskTree props, `dense` mode behavior, and expected JSON shape for TaskNode.

## 6. Automated Verification
- [ ] Run jest tests and a performance smoke script that renders a 200-node tree in jsdom and asserts render completes within a configurable threshold (e.g., 500ms in CI environment).
