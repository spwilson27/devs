# Task: Install and Configure i18next Infrastructure in Webview (Sub-Epic: 92_i18n_Skeleton_Core)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-101]

## 1. Initial Test Written
- [ ] In `packages/vscode/webview/src/__tests__/i18n/`, create `i18n.setup.test.ts`.
- [ ] Write a test that imports the i18n singleton (`src/i18n/index.ts`) and asserts:
  - `i18n.isInitialized` is `true` after `await i18n.init()`.
  - `i18n.language` resolves to a non-empty BCP 47 locale string (e.g. `"en"` or `"en-US"`) on startup.
  - `i18n.t('app.title')` returns a non-empty string (does not return the key verbatim).
  - Calling `i18n.changeLanguage('fr')` resolves successfully and updates `i18n.language` to `"fr"`.
- [ ] Write a test for the `I18nextProvider` wrapper: render `<I18nextProvider i18n={i18n}><App /></I18nextProvider>` with React Testing Library; assert no uncaught console errors and the root renders without crashing.
- [ ] Add a test asserting that the `LanguageDetector` plugin is registered: `i18n.services.languageDetector` must not be `undefined`.

## 2. Task Implementation
- [ ] In `packages/vscode/webview/`, install production dependencies:
  ```
  npm install i18next react-i18next i18next-browser-languagedetector
  ```
- [ ] Create `packages/vscode/webview/src/i18n/index.ts`:
  - Import `i18next`, `initReactI18next`, and `LanguageDetector`.
  - Call `i18next.use(LanguageDetector).use(initReactI18next).init({...})` with:
    - `fallbackLng: 'en'`
    - `supportedLngs: ['en']` (expandable; only English skeleton is required in this task)
    - `ns: ['common', 'dashboard', 'console', 'roadmap', 'settings']`
    - `defaultNS: 'common'`
    - `interpolation: { escapeValue: false }` (React already escapes)
    - `detection: { order: ['navigator'], caches: [] }` — read from `navigator.language`, do not cache to `localStorage` yet.
    - `resources: {}` — populated via dynamic `import()` in task 02.
  - Export the configured `i18next` instance as the default export.
- [ ] Create `packages/vscode/webview/src/i18n/types.ts` with TypeScript module augmentation to provide strong typing for `t()` key paths (generate empty typed `Resources` interface as a stub for now).
- [ ] Wrap the React root in `packages/vscode/webview/src/index.tsx` with `<I18nextProvider i18n={i18n}>` before the `<App />` component. Do not render until `i18n.isInitialized` (use `i18n.on('initialized', ...)` or a `<Suspense>` gate).
- [ ] Verify the TypeScript project still compiles: `npx tsc --noEmit` from `packages/vscode/webview/`.

## 3. Code Review
- [ ] Confirm `i18next` instance is created **once** (singleton module), not inside a React component or hook.
- [ ] Confirm `LanguageDetector` is the **only** detection source; no hardcoded `lng` override that would break dynamic locale switching.
- [ ] Confirm `escapeValue: false` is documented with a comment explaining why (React XSS protection).
- [ ] Confirm there are **no hardcoded locale strings** (e.g., `"en-US"`) left in the init config other than the `fallbackLng` safety net.
- [ ] Confirm the render gate prevents a flash of untranslated content (FOUC); verify with a Suspense boundary or an `initialized` state boolean before the first `ReactDOM.render` / `createRoot().render()` call.

## 4. Run Automated Tests to Verify
- [ ] Run the Webview test suite:
  ```bash
  cd packages/vscode/webview && npm test -- --testPathPattern="i18n/i18n.setup"
  ```
- [ ] All tests in `i18n.setup.test.ts` must pass with zero failures.
- [ ] Run the full Webview unit test suite to confirm no regressions:
  ```bash
  cd packages/vscode/webview && npm test
  ```
- [ ] Run TypeScript compilation check:
  ```bash
  cd packages/vscode/webview && npx tsc --noEmit
  ```

## 5. Update Documentation
- [ ] Create `packages/vscode/webview/src/i18n/i18n.agent.md` with:
  - Summary: "i18next is the i18n framework for the Webview. All static UI strings must go through `t()`. The singleton is initialised once in `src/i18n/index.ts`."
  - How to add a new namespace: add the key to `ns` array, create the JSON file in `src/i18n/locales/en/<namespace>.json`, and import it in `src/i18n/index.ts` resources.
  - How to add a new supported language: add the locale code to `supportedLngs`, create the locale directory, and supply translated JSON files.
- [ ] Update `packages/vscode/webview/README.md` with an "Internationalisation" section pointing to the agent doc.

## 6. Automated Verification
- [ ] Run:
  ```bash
  cd packages/vscode/webview && npm test -- --testPathPattern="i18n/i18n.setup" --json --outputFile=/tmp/i18n_setup_results.json
  ```
- [ ] Validate the output:
  ```bash
  node -e "const r = require('/tmp/i18n_setup_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"
  ```
  Exit code `0` confirms all tests pass.
- [ ] Run `npx tsc --noEmit` and assert exit code is `0`.
