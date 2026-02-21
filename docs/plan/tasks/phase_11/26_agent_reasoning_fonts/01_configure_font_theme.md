# Task: Configure Tailwind Font Stacks & CSS Variables (Sub-Epic: 26_Agent_Reasoning_Fonts)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-034], [6_UI_UX_ARCH-REQ-083]

## 1. Initial Test Written
- [ ] Create a Vitest test file `packages/vscode/webview/tests/typography.test.ts` that:
    - Verifies that CSS variables for fonts (`--devs-font-serif`, `--devs-font-mono`, `--devs-font-system`) are correctly defined.
    - Uses a JSDOM or similar environment to check that elements with Tailwind classes `font-agent-thought`, `font-human-directive`, and `font-tool-action` have the correct `font-family` and `font-style` computed styles.
    - Specifically check that `font-agent-thought` computes to a serif stack with `italic` style.
    - Specifically check that `font-human-directive` computes to a system-ui stack with `bold` weight.
    - Specifically check that `font-tool-action` computes to a monospace stack with `bold` weight.

## 2. Task Implementation
- [ ] Update `packages/vscode/webview/tailwind.config.ts` (or equivalent) to include custom font families:
    ```typescript
    theme: {
      extend: {
        fontFamily: {
          'agent-thought': ['var(--devs-font-serif)', 'Georgia', 'serif'],
          'human-directive': ['var(--devs-font-system)', 'system-ui', 'sans-serif'],
          'tool-action': ['var(--devs-font-mono)', 'monospace'],
        }
      }
    }
    ```
- [ ] Update the global CSS file (e.g., `packages/vscode/webview/src/styles/base.css`) to define the CSS variables, ensuring they pull from VSCode's editor font if available:
    ```css
    :root {
      --devs-font-serif: "Times New Roman", serif; /* Standard fallback for agentic journaling */
      --devs-font-mono: var(--vscode-editor-font-family, "Courier New", monospace);
      --devs-font-system: var(--vscode-font-family, system-ui);
    }
    ```
- [ ] Ensure that Tailwind is configured to pick up these custom utilities.

## 3. Code Review
- [ ] Verify that no hardcoded hex colors are used; use `--devs-primary` for directives.
- [ ] Ensure font fallbacks are logical (e.g., serif fallback for thoughts).
- [ ] Confirm that `tailwind.config.ts` follows the project's existing configuration patterns.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test` in the `@devs/vscode` package and ensure the typography tests pass.

## 5. Update Documentation
- [ ] Update `docs/specs/4_ui_ux.md` (if it exists) to document the semantic font intent mapping for future agent reference.
- [ ] Record the decision to use VSCode's editor font for tool actions in the Vector Memory.

## 6. Automated Verification
- [ ] Run a script that scans `packages/vscode/webview/src/styles/` for the presence of the required CSS variables.
- [ ] Validate the build bundle contains the new Tailwind utility classes.
