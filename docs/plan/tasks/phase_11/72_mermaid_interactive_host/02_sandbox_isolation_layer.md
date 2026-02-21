# Task: Sandbox Isolation Layer for Mermaid Rendering (Sub-Epic: 72_Mermaid_Interactive_Host)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-027]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/components/MermaidHost/__tests__/MermaidSandbox.test.tsx`, write **unit tests** using Vitest + React Testing Library that:
  - Assert the component renders an `<iframe>` with `sandbox="allow-scripts"` attribute when `strategy="iframe"` is passed.
  - Assert the component renders a `<div>` with a Shadow DOM root (verify via `element.shadowRoot !== null`) when `strategy="shadow-dom"` is passed.
  - Assert that when no `strategy` prop is given, the component defaults to `"shadow-dom"`.
  - Assert that the rendered container does NOT contain any `<link>` or `<style>` tags from the parent document (CSS isolation check).
  - Assert that the sandbox `<iframe>` has NO `allow-same-origin` in its `sandbox` attribute, confirming scripts cannot access parent origin.
  - Assert that an `onReady` callback prop is called with the container's inner document/root as argument once the sandbox is initialised.
- [ ] In `packages/webview-ui/src/components/MermaidHost/__tests__/MermaidSandbox.security.test.ts`, write a **security-focused unit test** that:
  - Creates a `MermaidSandbox` with `strategy="iframe"` and verifies that attempting to call `window.parent.document` from inside the iframe throws a `DOMException` (simulate by checking `allow-same-origin` is absent from `sandbox` attribute).
  - Asserts that no `<script src="...">` tags with external URLs can be injected into the sandbox container (verify CSP meta tag is present inside the iframe's `srcdoc`).

## 2. Task Implementation
- [ ] Create `packages/webview-ui/src/components/MermaidHost/MermaidSandbox.tsx`:
  - Props interface:
    ```ts
    interface MermaidSandboxProps {
      strategy?: 'iframe' | 'shadow-dom';
      children?: (containerRef: React.RefObject<HTMLElement>) => React.ReactNode;
      onReady?: (container: HTMLElement | ShadowRoot) => void;
      className?: string;
    }
    ```
  - **Shadow DOM strategy** (default):
    - Render a `<div ref={hostRef} />`.
    - In a `useLayoutEffect`, attach a Shadow DOM with `mode: 'closed'` to `hostRef.current` (store the `ShadowRoot` in a `useRef`).
    - Inject a `<style>` tag into the Shadow DOM that resets all inherited CSS to prevent leakage from the parent document: `all: initial; display: block;`.
    - Call `onReady(shadowRoot)` after attachment.
  - **iframe strategy**:
    - Render `<iframe sandbox="allow-scripts" style={{ border: 'none', width: '100%', height: '100%' }} title="mermaid-sandbox" />`.
    - The iframe's `srcdoc` must include a strict CSP `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline';">` — note: `allow-same-origin` is deliberately **excluded** from `sandbox` to isolate the iframe's origin.
    - After the iframe loads (`onLoad`), call `onReady(iframe.contentDocument.body)`.
  - Export a stable `useSandboxContainer` hook that wraps `MermaidSandbox` state and returns a `containerRef` suitable for use by `useMermaidRenderer`.
- [ ] Update `useMermaidRenderer.ts` to accept an optional `containerRef: React.RefObject<HTMLElement | ShadowRoot | null>` parameter. When provided, call `mermaid.render()` targeting that container rather than `document.body`.
- [ ] Update `MermaidHost.tsx` to compose `MermaidSandbox` around the rendering output:
  ```tsx
  <MermaidSandbox strategy="shadow-dom" onReady={handleSandboxReady}>
    {/* SVG injected into the shadow root via useMermaidRenderer */}
  </MermaidSandbox>
  ```
- [ ] Ensure the sandbox wraps the SVG output so that Mermaid's injected `<style>` tags are contained inside the shadow root and cannot affect parent document styles.

## 3. Code Review
- [ ] Verify that `<iframe sandbox="...">` never includes `allow-same-origin` (grep: `allow-same-origin` must not appear in `MermaidSandbox.tsx`).
- [ ] Confirm Shadow DOM is attached with `mode: 'closed'` (not `'open'`) so JavaScript in the parent cannot access `element.shadowRoot`.
- [ ] Verify the CSP `<meta>` tag inside the `srcdoc` blocks `default-src 'none'` and does not include `connect-src` or `img-src` with external origins.
- [ ] Confirm no global `document.querySelectorAll` calls reference elements inside the sandbox, preventing style leakage testing false-negatives.
- [ ] Confirm `useSandboxContainer` hook has a stable identity (no unnecessary re-creation of the Shadow DOM on each render).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test --reporter=verbose packages/webview-ui/src/components/MermaidHost` and confirm all sandbox tests pass with 0 failures.
- [ ] Run `pnpm --filter @devs/webview-ui build` to confirm no TypeScript type errors.
- [ ] Run `pnpm --filter @devs/webview-ui test:security` (or equivalent security test suite) and confirm `MermaidSandbox.security.test.ts` passes.

## 5. Update Documentation
- [ ] Update `packages/webview-ui/src/components/MermaidHost/MermaidHost.agent.md` to add a **Sandbox** section:
  - Explain the two strategies (`shadow-dom` default, `iframe` fallback).
  - Document why `allow-same-origin` is excluded.
  - Document the CSP policy injected into the `srcdoc`.
  - Reference `[6_UI_UX_ARCH-REQ-027]` as the driving requirement.
- [ ] Add an entry to `docs/architecture/security.md` (or equivalent) describing the Mermaid sandbox isolation contract.

## 6. Automated Verification
- [ ] CI check: `pnpm --filter @devs/webview-ui test --run` exits with code `0` (includes new sandbox tests).
- [ ] Security lint: Add a custom ESLint rule (or inline `grep` CI step) that fails if `allow-same-origin` appears in any `.tsx` file under `src/components/MermaidHost/`.
  ```bash
  grep -r "allow-same-origin" packages/webview-ui/src/components/MermaidHost/ && exit 1 || exit 0
  ```
- [ ] Run the above `grep` command in CI and assert it exits `0` (i.e., `allow-same-origin` is absent).
