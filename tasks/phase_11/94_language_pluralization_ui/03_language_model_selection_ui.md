# Task: Language-Specific LLM Model Selection UI (Sub-Epic: 94_Language_Pluralization_UI)

## Covered Requirements
- [4_USER_FEATURES-REQ-052]

## 1. Initial Test Written
- [ ] In `packages/vscode-webview/src/views/settings/__tests__/`, create `ModelSelector.test.tsx`.
- [ ] Write a unit test that renders the `ModelSelector` component with a mock list of models (each having `{ id: string, name: string, languages: string[] }`) and asserts the dropdown contains an entry for each model.
- [ ] Write a test that verifies when the user selects a model from the dropdown, an `onModelChange(modelId)` callback prop is called with the correct ID.
- [ ] Write a test that renders `ModelSelector` with a `preferredLanguage="ja"` prop and asserts that models tagged with `"ja"` in their `languages` array appear first in the list (or are visually highlighted with a "Recommended" badge).
- [ ] Write a test that asserts the language filter select (`<select aria-label="Filter by language">`) updates the displayed model list when a language is chosen.
- [ ] Write a test verifying that when `preferredLanguage` matches no models, a localized fallback message `t('settings.modelSelector.noModelsForLanguage')` is rendered.
- [ ] Write an integration test using the Zustand store mock that verifies selecting a model dispatches the `setPreferredModel(modelId)` action to the global settings store.

## 2. Task Implementation
- [ ] Create `packages/vscode-webview/src/views/settings/ModelSelector.tsx`. This component:
  - Accepts props: `models: ModelConfig[]`, `selectedModelId: string`, `preferredLanguage: string`, `onModelChange: (id: string) => void`.
  - Renders a labelled `<select>` (or `vscode-dropdown` from `@vscode/webview-ui-toolkit`) for model choice.
  - Sorts/groups models so those supporting `preferredLanguage` appear first, each with a `(Recommended)` suffix in their label text (localized via `t('settings.modelSelector.recommended')`).
  - Renders a secondary `<select>` (language filter) to allow manual filtering of the model list by language tag.
  - When no models match the current language filter, renders `<p role="status">{t('settings.modelSelector.noModelsForLanguage')}</p>`.
- [ ] Define the `ModelConfig` TypeScript interface in `packages/vscode-webview/src/types/models.ts`:
  ```ts
  export interface ModelConfig {
    id: string;
    name: string;
    provider: string;
    languages: string[]; // BCP-47 language tags, e.g. ["en", "ja", "zh"]
    isDefault?: boolean;
  }
  ```
- [ ] Add the Zustand settings store slice at `packages/vscode-webview/src/store/settingsSlice.ts` (or extend an existing settings slice) with:
  - `preferredModelId: string | null`
  - `setPreferredModel(modelId: string): void`
- [ ] Integrate `ModelSelector` into the `SETTINGS` view (`packages/vscode-webview/src/views/SettingsView.tsx`) under an `### AI Model` section heading.
- [ ] Add locale keys to `public/locales/en/translation.json` under a `settings.modelSelector` namespace group:
  - `settings.modelSelector.label`: `"AI Model"`
  - `settings.modelSelector.recommended`: `"(Recommended for your language)"`
  - `settings.modelSelector.languageFilter`: `"Filter by language"`
  - `settings.modelSelector.noModelsForLanguage`: `"No models found optimized for the selected language. Showing all available models."`
- [ ] Wire the `preferredLanguage` prop from the user's locale detected via `i18n.language` (already initialized in task 01) so the component automatically surfaces relevant models.
- [ ] Propagate the new locale keys to `fr` and `ru` stub locale files.

## 3. Code Review
- [ ] Confirm `ModelSelector` does not contain any hardcoded language strings — all copy uses `t()`.
- [ ] Verify the `languages` field on `ModelConfig` uses BCP-47 tags (not free-text country names), enabling reliable matching against `i18n.language`.
- [ ] Confirm the Zustand action `setPreferredModel` is a pure function with no side effects beyond state mutation.
- [ ] Ensure the component is fully keyboard accessible: the `<select>` elements must be focusable and operable via arrow keys; verify with `axe-core` or `jest-axe`.
- [ ] Check that the `(Recommended)` label is a localized string — not an English hardcode — so it translates correctly when the UI language changes.
- [ ] Verify the component gracefully handles an empty `models` array (renders an appropriate empty-state message).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode-webview test -- --testPathPattern="ModelSelector"` and confirm all 6+ tests pass with 0 failures.
- [ ] Run `pnpm --filter @devs/vscode-webview test` (full suite) to confirm no regressions.

## 5. Update Documentation
- [ ] In `packages/vscode-webview/AGENT.md`, add a subsection `#### Language-Specific Model Selection` documenting:
  - The `ModelConfig` interface and where it is defined.
  - How `preferredLanguage` is sourced from `i18n.language`.
  - The Zustand `settingsSlice` key `preferredModelId` and its effect on the orchestrator (note: orchestrator reads this value from the shared state bridge to select the LLM at runtime).
- [ ] Add a comment in `ModelSelector.tsx` explaining that `languages` uses BCP-47 tags and linking to the RFC.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode-webview test -- --coverage --testPathPattern="ModelSelector"` and assert statement coverage ≥ 90% for `ModelSelector.tsx`.
- [ ] Run `pnpm --filter @devs/vscode-webview build` and confirm zero TypeScript compilation errors.
- [ ] Run `pnpm --filter @devs/vscode-webview lint` and confirm `ModelSelector.tsx` has no ESLint violations.
