# Task: Semantic HTML & ARIA Structure for WCAG 2.1 AA (Sub-Epic: 85_Accessibility_WCAG_Base)

## Covered Requirements
- [4_USER_FEATURES-REQ-044], [7_UI_UX_DESIGN-REQ-UI-DES-084]

## 1. Initial Test Written
- [ ] In `packages/vscode/webview-ui/src/__tests__/accessibility/semantic-structure.test.tsx`, write the following tests using `@testing-library/react` and `jest-axe`:
  - Render the `<App />` root and assert `axe()` output has zero violations for the `landmark` and `region` rule categories.
  - Render `<DashboardView />` and assert it contains exactly one `<main>` element (via `screen.getByRole('main')`).
  - Render the sidebar navigation component and assert `screen.getByRole('navigation')` resolves (i.e., a `<nav>` landmark exists).
  - Render `<DAGCanvas />` and assert its interactive SVG nodes are reachable via `screen.getAllByRole('button')` or `screen.getAllByRole('treeitem')` (whichever semantic model is chosen).
  - Render `<ThoughtStreamer />` and assert the container has `role="log"` and `aria-live="polite"` attributes.
  - Render the `<DirectiveWhisperer />` input and assert `screen.getByRole('textbox')` is present with an associated `aria-label` or `aria-labelledby`.
  - Render any modal/popup component and assert `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` are set.
  - Run full `axe()` scan with `{ rules: { 'aria-required-attr': { enabled: true }, 'aria-roles': { enabled: true }, 'landmark-one-main': { enabled: true } } }` against a composite render of `<App />` and assert zero violations.

## 2. Task Implementation
- [ ] Audit all existing components in `packages/vscode/webview-ui/src/components/` for missing semantic roles:
  - Replace `<div>` wrappers used as navigation containers with `<nav aria-label="...">`.
  - Replace the primary content wrapper `<div>` with `<main>`.
  - Replace sidebar region `<div>` with `<aside aria-label="Project Sidebar">`.
  - Replace status-bar-like `<div>` elements with `<footer>` or `<section aria-label="Status Bar">`.
- [ ] In `<ThoughtStreamer />` component:
  - Set `role="log"` and `aria-live="polite"` and `aria-relevant="additions"` on the scrollable container element.
  - Set `aria-atomic="false"` so screen readers announce each new thought individually.
- [ ] In `<DAGCanvas />` component:
  - Wrap the SVG in a `<div role="tree" aria-label="Task Dependency Graph">`.
  - Each task node (`<g>` or `<foreignObject>`) must have `role="treeitem"`, `tabIndex={0}`, and `aria-label={\`Task ${task.id}: ${task.title}, status ${task.status}\`}`.
  - Ensure arrow-key keyboard navigation cycles focus through nodes (implement `onKeyDown` handler using `ArrowUp`/`ArrowDown`/`ArrowLeft`/`ArrowRight` to move focus to adjacent nodes).
- [ ] In `<DirectiveWhisperer />`:
  - Ensure the `<input>` or `<textarea>` has `aria-label="Directive Input"` or is associated via `<label htmlFor="...">`.
  - Ensure the autocomplete dropdown (when visible) has `role="listbox"` and each suggestion has `role="option"`.
- [ ] In any modal/dialog components (e.g., HITL approval popups, RCA report):
  - Set `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to the dialog's `<h2>` heading `id`.
  - Implement focus trap: on open, move focus to first focusable element; on close, return focus to the trigger element.
- [ ] In `<App />` root (or `index.tsx`), add a skip-navigation link as the **first focusable element** in the DOM:
  ```tsx
  <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[400] focus:bg-[var(--vscode-button-background)] focus:text-[var(--vscode-button-foreground)] focus:px-4 focus:py-2">
    Skip to main content
  </a>
  ```
  Ensure the `<main>` element has `id="main-content"`.
- [ ] Add Tailwind `sr-only` utility class usage (already available via Tailwind) for screen-reader-only text throughout components (e.g., icon-only buttons must have `<span className="sr-only">Close</span>` adjacent to the icon).

## 3. Code Review
- [ ] Run `grep -rn "<div" packages/vscode/webview-ui/src/components/ | grep -v "role=" | grep -v "className"` and manually confirm no semantic region `<div>` lacks a role where a semantic HTML element would be appropriate.
- [ ] Verify every interactive element (buttons, links, inputs, nodes) is reachable via keyboard Tab order in a logical DOM sequence. Use `screen.getAllByRole` in tests to confirm.
- [ ] Confirm `<ThoughtStreamer />` has `aria-live`, `aria-relevant`, and `aria-atomic` attributes set exactly as specified — no other `aria-live` regions should exist on the page (duplicates confuse screen readers).
- [ ] Confirm every icon-only `<button>` component has either a visible label or an `aria-label` attribute — no bare icon buttons.
- [ ] Verify focus trap implementation in modals using `focus-trap-react` or equivalent — do not implement manually if a library is already in the dependency tree.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=semantic-structure` from `packages/vscode/webview-ui` and confirm all semantic structure tests pass.
- [ ] Run `npm run test:a11y` and confirm zero `landmark`, `aria-*`, and `region` rule violations.
- [ ] Run the Playwright WCAG audit: `npx playwright test e2e/accessibility/wcag-audit.spec.ts` and confirm zero violations for rules: `landmark-one-main`, `aria-required-attr`, `aria-roles`, `bypass`.

## 5. Update Documentation
- [ ] In `packages/vscode/webview-ui/README.md`, add a `### Semantic HTML & ARIA Conventions` section documenting:
  - The landmark structure (`<nav>`, `<main id="main-content">`, `<aside>`, `<footer>`).
  - The `role="log" aria-live="polite"` pattern for `<ThoughtStreamer />`.
  - The `role="tree"` / `role="treeitem"` pattern for `<DAGCanvas />`.
  - The skip-navigation link pattern.
  - The focus trap requirement for modals.
- [ ] Update `packages/vscode/webview-ui/webview-ui.agent.md` with a memory entry:
  ```
  ARIA / Semantic conventions:
  - Page landmark structure: <nav>, <main id="main-content">, <aside>, <footer>
  - Skip link: first DOM child of <App /> root
  - ThoughtStreamer: role="log" aria-live="polite" aria-atomic="false"
  - DAGCanvas nodes: role="treeitem" tabIndex={0} aria-label="Task {id}: {title}, status {status}"
  - Modals: role="dialog" aria-modal="true" aria-labelledby="{headingId}" + focus trap
  - Icon-only buttons: must have aria-label or adjacent sr-only span
  ```

## 6. Automated Verification
- [ ] Execute `npx jest --testPathPattern=semantic-structure --verbose 2>&1 | grep -E "PASS|FAIL"` and assert all suites show `PASS`.
- [ ] Execute `npx playwright test e2e/accessibility/wcag-audit.spec.ts --reporter=json | jq '.suites[].specs[] | select(.ok == false)'` and assert no output (all specs pass).
- [ ] Execute `grep -rn 'aria-live' packages/vscode/webview-ui/src/components/ThoughtStreamer` and confirm at least one match with value `"polite"`.
- [ ] Execute `grep -rn 'role="dialog"' packages/vscode/webview-ui/src/components/` and confirm at least one modal component is found.
