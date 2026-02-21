# Task: Implement Node Hover Elevation (Sub-Epic: 53_Interaction_Highlighting)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-055-1]

## 1. Initial Test Written
- [ ] Create a unit test at src/components/DAG/__tests__/Node.hover.test.tsx using Jest + React Testing Library:
  - Render the Node component with props { id: 'n-hover', label: 'Hover me' } and include a wrapper element with data-testid={`dag-node-${id}`}.
  - Assert the element has no transform before hover (element.style.transform is falsy or '').
  - Simulate fireEvent.mouseEnter(nodeEl).
  - Assert nodeEl.style.transform === 'scale(1.05)' and that the node has an increased shadow (classList contains 'shadow-md' or nodeEl.style.boxShadow contains a shadow value).
  - Simulate fireEvent.mouseLeave(nodeEl) and assert transform and shadow are removed/reverted.
  - If the component depends on providers (Zustand store, Theme provider), mount with minimal mocked providers.

## 2. Task Implementation
- [ ] Modify src/components/DAG/Node.tsx (or .jsx/.tsx):
  - Add internal hovered state: const [hovered, setHovered] = useState(false).
  - Add handlers: onMouseEnter={() => setHovered(true)} and onMouseLeave={() => setHovered(false)}.
  - Apply inline style to the node wrapper: style={{ transform: hovered ? 'scale(1.05)' : 'none', boxShadow: hovered ? 'var(--devs-shadow-md)' : undefined, transition: 'transform 150ms ease, box-shadow 150ms ease' }} and include data-testid={`dag-node-${id}`}.
  - Also include Tailwind-friendly utility classes if the project uses Tailwind (e.g., 'transform transition-transform duration-150').
  - Respect reduced-motion: if window.matchMedia('(prefers-reduced-motion: reduce)').matches, avoid transitions and transforms; apply only a static shadow.
  - Export the component unchanged and wrap with React.memo for performance if appropriate.

## 3. Code Review
- [ ] During code review verify:
  - The effect uses CSS transform (GPU-accelerated) and not layout-changing properties.
  - Reduced-motion preference is respected and toggles off motion appropriately.
  - The Node component is memoized to avoid unnecessary re-renders.
  - Accessibility: the node has an accessible name and hover-only effects do not convey required information.

## 4. Run Automated Tests to Verify
- [ ] Run the new unit test: npm test -- --testPathPattern=Node.hover.test.tsx and confirm the test passes.
- [ ] Optionally run the whole test suite: npm test

## 5. Update Documentation
- [ ] Add a short note to docs/ui/interaction_highlighting.md and update specs/7_ui_ux_design.md documenting the hover elevation implementation, including the CSS snippet and reduced-motion behavior.

## 6. Automated Verification
- [ ] Run jest with JSON output to assert success: npm test -- --testPathPattern=Node.hover.test.tsx --json --outputFile=tmp/node-hover-test.json and use a small script to assert the JSON indicates success (or run a puppeteer script that mounts the component and asserts computedStyle.transform contains the expected scale matrix).

Commit notes: make a single small PR implementing the Node hover behavior, include tests, and in the commit message add the required Co-authored-by trailer.
