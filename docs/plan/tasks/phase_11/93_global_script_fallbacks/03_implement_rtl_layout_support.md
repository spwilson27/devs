# Task: Implement RTL Layout Support via CSS Logical Properties (Sub-Epic: 93_Global_Script_Fallbacks)

## Covered Requirements
- [4_USER_FEATURES-REQ-058]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/__tests__/rtl/rtl-layout.test.tsx`, write `@testing-library/react` unit tests that:
  - Render the `<DevsApp>` root with `dir="rtl"` set on the wrapping element (simulating Arabic/Hebrew locale detection).
  - Assert that the primary sidebar renders on the right side of the viewport (i.e., the sidebar container has `inset-inline-start: 0` or `margin-inline-end` applied rather than `margin-left`/`margin-right`).
  - Assert that the `DirectiveWhisperer` input field's text aligns to the right when `dir="rtl"`.
  - Assert that chevron/arrow icons in navigation elements are mirrored (check for a `rtl:rotate-180` or `[dir=rtl]` CSS class).
  - Assert that `padding-inline-start` and `padding-inline-end` are used (not `padding-left`/`padding-right`) on the `ThoughtStreamer` container.
- [ ] In `e2e/rtl/rtl-dashboard.spec.ts`, write a Playwright test that:
  - Activates the Webview panel.
  - Posts a `SET_LOCALE` message with `locale: "ar"` (Arabic) to the Webview via `postMessage`.
  - Waits for the `dir` attribute on the document root to update to `"rtl"`.
  - Takes a screenshot and performs visual diff against a pre-committed RTL baseline (`e2e/rtl/__screenshots__/dashboard-rtl.png`).
  - Asserts that no UI element overflows horizontally outside the viewport bounds.
- [ ] Write a CSS audit test in `packages/webview-ui/src/__tests__/rtl/logical-properties-audit.test.ts` that:
  - Statically parses all `.css` and `.tsx`/`.ts` files in `packages/webview-ui/src/` using a regex/AST approach.
  - Fails if any file contains directional physical CSS properties: `margin-left`, `margin-right`, `padding-left`, `padding-right`, `left:`, `right:`, `border-left`, `border-right`, `text-align: left`, `text-align: right`.
  - Whitelists known exceptions (e.g., third-party Mermaid styles, D3 absolute positioning that requires physical coordinates) listed in `rtl-audit-whitelist.json`.

## 2. Task Implementation
- [ ] Audit all existing component stylesheets and Tailwind utility usages across `packages/webview-ui/src/` for physical directional properties. Generate a migration list.
- [ ] Replace all directional physical CSS with CSS logical properties throughout the Webview package:
  - `margin-left` → `margin-inline-start`
  - `margin-right` → `margin-inline-end`
  - `padding-left` → `padding-inline-start`
  - `padding-right` → `padding-inline-end`
  - `border-left` → `border-inline-start`
  - `border-right` → `border-inline-end`
  - `left: X` (for absolute/fixed positioned elements) → `inset-inline-start: X`
  - `right: X` → `inset-inline-end: X`
  - `text-align: left` → `text-align: start`
  - `text-align: right` → `text-align: end`
- [ ] In Tailwind usage, replace directional Tailwind classes with their logical equivalents using the `@tailwindcss/logical` plugin or the built-in logical property utilities (Tailwind v3.3+):
  - `ml-*` → `ms-*`, `mr-*` → `me-*`, `pl-*` → `ps-*`, `pr-*` → `pe-*`
  - `left-*` → `start-*`, `right-*` → `end-*`
- [ ] In `packages/webview-ui/src/store/uiStore.ts` (Zustand), add a `textDirection: "ltr" | "rtl"` field to the global UI state, defaulting to `"ltr"`. Implement a `setTextDirection(dir: "ltr" | "rtl")` action.
- [ ] In `packages/webview-ui/src/App.tsx`, subscribe to `uiStore.textDirection` and set `document.documentElement.dir` and `document.documentElement.lang` accordingly whenever the direction changes. This ensures native browser RTL layout applies globally.
- [ ] In `packages/webview-ui/src/messaging/messageHandler.ts`, handle a new incoming message type `SET_LOCALE` from the VSCode extension host. When received, call `setTextDirection(resolveDirectionFromLocale(locale))`. Implement `resolveDirectionFromLocale(locale: string): "ltr" | "rtl"` in `packages/ui-tokens/src/i18n.ts` using a well-known RTL locale list:
  ```ts
  const RTL_LOCALES = ["ar", "he", "fa", "ur", "yi", "dv", "prs"];
  export function resolveDirectionFromLocale(locale: string): "ltr" | "rtl" {
    const lang = locale.split("-")[0].toLowerCase();
    return RTL_LOCALES.includes(lang) ? "rtl" : "ltr";
  }
  ```
- [ ] For icon components that are semantically directional (e.g., chevron-right used as "next", arrow-left used as "back"), add Tailwind's `rtl:rotate-180` or `[dir=rtl]:rotate-180` class so they visually mirror in RTL mode. Affected icons: navigation arrows in `ViewRouter`, breadcrumb separators, `DirectiveWhisperer` submit arrow.
- [ ] Add `rtl-audit-whitelist.json` at `packages/webview-ui/` listing the specific files and line ranges that are exempt from the logical-properties audit (e.g., D3 SVG `x`/`y` coordinate attributes and Mermaid-generated output).

## 3. Code Review
- [ ] Confirm that `document.documentElement.dir` is the only RTL toggle point. No component should independently override `dir` or hardcode `direction: rtl` in inline styles.
- [ ] Verify that the `SET_LOCALE` message handler validates the locale string against an allowlist before calling `setTextDirection` to prevent injection of invalid values.
- [ ] Confirm that SVG-based components (`DAGCanvas`, `MermaidHost`) are explicitly excluded from logical property migration since SVG uses a fixed coordinate system—document this exemption clearly in `DAGCanvas.agent.md`.
- [ ] Verify the Zustand `textDirection` state persists correctly using `Tier 3: Persistent user preferences` store (as defined in `6_UI_UX_ARCH-REQ-043`) so the direction is remembered across Webview reloads.
- [ ] Ensure the `resolveDirectionFromLocale` function in `@devs/ui-tokens` is a pure function with no side effects.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test` — all three test files (`rtl-layout.test.tsx`, `logical-properties-audit.test.ts`) must pass with zero failures.
- [ ] Run `pnpm --filter @devs/ui-tokens test` to confirm `resolveDirectionFromLocale` unit tests pass for all RTL and LTR locale codes.
- [ ] Run `pnpm --filter @devs/webview-ui build` to confirm no Tailwind class-name errors or TypeScript compilation errors.
- [ ] Run `pnpm e2e --grep "rtl-dashboard"` to confirm the RTL visual baseline test passes.

## 5. Update Documentation
- [ ] Create `docs/ui/rtl-support.md` documenting: the RTL activation mechanism (`SET_LOCALE` message), the `resolveDirectionFromLocale` utility, the CSS logical properties convention, the SVG exemption policy, and instructions for adding new RTL locales.
- [ ] Update `packages/webview-ui/AGENT.md` with a mandatory rule: "All new CSS styles MUST use logical properties (margin-inline-start, padding-inline-end, inset-inline-start, etc.). Physical directional properties (margin-left, etc.) are prohibited except in SVG coordinate contexts."
- [ ] Update `packages/ui-tokens/AGENT.md` to document the `resolveDirectionFromLocale` function and the `RTL_LOCALES` allowlist, and how to add new RTL locales.
- [ ] Add a `[4_USER_FEATURES-REQ-058]` entry to the Phase 11 architectural decision log (`docs/decisions/phase_11_typography.md`) describing the RTL strategy.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test --testPathPattern=logical-properties-audit` — the static audit test must exit with code `0` and report zero violations.
- [ ] Run `node scripts/verify-rtl-direction.mjs` — a script that: (1) spawns a headless Webview via the test harness, (2) posts `SET_LOCALE { locale: "ar" }`, (3) reads `document.documentElement.dir` via CDP/Playwright, and (4) asserts it equals `"rtl"`. Exit code must be `0`.
- [ ] Run `node scripts/verify-rtl-direction.mjs --locale en` and assert `document.documentElement.dir === "ltr"`. Exit code must be `0`.
