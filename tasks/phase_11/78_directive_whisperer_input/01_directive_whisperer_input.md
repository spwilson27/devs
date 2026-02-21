# Task: Directive Whisperer Input (Sub-Epic: 78_Directive_Whisperer_Input)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-030], [6_UI_UX_ARCH-REQ-089]

## 1. Initial Test Written
- [ ] Write integration test verifying the `DirectiveWhisperer` component mounts persistently at the bottom of the sidebar/console.
- [ ] Write tests ensuring that text input submitted here sends a "User Whispering" action payload.

## 2. Task Implementation
- [ ] Implement `DirectiveWhisperer.tsx` as a persistent input field component.
- [ ] Position this field firmly in the sidebar footer or console layout, ensuring it is always available for mid-task guidance without having to invoke modal popups.

## 3. Code Review
- [ ] Ensure positioning robustly handles viewport resizing without obscuring content beneath it.
- [ ] Verify accessibility attributes (ARIA roles) on the permanent text field.

## 4. Run Automated Tests to Verify
- [ ] Execute `npm run test -- DirectiveWhisperer.test.tsx`.

## 5. Update Documentation
- [ ] Update architectural diagrams showing user data flow from the persistent whisperer input to the HITL orchestrator.

## 6. Automated Verification
- [ ] Check console warnings during tests to ensure no prop or styling warnings are emitted.
