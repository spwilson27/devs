# Task: Implement Extension Host Lifecycle and Basic Commands (Sub-Epic: 01_VSCode_Extension_Core)

## Covered Requirements
- [2_TAS-REQ-034], [1_PRD-REQ-INT-002]

## 1. Initial Test Written
- [ ] Write a mock-based test using `@vscode/test-electron` or a similar tool to verify the `activate` and `deactivate` functions.
- [ ] Create a test case to ensure that the `devs.openDashboard` command is correctly registered upon activation.
- [ ] Implement a test that verifies the `deactivate` function correctly disposes of all registered disposables.

## 2. Task Implementation
- [ ] Implement the `activate` function in `src/extension.ts` using the `vscode` Extension API.
- [ ] Register the `devs.openDashboard` command to trigger the future Webview panel creation.
- [ ] Set up an `ExtensionContext` manager to store and manage the extension's internal state (e.g., active panel, workspace folder).
- [ ] Implement the `deactivate` function, ensuring that all resources (timers, watchers, etc.) are properly cleaned up.
- [ ] Configure `package.json` with the new commands and their keybindings (e.g., Cmd+Shift+D).

## 3. Code Review
- [ ] Verify that the extension host management follows the TAS-REQ-034 requirement for lifecycle handling.
- [ ] Ensure that no global state is leaked between activations.
- [ ] Confirm that command registration uses a consistent naming convention (`devs.*`).

## 4. Run Automated Tests to Verify
- [ ] Execute the extension integration tests in a headless VSCode instance.
- [ ] Verify that the `devs.openDashboard` command is listed in the VSCode command palette.

## 5. Update Documentation
- [ ] Update the `vscode.md` AOD file with details on the extension lifecycle and registered commands.
- [ ] Document the intended behavior of the `openDashboard` command.

## 6. Automated Verification
- [ ] Run a shell script that uses `grep` to verify the registration of `activate` and `deactivate` in the compiled extension code.
- [ ] Validate that the command registration in `package.json` matches the implementation in `extension.ts`.
