# Task: Initialize CLI Package and Ink Foundation (Sub-Epic: 04_TUI Framework & Styling Foundations)

## Covered Requirements
- [9_ROADMAP-TAS-701]

## 1. Initial Test Written
- [ ] Create a unit test using `ink-testing-library` that renders a basic "devs" Header component.
- [ ] The test should verify that the output contains the string "devs" and follows the expected layout (e.g., using `render` and checking `lastFrame()`).
- [ ] Verify that the test fails because the component doesn't exist yet.

## 2. Task Implementation
- [ ] Initialize the `@devs/cli` package in the `packages/` directory (if not already existing, or create a `src/cli` if monolithic).
- [ ] Install required dependencies: `ink`, `react`, `chalk`, `commander`, and `@types/node`.
- [ ] Install dev dependencies: `ink-testing-library`, `jest` (or vitest), and `ts-jest`.
- [ ] Create a basic entry point `src/index.ts` that uses `commander` to handle a simple `devs run` command.
- [ ] When `devs run` is executed, it should mount an Ink-based React component that displays a "Hello Devs" or "devs" header.
- [ ] Ensure the TypeScript configuration (`tsconfig.json`) supports React/JSX (Ink uses React).

## 3. Code Review
- [ ] Verify that the `commander` setup correctly parses arguments and flags.
- [ ] Ensure the Ink root component is correctly cleaned up on process exit.
- [ ] Check that the package structure aligns with the project's monorepo conventions (e.g., `pnpm-workspace.yaml` integration).

## 4. Run Automated Tests to Verify
- [ ] Run the tests: `npm test` or `pnpm test`.
- [ ] Ensure the "devs" Header component renders correctly in the test environment.

## 5. Update Documentation
- [ ] Document the CLI entry point and how to run the TUI in development mode (e.g., `npm run dev`).
- [ ] Update the `@devs/cli` README with basic setup instructions.

## 6. Automated Verification
- [ ] Execute `node dist/index.js run` (after building) and pipe the output to a temporary file.
- [ ] Validate that the output contains ANSI escape sequences if terminal colors are enabled, or verify the text content.
