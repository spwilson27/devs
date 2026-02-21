# Task: Context-Aware Injection Core (Sub-Epic: 76_Directive_Injection_Core)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-100], [7_UI_UX_DESIGN-REQ-UI-DES-100-1]

## 1. Initial Test Written
- [ ] Write a keyboard event test asserting that pressing `Cmd+K` (macOS) or `Ctrl+K` (Windows) mounts and focuses the `DirectiveInjection` dialogue.
- [ ] Ensure the component state reflects "waiting for context input" initially.

## 2. Task Implementation
- [ ] Create the `DirectiveInjectionCore.tsx` component that renders a modal or text field whenever the shortcut is activated.
- [ ] Bind robust keydown listeners at the document/window level so that the injection trigger intercepts smoothly without blocking standard browser defaults unless pressed.

## 3. Code Review
- [ ] Review event cleanup in `useEffect` hooks to prevent memory leaks from dangling `keydown` listeners.
- [ ] Ensure the injection dialogue styling aligns with glass box effects and overlay depth.

## 4. Run Automated Tests to Verify
- [ ] Run the test suite: `npm run test -- DirectiveInjectionCore.test.tsx`.

## 5. Update Documentation
- [ ] Update shortcut and keybinding reference docs to reserve `Cmd+K` / `Ctrl+K`.

## 6. Automated Verification
- [ ] Validate component rendering via Storybook snapshot.
