# Task: Implement Accessible Color Palettes and Visual Cues for Mermaid Diagrams (Sub-Epic: 87_Contrast_Risk_Resilience)

## Covered Requirements
- [4_USER_FEATURES-REQ-047], [7_UI_UX_DESIGN-REQ-UI-DES-141]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/components/__tests__/MermaidHost.a11y.test.tsx`, write unit tests using Vitest and `@testing-library/react` that:
  - Assert that `MermaidHost` passes a `theme` prop of `"base"` with `themeVariables` containing color-blind-safe palette values (no red/green only differentiation) when neither HC mode nor a custom theme is active.
  - Assert that when `data-vscode-theme-kind="vscode-high-contrast"` is present on the root element, `MermaidHost` passes `theme="base"` with `themeVariables` where `primaryColor`, `secondaryColor`, `tertiaryColor`, etc., are fully opaque and contrast against `--vscode-editor-background` at a ratio ≥ 4.5:1 (verify by computing WCAG relative luminance of the hardcoded HC palette values in the test).
  - Assert that rendered Mermaid SVG nodes contain a `stroke-dasharray` or `fill-pattern` attribute (i.e., a non-color visual differentiator) on at least the primary node shape — verifying a post-processing step applies pattern fills.
  - Assert that every `<text>` element inside the rendered Mermaid SVG has a `data-label` attribute that duplicates the visible text content, enabling TTS tools to read node labels independently.
- [ ] In `packages/vscode/src/webview/utils/__tests__/mermaidPalette.test.ts`, write unit tests that:
  - Call `getMermaidThemeVariables('dark')`, `getMermaidThemeVariables('light')`, `getMermaidThemeVariables('high-contrast')` and assert each returns an object with all required Mermaid theme variable keys (`primaryColor`, `primaryTextColor`, `lineColor`, `edgeLabelBackground`, `nodeBorder`, `clusterBkg`, `titleColor`, `tertiaryColor`, `tertiaryTextColor`).
  - Assert that in `high-contrast` mode, none of the returned color values contain an alpha channel (no `rgba`, `hsla`, or 8-digit hex).
  - Assert that the color-blind-safe palette used in `light` and `dark` modes does not pair red against green as sole differentiators (verify the specific hex codes do not include both `#e53e3e`-family reds and `#38a169`-family greens without a secondary differentiator).

## 2. Task Implementation
- [ ] Create `packages/vscode/src/webview/utils/mermaidPalette.ts` exporting:
  ```ts
  export type ThemeKind = 'light' | 'dark' | 'high-contrast';
  export function getMermaidThemeVariables(kind: ThemeKind): Record<string, string>;
  ```
  Implement three palettes:
  - **light**: Uses a blue/orange/purple triad with sufficient luminance contrast, verified against WCAG 4.5:1 on a white background. No red/green-only encoding.
  - **dark**: Uses the same hue triad shifted for dark background (lightened), verified against WCAG 4.5:1 on dark background.
  - **high-contrast**: Uses fully opaque colors only. Primary = `#FFFFFF`, background = `#000000` (or inverted for light HC), borders = `#FFFFFF`/`#000000`. No alpha anywhere. All values must achieve WCAG 7:1 (AAA) contrast ratio.
- [ ] In `packages/vscode/src/webview/components/MermaidHost.tsx`:
  - Read `document.documentElement.dataset.vscodeThemeKind` to determine `ThemeKind`.
  - Call `getMermaidThemeVariables(themeKind)` and pass the result as `themeVariables` to the Mermaid `initialize()` call with `theme: 'base'`.
  - Subscribe to the `theme-changed` postMessage event and re-initialize Mermaid with the new palette on theme change.
  - After Mermaid renders the SVG, run a post-processing pass (`applyPatternFills(svgElement: SVGElement): void`) that:
    - Assigns a unique `<pattern>` defs entry (e.g., diagonal stripes, dots, cross-hatch) to each distinct node `fill` color in the SVG.
    - Applies the pattern as a secondary visual differentiator via `fill="url(#pattern-N)"` on the node `<rect>` or `<polygon>`, keeping the original color as a `stroke`.
    - Adds a `data-label` attribute to every `<text>` element mirroring its `textContent`.
- [ ] Create `packages/vscode/src/webview/utils/applyPatternFills.ts` implementing the `applyPatternFills` function:
  - Define a fixed set of 6 accessible SVG patterns (diagonal-ltr, diagonal-rtl, dots, cross-hatch, horizontal-lines, vertical-lines) as inline `<pattern>` elements injected into the SVG `<defs>`.
  - Map each unique fill color to a pattern index using a deterministic hash of the color string.
  - Replace node background fills with the pattern reference while applying the original color as `stroke` with `stroke-width="2"`.
- [ ] In `packages/vscode/src/webview/styles/components.css`, scope all Mermaid container styles under `.mermaid-host` and ensure the container inherits `background-color: var(--vscode-editor-background)` so diagram backgrounds never clash with theme backgrounds.

## 3. Code Review
- [ ] Verify `getMermaidThemeVariables` has no hardcoded color values outside of the function itself — all palette constants must be defined in a single `PALETTES` constant object at the top of `mermaidPalette.ts` for easy auditing.
- [ ] Confirm `applyPatternFills` does not mutate the Mermaid SVG during rendering (it must run in a `useEffect` after the SVG is stable in the DOM), using a `MutationObserver` to detect when Mermaid has finished inserting the SVG.
- [ ] Verify no Mermaid theme variable overrides use color values that encode semantic meaning solely through hue (confirm by inspecting the palette triad for color-blind simulation: deuteranopia and protanopia safe — comment in code referencing Colour Blind Awareness criteria).
- [ ] Confirm the `theme-changed` listener is cleaned up in the `useEffect` return to prevent memory leaks.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test -- utils/mermaidPalette` and confirm all palette unit tests pass.
- [ ] Run `pnpm --filter @devs/vscode test -- components/MermaidHost.a11y` and confirm all accessibility tests pass.
- [ ] Run `pnpm --filter @devs/vscode build` and confirm zero TypeScript errors.
- [ ] Run `pnpm --filter @devs/vscode test:e2e -- --grep "mermaid"` for an E2E test in `e2e/diagrams/mermaidA11y.spec.ts` that loads the SPEC_VIEW with a sample Mermaid diagram in HC theme and asserts:
  - The rendered SVG `<defs>` contains at least one `<pattern>` element.
  - At least one `<rect>` or `<polygon>` has a `fill` attribute beginning with `url(#pattern-`.
  - No `<text>` element is missing a `data-label` attribute.

## 5. Update Documentation
- [ ] In `docs/ui/mermaid.md`, add a section "Accessible Diagram Palettes" describing: the three palettes (`light`, `dark`, `high-contrast`), the `applyPatternFills` post-processing mechanism, WCAG contrast requirements per palette, and guidance on extending palettes for new diagram types.
- [ ] Update `docs/accessibility.md` with a note that Mermaid diagrams use pattern fills as secondary visual differentiators for color-blind users, and that HC mode enforces WCAG 2.1 AAA (7:1) contrast on all diagram elements.
- [ ] Append to `memory/phase_11_decisions.md`: "Mermaid A11y: All Mermaid diagrams use `theme: 'base'` with `getMermaidThemeVariables(themeKind)`. Pattern fills are applied post-render via `applyPatternFills` to provide non-color visual differentiation. HC mode enforces AAA (7:1) contrast with no alpha channel anywhere in the palette."

## 6. Automated Verification
- [ ] Run `node scripts/verify_mermaid_palette.mjs` — a script that imports `getMermaidThemeVariables` for all three theme kinds and computes WCAG contrast ratios for each color against its expected background, asserting ≥ 4.5:1 for `light`/`dark` and ≥ 7:1 for `high-contrast` (script exits 0 on pass, 1 on failure, printing failing pairs).
- [ ] Run `pnpm --filter @devs/vscode test -- --coverage` and confirm `utils/mermaidPalette.ts` and `utils/applyPatternFills.ts` each have ≥ 90% line coverage.
- [ ] Confirm CI pipeline step `pnpm ci:a11y` passes, which runs axe-core accessibility checks against a rendered Webview snapshot containing a Mermaid diagram, asserting zero violations at WCAG 2.1 AA level or higher.
