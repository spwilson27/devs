# Task: Implement Icon React Component with Codicon support (Sub-Epic: 38_Iconography_Standards)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-005-2], [6_UI_UX_ARCH-REQ-073]

## 1. Initial Test Written
- [ ] Create unit tests at `tests/components/Icon.test.tsx` using Jest + React Testing Library. Tests to write BEFORE implementation:
  - Render `<Icon name="check" size="medium" colorRole="primary" ariaLabel="Check" />` and assert that the rendered DOM contains either:
    - A `<span>` with class `codicon codicon-check`, or
    - An inline `<svg>` with `role="img"` and a nested `<title>` text when fallback is used.
  - Assert that computed styles on the rendered node reference CSS variables: `getComputedStyle(node).color` equals `'var(--vscode-icon-foreground)'` (use string presence check for `--vscode-`).
  - Mock `src/ui/iconography/codicon-mapping.json` to map semantic names to codicon keys for tests.

## 2. Task Implementation
- [ ] Implement component at `src/ui/components/Icon.tsx` with the exact API:
  - Props: `{ name: string; size?: 'small'|'medium'|'large'; colorRole?: 'foreground'|'muted'; ariaLabel?: string; decorative?: boolean; fallbackSvg?: React.ReactNode }
  - Behavior:
    - Resolve `mapped = codiconMapping[name]` by importing `src/ui/iconography/codicon-mapping.json`.
    - If `mapped` found and runtime DOM is available, render: `<span className={`codicon codicon-${mapped}`} aria-hidden={decorative} aria-label={decorative ? undefined : ariaLabel} />`.
    - If mapped not found or in SSR (no `document`), render `fallbackSvg` or an inline SVG from `src/ui/iconography/svgs/{name}.svg`.
    - Apply size and color via CSS classes that read variables from `tokens.json` (e.g., `.icon--medium { width: var(--vscode-icon-size-medium); height: var(--vscode-icon-size-medium); }`).
    - Memoize render with `React.memo` and use `useCallback` for any handlers.
  - Types: export proper TS types and unit-testable functions for mapping resolution.

## 3. Code Review
- [ ] Checklist for reviewers:
  - Icon component provides accessible defaults: non-decorative icons must have `aria-label` or `title`.
  - No hardcoded color/size values; all references must use CSS variables prefixed with `--vscode-`.
  - Component supports SSR (no global `document` access at import time).
  - Tests mock mapping and verify both codicon and fallback code paths.
  - Ensure the component is small and tree-shakeable.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- tests/components/Icon.test.tsx` and confirm green.

## 5. Update Documentation
- [ ] Add `docs/components/icon.md` with prop table, examples of codicon usage, fallback instructions, and ghost-mode example using token mix.

## 6. Automated Verification
- [ ] Add a smoke test `tests/smoke/icon-smoke.test.tsx` that mounts `<Icon>` with several names and runs in CI; failing tests block merge.
