# Task: Define Global CJK Font Fallback Stack in CSS/Tailwind Configuration (Sub-Epic: 93_Global_Script_Fallbacks)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-038], [7_UI_UX_DESIGN-REQ-UI-DES-038-1]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/__tests__/typography/cjk-font-stack.test.ts`, write a unit test that imports the shared font-stack constant (e.g., `CJK_FONT_FALLBACKS` from `@devs/ui-tokens/typography`) and asserts that:
  - The array contains `"PingFang SC"` before `"Noto Sans CJK SC"`.
  - The array contains `"Meiryo"` before `"Yu Gothic"`.
  - The array contains `"Apple SD Gothic Neo"` (Korean macOS default).
  - The array contains `"Noto Sans KR"` and `"Noto Sans JP"` as universal fallbacks.
  - The array terminates with `"sans-serif"` as the final generic fallback.
- [ ] In `packages/webview-ui/src/__tests__/typography/cjk-font-stack.test.ts`, write a DOM-based test (using `@testing-library/react` + `jsdom`) that renders a `<Typography>` wrapper component with a sample CJK string (`"你好世界 こんにちは 안녕하세요"`) and asserts that the computed `font-family` CSS on the container includes all required CJK fallback entries in the correct order.
- [ ] Write a Playwright E2E test in `e2e/typography/cjk-rendering.spec.ts` that opens the Webview panel, injects a test fixture containing CJK characters into the `ThoughtStreamer` component, takes a screenshot, and uses pixel-diff comparison to assert that no "tofu" (□) rectangles appear in the rendered output. Use a known reference screenshot as baseline.

## 2. Task Implementation
- [ ] In `packages/ui-tokens/src/typography.ts`, define and export a constant `CJK_FONT_FALLBACKS: string[]` with the following ordered entries:
  ```ts
  export const CJK_FONT_FALLBACKS = [
    // macOS/iOS CJK defaults (Simplified Chinese, Japanese, Korean)
    "PingFang SC",
    "PingFang TC",
    "Apple SD Gothic Neo",
    // Windows CJK defaults
    "Meiryo",
    "Yu Gothic",
    "Microsoft YaHei",
    "Malgun Gothic",
    // Android / Linux universal fallbacks
    "Noto Sans CJK SC",
    "Noto Sans CJK TC",
    "Noto Sans JP",
    "Noto Sans KR",
    // Final generic
    "sans-serif",
  ];
  ```
- [ ] In `packages/ui-tokens/src/typography.ts`, compose and export a `FULL_BODY_FONT_STACK: string` that prepends the existing Latin stack (sourcing from `var(--vscode-font-family)` and system-ui) before the `CJK_FONT_FALLBACKS` entries:
  ```ts
  export const FULL_BODY_FONT_STACK = [
    "var(--vscode-font-family)",
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    '"Segoe UI"',
    "Roboto",
    ...CJK_FONT_FALLBACKS,
  ].join(", ");
  ```
- [ ] In `packages/webview-ui/tailwind.config.ts`, extend `theme.fontFamily.sans` to use `FULL_BODY_FONT_STACK` so that Tailwind's `font-sans` utility automatically includes CJK fallbacks.
- [ ] In `packages/webview-ui/src/styles/globals.css`, set `font-family: var(--devs-font-stack);` on the `:root` selector. Add a CSS custom property `--devs-font-stack` that references the Tailwind-generated value, ensuring it cascades to all child elements including `ThoughtStreamer`, `DAGCanvas` tooltips, and all panel labels.
- [ ] Export `CJK_FONT_FALLBACKS` and `FULL_BODY_FONT_STACK` from `packages/ui-tokens/src/index.ts` so they are available to all consumers in the monorepo.

## 3. Code Review
- [ ] Verify that no hardcoded `font-family` strings in any component files (`ThoughtStreamer.tsx`, `DAGCanvas.tsx`, `MermaidHost.tsx`, `DirectiveWhisperer.tsx`) bypass the centralized `--devs-font-stack` custom property.
- [ ] Confirm the font-stack constant is defined only once (in `@devs/ui-tokens`) and imported everywhere else—no duplication across packages.
- [ ] Verify the Tailwind `theme.fontFamily.sans` override does not break existing snapshot tests for components that rely on `font-sans`.
- [ ] Ensure the ordering of the `CJK_FONT_FALLBACKS` array places OS-native fonts before universal Noto fallbacks to minimize flash-of-unstyled-text on macOS and Windows.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/ui-tokens test` and confirm all new unit tests for `CJK_FONT_FALLBACKS` and `FULL_BODY_FONT_STACK` pass.
- [ ] Run `pnpm --filter @devs/webview-ui test` and confirm the DOM-based `cjk-font-stack.test.ts` tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui build` to confirm Tailwind compiles the updated `fontFamily` configuration without errors.
- [ ] Run the Playwright E2E suite: `pnpm e2e --grep "cjk-rendering"` and confirm no tofu-detection failures. (Note: E2E screenshot baseline must be committed to `e2e/typography/__screenshots__/`.)

## 5. Update Documentation
- [ ] Update `packages/ui-tokens/AGENT.md` to document the `CJK_FONT_FALLBACKS` and `FULL_BODY_FONT_STACK` exports, including their intended usage pattern and the rationale for font ordering (OS-native first, Noto fallback second).
- [ ] Update `packages/webview-ui/AGENT.md` to note that global body font is set via `--devs-font-stack` CSS custom property sourced from `@devs/ui-tokens` and to warn agents not to override `font-family` inline in components.
- [ ] Add an entry to the Phase 11 architectural decision log (`docs/decisions/phase_11_typography.md`) describing the CJK fallback strategy and why OS-native fonts are preferred over bundling webfonts.

## 6. Automated Verification
- [ ] Run `node scripts/verify-font-stack.mjs` — a script that: (1) parses the compiled `globals.css` output, (2) extracts the `--devs-font-stack` value, and (3) asserts each expected font name from `CJK_FONT_FALLBACKS` is present in order. Exit code must be `0`.
- [ ] Run `pnpm --filter @devs/ui-tokens test --coverage` and confirm line coverage for `typography.ts` is ≥ 100%.
