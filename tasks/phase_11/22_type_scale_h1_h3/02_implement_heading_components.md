# Task: Implement and Verify Heading Component Styles (Sub-Epic: 22_Type_Scale_H1_H3)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-033], [7_UI_UX_DESIGN-REQ-UI-DES-033-1], [7_UI_UX_DESIGN-REQ-UI-DES-033-2], [7_UI_UX_DESIGN-REQ-UI-DES-033-3]

## 1. Initial Test Written
- [ ] Create a component test in `packages/vscode/webview/src/components/common/Heading.test.tsx` using `@testing-library/react`.
- [ ] The test should render `<Heading level={1}>Test</Heading>` and verify that the rendered element is an `<h1>` with the class `text-h1`.
- [ ] Repeat for levels 2 and 3, verifying classes `text-h2` and `text-h3`.
- [ ] Add a computed style check (if possible in the test environment) to ensure the font-size resolves to 20px, 16px, and 14px respectively.

## 2. Task Implementation
- [ ] Create a reusable `Heading` component in `packages/vscode/webview/src/components/common/Heading.tsx`:
    ```tsx
    import React from 'react';

    interface HeadingProps {
      level: 1 | 2 | 3;
      children: React.ReactNode;
      className?: string;
    }

    export const Heading: React.FC<HeadingProps> = ({ level, children, className = '' }) => {
      const Tag = `h${level}` as const;
      const sizeClass = `text-h${level}`;
      
      return (
        <Tag className={`${sizeClass} font-semibold ${className}`}>
          {children}
        </Tag>
      );
    };
    ```
- [ ] Alternatively, apply global styles in `packages/vscode/webview/src/styles/globals.css` to base HTML tags:
    ```css
    h1 { @apply text-h1 font-semibold; }
    h2 { @apply text-h2 font-semibold; }
    h3 { @apply text-h3 font-semibold; }
    ```
- [ ] Ensure that the font weight is set to `semibold` (500/600) to align with [7_UI_UX_DESIGN-REQ-UI-DES-037-1].

## 3. Code Review
- [ ] Verify that the `Heading` component uses the correct semantic HTML tags (`h1`, `h2`, `h3`).
- [ ] Ensure that the component is theme-aware and doesn't hardcode colors, relying on Tailwind's default or VSCode's foreground variables.
- [ ] Check for proper prop spreading or class merging if needed.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test` in the webview directory to confirm the component tests pass.

## 5. Update Documentation
- [ ] Update `docs/components/Typography.md` with examples of how to use the `Heading` component.
- [ ] Update the agent "memory" (AOD) in `packages/vscode/.agent.md` to note the standardized heading implementation.

## 6. Automated Verification
- [ ] Run a Playwright E2E test `packages/vscode/webview/e2e/typography.spec.ts` that navigates to a style-guide page and asserts the bounding box or computed font-size of the H1, H2, and H3 elements.
