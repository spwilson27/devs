# Task: Configure Tailwind and CSS Variables for H1-H3 Scale (Sub-Epic: 22_Type_Scale_H1_H3)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-033], [7_UI_UX_DESIGN-REQ-UI-DES-033-1], [7_UI_UX_DESIGN-REQ-UI-DES-033-2], [7_UI_UX_DESIGN-REQ-UI-DES-033-3]

## 1. Initial Test Written
- [ ] Create a configuration test in `packages/vscode/webview/tests/theme.test.ts` that imports the Tailwind configuration and asserts that the `theme.extend.fontSize` object contains the following mappings:
    - `h1`: '20px'
    - `h2`: '16px'
    - `h3`: '14px'
- [ ] Create a CSS variable verification test that checks if the root styles in a test environment contain `--devs-font-size-h1`, `--devs-font-size-h2`, and `--devs-font-size-h3` with their respective pixel values.

## 2. Task Implementation
- [ ] Define CSS variables in `packages/vscode/webview/src/styles/globals.css`:
    ```css
    :root {
      --devs-font-size-h1: 20px;
      --devs-font-size-h2: 16px;
      --devs-font-size-h3: 14px;
    }
    ```
- [ ] Update `packages/vscode/webview/tailwind.config.js` to extend the font size theme using these variables:
    ```javascript
    theme: {
      extend: {
        fontSize: {
          'h1': ['var(--devs-font-size-h1)', { lineHeight: '1.2' }],
          'h2': ['var(--devs-font-size-h2)', { lineHeight: '1.2' }],
          'h3': ['var(--devs-font-size-h3)', { lineHeight: '1.2' }],
        }
      }
    }
    ```
- [ ] Ensure the configuration is properly exported and recognized by the TypeScript environment.

## 3. Code Review
- [ ] Verify that the font sizes match the requirements EXACTLY (20px, 16px, 14px).
- [ ] Ensure naming conventions follow the `@devs` design system pattern (using `--devs-` prefix).
- [ ] Check that line heights are appropriately set to 1.2 as per [7_UI_UX_DESIGN-REQ-UI-DES-035-3].

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test` in the `packages/vscode/webview` directory to ensure the configuration tests pass.

## 5. Update Documentation
- [ ] Update the UI Design System section in `docs/design_system.md` (if it exists) or create a new `docs/visual_glass_box/typography.md` documenting the H1-H3 scale.

## 6. Automated Verification
- [ ] Run a script `scripts/verify_tailwind_config.js` that parses the tailwind config and exits with code 0 only if h1=20px, h2=16px, and h3=14px.
