# Task: Implement Locale-Aware Formatting Utilities for Timestamps, Numbers, and Currencies (Sub-Epic: 92_i18n_Skeleton_Core)

## Covered Requirements
- [4_USER_FEATURES-REQ-051]

## 1. Initial Test Written
- [ ] Create `packages/vscode/webview/src/__tests__/i18n/locale-formatting.test.ts`.
- [ ] **Timestamp formatting tests**:
  - Import `formatTimestamp(isoUtcString: string, locale?: string): string` from `src/i18n/formatters/timestamp.ts`.
  - Assert that `formatTimestamp('2024-01-15T09:30:00Z', 'en-US')` returns a string containing `"Jan"` or `"1"` and `"2024"` (locale-formatted, not raw ISO).
  - Assert that `formatTimestamp('2024-01-15T09:30:00Z', 'de-DE')` returns a string formatted in German locale conventions (e.g., `"15.1.2024"`).
  - Assert that `formatTimestamp('2024-01-15T09:30:00Z', 'ja-JP')` returns a string with Japanese date ordering.
  - Assert that the **internal** ISO 8601 UTC string passed in is **never** mutated (the function is pure).
  - Assert that an invalid ISO string causes the function to return a designated fallback string (e.g., `"—"`) without throwing.
- [ ] **Number formatting tests**:
  - Import `formatNumber(value: number, locale?: string, options?: Intl.NumberFormatOptions): string`.
  - Assert `formatNumber(1234567.89, 'en-US')` returns `"1,234,567.89"`.
  - Assert `formatNumber(1234567.89, 'de-DE')` returns `"1.234.567,89"`.
  - Assert `formatNumber(0.456, 'en-US', { style: 'percent' })` returns `"45.6%"`.
- [ ] **Currency formatting tests**:
  - Import `formatCurrency(amount: number, currencyCode: string, locale?: string): string`.
  - Assert `formatCurrency(42.5, 'USD', 'en-US')` returns a string starting with `"$"` and containing `"42.50"`.
  - Assert `formatCurrency(42.5, 'EUR', 'de-DE')` returns a string containing `"€"` and `"42,50"`.
- [ ] **Hook tests**: Render `<FormattedTimestamp isoUtc="2024-01-15T09:30:00Z" />` with `renderWithI18n` and assert the output text does NOT equal the raw ISO string.
- [ ] Assert all formatter functions are pure (same inputs → same output; no global state mutation).

## 2. Task Implementation
- [ ] Create `packages/vscode/webview/src/i18n/formatters/timestamp.ts`:
  - Export `formatTimestamp(isoUtcString: string, locale?: string): string`.
  - Parse input with `new Date(isoUtcString)`.
  - If `isNaN(date.getTime())`, return `"—"`.
  - Format using `new Intl.DateTimeFormat(locale ?? navigator.language, { dateStyle: 'medium', timeStyle: 'short' }).format(date)`.
  - For "relative" display (e.g., "2 minutes ago"), provide a separate export `formatRelativeTime(isoUtcString: string, locale?: string): string` using `Intl.RelativeTimeFormat`.
- [ ] Create `packages/vscode/webview/src/i18n/formatters/number.ts`:
  - Export `formatNumber(value: number, locale?: string, options?: Intl.NumberFormatOptions): string`.
  - Use `new Intl.NumberFormat(locale ?? navigator.language, options).format(value)`.
- [ ] Create `packages/vscode/webview/src/i18n/formatters/currency.ts`:
  - Export `formatCurrency(amount: number, currencyCode: string, locale?: string): string`.
  - Use `new Intl.NumberFormat(locale ?? navigator.language, { style: 'currency', currency: currencyCode }).format(amount)`.
- [ ] Create `packages/vscode/webview/src/i18n/formatters/index.ts` that re-exports all three formatter modules.
- [ ] Create React components wrapping the formatters:
  - `packages/vscode/webview/src/components/i18n/FormattedTimestamp.tsx`: accepts `isoUtc: string` prop, renders formatted local time.
  - `packages/vscode/webview/src/components/i18n/FormattedNumber.tsx`: accepts `value: number` and optional `options`.
  - `packages/vscode/webview/src/components/i18n/FormattedCurrency.tsx`: accepts `amount: number` and `currency: string`.
  - All components use `i18n.language` from `useTranslation()` as the locale source to stay reactive to language changes.
- [ ] Replace any raw timestamp string render calls in existing components (e.g., `new Date(ts).toLocaleString()` with no locale arg) with `<FormattedTimestamp isoUtc={ts} />`.
- [ ] Ensure internal storage and IPC messages continue to use ISO 8601 UTC strings (no formatting applied before transport); formatting is presentation-layer only.

## 3. Code Review
- [ ] Confirm all three formatter functions accept an explicit `locale` parameter and fall back to `navigator.language`; they must never hardcode a locale string like `"en-US"`.
- [ ] Confirm `Intl` APIs are used directly — no third-party date/number formatting library is introduced (keep bundle size minimal per `6_UI_UX_ARCH-REQ-007`).
- [ ] Confirm no raw `.toLocaleString()` or `.toLocaleDateString()` calls without a locale argument exist in the component tree (these would ignore the active i18n locale).
- [ ] Confirm internal data models and IPC messages use ISO 8601 UTC strings; formatting occurs exclusively in the presentation layer.
- [ ] Confirm formatter functions have no side effects and return a string.

## 4. Run Automated Tests to Verify
- [ ] Run formatter tests:
  ```bash
  cd packages/vscode/webview && npm test -- --testPathPattern="i18n/locale-formatting"
  ```
- [ ] Run full Webview test suite:
  ```bash
  cd packages/vscode/webview && npm test
  ```
- [ ] Run TypeScript check:
  ```bash
  cd packages/vscode/webview && npx tsc --noEmit
  ```
- [ ] All assertions must pass; zero TypeScript errors.

## 5. Update Documentation
- [ ] Create `packages/vscode/webview/src/i18n/formatters/formatters.agent.md`:
  - Document each formatter function's signature, purpose, and locale fallback behaviour.
  - State the rule: "All user-facing timestamps, numbers, and currencies MUST use these formatters. Internal storage always uses ISO 8601 UTC."
  - Include a short example for each formatter.
- [ ] Update `packages/vscode/webview/src/i18n/i18n.agent.md` with a pointer to `formatters.agent.md`.

## 6. Automated Verification
- [ ] Run:
  ```bash
  cd packages/vscode/webview && npm test -- --testPathPattern="i18n/locale-formatting" --json --outputFile=/tmp/locale_formatting_results.json
  ```
- [ ] Validate:
  ```bash
  node -e "const r = require('/tmp/locale_formatting_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"
  ```
- [ ] Grep for bare `.toLocaleDateString()` or `.toLocaleString()` calls without a locale argument as a regression guard:
  ```bash
  ! grep -rn --include="*.ts" --include="*.tsx" "\.toLocaleString()\|\.toLocaleDateString()\|\.toLocaleTimeString()" packages/vscode/webview/src/components packages/vscode/webview/src/views
  ```
  Zero output confirms all formatting goes through the approved utilities.
