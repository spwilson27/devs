# Task: Implement Strict CSP and vscode-resource URI Scheme (Sub-Epic: 02_Webview_Stack_Scaffolding)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-012], [6_UI_UX_ARCH-REQ-074]

## 1. Initial Test Written
- [ ] Write a test for the resource resolver utility that verifies it correctly transforms a local file path into a `vscode-resource://` URI (or using `webview.asWebviewUri`).
- [ ] Create a test that validates the CSP string contains mandatory directives (e.g., `default-src 'none'`, `img-src ${webview.cspSource}`).

## 2. Task Implementation
- [ ] Implement a `ResourceResolver` class or utility in the extension host that wraps `webview.asWebviewUri()`.
- [ ] Update the Webview HTML generation logic to dynamically inject a strict `<meta http-equiv="Content-Security-Policy">` tag.
- [ ] Ensure the CSP allows:
    - `script-src`: The webview bundle (using a nonce or specific URI).
    - `style-src`: Inline styles (if required by Tailwind) and the webview bundle.
    - `img-src`: `vscode-resource:` and local data URIs.
    - `font-src`: `vscode-resource:`.
- [ ] Verify that all external assets (if any) are blocked by the CSP.

## 3. Code Review
- [ ] Ensure that `asWebviewUri` is used for ALL assets (JS, CSS, Images, Fonts).
- [ ] Verify that the CSP is as restrictive as possible while allowing the app to function.
- [ ] Check that nonces are used where appropriate to prevent unauthorized script execution.

## 4. Run Automated Tests to Verify
- [ ] Run the ResourceResolver tests.
- [ ] Launch the extension and check the VSCode developer tools (Webview) for any CSP violation errors.

## 5. Update Documentation
- [ ] Document the CSP policy and the mandatory use of the `ResourceResolver` utility for any new assets.

## 6. Automated Verification
- [ ] Run a script that scans the extension host code for any direct usage of local file paths in the webview HTML, ensuring all go through `asWebviewUri`.
- [ ] Validate the final HTML output of the webview to ensure the CSP header is present and correctly formatted.
