# Task: UI String Externalization & Pluralization/Gendered Grammar (Sub-Epic: 94_Language_Pluralization_UI)

## Covered Requirements
- [4_USER_FEATURES-REQ-053]

## 1. Initial Test Written
- [ ] In `packages/vscode-webview/src/components/__tests__/`, create `AgentConsole.i18n.test.tsx`.
- [ ] Using `react-i18next`'s `renderWithI18n` test utility (or a custom wrapper that provides the initialized `i18n` instance), render the `AgentConsole` component and assert that all visible text strings are retrieved from locale keys — not hardcoded literals. Do this by switching the i18n language to `fr` before render and verifying the French strings appear.
- [ ] Write a test for the `PhaseStepperWidget` component that checks the phase label (e.g., "Phase 1 of 8") uses the ICU plural key `phases.progress` with correct argument binding.
- [ ] Write a test for the `TaskCountBadge` component verifying: count=0 → "0 tasks", count=1 → "1 task", count=2 → "2 tasks" using `useTranslation()`.
- [ ] Write a test for a hypothetical `AgentRoleLabel` component that renders the agent role name using a gendered grammar key (e.g., Spanish `agent.role.developer_male` vs. `agent.role.developer_female` selected via a `gender` prop), validating the correct ICU `{gender, select, ...}` pattern is used.
- [ ] Write a snapshot test for the `StatusBadge` component confirming that i18n keys render correctly in the `en` locale.

## 2. Task Implementation
- [ ] Audit all `.tsx` / `.ts` files under `packages/vscode-webview/src/components/` and `packages/vscode-webview/src/views/` for hardcoded user-visible strings (button labels, status messages, headings, tooltips, ARIA labels).
- [ ] Replace every hardcoded string with a call to the `useTranslation()` hook's `t()` function or the `<Trans>` component for strings containing embedded React elements. Example: replace `<span>Running</span>` with `<span>{t('status.running')}</span>`.
- [ ] Add the corresponding ICU-format key-value pairs to `public/locales/en/translation.json`. For plural strings, use the ICU plural form: `"tasks.count": "{count, plural, =0 {# tasks} one {# task} other {# tasks}}"`. For gendered grammar, use ICU select: `"agent.role": "{gender, select, male {Developer} female {Developer} other {Developer}}"` (extend for languages that grammatically distinguish gender).
- [ ] For the `AgentConsole` component, replace all status/phase labels with `t('status.<key>')` calls. Pass dynamic variables (e.g., task name, phase number) as i18next interpolation objects.
- [ ] For the `PhaseStepperWidget`, implement `t('phases.progress', { current: currentPhase, total: totalPhases })` using an ICU `{current} of {total}` message pattern.
- [ ] Create the `TaskCountBadge` component (if not yet existing) at `packages/vscode-webview/src/components/TaskCountBadge.tsx` that uses `t('tasks.count', { count })`.
- [ ] For any component using ARIA labels (e.g., `aria-label="Close panel"`), replace with `t('aria.closePanel')` and add the key to locale files.
- [ ] Propagate new keys to stub locale files (`fr`, `ru`) with placeholder translations (values may mirror English but must be present to avoid missing-key warnings).

## 3. Code Review
- [ ] Verify no hardcoded English strings remain in any `.tsx` or `.ts` file under `src/components/` and `src/views/`. Use `grep -r '"[A-Z][a-z]' src/components/ src/views/ --include="*.tsx"` to surface suspicious literals.
- [ ] Confirm all plural strings use ICU `{count, plural, ...}` syntax, not the legacy `key_plural` i18next pattern.
- [ ] Confirm all gendered strings use ICU `{gender, select, ...}` syntax.
- [ ] Check that ARIA label strings are also externalized (not hardcoded), enabling future translation of accessibility text.
- [ ] Verify that `<Trans>` is used (not string concatenation with `t()`) for strings that embed React components (e.g., links, `<strong>` tags).
- [ ] Ensure all locale JSON files remain valid JSON (run `jq . public/locales/**/*.json` to validate).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode-webview test -- --testPathPattern="i18n|AgentConsole|PhaseStepperWidget|TaskCountBadge|StatusBadge"` and confirm 0 failures.
- [ ] Run the full webview test suite `pnpm --filter @devs/vscode-webview test` and confirm no regressions.

## 5. Update Documentation
- [ ] In `packages/vscode-webview/AGENT.md`, add a subsection `#### Externalizing Strings` that documents:
  - The rule that **all** user-visible strings must use `t()` or `<Trans>`, never hardcoded.
  - The ICU plural and select formats used.
  - Instructions for future developers to run the grep audit command to check for regressions.
- [ ] Update `public/locales/en/translation.json` with a top-level comment block (as a `"_comment"` key) explaining the ICU format conventions.

## 6. Automated Verification
- [ ] Execute `grep -rn '"[A-Z][a-z][a-z]' packages/vscode-webview/src/components/ packages/vscode-webview/src/views/ --include="*.tsx" | grep -v "t('" | grep -v "//"` — the result must return 0 matches (no unlocalized capitalized strings in JSX).
- [ ] Run `pnpm --filter @devs/vscode-webview test -- --coverage` and confirm i18n-related component coverage ≥ 85%.
- [ ] Run `node -e "require('./packages/vscode-webview/public/locales/en/translation.json')"` (or `jq . ...`) to assert all locale JSON files parse without errors.
