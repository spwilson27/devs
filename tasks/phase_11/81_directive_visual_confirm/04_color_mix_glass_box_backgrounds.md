# Task: Implement color-mix() Glass-Box Backgrounds for Agentic Content (Sub-Epic: 81_Directive_Visual_Confirm)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-013]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/styles/agenticBackgrounds.test.ts`, write CSS-in-JS / computed-style tests using Vitest + jsdom:
  - **color-mix usage test**: For each agentic content component (`ThoughtBlock`, `DirectiveConfirmationBadge`, `AgentCard` if it exists), render the component and assert that the computed `background` or `background-color` style string contains the substring `color-mix(` — confirming the glass-box implementation is in effect and no plain hex value is used.
  - **Semantic intent test**: Render a `ThoughtBlock` with `agentType="developer"` and assert its background uses the developer-blue token (`--vscode-terminal-ansiBlue` or equivalent) as the first argument to `color-mix()`.
  - **Theme adaptation test**: Simulate a `--vscode-editor-background` value of `#1e1e1e` (dark) vs `#ffffff` (light), render the `ThoughtBlock`, and assert the `color-mix()` expression references `var(--vscode-editor-background)` as the mixing base — guaranteeing adaptive blending regardless of theme.
  - **No hardcoded color test**: Assert that none of the agentic background styles contain raw hex codes (`#[0-9a-fA-F]{3,6}`) or `rgb(` literals.
- [ ] All tests must fail before implementation begins.

## 2. Task Implementation
- [ ] Create `packages/webview-ui/src/styles/agentic-backgrounds.css` with a set of semantic CSS utility classes:
  ```css
  /*
   * Glass-Box agentic backgrounds.
   * Uses color-mix() to blend a semantic agent color with the editor background,
   * producing a translucent tinted surface that adapts to any VSCode theme.
   * REQ: 7_UI_UX_DESIGN-REQ-UI-DES-013
   */

  .bg-agent-developer {
    background: color-mix(
      in srgb,
      var(--vscode-terminal-ansiBlue) 12%,
      var(--vscode-editor-background)
    );
  }

  .bg-agent-reviewer {
    background: color-mix(
      in srgb,
      var(--vscode-terminal-ansiYellow) 12%,
      var(--vscode-editor-background)
    );
  }

  .bg-agent-architect {
    background: color-mix(
      in srgb,
      var(--vscode-terminal-ansiGreen) 12%,
      var(--vscode-editor-background)
    );
  }

  .bg-agent-directive {
    /* Used for DirectiveConfirmationBadge and human-directive blocks */
    background: color-mix(
      in srgb,
      var(--vscode-notificationsInfoIcon-foreground) 15%,
      var(--vscode-editor-background)
    );
  }

  .bg-agent-neutral {
    /* Fallback for unknown agent types */
    background: color-mix(
      in srgb,
      var(--vscode-foreground) 8%,
      var(--vscode-editor-background)
    );
  }
  ```
- [ ] Import `agentic-backgrounds.css` in the Webview root entry (`packages/webview-ui/src/index.tsx` or the Shadow DOM root stylesheet).
- [ ] Update `ThoughtBlock.tsx` to accept an `agentType?: 'developer' | 'reviewer' | 'architect' | 'neutral'` prop and apply the corresponding `bg-agent-*` class.
- [ ] Update `DirectiveConfirmationBadge.tsx` to use the `bg-agent-directive` class (replacing any inline background style added in task 01).
- [ ] If an `AgentCard` component exists, apply the appropriate `bg-agent-*` class based on its `agentType` prop.
- [ ] Remove any pre-existing hardcoded hex or `rgba()` backgrounds from agentic content components.

## 3. Code Review
- [ ] Audit all agentic content components (`ThoughtBlock`, `DirectiveConfirmationBadge`, `AgentCard`, any SAOP-envelope cards) and confirm zero remaining hardcoded color values.
- [ ] Verify each `color-mix()` call:
  - Uses `in srgb` color space.
  - References a `--vscode-*` semantic token as the tint color.
  - References `var(--vscode-editor-background)` as the base (ensuring theme adaptation).
  - Uses a tint percentage ≤ 15% (to maintain subtlety and avoid overwhelming the VSCode chrome).
- [ ] Verify the CSS file is imported within the Shadow DOM scope (not leaked into VSCode's global styles).
- [ ] Verify the `agentType` prop on `ThoughtBlock` defaults to `'neutral'` when not provided (no unclassed element).
- [ ] Confirm compliance with `6_UI_UX_ARCH-REQ-004` (Theme-aware styling — no hardcoded colors).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="agenticBackgrounds"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="ThoughtBlock"` to confirm the updated `agentType` prop does not break existing tests.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="DirectiveConfirmationBadge"` to confirm badge tests still pass.
- [ ] Run the full webview-ui test suite: `pnpm --filter @devs/webview-ui test`.

## 5. Update Documentation
- [ ] Create `packages/webview-ui/src/styles/agentic-backgrounds.agent.md` with:
  - Purpose: provides the `color-mix()` glass-box semantic backgrounds for all agentic content.
  - List of utility classes and their associated agent roles / VSCode tokens.
  - Usage instructions: import path, how to apply to a new component.
  - Browser compatibility note: `color-mix(in srgb, ...)` requires Chromium 111+ (VSCode's embedded Electron meets this requirement as of VSCode 1.80+).
  - Covered requirements: `7_UI_UX_DESIGN-REQ-UI-DES-013`.
- [ ] Update `ThoughtBlock.agent.md` to document the `agentType` prop.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test -- --reporter=json --outputFile=test-results/agentic-backgrounds.json` and assert zero failed tests.
- [ ] Run `grep -rn "background.*#[0-9a-fA-F]" packages/webview-ui/src/components` and assert zero matches (no hardcoded hex backgrounds remain in component files).
- [ ] Run `pnpm --filter @devs/webview-ui build` to confirm TypeScript and CSS compilation succeeds.
