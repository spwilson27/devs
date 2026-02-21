# Task: Scaffold the VSCode Extension Package (Sub-Epic: 01_VSCode_Extension_Core)

## Covered Requirements
- [TAS-102], [1_PRD-REQ-INT-002]

## 1. Initial Test Written
- [ ] Create a unit test for the package configuration to ensure that the `package.json` contains the necessary extension metadata (e.g., `engines.vscode`, `activationEvents`, `contributes.views`).
- [ ] Implement a script to verify that the directory structure (e.g., `src/`, `resources/`) follows the TAS-104 requirement for project layout.

## 2. Task Implementation
- [ ] Initialize the `@devs/vscode` package in the monorepo workspace.
- [ ] Configure `package.json` with extension entry point (`main`), activation events (e.g., `onView:devs-dashboard`), and contributing commands.
- [ ] Set up `tsconfig.json` with strict mode enabled, targeting modern Node.js and VSCode extension environment.
- [ ] Configure the build pipeline (e.g., `esbuild` or `webpack`) to bundle the extension code into a single file for production while maintaining sourcemaps for development.
- [ ] Add `pnpm` workspace scripts for `build`, `watch`, and `lint`.

## 3. Code Review
- [ ] Verify that the extension metadata correctly identifies `@devs/vscode` as the UI controller.
- [ ] Ensure that the build process correctly handles external dependencies and doesn't bundle VSCode's built-in modules.
- [ ] Confirm that strict TypeScript mode is enforced.

## 4. Run Automated Tests to Verify
- [ ] Execute the package configuration verification script.
- [ ] Run `pnpm build` and verify that the output bundle exists and is valid JavaScript.

## 5. Update Documentation
- [ ] Document the extension build process and configuration in the `@devs/vscode` README.
- [ ] Update the project's top-level overview if any new dependencies were added.

## 6. Automated Verification
- [ ] Run a shell script that checks for the existence of the generated extension bundle (`dist/extension.js`) and validates the `package.json` against VSCode extension schema.
