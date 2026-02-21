# Task: Create English Translation Namespaces and Migrate Static UI Strings (Sub-Epic: 92_i18n_Skeleton_Core)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-101]

## 1. Initial Test Written
- [ ] In `packages/vscode/webview/src/__tests__/i18n/`, create `translations.test.ts`.
- [ ] Write a test that imports the configured `i18n` singleton (task 01) and for each namespace (`common`, `dashboard`, `console`, `roadmap`, `settings`):
  - Asserts the namespace resource bundle is loaded: `i18n.hasResourceBundle('en', ns)` returns `true`.
  - Asserts the bundle is a non-empty object (at least one key exists).
- [ ] Write a snapshot test using `i18n.getResourceBundle('en', 'common')` — snapshot the shape to prevent accidental key deletion.
- [ ] For each React component under `src/components/` that renders visible text, add or extend an existing RTL test to assert:
  - No raw string literal that is visible to the user appears as JSX text content (the rendered DOM text must match the return value of `t(key)` for a given key, not a hardcoded English string).
  - The component renders without crashing when `i18n.language` is set to `'fr'` (fallback should silently return English since French is not yet translated).
- [ ] Create a helper `renderWithI18n(ui: ReactElement)` in `src/__tests__/utils/renderWithI18n.tsx` that wraps the component in `I18nextProvider` to eliminate boilerplate across test files.

## 2. Task Implementation
- [ ] Create the directory structure:
  ```
  packages/vscode/webview/src/i18n/locales/
  └── en/
      ├── common.json
      ├── dashboard.json
      ├── console.json
      ├── roadmap.json
      └── settings.json
  ```
- [ ] Populate `common.json` with all cross-cutting UI strings (labels shared across views): button labels (`"save"`, `"cancel"`, `"back"`, `"confirm"`), status labels (`"pending"`, `"in_progress"`, `"done"`, `"error"`), generic error messages, and the application title `"app.title"`.
- [ ] Populate `dashboard.json`, `console.json`, `roadmap.json`, `settings.json` each with strings specific to that view (headings, placeholder text, empty-state messages, tooltip text).
- [ ] Update `packages/vscode/webview/src/i18n/index.ts` (from task 01) to import and inline the JSON bundles into the `resources` field:
  ```ts
  import commonEn from './locales/en/common.json';
  // ... etc.
  resources: {
    en: { common: commonEn, dashboard: dashboardEn, ... }
  }
  ```
- [ ] Audit every `.tsx` / `.ts` file under `packages/vscode/webview/src/components/` and `src/views/` for hardcoded user-visible English strings. Replace each with `const { t } = useTranslation('namespace')` and `{t('key')}`. Commit all changed components.
- [ ] Update `packages/vscode/webview/src/i18n/types.ts` to augment `Resources` with the actual key shapes imported from the JSON files, enabling TypeScript autocomplete for `t()` calls.
- [ ] Ensure no translation key is used in more than one namespace (no cross-namespace key duplication); use the `common` namespace for shared strings.

## 3. Code Review
- [ ] Grep for hardcoded user-visible English string literals in JSX (`/src/components/**/*.tsx`, `/src/views/**/*.tsx`). The output must be zero matches for plain English text nodes that are NOT inside `t()` calls or comments.
- [ ] Confirm all `useTranslation()` calls specify the correct namespace argument. No component should rely on the default namespace for namespace-specific strings.
- [ ] Confirm JSON locale files follow a flat-or-two-level key structure (e.g., `"button.save": "Save"` or `{ "button": { "save": "Save" } }`). Decide one convention and apply it consistently across all namespaces.
- [ ] Confirm `i18n/types.ts` Resources interface is updated and `tsc --noEmit` produces no type errors for `t()` key arguments.

## 4. Run Automated Tests to Verify
- [ ] Run translation-specific tests:
  ```bash
  cd packages/vscode/webview && npm test -- --testPathPattern="i18n/translations"
  ```
- [ ] Run all component tests to catch regressions from the string migration:
  ```bash
  cd packages/vscode/webview && npm test
  ```
- [ ] Assert zero test failures and zero TypeScript errors:
  ```bash
  cd packages/vscode/webview && npx tsc --noEmit
  ```

## 5. Update Documentation
- [ ] Update `packages/vscode/webview/src/i18n/i18n.agent.md` (from task 01) with:
  - A table listing each namespace and its purpose.
  - The key naming convention chosen (flat vs. nested).
  - Rule: "Any string visible to the user MUST be added to a locale JSON file and accessed via `t()`."
- [ ] Add a section "Adding a new translation key" with step-by-step instructions for AI agents.

## 6. Automated Verification
- [ ] Run:
  ```bash
  cd packages/vscode/webview && npm test -- --testPathPattern="i18n/translations" --json --outputFile=/tmp/i18n_translations_results.json
  ```
- [ ] Validate:
  ```bash
  node -e "const r = require('/tmp/i18n_translations_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"
  ```
- [ ] Run a grep audit to confirm no bare English strings remain in JSX:
  ```bash
  ! grep -rn --include="*.tsx" ">[A-Z][a-z]" packages/vscode/webview/src/components packages/vscode/webview/src/views | grep -v "//\|t(\|{\|<" | grep -v ".test."
  ```
  (This is a heuristic check; zero output is the target.)
