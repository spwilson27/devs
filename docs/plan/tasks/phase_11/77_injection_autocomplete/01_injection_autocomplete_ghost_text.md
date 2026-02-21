# Task: Injection Autocomplete and Priority (Sub-Epic: 77_Injection_Autocomplete)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-100-2], [7_UI_UX_DESIGN-REQ-UI-DES-100-3], [7_UI_UX_DESIGN-REQ-UI-DES-100-4]

## 1. Initial Test Written
- [ ] Write a unit test ensuring that typing `@` fetches and displays a list of project files, and `#` triggers requirement IDs.
- [ ] Write a test to ensure ghost text renders correctly inside the input field.
- [ ] Write a test validating the "Immediate Pivot" toggle correctly modifies the emitted directive payload.

## 2. Task Implementation
- [ ] Implement an Autocomplete popover within the Directive input that parses input for `@` and `#` symbols to fetch contextual lists.
- [ ] Add visual Ghost Text `Whisper a directive to the agent (e.g., 'Use fetch instead of axios')...` as the input placeholder or trailing text.
- [ ] Add the Priority Toggle checkbox for "Immediate Pivot" near the input that flags the directive for instant mid-turn interruption.

## 3. Code Review
- [ ] Check performance of the regex matching and autocomplete list rendering (`useMemo` for large project files).
- [ ] Verify that the Immediate Pivot toggle visually reflects its high-priority state.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test -- InjectionAutocomplete.test.tsx`.

## 5. Update Documentation
- [ ] Add the autocomplete query architecture to the frontend specification document.

## 6. Automated Verification
- [ ] Run standard lints and build checks: `npm run lint`.
