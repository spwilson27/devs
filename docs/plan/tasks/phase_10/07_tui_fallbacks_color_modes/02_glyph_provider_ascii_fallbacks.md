# Task: Implement Glyph Provider & ASCII Fallback System (Sub-Epic: 07_TUI Fallbacks & Color Modes)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-080], [7_UI_UX_DESIGN-REQ-UI-DES-064]

## 1. Initial Test Written
- [ ] Create a unit test in `packages/cli/src/tui/components/__tests__/Glyph.test.tsx` using `ink-testing-library`.
- [ ] Mock `is-unicode-supported` to return `true` and verify that `<Glyph name="CHECK_CIRCLE" />` renders the Unicode checkmark `✔`.
- [ ] Mock `is-unicode-supported` to return `false` and verify that it renders the ASCII fallback `[V]` or `(v)`.
- [ ] Verify that box-drawing characters (for `7_UI_UX_DESIGN-REQ-UI-DES-065`) also have ASCII fallbacks (e.g., `+`, `-`, `|`).

## 2. Task Implementation
- [ ] Create `Glyph` component in `packages/cli/src/tui/components/Glyph.tsx`.
- [ ] Implement a `GLYPH_MAP` that defines:
    - `CHECK_CIRCLE`: { unicode: '✔', ascii: '[V]' }
    - `ERROR`: { unicode: '✖', ascii: '[X]' }
    - `THINKING`: { unicode: '◌', ascii: '...' }
    - `WARNING`: { unicode: '⚠', ascii: '[!]' }
    - `STEP_ACTIVE`: { unicode: '●', ascii: '(*)' }
    - `STEP_INACTIVE`: { unicode: '○', ascii: '( )' }
- [ ] Use `is-unicode-supported` package to determine the rendering mode.
- [ ] Implement a `BoxDrawing` utility or component that provides fallbacks for `┌`, `─`, `┐`, `│`, `└`, `─`, `┘`.
    - Unicode: `┌ ─ ┐ │ └ ─ ┘`
    - ASCII: `+ - + | + - +`

## 3. Code Review
- [ ] Ensure the ASCII fallbacks maintain the visual alignment and spacing of the original TUI layout.
- [ ] Verify that the `Glyph` component is lightweight and doesn't introduce unnecessary re-renders.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test packages/cli/src/tui/components/__tests__/Glyph.test.tsx` and ensure all tests pass.

## 5. Update Documentation
- [ ] Document the tiered fallback system in `docs/ui_ux_architecture.md`.

## 6. Automated Verification
- [ ] Run a small script that renders all glyphs to `stdout` and pipes to a file, then check the file content for either Unicode or ASCII based on the `LANG` environment variable.
