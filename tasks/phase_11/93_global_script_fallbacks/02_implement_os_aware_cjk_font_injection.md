# Task: Implement OS-Aware Runtime Font Injection for CJK Script Fallbacks (Sub-Epic: 93_Global_Script_Fallbacks)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-038-1]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/__tests__/typography/os-font-injector.test.ts`, write unit tests for a `resolveOSFontStack(platform: NodeJS.Platform): string` utility that:
  - Returns a string containing `"PingFang SC"` when `platform === "darwin"`.
  - Returns a string containing `"Meiryo"` and `"Microsoft YaHei"` when `platform === "win32"`.
  - Returns a string containing `"Noto Sans CJK SC"` when `platform === "linux"`.
  - Includes the universal Noto fallbacks (`"Noto Sans JP"`, `"Noto Sans KR"`) on every platform.
  - Throws no errors for unknown platforms (falls back to Noto-only stack).
- [ ] In `packages/vscode/src/__tests__/font-injector.test.ts`, write an integration test for the `ExtensionFontInjector` class that:
  - Mocks `process.platform` for macOS, Windows, and Linux.
  - Calls `ExtensionFontInjector.getWebviewFontCSS()` and asserts the returned CSS string contains the correct platform-specific font names.
  - Asserts the returned CSS injects a `--devs-cjk-font-stack` custom property on `:root`.
- [ ] Write a Playwright E2E test in `e2e/typography/runtime-font-injection.spec.ts` that reads the active `--devs-cjk-font-stack` CSS variable from the rendered Webview DOM and asserts it is non-empty and contains at least one CJK font name.

## 2. Task Implementation
- [ ] In `packages/ui-tokens/src/typography.ts`, implement and export `resolveOSFontStack(platform: NodeJS.Platform): string`:
  ```ts
  export function resolveOSFontStack(platform: NodeJS.Platform): string {
    const platformFonts: Record<string, string[]> = {
      darwin: ['"PingFang SC"', '"PingFang TC"', '"Apple SD Gothic Neo"'],
      win32: ['"Meiryo"', '"Yu Gothic"', '"Microsoft YaHei"', '"Malgun Gothic"'],
      linux: ['"Noto Sans CJK SC"', '"Noto Sans CJK TC"'],
    };
    const osSpecific = platformFonts[platform] ?? [];
    const universalFallbacks = ['"Noto Sans JP"', '"Noto Sans KR"', "sans-serif"];
    return [...osSpecific, ...universalFallbacks].join(", ");
  }
  ```
- [ ] In `packages/vscode/src/webview/ExtensionFontInjector.ts`, create an `ExtensionFontInjector` class that:
  - In its `getWebviewFontCSS()` method, calls `resolveOSFontStack(process.platform)` to get the platform-specific CJK stack.
  - Returns a CSS string that defines `--devs-cjk-font-stack` on `:root`:
    ```css
    :root { --devs-cjk-font-stack: <resolved stack>; }
    ```
  - This CSS is injected into the Webview's `<head>` as an inline `<style>` tag by the `DevsPanelProvider`.
- [ ] In `packages/vscode/src/webview/DevsPanelProvider.ts`, update the `_getHtmlForWebview()` method to call `ExtensionFontInjector.getWebviewFontCSS()` and embed the result in the `<head>` of the Webview HTML, after the existing CSP `<meta>` tag.
- [ ] In `packages/webview-ui/src/styles/globals.css`, update the `font-family` declaration for `body` (or `:root`) to append `var(--devs-cjk-font-stack)` at the end of the font stack, ensuring the runtime OS-injected fonts are honoured while keeping the compile-time fallbacks as a safety net:
  ```css
  :root {
    --devs-font-stack: var(--vscode-font-family), system-ui, -apple-system,
      BlinkMacSystemFont, "Segoe UI", Roboto, var(--devs-cjk-font-stack, "Noto Sans CJK SC", "sans-serif");
  }
  ```
- [ ] Ensure `ExtensionFontInjector` is registered in the extension's dependency injection container (`packages/vscode/src/container.ts`) and is disposed on extension deactivation.

## 3. Code Review
- [ ] Verify that `ExtensionFontInjector.getWebviewFontCSS()` does NOT embed fonts as base64 data URIs or attempt to load external network resources—only system font name strings are permitted (CSP compliance).
- [ ] Confirm the injected `<style>` tag is placed before any user-land stylesheets in the Webview `<head>` so it can be overridden by theme tokens if needed.
- [ ] Ensure `resolveOSFontStack` has zero side-effects and is a pure function—it must not read `process.platform` directly, receiving it as a parameter to enable testability.
- [ ] Verify no duplicate `--devs-cjk-font-stack` definitions exist (only one injection point in `DevsPanelProvider`).
- [ ] Check that the CSP `style-src` directive in `DevsPanelProvider` permits inline styles for this injection (via nonce or `'unsafe-inline'` scoped to the injected `<style>` tag with a nonce attribute).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/ui-tokens test` to confirm `resolveOSFontStack` unit tests pass for all three platform branches.
- [ ] Run `pnpm --filter @devs/vscode test` to confirm `ExtensionFontInjector` integration tests pass.
- [ ] Run `pnpm --filter @devs/vscode build` to confirm TypeScript compilation succeeds with no type errors in the new files.
- [ ] Run `pnpm e2e --grep "runtime-font-injection"` to confirm the E2E test finds a non-empty `--devs-cjk-font-stack` CSS variable in the live Webview.

## 5. Update Documentation
- [ ] Create `packages/vscode/src/webview/ExtensionFontInjector.agent.md` documenting: the purpose of the class, that it must remain a pure CSS string injector with no network calls, the expected output format, and how to update platform mappings when new OS defaults are identified.
- [ ] Update `packages/vscode/AGENT.md` to note that CJK font resolution happens at extension activation time via `ExtensionFontInjector`, and that any change to the font injection mechanism must be validated against the CSP nonce policy.
- [ ] Document the `--devs-cjk-font-stack` CSS custom property in the project's CSS custom properties reference (`docs/ui/css-variables.md`).

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/ui-tokens test --coverage` and confirm `resolveOSFontStack` branch coverage is 100% (all platform branches tested).
- [ ] Run `node scripts/verify-cjk-injection.mjs` — a script that: (1) imports `ExtensionFontInjector`, (2) calls `getWebviewFontCSS()` for each of `["darwin", "win32", "linux"]`, and (3) asserts each output string contains the expected platform font name. Exit code must be `0`.
