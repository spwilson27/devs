# Task: Add Animation Tokens and Tailwind Configuration (Sub-Epic: 48_Motion_Philosophy)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-006-2], [7_UI_UX_DESIGN-REQ-UI-DES-050]

## 1. Initial Test Written
- [ ] Create a test at packages/ui-styles/src/__tests__/animation-tokens.test.ts that builds the repository's global CSS (or PostCSS output) and asserts that the following CSS custom properties exist in the final bundle:
  - --devs-animation-duration: 250ms
  - --devs-animation-easing: cubic-bezier(0.4, 0, 0.2, 1)
  - --devs-animation-max-duration: 250ms
  - --devs-animation-allowed-properties: "transform,opacity" (string presence is sufficient)

Test implementation notes:
1. Use the repo's CSS build (postcss/tailwind) or a JSDOM PostCSS pipeline in the test to read the generated CSS string.
2. assert(css.includes('--devs-animation-duration: 250ms')) etc.
3. The test must fail before tokens are added.

## 2. Task Implementation
- [ ] Add CSS variables to the global style entry (suggested path: packages/ui-styles/src/animation.css or src/variables.css):
  :root {
    --devs-animation-duration: 250ms;
    --devs-animation-easing: cubic-bezier(0.4, 0, 0.2, 1);
    --devs-animation-max-duration: 250ms;
  }
- [ ] Update tailwind.config.js (root or packages/ui-styles) to map animation durations and easings to the tokens, e.g.:
  module.exports = {
    theme: {
      extend: {
        transitionTimingFunction: { 'devs-standard': 'var(--devs-animation-easing)' },
        transitionDuration: { 'devs-standard': 'var(--devs-animation-duration)' }
      }
    }
  }
- [ ] Ensure tokens are emitted in the built CSS and exposed for webview usage (vscode-webview CSS must include them via the Webview bundle).

## 3. Code Review
- [ ] Verify no hard-coded animation values elsewhere; prefer tokens.
- [ ] Verify that tokens use VSCode design tokens where appropriate (prefer --vscode-* for colors; for animation tokens keep names scoped to devs).

## 4. Run Automated Tests to Verify
- [ ] Run: pnpm --filter @devs/ui-styles test OR run the CSS build then run the animation-tokens.test.ts file. Confirm the test passes.

## 5. Update Documentation
- [ ] Update packages/ui-styles/README.md with token names and usage examples (Tailwind class examples and raw CSS examples) and link to requirement IDs.

## 6. Automated Verification
- [ ] Add a CI task that runs the CSS build and greps the generated CSS for the tokens; script should exit non-zero if tokens are missing. Locally run: node ./scripts/verify-animation-tokens.js (which runs a PostCSS parse and asserts presence).