# Task: i18next Infrastructure Setup & Configuration (Sub-Epic: 94_Language_Pluralization_UI)

## Covered Requirements
- [4_USER_FEATURES-REQ-053]

## 1. Initial Test Written
- [ ] In `packages/vscode-webview/src/i18n/`, create `__tests__/i18n.setup.test.ts`.
- [ ] Write a test that imports the configured `i18n` instance and asserts `i18n.isInitialized` is `true` after the async `init()` call resolves.
- [ ] Write a test that verifies the default language namespace (`translation`) is loaded and that `i18n.t('app.title')` returns a non-empty string.
- [ ] Write a test using `i18next-icu` (or `i18next-intervalplural-postprocessor`) to verify English pluralization: `i18n.t('tasks.count', { count: 0 })` returns `"0 tasks"`, `i18n.t('tasks.count', { count: 1 })` returns `"1 task"`, and `i18n.t('tasks.count', { count: 5 })` returns `"5 tasks"`.
- [ ] Write a test that verifies Russian pluralization rules (a language with 3 plural forms) are correctly handled by the ICU message format processor.
- [ ] Write a test that verifies switching language via `i18n.changeLanguage('fr')` causes `i18n.t('app.title')` to return the French translation.
- [ ] Write a test that asserts `<I18nextProvider i18n={i18n}>` wrapper renders child components without throwing.

## 2. Task Implementation
- [ ] In `packages/vscode-webview`, install dependencies: `i18next`, `react-i18next`, `i18next-icu`, and `i18next-http-backend` (or `i18next-resources-to-backend` for bundled locales).
- [ ] Create `packages/vscode-webview/src/i18n/index.ts`. Initialize i18next with the following configuration:
  - `lng: 'en'` as default language.
  - `fallbackLng: 'en'`.
  - `ns: ['translation', 'models']` — two namespaces: one for general UI strings, one for model-related copy.
  - `defaultNS: 'translation'`.
  - Use `initReactI18next` plugin for React binding.
  - Use `i18next-icu` (or `i18next-intervalplural-postprocessor`) plugin to enable ICU message format for pluralization and gendered grammar.
  - `interpolation: { escapeValue: false }` (React handles XSS).
  - `react: { useSuspense: true }`.
- [ ] Create the base locale directory at `packages/vscode-webview/public/locales/en/translation.json`. Populate it with a skeleton of all UI keys used in the extension (at minimum: `app.title`, `tasks.count` as an ICU plural string `"{count, plural, =0 {# tasks} one {# task} other {# tasks}}"`, `phase.label`, `status.*` variants).
- [ ] Create `packages/vscode-webview/public/locales/en/models.json` with a skeleton key `models.selector.label`.
- [ ] Create stub locale files for `fr` and `ru` (at minimum the same keys as `en`) to allow language-switch tests to pass.
- [ ] Wrap the root React app in `packages/vscode-webview/src/main.tsx` (or `App.tsx`) with `<React.Suspense fallback={<LoadingSpinner />}><I18nextProvider i18n={i18n}>{children}</I18nextProvider></React.Suspense>`.
- [ ] Export the `i18n` singleton from `packages/vscode-webview/src/i18n/index.ts` for use in tests and other modules.

## 3. Code Review
- [ ] Verify that the `i18n` initialization is called once and the singleton is re-used; no duplicate `init()` calls anywhere.
- [ ] Confirm ICU message format is active for the pluralization plugin — check that non-ICU-format keys (e.g., `key_plural`) do NOT exist; all plural strings use ICU `{count, plural, ...}` syntax.
- [ ] Ensure locale JSON files are bundled as static assets via the Vite/webpack config (`publicDir` or `CopyPlugin`), not inlined into JS bundles, so they can be loaded lazily.
- [ ] Check that the `fallbackLng` chain correctly falls back to `en` and logs a warning (not an error) for missing keys.
- [ ] Confirm `escapeValue: false` is documented with a comment explaining React's built-in XSS protection.
- [ ] Verify that `useSuspense: true` is consistent with the Suspense boundary added at the app root.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode-webview test -- --testPathPattern="i18n"` and confirm all tests pass with 0 failures.
- [ ] Run the full webview test suite `pnpm --filter @devs/vscode-webview test` to ensure no regressions.

## 5. Update Documentation
- [ ] Add a section `### Internationalization (i18n)` to `packages/vscode-webview/AGENT.md` (or create it if absent) documenting:
  - The i18next setup, plugin choices, and ICU message format.
  - How to add a new locale (create `public/locales/<lang>/translation.json`).
  - How to add a new UI string (add ICU key to all locale files, use `useTranslation()` hook in React).
  - The two namespaces (`translation`, `models`) and their scope.
- [ ] Update `packages/vscode-webview/package.json` `peerDependencies` or `dependencies` comments to annotate why `i18next-icu` was chosen over other plural processors.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode-webview test -- --coverage --testPathPattern="i18n"` and assert coverage is ≥ 90% for `src/i18n/index.ts`.
- [ ] Run `pnpm --filter @devs/vscode-webview build` and verify the build succeeds with no TypeScript errors related to i18n types.
- [ ] Inspect the build output directory to confirm locale JSON files appear under `dist/locales/en/` and `dist/locales/fr/` (i.e., they were copied, not inlined).
