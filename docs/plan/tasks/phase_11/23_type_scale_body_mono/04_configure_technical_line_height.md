# Task: Configure Typography for Technical Blocks (LogTerminal) (Sub-Epic: 23_Type_Scale_Body_Mono)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-033-5], [7_UI_UX_DESIGN-REQ-UI-DES-035]

## 1. Initial Test Written
- [ ] Create a component test for `LogTerminal` in `packages/webview/src/components/Console/__tests__/LogTerminal.test.tsx`.
- [ ] Verify that the technical log blocks have the classes `text-devs-mono` and `leading-devs-technical` applied.
- [ ] Assert that the computed `font-size` is `12px` and `line-height` is `1.4`.

## 2. Task Implementation
- [ ] Modify the `LogTerminal` component (or `ActionCard` primitive if used) in `packages/webview/src/components/Console/LogTerminal.tsx`.
- [ ] Apply the `text-devs-mono` and `leading-devs-technical` Tailwind classes to the output container.
- [ ] If using `xterm.js`, configure the `fontSize` and `lineHeight` options in the terminal constructor to match these requirements.
- [ ] Ensure that ANSI-colored output still respects these typography constraints.

## 3. Code Review
- [ ] Verify that the 12px/1.4 combination provides optimal density for technical logs as per REQ-UI-DES-035-2.
- [ ] Ensure that code blocks inherit the user's active VSCode editor font if possible, but fallback to 12px devs-mono.
- [ ] Check that the line-height doesn't cause clipping in the terminal rendering.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test` to verify the `LogTerminal` component tests pass.

## 5. Update Documentation
- [ ] Document the technical typography settings in the `AOD` for the `LogTerminal` component.

## 6. Automated Verification
- [ ] Verify that the `LogTerminal` component source code contains the strings `text-devs-mono` and `leading-devs-technical`.
