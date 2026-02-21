# Task: Build WCAG 2.1 AA Contrast Utility for Diagram Foreground Colors (Sub-Epic: 96_Diagram_Alt_Text_Contrast)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-102]

## 1. Initial Test Written
- [ ] In `packages/ui-hooks/src/__tests__/contrast.test.ts`, write unit tests for a new `contrastUtils` module:
  - Test `getRelativeLuminance(hex: string): number` returns correct luminance for `#000000` (0), `#ffffff` (1), and mid-gray `#808080` (~0.216).
  - Test `getContrastRatio(fg: string, bg: string): number` returns ≥ 4.5 for white-on-black and ≤ 1.0 for identical colors.
  - Test `chooseForeground(bg: string, candidates: string[]): string` selects the candidate with the highest contrast ratio against `bg`, preferring the first when tied.
  - Test `ensureWcagAA(bg: string, fg: string): string` returns `fg` if ratio ≥ 4.5, otherwise returns the fallback from a two-candidate list (`#000000`, `#ffffff`).
  - Test behavior against a sampled set of VSCode theme CSS variable values typical of dark, light, and high-contrast themes (mock the CSS variable resolution).

## 2. Task Implementation
- [ ] Create `packages/ui-hooks/src/contrastUtils.ts`:
  - Implement `hexToRgb(hex: string): { r: number; g: number; b: number }` — expand shorthand hex, strip `#`, parse into 0–255 channels.
  - Implement `getRelativeLuminance(hex: string): number` — apply the WCAG sRGB linearization formula: `c <= 0.04045 ? c/12.92 : ((c+0.055)/1.055)^2.4` per channel, then `L = 0.2126*R + 0.7152*G + 0.0722*B`.
  - Implement `getContrastRatio(fg: string, bg: string): number` — `(L_lighter + 0.05) / (L_darker + 0.05)`.
  - Implement `chooseForeground(bg: string, candidates: string[]): string` — iterate candidates, return the one with the highest contrast ratio against `bg`.
  - Implement `ensureWcagAA(bg: string, fg: string, level: 'AA' | 'AAA' = 'AA'): string` — threshold 4.5 for AA, 7 for AAA; if `fg` passes, return it; otherwise call `chooseForeground(bg, ['#000000', '#ffffff'])`.
  - Export all public functions from `packages/ui-hooks/src/index.ts`.
- [ ] Ensure the module has **zero runtime dependencies** beyond native TypeScript — no external color libraries.
- [ ] Add JSDoc comments explaining the WCAG 2.1 luminance formula and contrast ratio computation.

## 3. Code Review
- [ ] Verify the luminance formula exactly matches WCAG 2.1 §1.4.3 — no floating-point shortcuts that would cause off-by-one errors at the 4.5:1 boundary.
- [ ] Confirm `hexToRgb` correctly handles 3-character shorthand (`#abc` → `#aabbcc`) and uppercase hex.
- [ ] Confirm `ensureWcagAA` never returns a color without first verifying it passes the threshold (avoid infinite loops or empty candidate arrays).
- [ ] Verify all exports are tree-shakeable (named exports only, no barrel side-effects).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/ui-hooks test` and confirm all new tests pass with 0 failures.
- [ ] Run `pnpm --filter @devs/ui-hooks test --coverage` and confirm branch coverage for `contrastUtils.ts` is ≥ 95%.

## 5. Update Documentation
- [ ] Add an entry to `packages/ui-hooks/README.md` under a **Contrast Utilities** heading: describe each exported function, its signature, and a usage example showing how to resolve a VSCode CSS variable and ensure AA compliance.
- [ ] Update the agent memory file `docs/agent-memory/ui-hooks.agent.md` to note that `contrastUtils` is available for all diagram foreground color decisions.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/ui-hooks test --reporter=json --outputFile=test-results/contrast.json` and assert the JSON output contains `"numFailedTests": 0`.
- [ ] Run `grep -r "contrastUtils" packages/ui-hooks/src/index.ts` to confirm the module is exported from the package barrel.
